"use strict";

const http = require("node:http");
const fs = require("node:fs");
const fsp = require("node:fs/promises");
const path = require("node:path");
const { randomUUID } = require("node:crypto");

const ROOT = __dirname;
const PORT = Number(process.env.PORT || 4173);
const DATA_FILE = path.join(ROOT, "data", "safeshift.json");
const MAX_BODY_BYTES = 1_000_000;
const clients = new Set();

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
};

let db;
let writeQueue = Promise.resolve();

function loadDatabase() {
  const raw = fs.readFileSync(DATA_FILE, "utf8");
  db = JSON.parse(raw);
  normalizeDatabase();
}

function normalizeDatabase() {
  db.metrics ||= {};
  db.metrics.totalWorkers ??= 0;
  db.metrics.activeShifts ??= 0;
  db.metrics.pending ??= 0;
  db.metrics.swaps ??= 0;
  db.metrics.pto ??= 0;
  db.metrics.rebalanceApplied ??= false;
  db.operations ||= {};
  db.operations.nightLineFilled ??= false;
  db.settings ||= {
    criticalAlerts: true,
    aiDispatch: true,
    workerNudges: false,
  };
  db.workers = Array.isArray(db.workers) ? db.workers : [];
  db.alerts = Array.isArray(db.alerts) ? db.alerts : [];
  db.requests = Array.isArray(db.requests) ? db.requests : [];
  db.activity = Array.isArray(db.activity) ? db.activity : [];
}

function persistDatabase() {
  const snapshot = `${JSON.stringify(db, null, 2)}\n`;
  writeQueue = writeQueue
    .catch(() => undefined)
    .then(async () => {
      const temporaryFile = `${DATA_FILE}.${process.pid}.tmp`;
      await fsp.writeFile(temporaryFile, snapshot, "utf8");
      await fsp.rename(temporaryFile, DATA_FILE);
    });
  return writeQueue;
}

function recordActivity(type, message) {
  db.activity.unshift({
    id: randomUUID(),
    type,
    message,
    at: new Date().toISOString(),
  });
  db.activity = db.activity.slice(0, 100);
}

function sendJson(response, status, value) {
  const payload = JSON.stringify(value);
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(payload),
    "Cache-Control": "no-store",
  });
  response.end(payload);
}

function sendError(response, status, message) {
  sendJson(response, status, { error: message });
}

function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    request.on("data", (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        reject(new Error("Request body is too large."));
        request.destroy();
        return;
      }
      chunks.push(chunk);
    });
    request.on("end", () => {
      if (!chunks.length) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString("utf8")));
      } catch {
        reject(new Error("Request body must be valid JSON."));
      }
    });
    request.on("error", reject);
  });
}

function cleanText(value, maxLength = 240) {
  return String(value ?? "").trim().slice(0, maxLength);
}

function slugify(value) {
  return cleanText(value, 80)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function broadcast(event, payload) {
  const message = `event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`;
  for (const response of clients) {
    response.write(message);
  }
}

function broadcastState(event) {
  broadcast("state", {
    state: db,
    event,
  });
}

async function mutate(action, payload = {}) {
  let event;

  switch (action) {
    case "add-incident": {
      const worker = cleanText(payload.worker, 100);
      const notes = cleanText(payload.notes, 600);
      if (!worker || !notes) {
        throw new Error("Worker/area and incident notes are required.");
      }
      const severity = payload.severity === "Critical" ? "critical" : "moderate";
      const incident = {
        id: `incident-${randomUUID()}`,
        title: worker,
        meta: `(${cleanText(payload.location, 100)})`,
        chip: cleanText(payload.severity, 30) === "Critical" ? "Critical" : cleanText(payload.type, 60),
        severity,
        copy: notes,
        note: `${cleanText(payload.type, 60) || "Safety signal"} · Reported by Ananya Rao`,
        action: "Review",
        dashboard: true,
        active: true,
      };
      db.alerts.unshift(incident);
      recordActivity("incident", `Incident logged for ${worker}.`);
      event = { type: "incident.created", alertId: incident.id };
      break;
    }

    case "add-worker": {
      const name = cleanText(payload.name, 100);
      if (!name) throw new Error("Worker name is required.");
      const worker = {
        id: `${slugify(name) || "worker"}-${randomUUID().slice(0, 8)}`,
        name,
        role: cleanText(payload.role, 80),
        facility: cleanText(payload.facility, 120),
        shift: cleanText(payload.shift, 100),
        email: cleanText(payload.email, 180),
        risk: 18,
        duty: "Onboarding · first shift pending",
        status: "Ready",
      };
      db.workers.unshift(worker);
      db.metrics.totalWorkers += 1;
      recordActivity("worker", `${name} added to the workforce roster.`);
      event = { type: "worker.created", workerId: worker.id };
      break;
    }

    case "assign-shift": {
      const workerName = cleanText(payload.worker, 100);
      if (!workerName) throw new Error("A worker is required.");
      const worker = db.workers.find((item) => item.name === workerName);
      if (worker) {
        worker.facility = cleanText(payload.facility, 120);
        worker.shift = `${cleanText(payload.start, 10)}–${cleanText(payload.end, 10)} · ${cleanText(payload.date, 20)}`;
        worker.duty = "New assignment · monitor first shift";
      }
      db.metrics.activeShifts += 1;
      recordActivity("shift", `Shift assigned to ${workerName}.`);
      event = { type: "shift.assigned", workerName };
      break;
    }

    case "resolve-alert": {
      const alert = db.alerts.find((item) => item.id === payload.id && item.active);
      if (!alert) throw new Error("Alert was not found or is already resolved.");
      alert.active = false;
      recordActivity("alert", `${alert.title} alert marked resolved.`);
      event = { type: "alert.resolved", alertId: alert.id };
      break;
    }

    case "resolve-request": {
      const requestIndex = db.requests.findIndex((item) => item.id === payload.id);
      if (requestIndex < 0) throw new Error("Request was not found.");
      const [request] = db.requests.splice(requestIndex, 1);
      const decision = payload.decision === "decline" ? "declined" : "approved";
      db.metrics.pending = Math.max(0, db.metrics.pending - 1);
      if (request.type === "PTO review") {
        db.metrics.pto = Math.max(0, db.metrics.pto - 1);
      } else {
        db.metrics.swaps = Math.max(0, db.metrics.swaps - 1);
      }
      recordActivity("request", `${request.worker}'s ${request.type.toLowerCase()} ${decision}.`);
      event = { type: "request.resolved", requestId: request.id, decision };
      break;
    }

    case "rebalance": {
      if (db.metrics.rebalanceApplied) {
        throw new Error("The rebalance plan has already been applied.");
      }
      db.metrics.pending = Math.max(0, db.metrics.pending - 3);
      db.metrics.swaps = Math.max(0, db.metrics.swaps - 2);
      db.metrics.pto = Math.max(0, db.metrics.pto - 1);
      db.metrics.rebalanceApplied = true;
      recordActivity("ai", "3 workload rebalance changes applied.");
      event = { type: "rebalance.applied" };
      break;
    }

    case "fill-shift": {
      if (db.operations.nightLineFilled) {
        throw new Error("Night Line Prep is already covered.");
      }
      db.operations.nightLineFilled = true;
      const alert = db.alerts.find((item) => item.id === "nightline" && item.active);
      if (alert) alert.active = false;
      recordActivity("dispatch", "Aditya Verma assigned as Night Line Prep relief.");
      event = { type: "shift.filled", shift: "Night Line Prep" };
      break;
    }

    case "update-settings": {
      const allowed = ["criticalAlerts", "aiDispatch", "workerNudges"];
      if (!allowed.includes(payload.key)) throw new Error("Unknown setting.");
      db.settings[payload.key] = Boolean(payload.value);
      recordActivity("settings", `Setting ${payload.key} updated.`);
      event = { type: "settings.updated", key: payload.key };
      break;
    }

    default:
      throw new Error("Unknown action.");
  }

  db.updatedAt = new Date().toISOString();
  await persistDatabase();
  broadcastState(event);
  return { state: db, event };
}

function handleEvents(request, response) {
  response.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  });
  response.write(`event: snapshot\ndata: ${JSON.stringify({ state: db })}\n\n`);
  clients.add(response);

  request.on("close", () => {
    clients.delete(response);
  });
}

async function serveStatic(request, response, pathname) {
  const requestedPath = pathname === "/" ? "index.html" : decodeURIComponent(pathname.slice(1));
  const filePath = path.resolve(ROOT, requestedPath);
  if (filePath !== ROOT && !filePath.startsWith(`${ROOT}${path.sep}`)) {
    sendError(response, 403, "Forbidden.");
    return;
  }

  let stat;
  try {
    stat = await fsp.stat(filePath);
  } catch {
    sendError(response, 404, "File not found.");
    return;
  }

  if (!stat.isFile()) {
    sendError(response, 404, "File not found.");
    return;
  }

  const extension = path.extname(filePath).toLowerCase();
  const contentType = mimeTypes[extension] || "application/octet-stream";
  response.writeHead(200, {
    "Content-Type": contentType,
    "Content-Length": stat.size,
    "Cache-Control": extension === ".html" ? "no-cache" : "public, max-age=3600",
  });

  if (request.method === "HEAD") {
    response.end();
    return;
  }

  fs.createReadStream(filePath).pipe(response);
}

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url, `http://${request.headers.host || "localhost"}`);
  const pathname = url.pathname;

  try {
    if (pathname === "/api/health" && request.method === "GET") {
      sendJson(response, 200, {
        ok: true,
        database: "json-realtime",
        clients: clients.size,
        updatedAt: db.updatedAt,
      });
      return;
    }

    if (pathname === "/api/state" && request.method === "GET") {
      sendJson(response, 200, db);
      return;
    }

    if (pathname === "/api/events" && request.method === "GET") {
      handleEvents(request, response);
      return;
    }

    if (pathname === "/api/actions" && request.method === "POST") {
      const body = await readJsonBody(request);
      const result = await mutate(cleanText(body.action, 60), body.payload || {});
      sendJson(response, 200, result);
      return;
    }

    if (pathname.startsWith("/api/")) {
      sendError(response, 404, "API route not found.");
      return;
    }

    if (request.method !== "GET" && request.method !== "HEAD") {
      sendError(response, 405, "Method not allowed.");
      return;
    }

    await serveStatic(request, response, pathname);
  } catch (error) {
    console.error(error);
    sendError(response, 500, error.message || "Unexpected server error.");
  }
});

loadDatabase();

const heartbeat = setInterval(() => {
  for (const response of clients) {
    response.write(": heartbeat\n\n");
  }
}, 20_000);

server.listen(PORT, () => {
  console.log(`SafeShift AI real-time server: http://localhost:${PORT}`);
  console.log(`Persistent database: ${path.relative(ROOT, DATA_FILE)}`);
});

function shutdown() {
  clearInterval(heartbeat);
  for (const response of clients) response.end();
  server.close(() => process.exit(0));
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
