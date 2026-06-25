# 📖 LedgerFlow Technical Documentation

This document provides a comprehensive technical overview of **LedgerFlow** — detailing my architecture, file structures, API endpoints, development scripts, and database schema design.

---

## 🏛️ Architecture & Data Flow

I designed LedgerFlow with a hybrid, client-first architecture that guarantees portability, data privacy, and ease of deployment. The application can run in two distinct modes:

### Mode A: Stateless Client-Side (Default & Offline)
In this mode, the React application runs entirely in the browser:
1. **User Profiles and Transactions**: I store all data in the browser's [localStorage](file:///d:/Projects/budget-management/src/App.tsx#L97-L121) to ensure strict privacy.
2. **Calculations & Visualizations**: I run the transaction audits, categorization matching, and SVG-donut renderings directly in the browser's JavaScript execution thread.
3. **Document Reports**: I trigger A4 statement prints and email drafts locally via native browser engines (`window.print()` and client-side `mailto:` URIs).
4. No external network requests are made, keeping the app completely offline-capable.

### Mode B: Full-Stack API-Assisted (FastAPI Backend)
When the Python server is active, I connect the frontend to serve as a full-stack interface:
1. On initial load, the frontend synchronizes with `/api/budget` to retrieve the stored user profile and historical ledger.
2. On-demand modifications (onboarding profile, recording or deleting transactions) send REST payloads to the FastAPI backend.
3. The server validates incoming payloads using **Pydantic** validation models, matches categories, and persists data directly to a local `data.json` file.
4. If the connection fails or is unavailable, my frontend falls back to browser localStorage.

```
                  ┌──────────────────────────────┐
                  │      React App (Vite)        │
                  │   [localStorage Fallback]    │
                  └──────────────┬───────────────┘
                                 │ (HTTP REST API)
                                 ▼
                  ┌──────────────────────────────┐
                  │       FastAPI Server         │
                  │         (main.py)            │
                  └──────────────┬───────────────┘
                                 │
                                 ▼
                  ┌──────────────────────────────┐
                  │       Micro Database         │
                  │         (data.json)          │
                  └──────────────────────────────┘
```

---

## 📂 The `assets/` Directory (Its Purpose & Scope)

I set up the `assets/` directory in the root folder for two specific purposes:

1. **Local Workspace and AI Tooling Configurations**: 
   Inside `assets/`, the `.aistudio/` subdirectory acts as a workspace folder for AI Studio sessions, configuration changes, or developer states.
2. **Strict Git Exclusion**:
   I created a `.gitignore` containing `*` inside `assets/.aistudio/` to instruct version control to ignore all metadata generated there. This prevents local configurations, prompt logs, or developer environment settings from cluttering commits or leaking sensitive credentials.
3. **Static Image/Media Assets**:
   If I want to add application logos, screenshots for the README, or design mockups, I store them here to keep the code folders clean.

---

## 💻 Frontend Component Breakdown

I structured the core React frontend entirely within [App.tsx](file:///d:/Projects/budget-management/src/App.tsx):

- **State Management**: I used React state hooks (`useState` and `useEffect`) to manage the current `UserProfile` and `Expense[]` arrays, syncing changes to localStorage.
- **Auto-Tagging System**: I implemented a client-side dictionary-based keyword matcher that reads descriptions and auto-assigns categories like *Food, Utilities, Entertainment, or Rent* (falling back to *Miscellaneous*).
- **Outlay Donut Visualizer**: Instead of importing bloated graphing libraries, I built a custom SVG-based Donut chart that computes segment offsets and dash-arrays directly from transaction totals.
- **Tab Layouts**:
  1. **Dashboard Tab**: Contains onboarding modules, metrics summaries, inline budget limit edits, transaction inputs, category progression meters, and the transaction list.
  2. **Reports Tab**: I built a customizable reporting engine where users select statement intervals (Monthly, Quarterly, Annual), preview print layouts, sign verified checklists, and dispatch tabulated summaries via email.
  3. **Desktop App Tab**: A quick-reference terminal command guide I wrote detailing how to wrap the frontend bundle into native offline executables using Tauri or Electron.

---

## 🐍 Backend Implementation & Models

I built the backend web server using [FastAPI](file:///d:/Projects/budget-management/main.py):

- **Pydantic Validation Schemas**:
  - `UserOnboard`: I validate user profiles to ensure name entries, professions, and non-negative budgets meet constraints.
  - `ExpenseCreate`: I validate dates, transaction titles, and transaction amounts.
- **Auto-Tag Rules**:
  I configured the `TAG_RULES` lookup dictionary on the backend to match input strings (e.g. *starbucks, comcast, apartment*) to their corresponding categories.
- **Persistence Layer**:
  I implemented file-based helpers (`load_data` and `save_data`) to query and update state within `data.json` upon transaction changes.

---

## 📡 REST API Reference

Here are the endpoints I configured for the application:

| Endpoint | Method | Description | Request Body | Response Format |
| :--- | :--- | :--- | :--- | :--- |
| `/` | `GET` | Serves templates dashboard | None | `HTMLResponse` (`templates/index.html`) |
| `/api/budget` | `GET` | Retrieves profile configuration + expense roster | None | `JSONResponse` (`{user: User, expenses: Expense[]}`) |
| `/api/onboard` | `POST` | Overwrites user budget parameters | `UserOnboard` JSON | `JSONResponse` (`{status: "success", user: User}`) |
| `/api/expenses` | `POST` | Appends a transaction with auto-tagging checks | `ExpenseCreate` JSON | `JSONResponse` (`{status: "success", expense: Expense}`) |
| `/api/expenses/{id}` | `DELETE` | Removes transaction from database | None | `JSONResponse` (`{status: "success", message: str}`) |
| `/api/reset` | `POST` | Purges configurations and ledger records | None | `JSONResponse` (`{status: "success", message: str}`) |

---

## 🛠️ CLI Operations Guide

### Node.js Scripts (`package.json`)
I configured the following shortcuts to manage the frontend:
- `npm run dev`: Boots the Vite dev server at `http://localhost:3000` with hot-module reload.
- `npm run build`: Bundles optimized, production-ready assets into the `/dist` output folder.
- `npm run preview`: Launches a local server to test the compiled production build.
- `npm run lint`: Triggers TypeScript compiler diagnostics across my files.

### Python Environment Scripts (`main.py`)
To run or bundle the backend server:
- `pip install -r requirements.txt`: Installs requirements (FastAPI, Uvicorn, Jinja2).
- `uvicorn main:app --reload --port 8080`: Starts the FastAPI development server on port 8080.
- `pyinstaller --onefile --add-data "templates;templates" main.py`: Packages the backend server and its fallback HTML template into a standalone desktop executable.
