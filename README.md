# Sheet Web Sync

A tiny full‑stack demo that **synchronizes a Google Sheet in real‑time** between a Python backend, a Node.js middle‑man, and a React front‑end.

---

##  Project Overview

- **Python (FastAPI)** – The *source of truth*. It talks directly to the Google Sheets API, polls the sheet every few seconds and notifies the Node server when an external edit occurs.
- **Node.js (Express + Socket.io)** – A lightweight *proxy & WebSocket hub*. It forwards the React API calls to Python and broadcasts any updates to all connected browsers.
- **React (Vite)** – The UI that displays the sheet as a table, allows inline editing, and receives live updates via Socket.io.

The whole stack runs locally on three ports:
- `8000` – Python FastAPI server
- `3000` – Node.js proxy & WebSocket server
- `5173` – React front‑end (served by Vite)

---

##  Architecture Diagram (textual)
```
Google Sheet   <-- Service Account -->   Python FastAPI (8000)
      ▲                               │
      │  Webhook (POST /sheet-data-update)   │
      │                               ▼
   Node.js Express (3000) <-- Socket.io --> React (5173)
```
- The **Python server** polls the sheet. When it sees a change, it POSTs the new data to `http://localhost:3000/sheet-data-update`.
- The **Node server** receives that webhook, emits a `sheet-updated` event via Socket.io, and streams the data to every connected React client.
- The **React app** displays the rows, lets a user edit a row, and sends the update back to the Node server (`POST /api/rows/:index`). Node forwards this to Python which writes the change to the sheet.

---

##  Prerequisites
| Tool | Minimum Version |
|------|-----------------|
| Python | 3.9 |
| Node.js | 18 |
| npm | latest |
| git | any |
| Google account with access to Google Sheets API | — |

---

## ☁️ Google Cloud Configuration
1. **Create a GCP project** and enable **Google Sheets API**.
2. **Create a Service Account** in that project.
3. **Generate a JSON key** for the service account (e.g. `credentials.json`).
4. **Share the target Google Sheet** with the service‑account email (Editor access).
   - If you want *anyone* to be able to edit the sheet directly, set the sheet’s sharing to **"Anyone with the link can edit"**.
5. **Copy the Spreadsheet ID** from the sheet URL (`https://docs.google.com/spreadsheets/d/<SPREADSHEET_ID>/edit`).

---

##  Environment Variables (`.env` at project root)
Create a `.env` file in the repository root (it is already ignored by `.gitignore`).
```dotenv
# ── Python backend ──────────────────────
GOOGLE_CREDENTIALS_B64=<Base64‑encoded contents of credentials.json>
SPREADSHEET_ID=<your‑spreadsheet‑id>
WEBHOOK_URL=http://127.0.0.1:3000/sheet-data-update

# ── Node.js backend ─────────────────────
PORT=3000                # Node server port (can be changed)
PYTHON_API_URL=http://127.0.0.1:8000   # URL of the Python FastAPI server
```
**How to generate the Base64 string** (PowerShell):
```powershell
$bytes = [IO.File]::ReadAllBytes('credentials.json')
[Convert]::ToBase64String($bytes)
```
Copy the output and paste it as the value of `GOOGLE_CREDENTIALS_B64`.

---

##  Local Development Setup
```bash
# 1️⃣ Clone the repo (already done for you)
# git clone git@github.com:aadinath29/Sheet-Web-Sync.git
# cd Sheet-Web-Sync

# 2️⃣ Install Python deps (inside virtual env)
python -m venv venv
source venv/Scripts/activate   # PowerShell: .\venv\Scripts\Activate.ps1
pip install -r backend-python/requirements.txt python-dotenv

# 3️⃣ Install Node deps for both back‑ends and front‑end
npm install               # installs backend-node deps (express, socket.io, dotenv, etc.)
cd frontend-react && npm install && cd ..

# 4️⃣ Create the .env file (see above) – place it in the project root.

# 5️⃣ Start the three services (each in its own terminal or as background tasks)
# Python backend
uvicorn app.main:app --port 8000 --reload

# Node.js middle‑man
npm run start   # runs src/server.js

# React front‑end (Vite)
cd frontend-react && npm run dev
```
Open your browser at **http://localhost:5173** – you should see the sheet content. Editing a cell updates the Google Sheet instantly, and any change made directly in the Google Sheet (or by another browser) appears in real‑time.

---

##  How Synchronization Works
1. **Initial Load** – React calls `GET /api/rows` → Node forwards to Python → Python reads the sheet and returns the rows.
2. **Edit from UI** – User edits a row → React `POST /api/rows/:index` → Node forwards to Python → Python writes to the sheet and updates its in‑memory snapshot.
3. **External Edit** – Someone edits the Google Sheet directly (or via another client). Python’s background poll detects the change → Python POSTs the new data to Node’s webhook (`/sheet-data-update`).
4. **Broadcast** – Node receives the webhook and emits a `sheet-updated` Socket.io event to all connected browsers. The React client listens for this event and refreshes its table.

Because the **Python service is the only component that talks to Google Sheets**, we avoid the “echo” problem where a change would bounce back and forth indefinitely.

---

##  Project Structure
```
Google Sheet Web Syncronization/
├─ backend-python/          # FastAPI source (app/ folder)
├─ backend-node/            # Express + Socket.io source (src/ folder)
├─ frontend-react/          # Vite + React app
├─ .gitignore               # Ignores venv, node_modules, .env, credentials.json
├─ README.md                # This file
└─ credentials.json         # (not committed) – your service account key
```

---
