# HireCraft - Technical Interview & JD Intelligence Studio

An AI-powered technical interview roadmap generator that analyzes job descriptions and tailors core skills, calibrated coding and architecture questions, 7-day study plans, and reverse-interview questions by seniority level.

---

## 🚀 Running in Visual Studio Code (Quick Start)

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **npm** (comes with Node.js) or **bun** / **pnpm**
- **Visual Studio Code**

---

### 2. Open Project in VS Code
Open VS Code in this directory:
```bash
code .
```

---

### 3. Install Dependencies
Open the integrated terminal in VS Code (`Ctrl + ` ` or `Cmd + ` `) and run:
```bash
npm install
```

---

### 4. Configure Environment Variables
Copy `.env.example` to create your local `.env` file:
```bash
cp .env.example .env
```
Open `.env` and insert your Gemini API Key:
```env
GEMINI_API_KEY="your-gemini-api-key-here"
```
*(Get a free API key at [Google AI Studio](https://aistudio.google.com/app/apikey) if you don't already have one).*

---

### 5. Start the Application
Run the full-stack development server:
```bash
npm run dev
```

The Express server with Vite middleware will start on:
👉 **[http://localhost:3000](http://localhost:3000)**

---

## 🛠️ VS Code Integration Highlights

This project includes pre-configured `.vscode` configurations:

- **F5 / Run & Debug (`.vscode/launch.json`)**:
  - `Launch Full-Stack Dev Server`: Runs `npm run dev` directly inside VS Code's integrated terminal.
  - `Debug Server (server.ts with tsx)`: Sets breakpoints in `server.ts` routes (`/api/analyze`, `/api/mock-feedback`, `/api/share`).
  - `Full Stack: Server + Chrome Debugger`: Launches both the server and a debuggable Chrome browser window.
- **Default Build Task (`Ctrl + Shift + B` / `Cmd + Shift + B`)**:
  - Automatically runs `npm run build`.
- **Recommended Extensions (`.vscode/extensions.json`)**:
  - Tailwind CSS IntelliSense
  - Prettier & ESLint
  - TypeScript Official Extension

---

## 📦 Available Scripts

| Command | Action |
| :--- | :--- |
| `npm run dev` | Starts full-stack Express + Vite dev server on `http://localhost:3000` |
| `npm run build` | Compiles production assets into `dist/` |
| `npm start` | Runs the production server (`tsx server.ts`) |
| `npm run lint` | Runs TypeScript compiler type-checking (`tsc --noEmit`) |
| `npm run clean` | Deletes the `dist/` directory |

---

## 🏗️ Architecture Overview

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Recharts, jsPDF.
- **Backend**: Node.js, Express, `server.ts` utilizing `vite.middlewares` in dev mode for unified port 3000 operation.
- **AI Engine**: `@google/genai` TypeScript SDK using `gemini-3.8-flash` with strict JSON schema calibration.
- **Data Persistence**:
  - Checklists & Progress: `localStorage`
  - Scratchpad Notes & AI Evaluations: `localStorage`
  - Public Shared Plans: In-memory & Express `/api/share` routes
