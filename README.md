# SafeShift AI MVP

A responsive workforce-safety dashboard rebuilt in plain HTML, CSS, and JavaScript from the Stitch reference export.

## Run locally

```powershell
npm start
```

Open <http://localhost:4173>.

## Real-time data

The Node server in `server.js` provides a zero-dependency real-time API:

- `GET /api/state` returns the current shared state.
- `GET /api/events` streams updates over Server-Sent Events (SSE).
- `POST /api/actions` persists incidents, workers, shift assignments, alert resolutions, request decisions, AI rebalance changes, and settings.

State is stored in `data/safeshift.json`. Open the app in two browser windows to see changes propagate between them in real time. The file-backed store is intentionally local and dependency-free for this MVP; it can be replaced with PostgreSQL, Supabase, or Firebase behind the same API without changing the UI.

## Included flows

- Live dashboard and responsive navigation.
- Search command palette (`Ctrl+K` or `/`).
- Add workers, log incidents, and assign shifts.
- Resolve safety alerts and approve/decline shift-swap requests.
- Apply AI rebalancing recommendations.
- Export an operational safety report.

The dashboard keeps a local fallback copy of its seed data so `index.html` can still be previewed without the Node server. Start the server for persistence and multi-window updates.
