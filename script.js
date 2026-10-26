(() => {
  "use strict";

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  const dom = {
    body: document.body,
    sidebar: $("#sidebar"),
    menuToggle: $("#menuToggle"),
    mobileBackdrop: $("#mobileBackdrop"),
    dashboardView: $("#dashboardView"),
    secondaryView: $("#secondaryView"),
    modalOverlay: $("#modalOverlay"),
    modalEyebrow: $("#modalEyebrow"),
    modalTitle: $("#modalTitle"),
    modalBody: $("#modalBody"),
    modalFooter: $("#modalFooter"),
    drawerOverlay: $("#drawerOverlay"),
    drawerEyebrow: $("#drawerEyebrow"),
    drawerTitle: $("#drawerTitle"),
    drawerBody: $("#drawerBody"),
    searchOverlay: $("#searchOverlay"),
    commandInput: $("#commandInput"),
    commandResults: $("#commandResults"),
    toastRegion: $("#toastRegion"),
    datePopover: $("#datePopover"),
    plantPopover: $("#plantPopover"),
    chartTooltip: $("#chartTooltip"),
    dbStatus: $("#dbStatus"),
    dbStatusLabel: $("#dbStatusLabel"),
  };

  const viewMeta = {
    dashboard: {
      title: "Dashboard",
      heading: "Operational Safety & Workforce Overview",
      description: "Live monitoring across four facility zones.",
    },
    workers: {
      title: "Workers",
      heading: "Workforce Directory",
      description: "Worker readiness, assignments, and fatigue exposure across all active plants.",
    },
    "shift-scheduler": {
      title: "Shift Scheduler",
      heading: "Shift Scheduler",
      description: "Plan coverage across rotations and resolve capacity gaps before they become incidents.",
    },
    "leave-and-shift-swaps": {
      title: "Leave & Shift Swaps",
      heading: "Leave & Shift Swaps",
      description: "Review time-off requests and shift swaps with fatigue-aware coverage context.",
    },
    "ai-fatigue-prediction": {
      title: "AI Fatigue Prediction",
      heading: "AI Fatigue Prediction",
      description: "Model-backed fatigue signals with contributing shift and biometric factors.",
    },
    "safety-alerts": {
      title: "Safety Alerts",
      heading: "Safety Alert Console",
      description: "All active safety notifications, prioritized by operational risk.",
    },
    "reports-and-analytics": {
      title: "Reports & Analytics",
      heading: "Reports & Analytics",
      description: "Operational trends, compliance evidence, and exportable safety reporting.",
    },
    settings: {
      title: "Settings",
      heading: "Workspace Settings",
      description: "Configure notification, AI assistance, and dispatch authority preferences.",
    },
  };

  const state = {
    currentView: "dashboard",
    perspective: "manager",
    totalWorkers: 248,
    activeShifts: 86,
    pending: 12,
    swaps: 8,
    pto: 4,
    modelSync: "2 mins ago",
    dateRange: "This Week: Oct 14 - Oct 20, 2024",
    plant: "All Plants (North & Central)",
    settings: {
      criticalAlerts: true,
      aiDispatch: true,
      workerNudges: false,
    },
    operations: {
      nightLineFilled: false,
    },
    updatedAt: null,
    apiEnabled: location.protocol === "http:" || location.protocol === "https:",
    eventSource: null,
    selectedSearchIndex: 0,
    searchItems: [],
    lastFocus: null,
    rebalanceApplied: false,
    workers: [
      {
        id: "arjun-mehta",
        name: "Arjun Mehta",
        role: "Forklift Operator",
        facility: "Plant 1 · Assembly",
        shift: "Night · 22:00–06:00",
        risk: 88,
        duty: "14h duty window",
        status: "Needs relief",
      },
      {
        id: "sneha-iyer",
        name: "Sneha Iyer",
        role: "Assembly Associate",
        facility: "Line 2 · Fabrication",
        shift: "Evening · 14:00–22:00",
        risk: 76,
        duty: "6.5h rest turnaround",
        status: "Rest deficit",
      },
      {
        id: "vikram-singh",
        name: "Vikram Singh",
        role: "Maintenance Technician",
        facility: "Robotics Bay 4",
        shift: "Night · 23:00–07:00",
        risk: 81,
        duty: "5th night shift",
        status: "Night limit",
      },
      {
        id: "priya-nair",
        name: "Priya Nair",
        role: "QA Inspector",
        facility: "Plant 1 · Quality",
        shift: "Morning · 06:00–14:00",
        risk: 42,
        duty: "Within safe threshold",
        status: "Ready",
      },
      {
        id: "rohan-kulkarni",
        name: "Rohan Kulkarni",
        role: "Dispatch Lead",
        facility: "Plant 2 · Logistics",
        shift: "Evening · 14:00–22:00",
        risk: 58,
        duty: "Elevated overtime",
        status: "Monitor",
      },
      {
        id: "meera-joshi",
        name: "Meera Joshi",
        role: "Welding Specialist",
        facility: "Plant 3 · Fabrication",
        shift: "Morning · 06:00–14:00",
        risk: 33,
        duty: "Within safe threshold",
        status: "Ready",
      },
      {
        id: "aditya-verma",
        name: "Aditya Verma",
        role: "Cold Storage Operator",
        facility: "Zone B · Cold Storage",
        shift: "Night · 22:00–06:00",
        risk: 71,
        duty: "Certification coverage",
        status: "Monitor",
      },
      {
        id: "kavya-menon",
        name: "Kavya Menon",
        role: "Robotics Operator",
        facility: "Robotics Bay 4",
        shift: "Morning · 06:00–14:00",
        risk: 27,
        duty: "Within safe threshold",
        status: "Ready",
      },
      {
        id: "rahul-desai",
        name: "Rahul Desai",
        role: "Press Operator",
        facility: "Plant 1 · Stamping",
        shift: "Evening · 14:00–22:00",
        risk: 63,
        duty: "Moderate overtime",
        status: "Monitor",
      },
    ],
    alerts: [
      {
        id: "arjun",
        title: "Arjun Mehta",
        meta: "(Forklift Op - Plant 1)",
        chip: "Risk 88/100",
        severity: "critical",
        copy:
          "14h consecutive duty window. Sensor metrics indicate reaction time decay (+340ms).",
        note: "Action: Dispatch Relief",
        action: "Swap Now",
        dashboard: true,
        active: true,
      },
      {
        id: "sneha",
        title: "Sneha Iyer",
        meta: "(Assembly Line 2)",
        chip: "Rest Deficit",
        severity: "critical",
        copy:
          "Insufficient rest turnaround: scheduled 6.5 hrs between evening & morning shifts (Min: 11 hrs OSHA).",
        note: "Delay Start to 10:00 AM",
        action: "Adjust Start",
        dashboard: true,
        active: true,
      },
      {
        id: "vikram",
        title: "Vikram Singh",
        meta: "(Maintenance Tech)",
        chip: "Night Limit",
        severity: "moderate",
        copy:
          "5th consecutive night shift limit reached. Circadian strain model indicates severe micro-sleep risk.",
        note: "Rotate to Day Off",
        action: "Approve Rest",
        dashboard: true,
        active: true,
      },
      {
        id: "coldstorage",
        title: "Cold Storage Zone B",
        meta: "(Logistics)",
        chip: "Deficit: 2 Cert",
        severity: "critical",
        copy:
          "Only 2 certified cold-storage forklift drivers on duty for upcoming 80-ton shipment receiving.",
        note: "Overwork Danger",
        action: "Call Standby",
        dashboard: true,
        active: true,
      },
      {
        id: "neha",
        title: "Neha Kapoor",
        meta: "(Packaging Line 3)",
        chip: "Overtime 8.2h",
        severity: "moderate",
        copy:
          "Weekly overtime threshold exceeded. Recommend moving the final two hours to verified standby coverage.",
        note: "Recommend shift trim",
        action: "Review",
        dashboard: false,
        active: true,
      },
      {
        id: "conveyor",
        title: "Conveyor 3",
        meta: "(Plant 1 · Dispatch)",
        chip: "Sensor Drift",
        severity: "moderate",
        copy:
          "Vibration variance is 18% above baseline. Maintenance window is available during the next rotation.",
        note: "Inspect bearing assembly",
        action: "Schedule",
        dashboard: false,
        active: true,
      },
      {
        id: "nightline",
        title: "Night Line Prep",
        meta: "(Cold Storage Zone B)",
        chip: "Staffing Risk",
        severity: "moderate",
        copy:
          "Two forklift positions remain unfilled for the 22:00 receiving window. Standby pool has three eligible operators.",
        note: "Assign standby relief",
        action: "Fill Gap",
        dashboard: false,
        active: true,
      },
    ],
    requests: [
      {
        id: "request-1",
        worker: "Rohan Kulkarni",
        type: "Shift swap",
        detail: "Evening rotation · Oct 18 · receive Morning rotation",
      },
      {
        id: "request-2",
        worker: "Priya Nair",
        type: "PTO review",
        detail: "Personal leave · Oct 22–24 · coverage verified",
      },
      {
        id: "request-3",
        worker: "Aditya Verma",
        type: "Shift swap",
        detail: "Night rotation · Oct 20 · cold-storage certified peer",
      },
      {
        id: "request-4",
        worker: "Isha Sharma",
        type: "Rest adjustment",
        detail: "Delay start to 10:00 AM after 6.5h turnaround",
      },
    ],
  };

  const iconMarkup = (name, className = "") =>
    `<svg class="icon ${className}" aria-hidden="true"><use href="#i-${name}"></use></svg>`;

  const escapeHtml = (value) =>
    String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  const initials = (name) =>
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase();

  const activeAlerts = () => state.alerts.filter((alert) => alert.active);
  const criticalCount = () => activeAlerts().filter((alert) => alert.severity === "critical").length;
  const moderateCount = () => activeAlerts().filter((alert) => alert.severity === "moderate").length;

  function syncLockState() {
    const hasOverlay =
      !dom.modalOverlay.hidden || !dom.drawerOverlay.hidden || !dom.searchOverlay.hidden;
    dom.body.classList.toggle("is-locked", hasOverlay);
  }

  function updateCounts() {
    const alerts = activeAlerts();
    $$("[data-alert-count]").forEach((node) => {
      node.textContent = String(alerts.length);
    });
    $$("[data-critical-count]").forEach((node) => {
      node.textContent = String(criticalCount());
    });
    $$("[data-moderate-count]").forEach((node) => {
      node.textContent = String(moderateCount());
    });
    $$("[data-total-workers]").forEach((node) => {
      node.textContent = String(state.totalWorkers);
    });
    $$("[data-active-shifts]").forEach((node) => {
      node.textContent = String(state.activeShifts);
    });
    $("#pendingMetric").textContent = String(state.pending);
    $("#swapMetric").textContent = `${state.swaps} Swaps`;
    $("#ptoMetric").textContent = `${state.pto} PTO Reviews`;
    $("#modelSync").textContent = state.modelSync;
  }

  function setDbStatus(status, label, title) {
    if (!dom.dbStatus) return;
    dom.dbStatus.dataset.state = status;
    dom.dbStatus.title = title;
    if (dom.dbStatusLabel) dom.dbStatusLabel.textContent = label;
  }

  function timeAgo(timestamp) {
    if (!timestamp) return "just now";
    const elapsed = Math.max(0, Date.now() - new Date(timestamp).getTime());
    const minutes = Math.floor(elapsed / 60_000);
    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes} min${minutes === 1 ? "" : "s"} ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours} hr${hours === 1 ? "" : "s"} ago`;
  }

  function renderDashboardAlerts() {
    const list = $("#alertList");
    if (!list) return;
    const visible = activeAlerts()
      .filter((alert) => alert.dashboard)
      .slice(0, 4);
    list.innerHTML = visible.map(alertMarkup).join("");
  }

  function syncDashboardDerivedState() {
    renderDashboardAlerts();

    const row = $("#fillShift")?.closest("tr");
    if (row) {
      const staffCell = row.children[2];
      const riskCell = row.children[3];
      const directiveCell = row.children[4];
      const actionButton = row.querySelector("button");
      if (state.operations.nightLineFilled) {
        staffCell.innerHTML = "<strong>3 / 4 Forklifts</strong>";
        staffCell.classList.remove("danger-text");
        riskCell.innerHTML = '<span class="risk-pill risk-pill--medium"><i></i>Moderate (57)</span>';
        directiveCell.textContent = "Relief assigned · monitor 03:00 handover";
        directiveCell.classList.remove("danger-text");
        actionButton.textContent = "Assigned";
        actionButton.disabled = true;
      } else {
        staffCell.innerHTML = '<span class="font-semibold danger-text"><strong>2 / 4 Forklifts</strong></span>';
        staffCell.classList.add("danger-text");
        riskCell.innerHTML = '<span class="risk-pill risk-pill--high"><i></i>High (88)</span>';
        directiveCell.textContent = "Require standby relief dispatch";
        directiveCell.classList.add("danger-text");
        actionButton.textContent = "Fill Shift";
        actionButton.disabled = false;
      }
    }

    const aiTitle = $("#aiCardTitle");
    const rebalanceButton = $("#rebalanceShifts");
    if (state.rebalanceApplied) {
      if (aiTitle) aiTitle.textContent = "Workload Rebalance Applied";
      if (rebalanceButton) {
        rebalanceButton.innerHTML = `${iconMarkup("check", "icon--20")}<span>Review Rebalanced Roster</span>`;
      }
    } else {
      if (aiTitle) aiTitle.textContent = "3 Critical Workload Imbalances Detected";
      if (rebalanceButton) {
        rebalanceButton.innerHTML = `${iconMarkup("sparkles", "icon--20")}<span>Auto-Rebalance Shifts with AI</span>`;
      }
    }
  }

  function applyServerState(nextState, event = null, { announce = false } = {}) {
    if (!nextState) return;
    state.totalWorkers = Number(nextState.metrics?.totalWorkers ?? state.totalWorkers);
    state.activeShifts = Number(nextState.metrics?.activeShifts ?? state.activeShifts);
    state.pending = Number(nextState.metrics?.pending ?? state.pending);
    state.swaps = Number(nextState.metrics?.swaps ?? state.swaps);
    state.pto = Number(nextState.metrics?.pto ?? state.pto);
    state.rebalanceApplied = Boolean(nextState.metrics?.rebalanceApplied);
    state.workers = Array.isArray(nextState.workers) ? nextState.workers : state.workers;
    state.alerts = Array.isArray(nextState.alerts) ? nextState.alerts : state.alerts;
    state.requests = Array.isArray(nextState.requests) ? nextState.requests : state.requests;
    state.settings = nextState.settings || state.settings;
    state.operations = nextState.operations || state.operations;
    state.updatedAt = nextState.updatedAt || state.updatedAt;
    state.modelSync = timeAgo(state.updatedAt);
    updateCounts();
    syncDashboardDerivedState();

    if (state.currentView !== "dashboard") {
      renderSecondaryView(state.currentView);
    }

    if (announce && event?.type) {
      toast("Live operational data updated from another session.", "info", 2200);
    }
  }

  async function realtimeAction(action, payload = {}) {
    if (!state.apiEnabled) {
      return { offline: true };
    }

    state.lastMutationAt = Date.now();
    setDbStatus("connecting", "Syncing", "Saving to the real-time database");
    try {
      const response = await fetch("/api/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, payload }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "The update could not be saved.");
      applyServerState(result.state, result.event);
      setDbStatus("connected", "Live DB", "Real-time database connected");
      return result;
    } catch (error) {
      setDbStatus("offline", "Offline", error.message || "Real-time database unavailable");
      toast(error.message || "Could not reach the live database.", "danger", 4200);
      throw error;
    }
  }

  async function initializeRealtime() {
    if (!state.apiEnabled) {
      setDbStatus("offline", "Preview", "Start with npm start for real-time shared data");
      return;
    }

    setDbStatus("connecting", "Connecting", "Connecting to the real-time database");
    try {
      const response = await fetch("/api/state", { cache: "no-store" });
      if (!response.ok) throw new Error("Could not load the real-time database.");
      const snapshot = await response.json();
      applyServerState(snapshot);
      setDbStatus("connected", "Live DB", "Real-time database connected");
    } catch (error) {
      setDbStatus("offline", "Offline", error.message);
      toast("Live database unavailable. The dashboard is running on its local preview data.", "danger", 4500);
      return;
    }

    const source = new EventSource("/api/events");
    state.eventSource = source;
    source.addEventListener("state", (event) => {
      try {
        const message = JSON.parse(event.data);
        const isOwnMutation = Date.now() - (state.lastMutationAt || 0) < 900;
        applyServerState(message.state, message.event, { announce: !isOwnMutation });
        setDbStatus("connected", "Live DB", "Real-time database connected");
      } catch (error) {
        console.error("Unable to read real-time update", error);
      }
    });
    source.onopen = () => {
      setDbStatus("connected", "Live DB", "Real-time database connected");
    };
    source.onerror = () => {
      setDbStatus("connecting", "Reconnecting", "Reconnecting to the real-time database");
    };
  }

  function toast(message, type = "success", duration = 3600) {
    if (!message) return;
    const toastNode = document.createElement("div");
    toastNode.className = `toast toast--${type}`;
    const icon = type === "danger" ? "warning" : type === "info" ? "info" : "check";
    toastNode.innerHTML = `
      <span class="toast__icon">${iconMarkup(icon, "icon--16")}</span>
      <span>${escapeHtml(message)}</span>
    `;
    dom.toastRegion.append(toastNode);
    while (dom.toastRegion.children.length > 3) {
      dom.toastRegion.firstElementChild.remove();
    }
    window.setTimeout(() => {
      toastNode.classList.add("is-leaving");
      window.setTimeout(() => toastNode.remove(), 190);
    }, duration);
  }

  function closeMobileNav() {
    dom.body.classList.remove("nav-open");
    dom.mobileBackdrop.hidden = true;
    dom.menuToggle.setAttribute("aria-expanded", "false");
  }

  function openMobileNav() {
    dom.body.classList.add("nav-open");
    dom.mobileBackdrop.hidden = false;
    dom.menuToggle.setAttribute("aria-expanded", "true");
  }

  function openModal({ eyebrow = "SafeShift AI", title, body, footer = "", afterOpen }) {
    closeSearch(false);
    dom.lastFocus = document.activeElement;
    dom.modalEyebrow.textContent = eyebrow;
    dom.modalTitle.textContent = title;
    dom.modalBody.innerHTML = body;
    dom.modalFooter.innerHTML = footer;
    dom.modalOverlay.hidden = false;
    dom.modalOverlay.scrollTop = 0;
    syncLockState();
    afterOpen?.(dom.modalBody, dom.modalFooter);
    requestAnimationFrame(() => {
      const focusTarget =
        dom.modalBody.querySelector("input:not([type='hidden']), select, textarea, button") ||
        dom.modalOverlay.querySelector("[data-close-modal]");
      focusTarget?.focus({ preventScroll: true });
    });
  }

  function closeModal({ restoreFocus = true } = {}) {
    if (dom.modalOverlay.hidden) return;
    dom.modalOverlay.hidden = true;
    dom.modalBody.innerHTML = "";
    dom.modalFooter.innerHTML = "";
    syncLockState();
    if (restoreFocus) dom.lastFocus?.focus?.({ preventScroll: true });
  }

  function openDrawer({ eyebrow, title, body }) {
    closeSearch(false);
    dom.drawerEyebrow.textContent = eyebrow;
    dom.drawerTitle.textContent = title;
    dom.drawerBody.innerHTML = body;
    dom.drawerOverlay.hidden = false;
    syncLockState();
    requestAnimationFrame(() => dom.drawerOverlay.querySelector("[data-close-drawer]")?.focus());
  }

  function closeDrawer() {
    if (dom.drawerOverlay.hidden) return;
    dom.drawerOverlay.hidden = true;
    dom.drawerBody.innerHTML = "";
    syncLockState();
  }

  function setActiveNav(view) {
    $$("[data-view-link]").forEach((link) => {
      const active = link.dataset.viewLink === view;
      link.classList.toggle("is-active", active);
      if (active) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
  }

  function navigate(view, { updateHash = true } = {}) {
    if (!viewMeta[view]) view = "dashboard";
    state.currentView = view;
    closeMobileNav();
    setActiveNav(view);
    document.title = `${viewMeta[view].title} | SafeShift AI`;
    if (updateHash) {
      const nextHash = view === "dashboard" ? "" : `#${view}`;
      history.replaceState(null, "", `${location.pathname}${location.search}${nextHash}`);
    }

    if (view === "dashboard") {
      dom.secondaryView.hidden = true;
      dom.secondaryView.innerHTML = "";
      dom.dashboardView.hidden = false;
      dom.dashboardView.classList.add("is-active");
      applyPerspective();
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    dom.dashboardView.hidden = true;
    dom.dashboardView.classList.remove("is-active");
    dom.secondaryView.hidden = false;
    renderSecondaryView(view);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function secondaryHeader(view, actions = "") {
    const meta = viewMeta[view];
    return `
      <section class="secondary-heading">
        <div>
          <span class="eyebrow">${escapeHtml(meta.title)}</span>
          <h1>${escapeHtml(meta.heading)}</h1>
          <p>${escapeHtml(meta.description)}</p>
        </div>
        <div class="secondary-actions">${actions}</div>
      </section>
    `;
  }

  function riskBadge(risk) {
    if (risk >= 75) {
      return `<span class="status-badge status-badge--danger"><i></i>High risk</span>`;
    }
    if (risk >= 50) {
      return `<span class="status-badge status-badge--warning"><i></i>Monitor</span>`;
    }
    return `<span class="status-badge status-badge--safe"><i></i>Ready</span>`;
  }

  function summaryCard(label, value, suffix, description) {
    return `
      <article class="summary-card">
        <span class="summary-card__label">${escapeHtml(label)}</span>
        <div class="summary-card__value">
          <strong>${escapeHtml(value)}</strong>
          <span>${escapeHtml(suffix)}</span>
        </div>
        <p>${escapeHtml(description)}</p>
      </article>
    `;
  }

  function renderSecondaryView(view) {
    let content = "";
    switch (view) {
      case "workers":
        content = renderWorkersView();
        break;
      case "shift-scheduler":
        content = renderSchedulerView();
        break;
      case "leave-and-shift-swaps":
        content = renderRequestsView();
        break;
      case "ai-fatigue-prediction":
        content = renderFatigueView();
        break;
      case "safety-alerts":
        content = renderAlertsView();
        break;
      case "reports-and-analytics":
        content = renderReportsView();
        break;
      case "settings":
        content = renderSettingsView();
        break;
      default:
        content = "";
    }
    dom.secondaryView.innerHTML = content;
  }

  function renderWorkersView() {
    const highRisk = state.workers.filter((worker) => worker.risk >= 75).length;
    const ready = state.workers.filter((worker) => worker.risk < 50).length;
    return `
      ${secondaryHeader(
        "workers",
        `
          <button class="button button--soft" type="button" data-secondary-action="open-search">
            ${iconMarkup("search", "icon--18")} Search directory
          </button>
          <button class="button button--primary" type="button" data-secondary-action="add-worker">
            ${iconMarkup("person-add", "icon--18")} Add Worker
          </button>
        `,
      )}
      <div class="secondary-grid">
        ${summaryCard("Total Workers", "248", "+4 this month", "Across four active facilities and nine operational teams.")}
        ${summaryCard("High Risk", String(highRisk), "needs action", "Workers at or above the fatigue intervention threshold.")}
        ${summaryCard("Ready Now", String(ready), "assigned", "Workers in the visible sample with a safe current fatigue score.")}
      </div>
      <article class="full-card" style="margin-top: 16px;">
        <div class="card-heading card-heading--inline">
          <div>
            <h2>Worker Readiness</h2>
            <p>Live status from shift, overtime, and fatigue telemetry.</p>
          </div>
          <span class="soft-count">${state.workers.length} visible records</span>
        </div>
        <div class="table-wrap">
          <table class="full-table">
            <thead>
              <tr>
                <th>Worker</th>
                <th>Facility</th>
                <th>Current Shift</th>
                <th>Duty Context</th>
                <th>Fatigue</th>
                <th>Status</th>
                <th class="align-right">Action</th>
              </tr>
            </thead>
            <tbody>
              ${state.workers
                .map(
                  (worker) => `
                    <tr>
                      <td>
                        <div class="person-cell">
                          <span class="person-avatar">${escapeHtml(initials(worker.name))}</span>
                          <span><strong>${escapeHtml(worker.name)}</strong><small>${escapeHtml(worker.role)}</small></span>
                        </div>
                      </td>
                      <td>${escapeHtml(worker.facility)}</td>
                      <td>${escapeHtml(worker.shift)}</td>
                      <td>${escapeHtml(worker.duty)}</td>
                      <td><strong>${worker.risk}</strong> / 100</td>
                      <td>${riskBadge(worker.risk)}</td>
                      <td class="align-right"><button class="table-action" type="button" data-worker-id="${escapeHtml(worker.id)}">View</button></td>
                    </tr>
                  `,
                )
                .join("")}
            </tbody>
          </table>
        </div>
      </article>
    `;
  }

  function renderSchedulerView() {
    const days = [
      { day: "Mon 14", shifts: [["Morning", "48 / 50", ""], ["Evening", "26 / 28", ""]] },
      { day: "Tue 15", shifts: [["Morning", "47 / 50", ""], ["Evening", "27 / 28", ""]] },
      { day: "Wed 16", shifts: [["Morning", "48 / 50", ""], ["Night", "13 / 14", "warning"]] },
      { day: "Thu 17", shifts: [["Morning", "50 / 50", ""], ["Evening", "26 / 28", "warning"]] },
      { day: "Fri 18", shifts: [["Morning", "48 / 50", ""], ["Evening", "28 / 28", ""]] },
      { day: "Sat 19", shifts: [["Evening", "26 / 28", "warning"], ["Night", "12 / 14", "danger"]] },
      { day: "Sun 20", shifts: [["Morning", "45 / 50", "warning"], ["Night", "11 / 14", "danger"]] },
    ];
    return `
      ${secondaryHeader(
        "shift-scheduler",
        `
          <button class="button button--soft" type="button" data-secondary-action="open-shift">${iconMarkup("clock", "icon--18")} Adjust rotation</button>
          <button class="button button--primary" type="button" data-secondary-action="assign-shift">${iconMarkup("calendar", "icon--18")} Assign Shift</button>
        `,
      )}
      <div class="secondary-grid">
        ${summaryCard("Active Shifts", String(state.activeShifts), "across 3 tiers", "Morning, evening, and night rotations across four plants.")}
        ${summaryCard("Coverage", "93.5%", "staffed", "86 of 92 operational stations are covered for the current window.")}
        ${summaryCard("At-Risk Gaps", "2", "rotations", "Night Line Prep and cold-storage receiving remain below target.")}
      </div>
      <article class="full-card" style="margin-top: 16px;">
        <div class="card-heading card-heading--inline">
          <div><h2>Weekly Rotation Plan</h2><p>Oct 14–20, 2024 · drag-free MVP planner</p></div>
          <span class="status-badge status-badge--warning"><i></i>2 capacity gaps</span>
        </div>
        <div style="overflow-x: auto;">
          <div class="week-grid">
            ${days
              .map(
                ({ day, shifts }) => `
                  <div class="week-day">
                    <div class="week-day__label">${day}</div>
                    ${shifts
                      .map(
                        ([name, coverage, tone]) => `
                          <div class="week-shift ${tone ? `week-shift--${tone}` : ""}">
                            <strong>${name}</strong>
                            ${coverage} staffed
                          </div>
                        `,
                      )
                      .join("")}
                  </div>
                `,
              )
              .join("")}
          </div>
        </div>
      </article>
    `;
  }

  function renderRequestsView() {
    return `
      ${secondaryHeader(
        "leave-and-shift-swaps",
        `
          <button class="button button--soft" type="button" data-secondary-action="open-search">${iconMarkup("search", "icon--18")} Find request</button>
          <button class="button button--primary" type="button" data-secondary-action="assign-shift">${iconMarkup("swap", "icon--18")} New Swap</button>
        `,
      )}
      <div class="secondary-grid">
        ${summaryCard("Pending Requests", String(state.pending), "action required", "Shift swaps, PTO reviews, and rest adjustments awaiting manager approval.")}
        ${summaryCard("Average Response", "2.4h", "this week", "Requests are being resolved faster than the 4-hour service target.")}
        ${summaryCard("Coverage Risk", "1", "request", "One swap has a rest-turnaround warning that needs an adjusted start time.")}
      </div>
      <article class="full-card" style="margin-top: 16px;">
        <div class="card-heading card-heading--inline">
          <div><h2>Approval Queue</h2><p>Changes update staffing coverage and pending metrics.</p></div>
          <span class="soft-count">${state.requests.length} visible</span>
        </div>
        <div class="modal-list" style="margin-top: 12px;">
          ${state.requests
            .map(
              (request) => `
                <div class="request-card" data-request-card="${escapeHtml(request.id)}">
                  <div>
                    <strong>${escapeHtml(request.worker)} · ${escapeHtml(request.type)}</strong>
                    <p>${escapeHtml(request.detail)}</p>
                  </div>
                  <div class="request-actions">
                    <button type="button" data-request-action="approve" data-request-id="${escapeHtml(request.id)}">Approve</button>
                    <button type="button" data-request-action="decline" data-request-id="${escapeHtml(request.id)}">Decline</button>
                  </div>
                </div>
              `,
            )
            .join("")}
        </div>
      </article>
    `;
  }

  function renderFatigueView() {
    const highRisk = state.workers.filter((worker) => worker.risk >= 75);
    return `
      ${secondaryHeader(
        "ai-fatigue-prediction",
        `
          <button class="button button--soft" type="button" data-secondary-action="confidence">${iconMarkup("brain", "icon--18")} Model explainability</button>
          <button class="button button--primary" type="button" data-secondary-action="rebalance">${iconMarkup("sparkles", "icon--18")} Rebalance with AI</button>
        `,
      )}
      <div class="secondary-grid">
        ${summaryCard("High Fatigue Risk", String(highRisk.length), "intervention", "Workers at or above the 75-point predictive fatigue threshold.")}
        ${summaryCard("Model Confidence", "94%", "stable", "Ensemble confidence using shift, rest, overtime, and sensor-input signals.")}
        ${summaryCard("Avoidable Incidents", "78%", "projected", "Estimated reduction with the recommended shift rebalance plan.")}
      </div>
      <article class="full-card" style="margin-top: 16px;">
        <div class="card-heading card-heading--inline">
          <div><h2>Intervention Queue</h2><p>Explainable risk drivers for the highest-ranked workers.</p></div>
          <span class="confidence-tag">${iconMarkup("sparkles", "icon--14")} 94% Confidence</span>
        </div>
        <div class="table-wrap">
          <table class="full-table">
            <thead><tr><th>Worker</th><th>Risk</th><th>Primary Signal</th><th>Recommended Action</th><th class="align-right">Review</th></tr></thead>
            <tbody>
              ${highRisk
                .map(
                  (worker) => `
                    <tr>
                      <td><div class="person-cell"><span class="person-avatar">${escapeHtml(initials(worker.name))}</span><span><strong>${escapeHtml(worker.name)}</strong><small>${escapeHtml(worker.role)}</small></span></div></td>
                      <td><strong class="danger-text">${worker.risk}</strong> / 100</td>
                      <td>${escapeHtml(worker.duty)}</td>
                      <td>${worker.risk >= 85 ? "Dispatch relief before next rotation" : "Adjust rest window and reduce overtime"}</td>
                      <td class="align-right"><button class="table-action" type="button" data-worker-id="${escapeHtml(worker.id)}">Open</button></td>
                    </tr>
                  `,
                )
                .join("")}
            </tbody>
          </table>
        </div>
        <div class="detail-grid" style="margin-top: 14px;">
          <div class="detail-tile"><span>Overtime contribution</span><strong>38%</strong></div>
          <div class="detail-tile"><span>Rest deficit</span><strong>27%</strong></div>
          <div class="detail-tile"><span>Sensor pattern</span><strong>19%</strong></div>
          <div class="detail-tile"><span>Circadian strain</span><strong>16%</strong></div>
        </div>
      </article>
    `;
  }

  function alertMarkup(alert) {
    const severityClass = alert.severity === "critical" ? "alert-item--critical" : "alert-item--info";
    const chipClass = alert.severity === "critical" ? "alert-chip--danger" : "alert-chip--blue";
    return `
      <article class="alert-item ${severityClass}" data-alert-id="${escapeHtml(alert.id)}">
        <div class="alert-item__top">
          <p><strong>${escapeHtml(alert.title)}</strong> <span>${escapeHtml(alert.meta)}</span></p>
          <span class="alert-chip ${chipClass}">${escapeHtml(alert.chip)}</span>
        </div>
        <p class="alert-item__copy">${escapeHtml(alert.copy)}</p>
        <div class="alert-item__foot">
          <span class="${alert.severity === "critical" ? "alert-action" : "alert-note"}">${alert.severity === "critical" ? iconMarkup("bolt", "icon--14") : ""}${escapeHtml(alert.note)}</span>
          <button class="button button--mini-neutral" type="button" data-resolve-alert="${escapeHtml(alert.id)}">${escapeHtml(alert.action)}</button>
        </div>
      </article>
    `;
  }

  function renderAlertsView() {
    return `
      ${secondaryHeader(
        "safety-alerts",
        `
          <button class="button button--soft" type="button" data-secondary-action="notifications">${iconMarkup("bell", "icon--18")} Open live stream</button>
          <button class="button button--primary" type="button" data-secondary-action="incident">${iconMarkup("warning", "icon--18")} Log Incident</button>
        `,
      )}
      <div class="secondary-grid">
        ${summaryCard("Active Alerts", String(activeAlerts().length), "live", "Open signals requiring supervisor review or dispatch action.")}
        ${summaryCard("Critical", String(criticalCount()), "urgent", "Critical alerts may require immediate relief or a medical check.")}
        ${summaryCard("Moderate", String(moderateCount()), "monitor", "Preventive interventions recommended before the next shift.")}
      </div>
      <article class="full-card" style="margin-top: 16px;">
        <div class="card-heading card-heading--inline">
          <div><h2>All Active Notifications</h2><p>Resolved items are removed from the live stream immediately.</p></div>
          <span class="live-count">${activeAlerts().length} Live</span>
        </div>
        <div class="alert-list" style="margin-top: 12px;">
          ${activeAlerts().map(alertMarkup).join("")}
        </div>
      </article>
    `;
  }

  function renderReportsView() {
    return `
      ${secondaryHeader(
        "reports-and-analytics",
        `
          <button class="button button--soft" type="button" data-secondary-action="confidence">${iconMarkup("brain", "icon--18")} AI model card</button>
          <button class="button button--primary" type="button" data-secondary-action="report">${iconMarkup("download", "icon--18")} Export Safety Report</button>
        `,
      )}
      <div class="secondary-grid">
        ${summaryCard("Compliance", "98.4%", "OSHA ready", "Current shift records meet the configured audit evidence checks.")}
        ${summaryCard("Weekly Fatigue", "54.2", "avg score", "The score peaked at 92 on the Saturday night rotation.")}
        ${summaryCard("Overtime", "142.5h", "this week", "Cold storage and Plant 1 account for most overtime exposure.")}
      </div>
      <div class="secondary-grid secondary-grid--2" style="margin-top: 16px;">
        <article class="full-card">
          <h2>Fatigue by Day</h2>
          <p>Normalized predicted score across the current week.</p>
          <div class="chart-well" style="margin-top: 14px; padding-bottom: 13px;">
            <div style="display: flex; height: 190px; align-items: flex-end; gap: 10px; padding: 10px 8px 0;">
              ${[34, 45, 59, 72, 84, 92, 57]
                .map(
                  (value, index) => `
                    <div style="flex:1; display:flex; flex-direction:column; align-items:center; gap:7px;">
                      <span style="font-size:9px; font-weight:600; color:${value >= 85 ? "#dc2626" : "#526079"};">${value}</span>
                      <span style="width:100%; height:${value * 1.8}px; border-radius:5px 5px 2px 2px; background:${value >= 85 ? "#ef4444" : value >= 70 ? "#6d93ff" : "#cbd8ff"};"></span>
                      <small style="font-size:8px; color:#788397;">${["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][index]}</small>
                    </div>
                  `,
                )
                .join("")}
            </div>
          </div>
        </article>
        <article class="full-card">
          <h2>Coverage &amp; Compliance</h2>
          <p>Shift-level controls completed for the current reporting period.</p>
          <div class="modal-list" style="margin-top: 14px;">
            <div class="modal-list__item"><div><strong>Rest-period checks</strong><span>92 of 94 assignments inside policy</span></div><span class="status-badge status-badge--safe"><i></i>97.9%</span></div>
            <div class="modal-list__item"><div><strong>Fatigue reviews</strong><span>6 of 9 high-risk reviews completed</span></div><span class="status-badge status-badge--warning"><i></i>67%</span></div>
            <div class="modal-list__item"><div><strong>Dispatch relief</strong><span>4 critical interventions logged</span></div><span class="status-badge status-badge--safe"><i></i>Complete</span></div>
          </div>
        </article>
      </div>
    `;
  }

  function renderSettingsView() {
    return `
      ${secondaryHeader(
        "settings",
        `<button class="button button--primary" type="button" data-secondary-action="save-settings">${iconMarkup("check", "icon--18")} Save preferences</button>`,
      )}
      <div class="secondary-grid">
        ${summaryCard("Workspace", "North & Central", "operations", "Primary safety and workforce workspace for the demo account.")}
        ${summaryCard("Data Freshness", "2 min", "model sync", "Telemetry and AI inference are refreshed continuously.")}
        ${summaryCard("Dispatch Policy", "Human", "authority", "AI recommendations remain non-diagnostic decision support.")}
      </div>
      <section class="secondary-grid secondary-grid--2" style="margin-top: 16px;">
        <article class="full-card">
          <h2>Operational Preferences</h2>
          <p>Controls affect how recommendations are surfaced to managers.</p>
          <div style="margin-top: 7px;">
            <div class="settings-row">
              <div><strong>Critical alert notifications</strong><p>Show immediate in-app notifications for fatigue and staffing hazards.</p></div>
              <button class="switch is-on" type="button" role="switch" aria-checked="true" data-setting-toggle></button>
            </div>
            <div class="settings-row">
              <div><strong>AI dispatch suggestions</strong><p>Generate safe shift rebalancing recommendations with explainability.</p></div>
              <button class="switch is-on" type="button" role="switch" aria-checked="true" data-setting-toggle></button>
            </div>
            <div class="settings-row">
              <div><strong>Worker-view nudges</strong><p>Send rest and rotation guidance to assigned worker devices.</p></div>
              <button class="switch" type="button" role="switch" aria-checked="false" data-setting-toggle></button>
            </div>
          </div>
        </article>
        <article class="full-card">
          <h2>Human Authority Controls</h2>
          <p>Safety guardrails applied to every AI-assisted dispatch.</p>
          <div class="modal-list" style="margin-top: 14px;">
            <div class="modal-list__item"><div><strong>Manager approval required</strong><span>All rosters and medical suspensions</span></div><span class="status-badge status-badge--safe"><i></i>Enabled</span></div>
            <div class="modal-list__item"><div><strong>Non-diagnostic labeling</strong><span>Displayed on every AI suggestion</span></div><span class="status-badge status-badge--safe"><i></i>Enabled</span></div>
            <div class="modal-list__item"><div><strong>Decision audit trail</strong><span>Retain dispatch changes for 365 days</span></div><span class="status-badge status-badge--safe"><i></i>Enabled</span></div>
          </div>
        </article>
      </section>
    `;
  }

  function openIncidentForm(initialTab = "incident") {
    const body = `
      <div class="form-tabs" role="tablist" aria-label="Operations entry type">
        <button type="button" role="tab" data-entry-tab="shift">Add Shift</button>
        <button type="button" role="tab" data-entry-tab="incident">Log Incident</button>
      </div>
      <form id="incidentForm" data-entry-form="incident" class="form-grid">
        <div class="field">
          <label for="incidentWorker">Worker or area</label>
          <input id="incidentWorker" name="worker" placeholder="e.g. Marcus Chen" required />
        </div>
        <div class="field">
          <label for="incidentSeverity">Severity</label>
          <select id="incidentSeverity" name="severity" required>
            <option value="Critical">Critical · immediate review</option>
            <option value="Moderate" selected>Moderate · monitor closely</option>
            <option value="Low">Low · record only</option>
          </select>
        </div>
        <div class="field">
          <label for="incidentLocation">Facility / location</label>
          <select id="incidentLocation" name="location" required>
            <option>Plant 1 · Assembly</option>
            <option>Plant 2 · Cold Storage</option>
            <option>Plant 3 · Robotics</option>
            <option>Dispatch &amp; logistics</option>
          </select>
        </div>
        <div class="field">
          <label for="incidentType">Incident type</label>
          <select id="incidentType" name="type" required>
            <option>Fatigue / rest concern</option>
            <option>Near miss</option>
            <option>Equipment hazard</option>
            <option>Staffing deficit</option>
          </select>
        </div>
        <div class="field field--full">
          <label for="incidentNotes">What happened?</label>
          <textarea id="incidentNotes" name="notes" placeholder="Describe the observed signal, location, and immediate action needed..." required></textarea>
          <span class="field-hint">This entry is added to the live safety stream and retained in the audit trail.</span>
        </div>
      </form>

      <form id="shiftForm" data-entry-form="shift" class="form-grid" hidden>
        <div class="field">
          <label for="shiftWorker">Assign to worker</label>
          <select id="shiftWorker" name="worker" required>
            ${state.workers.map((worker) => `<option>${escapeHtml(worker.name)}</option>`).join("")}
          </select>
        </div>
        <div class="field">
          <label for="shiftDate">Shift date</label>
          <input id="shiftDate" name="date" type="date" value="2024-10-18" required />
        </div>
        <div class="field">
          <label for="shiftStart">Start time</label>
          <input id="shiftStart" name="start" type="time" value="22:00" required />
        </div>
        <div class="field">
          <label for="shiftEnd">End time</label>
          <input id="shiftEnd" name="end" type="time" value="06:00" required />
        </div>
        <div class="field">
          <label for="shiftFacility">Facility</label>
          <select id="shiftFacility" name="facility" required>
            <option>Plant 1 · Assembly</option>
            <option>Plant 2 · Cold Storage</option>
            <option>Plant 3 · Robotics</option>
          </select>
        </div>
        <div class="field">
          <label for="shiftRole">Role</label>
          <select id="shiftRole" name="role" required>
            <option>Forklift Operator</option>
            <option>Assembly Associate</option>
            <option>Maintenance Technician</option>
            <option>QA Inspector</option>
          </select>
        </div>
        <div class="field field--full">
          <label for="shiftNotes">Assignment note</label>
          <textarea id="shiftNotes" name="notes" placeholder="Optional handover or coverage note..."></textarea>
        </div>
      </form>
    `;

    openModal({
      eyebrow: "Operations entry",
      title: "Log Incident / Add Shift",
      body,
      footer: `
        <button class="button button--soft" type="button" data-close-modal>Cancel</button>
        <button class="button button--primary" type="submit" form="shiftForm" id="entrySubmit">Assign shift</button>
      `,
      afterOpen: (modalBody) => {
        const tabs = $$("[data-entry-tab]", modalBody);
        const forms = $$("[data-entry-form]", modalBody);
        const submit = $("#entrySubmit");
        const setTab = (tab) => {
          tabs.forEach((button) => button.classList.toggle("is-active", button.dataset.entryTab === tab));
          forms.forEach((form) => {
            form.hidden = form.dataset.entryForm !== tab;
          });
          submit.setAttribute("form", tab === "incident" ? "incidentForm" : "shiftForm");
          submit.textContent = tab === "incident" ? "Log incident" : "Assign shift";
          requestAnimationFrame(() => modalBody.querySelector(`[data-entry-form="${tab}"] input, [data-entry-form="${tab}"] select, [data-entry-form="${tab}"] textarea`)?.focus());
        };
        tabs.forEach((button) => button.addEventListener("click", () => setTab(button.dataset.entryTab)));
        setTab(initialTab);

        $("#incidentForm").addEventListener("submit", handleIncidentSubmit);
        $("#shiftForm").addEventListener("submit", handleShiftSubmit);
      },
    });
  }

  async function handleIncidentSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const title = String(data.get("worker") || "").trim();
    const severity = String(data.get("severity") || "Moderate");
    const location = String(data.get("location") || "");
    const type = String(data.get("type") || "Safety signal");
    const notes = String(data.get("notes") || "").trim();
    if (!title || !notes) return;

    if (state.apiEnabled) {
      try {
        await realtimeAction("add-incident", { worker: title, severity, location, type, notes });
        closeModal();
        toast(`Incident logged for ${title}. It is now in the live safety stream.`, severity === "Critical" ? "danger" : "success");
      } catch {
        // The database error is surfaced by realtimeAction.
      }
      return;
    }

    state.alerts.unshift({
      id: `incident-${Date.now()}`,
      title,
      meta: `(${location})`,
      chip: severity === "Critical" ? "Critical" : type,
      severity: severity === "Critical" ? "critical" : "moderate",
      copy: notes,
      note: `${type} · Reported by Ananya Rao`,
      action: "Review",
      dashboard: true,
      active: true,
    });

    const newAlert = state.alerts[0];
    const list = $("#alertList");
    if (list) list.insertAdjacentHTML("afterbegin", alertMarkup(newAlert));
    if (state.currentView === "safety-alerts") renderSecondaryView("safety-alerts");
    state.modelSync = "Updated just now";
    updateCounts();
    closeModal();
    toast(`Incident logged for ${title}. It is now in the live safety stream.`, severity === "Critical" ? "danger" : "success");
  }

  async function handleShiftSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const workerName = String(data.get("worker") || "");
    const date = String(data.get("date") || "");
    const start = String(data.get("start") || "");
    const facility = String(data.get("facility") || "");
    const end = String(data.get("end") || "");
    if (state.apiEnabled) {
      try {
        await realtimeAction("assign-shift", {
          worker: workerName,
          date,
          start,
          end,
          facility,
          role: String(data.get("role") || ""),
          notes: String(data.get("notes") || ""),
        });
        closeModal();
        toast(`Shift assigned to ${workerName} for ${date} at ${start}.`);
      } catch {
        // The database error is surfaced by realtimeAction.
      }
      return;
    }

    const worker = state.workers.find((item) => item.name === workerName);
    if (worker) {
      worker.facility = facility;
      worker.shift = `${start} start · ${date}`;
      worker.duty = "New assignment · monitor first shift";
    }
    state.activeShifts += 1;
    updateCounts();
    closeModal();
    toast(`Shift assigned to ${workerName} for ${date} at ${start}.`);
  }

  function openAddWorker() {
    const body = `
      <form id="workerForm" class="form-grid">
        <div class="field">
          <label for="workerName">Full name</label>
          <input id="workerName" name="name" placeholder="e.g. Isha Sharma" required />
        </div>
        <div class="field">
          <label for="workerRole">Role</label>
          <select id="workerRole" name="role" required>
            <option>Forklift Operator</option>
            <option>Assembly Associate</option>
            <option>Maintenance Technician</option>
            <option>QA Inspector</option>
            <option>Dispatch Lead</option>
          </select>
        </div>
        <div class="field">
          <label for="workerFacility">Facility</label>
          <select id="workerFacility" name="facility" required>
            <option>Plant 1 · Assembly</option>
            <option>Plant 2 · Cold Storage</option>
            <option>Plant 3 · Robotics</option>
            <option>Dispatch &amp; Logistics</option>
          </select>
        </div>
        <div class="field">
          <label for="workerShift">Initial shift</label>
          <select id="workerShift" name="shift" required>
            <option>Morning · 06:00–14:00</option>
            <option>Evening · 14:00–22:00</option>
            <option>Night · 22:00–06:00</option>
          </select>
        </div>
        <div class="field field--full">
          <label for="workerEmail">Work email</label>
          <input id="workerEmail" name="email" type="email" placeholder="name@company.com" required />
          <span class="field-hint">An onboarding and safety-policy review will be added to the approval queue.</span>
        </div>
      </form>
    `;
    openModal({
      eyebrow: "Workforce",
      title: "Add Worker",
      body,
      footer: `
        <button class="button button--soft" type="button" data-close-modal>Cancel</button>
        <button class="button button--primary" type="submit" form="workerForm">Add to roster</button>
      `,
      afterOpen: () => {
        $("#workerForm").addEventListener("submit", (event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          const name = String(data.get("name") || "").trim();
          if (!name) return;
          state.workers.unshift({
            id: `worker-${Date.now()}`,
            name,
            role: String(data.get("role") || ""),
            facility: String(data.get("facility") || ""),
            shift: String(data.get("shift") || ""),
            risk: 18,
            duty: "Onboarding · first shift pending",
            status: "Ready",
          });
          state.totalWorkers += 1;
          updateCounts();
          closeModal();
          if (state.currentView === "workers") renderSecondaryView("workers");
          toast(`${name} added to the workforce roster.`);
        });
      },
    });
  }

  function openConfidence() {
    openModal({
      eyebrow: "Explainable AI",
      title: "94% Fatigue Prediction Confidence",
      body: `
        <p class="modal-copy">The fatigue model combines recent shift length, rest turnaround, overtime exposure, and biometric sensor drift. Signals below are shown only as decision support and require manager review.</p>
        <div class="detail-grid" style="margin-top: 15px;">
          <div class="detail-tile"><span>Overtime contribution</span><strong>38%</strong></div>
          <div class="detail-tile"><span>Rest deficit</span><strong>27%</strong></div>
          <div class="detail-tile"><span>Sensor pattern drift</span><strong>19%</strong></div>
          <div class="detail-tile"><span>Circadian strain</span><strong>16%</strong></div>
        </div>
        <div class="modal-list" style="margin-top: 14px;">
          <div class="modal-list__item"><div><strong>Prediction window</strong><span>Next 12 hours · refreshed 2 minutes ago</span></div><span class="status-badge status-badge--safe"><i></i>Live</span></div>
          <div class="modal-list__item"><div><strong>Training population</strong><span>14,800 anonymized shift records</span></div><span class="status-badge status-badge--warning"><i></i>Non-diagnostic</span></div>
        </div>
      `,
      footer: `<button class="button button--primary" type="button" data-close-modal>Understood</button>`,
    });
  }

  function openWorkerDetails(worker) {
    openModal({
      eyebrow: "Worker readiness",
      title: worker.name,
      body: `
        <div class="modal-list">
          <div class="modal-list__item">
            <div><strong>${escapeHtml(worker.role)}</strong><span>${escapeHtml(worker.facility)}</span></div>
            ${riskBadge(worker.risk)}
          </div>
          <div class="modal-list__item"><div><strong>Current assignment</strong><span>${escapeHtml(worker.shift)}</span></div><span class="soft-count">${escapeHtml(worker.duty)}</span></div>
          <div class="modal-list__item"><div><strong>Fatigue score</strong><span>Predictive score for the next 12 hours</span></div><strong class="${worker.risk >= 75 ? "danger-text" : ""}">${worker.risk} / 100</strong></div>
        </div>
        <div class="detail-grid" style="margin-top: 14px;">
          <div class="detail-tile"><span>Rest compliance</span><strong>${worker.risk >= 75 ? "At risk" : "Compliant"}</strong></div>
          <div class="detail-tile"><span>Supervisor review</span><strong>${worker.risk >= 75 ? "Required" : "Not required"}</strong></div>
        </div>
      `,
      footer: `
        <button class="button button--soft" type="button" data-close-modal>Close</button>
        <button class="button button--primary" type="button" data-worker-assign="${escapeHtml(worker.id)}">Assign shift</button>
      `,
      afterOpen: () => {
        $("[data-worker-assign]")?.addEventListener("click", () => {
          closeModal({ restoreFocus: false });
          openIncidentForm("shift");
        });
      },
    });
  }

  function openShiftDetails(shiftName) {
    const rows = {
      "Evening Shift B": {
        time: "14:00–22:00",
        facility: "Stamping & Presses · Plant 1",
        staffed: "18 / 18",
        risk: "Low (24)",
        directive: "Standard hydration and ergonomic break.",
      },
      "Overnight Maintenance": {
        time: "23:00–07:00",
        facility: "Robotics Bay 4",
        staffed: "6 / 6",
        risk: "Moderate (62)",
        directive: "Mandate micro-break at 03:30 AM.",
      },
      "Night Line Prep": {
        time: "22:00–06:00",
        facility: "Cold Storage · Zone B",
        staffed: "2 / 4 Forklifts",
        risk: "High (88)",
        directive: "Require standby relief dispatch.",
      },
    };
    const shift = rows[shiftName] || rows["Evening Shift B"];
    openModal({
      eyebrow: "Shift risk review",
      title: shiftName,
      body: `
        <div class="detail-grid">
          <div class="detail-tile"><span>Time</span><strong>${escapeHtml(shift.time)}</strong></div>
          <div class="detail-tile"><span>Staffed</span><strong>${escapeHtml(shift.staffed)}</strong></div>
          <div class="detail-tile"><span>Predicted risk</span><strong class="${shift.risk.includes("High") ? "danger-text" : ""}">${escapeHtml(shift.risk)}</strong></div>
          <div class="detail-tile"><span>Facility</span><strong style="font-size: 11px;">${escapeHtml(shift.facility)}</strong></div>
        </div>
        <p class="modal-copy" style="margin-top: 15px;">${escapeHtml(shift.directive)}</p>
        <div class="worker-mode-banner" style="margin: 15px 0 0;">
          ${iconMarkup("verified", "icon--16")}
          <span><strong>Human approval required.</strong> The recommendation supports the shift supervisor and does not dispatch workers automatically.</span>
        </div>
      `,
      footer: `
        <button class="button button--soft" type="button" data-close-modal>Close</button>
        <button class="button button--primary" type="button" data-close-modal>Acknowledge</button>
      `,
    });
  }

  function openRoster() {
    openModal({
      eyebrow: "Next 12 hours",
      title: "Critical Shift Roster",
      body: `
        <div class="modal-list">
          <div class="modal-list__item"><div><strong>Evening Shift B</strong><span>14:00–22:00 · 18 / 18 assigned</span></div><span class="status-badge status-badge--safe"><i></i>Covered</span></div>
          <div class="modal-list__item"><div><strong>Night Line Prep</strong><span>22:00–06:00 · 2 / 4 forklifts assigned</span></div><span class="status-badge status-badge--danger"><i></i>Action</span></div>
          <div class="modal-list__item"><div><strong>Overnight Maintenance</strong><span>23:00–07:00 · 6 / 6 assigned</span></div><span class="status-badge status-badge--safe"><i></i>Covered</span></div>
        </div>
        <p class="modal-copy" style="margin-top: 14px;">Cold storage receiving has three certified standby operators available. The next recommended action is to call in one relief operator for the 22:00 window.</p>
      `,
      footer: `
        <button class="button button--soft" type="button" data-close-modal>Close</button>
        <button class="button button--primary" type="button" id="rosterCallStandby">Call Standby</button>
      `,
      afterOpen: () => {
        $("#rosterCallStandby")?.addEventListener("click", () => {
          closeModal();
          toast("Standby relief request sent to three certified cold-storage operators.", "info");
        });
      },
    });
  }

  function openNotifications() {
    const alerts = activeAlerts();
    const body = alerts.length
      ? `
          <p class="modal-copy" style="margin-bottom: 12px;">${alerts.length} active notifications across fatigue, rest compliance, equipment, and staffing risk.</p>
          ${alerts
            .map(
              (alert) => `
                <div class="drawer-alert">
                  <div class="drawer-alert__top">
                    <div><strong>${escapeHtml(alert.title)}</strong><p style="margin-top:2px;">${escapeHtml(alert.meta)}</p></div>
                    <span class="alert-chip ${alert.severity === "critical" ? "alert-chip--danger" : "alert-chip--blue"}">${escapeHtml(alert.chip)}</span>
                  </div>
                  <p>${escapeHtml(alert.copy)}</p>
                  <div style="display:flex; align-items:center; justify-content:space-between; gap:8px;">
                    <span class="alert-note">${escapeHtml(alert.note)}</span>
                    <button type="button" data-drawer-alert="${escapeHtml(alert.id)}">${escapeHtml(alert.action)} →</button>
                  </div>
                </div>
              `,
            )
            .join("")}
        `
      : `<div class="drawer-empty">No active notifications. Your operations stream is clear.</div>`;
    openDrawer({ eyebrow: "Live operations", title: "Notifications", body });
  }

  function openProfile() {
    openModal({
      eyebrow: "Account",
      title: "Elena Vance",
      body: `
        <div class="modal-list">
          <div class="modal-list__item">
            <div style="display:flex;align-items:center;gap:10px;">
              <img src="assets/elena-vance.png" alt="" style="width:42px;height:42px;border-radius:50%;object-fit:cover;border:1px solid #dbe2ef;" />
              <div><strong>Safety &amp; Operations Director</strong><span>North &amp; Central manufacturing group</span></div>
            </div>
            <span class="status-badge status-badge--safe"><i></i>Active</span>
          </div>
          <div class="modal-list__item"><div><strong>Human dispatch authority</strong><span>All final rostering decisions require your review.</span></div><span class="soft-count">Enabled</span></div>
          <div class="modal-list__item"><div><strong>Notification route</strong><span>Critical alerts are delivered in-app and by email.</span></div><button class="table-action" type="button" data-go-settings>Manage</button></div>
        </div>
      `,
      footer: `<button class="button button--primary" type="button" data-close-modal>Close</button>`,
      afterOpen: () => {
        $("[data-go-settings]")?.addEventListener("click", () => {
          closeModal({ restoreFocus: false });
          navigate("settings");
        });
      },
    });
  }

  function resolveAlert(id) {
    const alert = state.alerts.find((item) => item.id === id && item.active);
    if (!alert) return;
    alert.active = false;

    $$(`[data-alert-id="${CSS.escape(id)}"]`).forEach((node) => {
      node.classList.add("is-resolving");
      window.setTimeout(() => node.remove(), 190);
    });

    updateCounts();
    toast(`${alert.title} alert marked resolved.`, "success");
    if (!dom.drawerOverlay.hidden) {
      window.setTimeout(openNotifications, 220);
    }
    if (state.currentView === "safety-alerts") {
      window.setTimeout(() => renderSecondaryView("safety-alerts"), 220);
    }
  }

  function fillNightShift() {
    const button = $("#fillShift");
    const row = button?.closest("tr");
    openModal({
      eyebrow: "Dispatch action",
      title: "Fill Night Line Prep",
      body: `
        <p class="modal-copy">This will assign one certified cold-storage relief operator to the 22:00 receiving window, bringing the shift from 2/4 to 3/4 forklifts.</p>
        <div class="modal-list" style="margin-top: 14px;">
          <div class="modal-list__item"><div><strong>Recommended operator</strong><span>Noah Williams · Cold Storage Operator</span></div><span class="status-badge status-badge--warning"><i></i>Available</span></div>
          <div class="modal-list__item"><div><strong>Projected risk</strong><span>High (88) → Moderate (57)</span></div><span class="soft-count">-31 points</span></div>
        </div>
      `,
      footer: `
        <button class="button button--soft" type="button" data-close-modal>Cancel</button>
        <button class="button button--primary" type="button" id="confirmFillShift">Assign relief</button>
      `,
      afterOpen: () => {
        $("#confirmFillShift")?.addEventListener("click", () => {
          if (row) {
            const staffCell = row.children[2];
            staffCell.innerHTML = `<strong>3 / 4 Forklifts</strong>`;
            staffCell.classList.remove("danger-text");
            row.children[3].innerHTML = `<span class="risk-pill risk-pill--medium"><i></i>Moderate (57)</span>`;
            row.children[4].textContent = "Relief assigned · monitor 03:00 handover";
            row.children[4].classList.remove("danger-text");
            const rowButton = row.querySelector("button");
            rowButton.textContent = "Assigned";
            rowButton.disabled = true;
          }
          state.modelSync = "Updated just now";
          updateCounts();
          closeModal();
          toast("Relief assigned to Night Line Prep. Risk reduced to moderate.", "success");
        });
      },
    });
  }

  function openRebalanceConfirm() {
    openModal({
      eyebrow: "AI dispatch assistant",
      title: "Recommended Rebalance Plan",
      body: `
        <p class="modal-copy">The assistant found three coverage-preserving moves that reduce overtime exposure without creating a new rest-period violation.</p>
        <div class="modal-list" style="margin-top: 14px;">
          <div class="modal-list__item"><div><strong>Move 2 hours of Plant 1 overtime</strong><span>Evening Shift B → verified standby pool</span></div><span class="soft-count">-18 risk</span></div>
          <div class="modal-list__item"><div><strong>Rotate David Rodriguez to day off</strong><span>Night Line Prep coverage remains above minimum</span></div><span class="soft-count">-24 risk</span></div>
          <div class="modal-list__item"><div><strong>Delay Sarah Jenkins start to 10:00</strong><span>Restores OSHA rest turnaround to 11 hours</span></div><span class="soft-count">-16 risk</span></div>
        </div>
        <div class="worker-mode-banner" style="margin: 15px 0 0;">
          ${iconMarkup("verified", "icon--16")}
          <span><strong>Manager approval required.</strong> Applying this plan updates the recommendation queue only; it does not dispatch workers automatically.</span>
        </div>
      `,
      footer: `
        <button class="button button--soft" type="button" data-close-modal>Review later</button>
        <button class="button button--primary" type="button" id="applyRebalance">Apply 3 changes</button>
      `,
      afterOpen: () => {
        $("#applyRebalance")?.addEventListener("click", () => {
          state.pending = Math.max(0, state.pending - 3);
          state.swaps = Math.max(0, state.swaps - 2);
          state.pto = Math.max(0, state.pto - 1);
          state.rebalanceApplied = true;
          state.modelSync = "Updated just now";
          const aiTitle = $("#aiCardTitle");
          if (aiTitle) aiTitle.textContent = "Workload Rebalance Applied";
          const rebalanceButton = $("#rebalanceShifts");
          if (rebalanceButton) {
            rebalanceButton.innerHTML = `${iconMarkup("check", "icon--20")}<span>Review Rebalanced Roster</span>`;
          }
          updateCounts();
          closeModal();
          toast("3 workload changes applied. Pending request count reduced to " + state.pending + ".");
        });
      },
    });
  }

  function startRebalance() {
    const button = $("#rebalanceShifts");
    if (state.rebalanceApplied) {
      openRoster();
      return;
    }
    if (!button) {
      openRebalanceConfirm();
      return;
    }
    button.classList.add("is-loading");
    const original = button.innerHTML;
    button.innerHTML = `<span>Evaluating shift options...</span>`;
    window.setTimeout(() => {
      button.classList.remove("is-loading");
      button.innerHTML = original;
      openRebalanceConfirm();
    }, 950);
  }

  function downloadReport() {
    const reportAlerts = activeAlerts()
      .map(
        (alert) => `
          <tr>
            <td>${escapeHtml(alert.title)}</td>
            <td>${escapeHtml(alert.meta)}</td>
            <td>${escapeHtml(alert.chip)}</td>
            <td>${escapeHtml(alert.note)}</td>
          </tr>
        `,
      )
      .join("");

    const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>SafeShift AI — Operational Safety Report</title>
  <style>
    body { margin: 0; padding: 48px; background: #faf8ff; color: #131b2e; font-family: Arial, sans-serif; }
    main { max-width: 900px; margin: 0 auto; padding: 42px; border-radius: 16px; background: #fff; box-shadow: 0 8px 32px rgba(15,23,42,.08); }
    h1 { margin: 0; color: #00236f; font-size: 30px; }
    h2 { margin-top: 32px; color: #1e3a8a; font-size: 18px; }
    p { color: #4b5568; line-height: 1.55; }
    .meta { margin-top: 8px; font-size: 13px; color: #667085; }
    .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-top: 24px; }
    .metric { padding: 16px; border-radius: 10px; background: #f2f3ff; }
    .metric small { display: block; color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: .05em; }
    .metric strong { display: block; margin-top: 7px; color: #0f172a; font-size: 26px; }
    table { width: 100%; margin-top: 12px; border-collapse: collapse; font-size: 12px; }
    th { padding: 9px; background: #f2f3ff; color: #64748b; text-align: left; }
    td { padding: 9px; border-bottom: 1px solid #edf0f7; color: #475569; }
    .policy { margin-top: 30px; padding: 15px; border-radius: 10px; background: #f8fafc; color: #64748b; font-size: 12px; }
  </style>
</head>
<body>
  <main>
    <div style="display:flex;align-items:center;justify-content:space-between;gap:20px;">
      <div><h1>Operational Safety Report</h1><p class="meta">SafeShift AI · Predictive Ops</p></div>
      <img src="assets/logo.svg" alt="SafeShift AI" style="width:54px;height:54px;" />
    </div>
    <p class="meta">${escapeHtml(state.dateRange)} · ${escapeHtml(state.plant)} · Generated ${new Date().toLocaleDateString("en-IN", { dateStyle: "medium" })}</p>
    <div class="grid">
      <div class="metric"><small>Total workers</small><strong>${state.totalWorkers}</strong></div>
      <div class="metric"><small>Active shifts</small><strong>${state.activeShifts}</strong></div>
      <div class="metric"><small>Active alerts</small><strong>${activeAlerts().length}</strong></div>
      <div class="metric"><small>Compliance</small><strong>98.4%</strong></div>
    </div>
    <h2>Active safety notifications</h2>
    <table><thead><tr><th>Entity</th><th>Area</th><th>Risk</th><th>Recommended action</th></tr></thead><tbody>${reportAlerts}</tbody></table>
    <h2>Shift coverage</h2>
    <p>86 of 92 operational stations are currently staffed. The Night Line Prep rotation remains below target with two certified forklift positions open. Standby relief has been identified.</p>
    <div class="policy"><strong>Human dispatch authority:</strong> AI estimates are non-diagnostic decision-support tools. Plant supervisors and EHS officers retain final dispatch, rostering, and medical suspension authority.</div>
  </main>
</body>
</html>`;

    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "safeshift-operational-safety-report.html";
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    toast("Safety report exported as a standalone HTML report.", "success");
  }

  function getSearchItems() {
    const items = [];
    Object.entries(viewMeta).forEach(([id, meta]) => {
      items.push({
        type: "Workspace",
        title: meta.title,
        subtitle: meta.description,
        icon: id === "dashboard" ? "dashboard" : id === "workers" ? "workers" : id === "safety-alerts" ? "warning" : "chevron-right",
        action: () => navigate(id),
      });
    });

    state.workers.forEach((worker) => {
      items.push({
        type: "Worker",
        title: worker.name,
        subtitle: `${worker.role} · ${worker.facility} · Fatigue ${worker.risk}`,
        icon: "workers",
        action: () => openWorkerDetails(worker),
      });
    });

    activeAlerts().forEach((alert) => {
      items.push({
        type: "Safety alert",
        title: alert.title,
        subtitle: `${alert.meta} · ${alert.chip}`,
        icon: "warning",
        action: () => {
          navigate("safety-alerts");
          window.setTimeout(() => {
            const match = [...document.querySelectorAll(`[data-alert-id="${CSS.escape(alert.id)}"]`)].at(-1);
            match?.scrollIntoView({ behavior: "smooth", block: "center" });
          }, 160);
        },
      });
    });

    [
      ["Night Line Prep", "22:00–06:00 · Cold Storage Zone B"],
      ["Evening Shift B", "14:00–22:00 · Stamping & Presses"],
      ["Overnight Maintenance", "23:00–07:00 · Robotics Bay 4"],
    ].forEach(([title, subtitle]) => {
      items.push({
        type: "Shift",
        title,
        subtitle,
        icon: "clock",
        action: () => openShiftDetails(title),
      });
    });

    items.push(
      {
        type: "Quick action",
        title: "Log Incident",
        subtitle: "Create a new safety notification",
        icon: "warning",
        action: () => openIncidentForm("incident"),
      },
      {
        type: "Quick action",
        title: "Generate Safety Report",
        subtitle: "Export the current operational report",
        icon: "download",
        action: downloadReport,
      },
      {
        type: "Quick action",
        title: "Auto-Rebalance Shifts with AI",
        subtitle: "Review three fatigue-reducing workload moves",
        icon: "sparkles",
        action: startRebalance,
      },
    );
    return items;
  }

  function renderSearchResults(query = "") {
    const normalized = query.trim().toLowerCase();
    state.searchItems = getSearchItems().filter((item) => {
      if (!normalized) return true;
      return `${item.type} ${item.title} ${item.subtitle}`.toLowerCase().includes(normalized);
    });
    state.selectedSearchIndex = Math.min(state.selectedSearchIndex, Math.max(0, state.searchItems.length - 1));

    if (!state.searchItems.length) {
      dom.commandResults.innerHTML = `<div class="command-empty">No results for “${escapeHtml(query)}”. Try a worker, shift, or alert.</div>`;
      return;
    }

    let lastType = "";
    dom.commandResults.innerHTML = state.searchItems
      .map((item, index) => {
        const groupLabel = item.type !== lastType ? `<div class="command-group-label">${escapeHtml(item.type)}</div>` : "";
        lastType = item.type;
        return `
          ${groupLabel}
          <button class="command-result ${index === state.selectedSearchIndex ? "is-selected" : ""}" type="button" data-search-index="${index}" role="option" aria-selected="${index === state.selectedSearchIndex}">
            <span class="command-result__icon">${iconMarkup(item.icon, "icon--18")}</span>
            <span class="command-result__copy"><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(item.subtitle)}</span></span>
            <span class="command-result__meta">Enter</span>
          </button>
        `;
      })
      .join("");
  }

  function openSearch() {
    closeModal({ restoreFocus: false });
    closeDrawer();
    dom.lastFocus = document.activeElement;
    dom.searchOverlay.hidden = false;
    dom.commandInput.value = "";
    state.selectedSearchIndex = 0;
    renderSearchResults();
    syncLockState();
    requestAnimationFrame(() => dom.commandInput.focus());
  }

  function closeSearch(restoreFocus = true) {
    if (dom.searchOverlay.hidden) return;
    dom.searchOverlay.hidden = true;
    syncLockState();
    if (restoreFocus) dom.lastFocus?.focus?.({ preventScroll: true });
  }

  function runSearchItem(index) {
    const item = state.searchItems[index];
    if (!item) return;
    closeSearch(false);
    item.action();
  }

  function applyPerspective() {
    $$("[data-perspective]").forEach((button) => {
      button.classList.toggle("is-active", button.dataset.perspective === state.perspective);
    });
    const existing = $("[data-worker-banner]");
    if (state.perspective === "manager") {
      existing?.remove();
      return;
    }
    if (!existing) {
      const banner = document.createElement("div");
      banner.className = "worker-mode-banner";
      banner.dataset.workerBanner = "true";
      banner.innerHTML = `
        ${iconMarkup("workers", "icon--16")}
        <span><strong>Worker view active.</strong> Showing assigned shifts, rest guidance, and the same safety stream with personal actions emphasized.</span>
      `;
      $(".overview-card")?.after(banner);
    }
  }

  function showPopover(type, anchor) {
    const popover = type === "date" ? dom.datePopover : dom.plantPopover;
    const other = type === "date" ? dom.plantPopover : dom.datePopover;
    other.hidden = true;
    const rect = anchor.getBoundingClientRect();
    popover.hidden = false;
    const width = popover.offsetWidth;
    const left = Math.min(window.innerWidth - width - 12, Math.max(12, rect.right - width));
    const top = Math.min(window.innerHeight - popover.offsetHeight - 12, rect.bottom + 6);
    popover.style.left = `${left}px`;
    popover.style.top = `${top}px`;
  }

  function closePopovers() {
    dom.datePopover.hidden = true;
    dom.plantPopover.hidden = true;
  }

  // Global event delegation
  document.addEventListener("click", (event) => {
    const viewLink = event.target.closest("[data-view-link]");
    if (viewLink) {
      event.preventDefault();
      navigate(viewLink.dataset.viewLink);
      return;
    }

    const perspectiveButton = event.target.closest("[data-perspective]");
    if (perspectiveButton) {
      state.perspective = perspectiveButton.dataset.perspective;
      applyPerspective();
      toast(state.perspective === "manager" ? "Manager view restored." : "Switched to Worker View.", "info", 2200);
      return;
    }

    const toastButton = event.target.closest("[data-toast]");
    if (toastButton) {
      toast(toastButton.dataset.toast, "info");
      return;
    }

    if (event.target.closest("[data-close-modal]")) {
      closeModal();
      return;
    }

    if (event.target.closest("[data-close-drawer]")) {
      closeDrawer();
      return;
    }

    if (event.target.closest("#openSearch")) {
      openSearch();
      return;
    }

    if (event.target.closest("#openNotifications")) {
      openNotifications();
      return;
    }

    if (event.target.closest("#openIncident")) {
      openIncidentForm("incident");
      return;
    }

    if (event.target.closest("#addWorkerTop")) {
      openAddWorker();
      return;
    }

    if (event.target.closest("#assignShiftTop")) {
      openIncidentForm("shift");
      return;
    }

    if (event.target.closest("#generateReport")) {
      downloadReport();
      return;
    }

    if (event.target.closest("#jumpAlerts")) {
      navigate("safety-alerts");
      return;
    }

    if (event.target.closest("#openProfile")) {
      openProfile();
      return;
    }

    if (event.target.closest("#openConfidence")) {
      openConfidence();
      return;
    }

    if (event.target.closest("#rebalanceShifts")) {
      startRebalance();
      return;
    }

    if (event.target.closest("#showAllAlerts")) {
      navigate("safety-alerts");
      return;
    }

    if (event.target.closest("[data-roster]")) {
      openRoster();
      return;
    }

    if (event.target.closest("#fillShift")) {
      fillNightShift();
      return;
    }

    const shiftDetailsButton = event.target.closest("[data-shift-details]");
    if (shiftDetailsButton) {
      openShiftDetails(shiftDetailsButton.dataset.shiftDetails);
      return;
    }

    const alertButton = event.target.closest("[data-resolve-alert]");
    if (alertButton) {
      resolveAlert(alertButton.dataset.resolveAlert);
      return;
    }

    const drawerAlertButton = event.target.closest("[data-drawer-alert]");
    if (drawerAlertButton) {
      const alert = state.alerts.find((item) => item.id === drawerAlertButton.dataset.drawerAlert);
      closeDrawer();
      if (alert) {
        openModal({
          eyebrow: "Safety notification",
          title: alert.title,
          body: `
            <p class="modal-copy">${escapeHtml(alert.copy)}</p>
            <div class="modal-list" style="margin-top: 14px;">
              <div class="modal-list__item"><div><strong>Risk signal</strong><span>${escapeHtml(alert.chip)}</span></div><span class="status-badge ${alert.severity === "critical" ? "status-badge--danger" : "status-badge--warning"}"><i></i>${alert.severity === "critical" ? "Critical" : "Moderate"}</span></div>
              <div class="modal-list__item"><div><strong>Recommended action</strong><span>${escapeHtml(alert.note)}</span></div><button class="table-action" type="button" data-resolve-alert="${escapeHtml(alert.id)}">Resolve</button></div>
            </div>
          `,
          footer: `<button class="button button--soft" type="button" data-close-modal>Close</button>`,
        });
      }
      return;
    }

    const workerButton = event.target.closest("[data-worker-id]");
    if (workerButton) {
      const worker = state.workers.find((item) => item.id === workerButton.dataset.workerId);
      if (worker) openWorkerDetails(worker);
      return;
    }

    const requestButton = event.target.closest("[data-request-action]");
    if (requestButton) {
      const request = state.requests.find((item) => item.id === requestButton.dataset.requestId);
      if (request) {
        state.pending = Math.max(0, state.pending - 1);
        if (requestButton.dataset.requestAction === "approve") state.swaps = Math.max(0, state.swaps - 1);
        else state.pto = Math.max(0, state.pto - 1);
        requestButton.closest(".request-card")?.remove();
        state.requests = state.requests.filter((item) => item.id !== request.id);
        updateCounts();
        toast(`${request.worker}'s ${request.type.toLowerCase()} ${requestButton.dataset.requestAction === "approve" ? "approved" : "declined"}.`);
      }
      return;
    }

    const settingToggle = event.target.closest("[data-setting-toggle]");
    if (settingToggle) {
      const on = !settingToggle.classList.contains("is-on");
      settingToggle.classList.toggle("is-on", on);
      settingToggle.setAttribute("aria-checked", String(on));
      return;
    }

    const secondaryButton = event.target.closest("[data-secondary-action]");
    if (secondaryButton) {
      const action = secondaryButton.dataset.secondaryAction;
      if (action === "add-worker") openAddWorker();
      if (action === "open-shift") openIncidentForm("shift");
      if (action === "assign-shift") openIncidentForm("shift");
      if (action === "open-search") openSearch();
      if (action === "confidence") openConfidence();
      if (action === "rebalance") startRebalance();
      if (action === "notifications") openNotifications();
      if (action === "incident") openIncidentForm("incident");
      if (action === "report") downloadReport();
      if (action === "save-settings") toast("Workspace preferences saved.");
      return;
    }

    const popoverButton = event.target.closest("[data-popover]");
    if (popoverButton) {
      event.stopPropagation();
      showPopover(popoverButton.dataset.popover, popoverButton);
      return;
    }

    const periodButton = event.target.closest("[data-period]");
    if (periodButton) {
      state.dateRange = periodButton.dataset.period;
      $("#dateRangeLabel").textContent = state.dateRange;
      dom.datePopover.hidden = true;
      toast(`Reporting window changed to ${state.dateRange}.`, "info", 2400);
      return;
    }

    const plantButton = event.target.closest("[data-plant]");
    if (plantButton) {
      state.plant = plantButton.dataset.plant.replaceAll("&amp;", "&");
      $("#plantLabel").textContent = state.plant;
      dom.plantPopover.hidden = true;
      toast(`Facility filter set to ${state.plant}.`, "info", 2400);
      return;
    }

    const searchResult = event.target.closest("[data-search-index]");
    if (searchResult) {
      state.selectedSearchIndex = Number(searchResult.dataset.searchIndex);
      runSearchItem(state.selectedSearchIndex);
      return;
    }

    if (!event.target.closest(".popover")) closePopovers();
  });

  dom.menuToggle.addEventListener("click", () => {
    if (dom.body.classList.contains("nav-open")) closeMobileNav();
    else openMobileNav();
  });

  dom.mobileBackdrop.addEventListener("click", closeMobileNav);

  dom.modalOverlay.addEventListener("click", (event) => {
    if (event.target === dom.modalOverlay) closeModal();
  });

  dom.drawerOverlay.addEventListener("click", (event) => {
    if (event.target === dom.drawerOverlay) closeDrawer();
  });

  dom.searchOverlay.addEventListener("click", (event) => {
    if (event.target === dom.searchOverlay) closeSearch();
  });

  dom.commandInput.addEventListener("input", () => {
    state.selectedSearchIndex = 0;
    renderSearchResults(dom.commandInput.value);
  });

  dom.commandInput.addEventListener("keydown", (event) => {
    if (!state.searchItems.length) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      state.selectedSearchIndex = (state.selectedSearchIndex + 1) % state.searchItems.length;
      renderSearchResults(dom.commandInput.value);
      dom.commandResults.querySelector(".is-selected")?.scrollIntoView({ block: "nearest" });
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      state.selectedSearchIndex =
        (state.selectedSearchIndex - 1 + state.searchItems.length) % state.searchItems.length;
      renderSearchResults(dom.commandInput.value);
      dom.commandResults.querySelector(".is-selected")?.scrollIntoView({ block: "nearest" });
    } else if (event.key === "Enter") {
      event.preventDefault();
      runSearchItem(state.selectedSearchIndex);
    }
  });

  document.addEventListener("keydown", (event) => {
    const tag = event.target.tagName;
    const editing = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || event.target.isContentEditable;

    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      openSearch();
      return;
    }

    if (event.key === "/" && !editing) {
      event.preventDefault();
      openSearch();
      return;
    }

    if (event.key === "Escape") {
      if (!dom.searchOverlay.hidden) closeSearch();
      else if (!dom.modalOverlay.hidden) closeModal();
      else if (!dom.drawerOverlay.hidden) closeDrawer();
      else if (dom.body.classList.contains("nav-open")) closeMobileNav();
      else closePopovers();
    }
  });

  $$(".chart-points circle, .chart-plot .fatigue-points circle").forEach((point) => {
    point.setAttribute("tabindex", "0");
    point.setAttribute(
      "aria-label",
      `${point.dataset.day}: fatigue score ${point.dataset.score}, ${point.dataset.overtime} overtime hours`,
    );

    const show = () => {
      const chart = $("#fatigueChart");
      const rect = chart.getBoundingClientRect();
      const pointRect = point.getBoundingClientRect();
      dom.chartTooltip.innerHTML = `<strong>${escapeHtml(point.dataset.day)}</strong><span>Fatigue ${escapeHtml(point.dataset.score)} / 100</span><span>${escapeHtml(point.dataset.overtime)} OT hours</span>`;
      dom.chartTooltip.style.left = `${pointRect.left - rect.left + pointRect.width / 2}px`;
      dom.chartTooltip.style.top = `${pointRect.top - rect.top}px`;
      dom.chartTooltip.hidden = false;
    };

    point.addEventListener("mouseenter", show);
    point.addEventListener("focus", show);
    point.addEventListener("mouseleave", () => {
      dom.chartTooltip.hidden = true;
    });
    point.addEventListener("blur", () => {
      dom.chartTooltip.hidden = true;
    });
  });

  window.addEventListener("hashchange", () => {
    const view = location.hash.replace("#", "") || "dashboard";
    if (viewMeta[view]) navigate(view, { updateHash: false });
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 920) closeMobileNav();
    closePopovers();
  });

  const initialView = location.hash.replace("#", "") || "dashboard";
  updateCounts();
  applyPerspective();
  navigate(viewMeta[initialView] ? initialView : "dashboard", { updateHash: false });
  renderSearchResults();
})();
