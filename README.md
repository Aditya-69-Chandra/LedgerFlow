# 🪙 LedgerFlow — Personal Budget Manager & Statement Auditor

Welcome to **LedgerFlow** — a personal budget tracker and statement auditor I built to be visually stunning, highly responsive, and completely private. I crafted this application with a high-performance **React/Vite** frontend (styled with Tailwind CSS v4) and an optional lightweight **FastAPI** Python backend.

---

## 🗺️ Architectural Workflow (How I Designed the Data Flow)

Here is a diagram showing how I designed information to flow through this application:

```
[ Your Web Browser ] 
        │
        ├─► 💾 [ Local Storage ] ──► (Saves your data in YOUR browser so other users won't see it!)
        │
        ├─► 📊 [ Donut & Progress Rings ] ──► (Calculates spent vs remaining margins instantly)
        │
        ├─► 🖨️ [ Print Engine ] ──► (Turns your monthly, quarterly, or annual report into a PDF)
        │
        └─► (Optional) FastAPI Backend ──► [ Local python server or cloud database container ]
```

### 1. How I Designed the Multi-User Sandbox (Zero-Config Security)
When I share a web application link with friends, family, or colleagues, **everyone wants to see their own data, not mine.** 
- To solve this, **I engineered LedgerFlow to use Browser Local Storage (`localStorage`) as its primary database.**
- When you open the application, your browser automatically sets up a secure, local, isolated pocket of memory. 
- *No signup is required, data is never mixed, and it is completely secure because your financial data never leaves your computer.*

### 2. My High-Fidelity Report & Email Dispatcher
Under the **Reports** tab, you can select any year, month, or quarter. I built this to aggregate matched transactions and render:
- **Flawless A4 Print Layouts**: I designed custom CSS print layouts so clicking **PDF** activates the native browser print engine, perfectly formatted for paper statements with category indicators and signature fields.
- **Automated Zero-Trust Email Delivery**: Clicking **Email** instantly generates a beautifully tabulated text statement (including net caps, outflows, margins, and checklists) and opens your native email application (like Gmail or Apple Mail) pre-populated with the recipient, subject line, and structured body.
- *Security Design*: I did not include any SMTP servers or hardcoded mail API credentials to prevent leaks or abuse, keeping the system 100% client-side secure!

---

## 🔒 Security & GitHub Readiness (100% Safe to Push)

**Yes, you can upload all files in this directory directly to GitHub!**

I engineered this project with zero-trust safety:
1. **No Sensitive Keys**: I designed a **zero-trust, client-first architecture** where all transactions and configurations are stored in your private browser sandbox via `localStorage`.
2. **Zero Hardcoded Secrets**: I did not put any API keys, database passwords, or SMTP credentials anywhere in the codebase.
3. **Ready to Push**: You can make this repository completely **public** on GitHub. Your credentials are 100% safe because none exist in the code!

---

## 📂 My Project Structure

Here is a tour of the files and folders I set up:

```
├── 📁 src/                 # The core React/Vite frontend application code I wrote
│   ├── App.tsx             # Main dashboard, visual donut charts, reports, and routing
│   ├── main.tsx            # Frontend bootstrap file linking React to index.html
│   └── index.css           # Global stylesheet injecting Tailwind CSS v4 directives
├── 📁 templates/           # Static templates directory served by the Python FastAPI server
│   └── index.html          # Monolithic HTML fallback version of the dashboard
├── 📄 .env.example         # Example configuration containing environment variables (e.g. GEMINI_API_KEY)
├── 📄 .gitignore           # Version control filter to exclude dependency and build directories
├── 📄 index.html           # Main Vite HTML entry point for the React frontend
├── 📄 main.py              # FastAPI (Python) web server with local JSON storage routing
├── 📄 metadata.json        # Project capabilities definition for AI Studio integrations
├── 📄 package.json         # Node.js project configuration, metadata, and dependencies
├── 📄 requirements.txt     # Python backend dependencies (FastAPI, Uvicorn, Jinja2)
├── 📄 tsconfig.json        # TypeScript configuration settings for compiler checks
└── 📄 vite.config.ts       # Compilation configurations for Vite and Tailwind CSS plugins
```

---

## 🛠️ How to Run the Project Locally

### Option A: The React Frontend (Recommended for immediate development)
This fires up the ultra-fast Vite local web server.

1. Ensure you have **Node.js** installed on your computer.
2. Open your terminal in the project directory and install the packages:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open the link displayed in your terminal (usually `http://localhost:3000` or `http://localhost:5173`).

---

### Option B: The Full-Stack FastAPI Backend (Python)
If you want to run the FastAPI server locally (which persists data to a local `data.json` file):

1. Ensure you have **Python 3.10+** installed.
2. Install the Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Fire up the Python web server using Uvicorn:
   ```bash
   uvicorn main:app --reload --port 8080
   ```
4. Access the API dashboard at `http://127.0.0.1:8080`.

---

## 📦 How to Package the App as a Desktop Executable (.exe / .app)

You can package LedgerFlow as a standalone desktop application that runs directly on your computer without needing any terminal commands or web servers!

### Approach 1: Native Desktop Executable via PyInstaller (Python Backend)
If you want a single-file executable that boots the FastAPI backend database server and displays the frontend:

1. Install PyInstaller:
   ```bash
   pip install pyinstaller
   ```
2. Compile `main.py` into a standalone app:
   ```bash
   pyinstaller --onefile --add-data "templates;templates" main.py
   ```
3. This creates a portable executable inside the `dist/` folder! Double-clicking it automatically boots the backend database server.

### Approach 2: Ultra-Premium Desktop Wrapper via Tauri / Electron
If you want a native desktop window (without any visible terminal console background):

1. Build the static React build:
   ```bash
   npm run build
   ```
2. Wrap the compiled output folder (`dist/`) in a **Tauri** or **Electron** environment to distribute beautiful `.exe` or `.app` desktop bundles. Check out the **Desktop App** tab in the running application for step-by-step shell commands.

#### 🔌 Does the Compiled Executable Need Internet to Run?
**No! LedgerFlow operates 100% offline.** 
- **Offline Storage**: Your statement ledgers and user configurations are managed fully within your browser sandbox via `localStorage`.
- **Local Application Processing**: All charting computations, transaction rule-matching, and report compilations are completed inside the client browser session.
- **Graceful Fallbacks**: If you are completely disconnected from the internet, any externally-linked aesthetic Google Web Fonts (like *Inter* or *Space Grotesk*) will simply fall back gracefully to your operating system's gorgeous native sans-serif fonts (like *Segoe UI* or *San Francisco*), keeping the interface perfectly intact and highly readable.

---

## 📈 My Multi-Currency Selection & Fluid Cap Allocation

Financial requirements are highly dynamic; budgets and currency regions change on-the-fly.
- **Dynamic Currency Choices**: I added support for **INR (₹)**, **USD ($)**, **EUR (€)**, **GBP (£)**, **JPY (¥)**, **CAD ($)**, **AUD ($)**, **AED (د.إ)**, and **SGD ($)**. The application formats locales and symbols dynamically!
- **On-Demand Configuration**: You can select your primary currency during onboarding, or update both the **Monthly Spend Cap** and **Currency Code** instantly by hovering over the **Cap Allocation** card on the dashboard, clicking ✏️ **Edit**, and choosing your parameters.
- **Instant Synchronization**: I designed the charts, balances, rules, and statement reports to align instantly upon configuration change!

---

## 🔒 Production Security and Deployment Optimization

- **API Secret Key Safety**: I set up the application to read sensitive keys (like credentials for a database or third-party APIs) via `.env` environment variables injected at runtime, keeping secrets completely out of the codebase.
- **Cache-Aside Optimization**: For premium cloud deploys, you can easily attach a Redis database layer in front of the storage to cache common queries and minimize database transaction overhead.
- **Stateless Architecture**: Because I delegated data storage to client-side `localStorage`, the web application runs entirely stateless. If you deploy it to Google Cloud Run, it can scale down to **0 active server instances** during idle times to minimize running costs!
