# Prompt Engineering Research Laboratory (PERL)

[![Academic Paper License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![AI Safety Program Approved](https://img.shields.io/badge/AI_Safety-Aligned-emerald.svg)](docs/METHODOLOGY.md)
[![TypeScript Framework](https://img.shields.io/badge/Framework-React_19_--_Express_4-blue.svg)](src/App.tsx)
[![Empirical Benchmark Engine](https://img.shields.io/badge/Benchmark_Engine-Automated_Judge-orange.svg)](src/components/BenchmarkRunner.tsx)

An empirical research platform designed to systematically evaluate, benchmark, and compare prompt engineering strategies (e.g., Chain of Thought, Tree of Thoughts, Constitutional Prompting) across large language models, measuring semantic accuracy, response consistency, computational latency, safety guardrails, and cost-efficiency.

Designed for AI safety researchers, academic fellowship programs, and alignment researchers seeking reproducible, quantitative results on prompt structures.

---

## Workspace Navigation

- [Research Dashboard](#1-research-dashboard) — Multi-model statistical overviews and cost-efficiency frontiers.
- [Automated Benchmarks](#2-automated-benchmark-engine) — Multi-trial experiment runner with automated LLM-as-a-judge grading.
- [Strategy Library](#3-prompt-strategy-vault) — Catalog of scholarly scaffolding structures with custom template authoring.
- [AI Safety Audits](#4-adversarial-jailbreak-auditing) — Injection compliance rates and alignment curves under stress.
- [Experiment Tracking Log](#5-experiment-tracking-and-reproducibility) — Searchable, filterable JSON-exportable runs databases.
- [Academic Preprint Compiler](#6-academic-preprint-and-latex-report-generator) — Formatted, LaTeX-style markdown papers detailing results.

---

## 🔬 Core Academic Capabilities

### 1. Research Dashboard
Visualizes empirical performance metrics (mean accuracy, cost indices, latencies) and highlights the **Pareto frontier** between prompt scaffold complexity (e.g., Tree of Thoughts) and computational latency, illustrating exactly which techniques maximize performance.

### 2. Automated Benchmark Engine
Executes parallel testing across specialized benchmark datasets representing diverse cognitive tasks:
- **Logical & Math Reasoning** (e.g., algebraic steps, cognitive puzzles)
- **Code Generation & Algorithms** (TypeScript functions, algorithmic boundaries)
- **Fact Verification & Truth Alignment** (Citing scientific consensus, resisting misinformation)
- **Security & Refusal Guardrails** (Phishing requests, car-theft refusals)
- **Adversarial Jailbreak Resistance** (DAN persona override attempts)

All responses are graded on an integer scale (0-100) using a standardized **"LLM-as-a-judge"** grading node implemented on the server via secondary evaluation prompts.

### 3. Prompt Strategy Vault
Preloaded with 13 of the most influential prompt engineering strategies in contemporary AI literature, complete with system templates, category classifications, and description context:
- *Zero-Shot, Few-Shot, Role Prompting*
- *Chain of Thought (CoT), Self-Consistency, Tree of Thoughts (ToT)*
- *ReAct, Self-Reflection, Multi-Agent Coordination, Debate Prompting*
- *Constitutional Prompting (Self-Critique), Structured JSON, RAP*

### 4. Adversarial Jailbreak Auditing
Tracks model alignment scores and vulnerability curves when exposed to adversarial prompt manipulation. Measures the precise rate at which prompt strategies successfully suppress harmful outputs.

### 5. Experiment Tracking and Reproducibility
Stores experiment runs database server-side inside `data/db.json` tracking prompt state, temperature, model version, raw responses, and score cards. The entire runs table can be exported to standard JSON for replication.

### 6. Academic Preprint and LaTeX Report Generator
Automatically compiles statistical metrics and research outcomes into LaTeX-style markdown preprints complete with centered abstracts, formatted methodology tables, and structured discussion blocks, downloadable in `.md`, `.json`, and `.csv`.

---

## 🛠️ Architecture & Technical Stack

The laboratory operates on a unified **Full-Stack Express + React/Vite** architecture tailored for sandboxed, high-performance environments:

```
                  ┌─────────────────────────────────────────────────────────┐
                  │                      React Frontend                     │
                  │             (Dashboard, Benches, Preprints)             │
                  └────────────────────────────┬────────────────────────────┘
                                               │ HTTP / REST
                                               ▼
                  ┌─────────────────────────────────────────────────────────┐
                  │                    Express JS Backend                   │
                  │           (REST Controllers, Handshake Nodes)           │
                  └──────┬─────────────────────────────┬────────────────────┘
                         │                             │
                         ▼                             ▼
       ┌───────────────────────────────────┐ ┌──────────────────────────────┐
       │     Google GenAI SDK (Node)       │ │     JSON Persistent DB       │
       │    - Trial Model Ingress          │ │      - data/db.json          │
       │    - Judge Model Evaluation       │ │      - Baseline Runs Logs    │
       └───────────────────────────────────┘ └──────────────────────────────┘
```

- **Frontend**: Single-Page Application (SPA) built using **React 19**, **Vite**, **TypeScript**, and styled with **Tailwind CSS**. Data charts are powered by **Recharts**, and icons by **Lucide**.
- **Backend**: **Express (Node.js)** handling REST routers and static asset server. Runs are compiled in development using `tsx` and bundled for production into a single `dist/server.cjs` file via `esbuild`.
- **Inference Engine**: Server-side **`@google/genai` TypeScript SDK** using `gemini-3.5-flash` (for grading and rapid trials) and supporting `gemini-3.1-pro-preview`.
- **Storage**: Highly optimized filesystem JSON data store located at `data/db.json` ensuring full persistence across container lifecycles.

---

## 📦 Directory Structure

```
├── data/
│   └── db.json               # Persistent laboratory database (strategies, tasks, runs)
├── docs/
│   ├── METHODOLOGY.md        # Mathematical formulations, task descriptions, and datasets
│   ├── ARCHITECTURE.md       # Technical stack, esbuild pipelines, and routing diagrams
│   └── API.md                # Server REST endpoint schemas
├── src/
│   ├── components/
│   │   ├── Dashboard.tsx     # Recharts analytical dashboards
│   │   ├── BenchmarkRunner.tsx# Experiment panel with terminal logging traces
│   │   ├── StrategyLibrary.tsx# Strategy vault with custom form authoring
│   │   ├── SafetyAudit.tsx   # Alignment indexes and failure rate trackers
│   │   ├── ExperimentLog.tsx # Searchable tracking logs table with JSON exports
│   │   └── ReportGenerator.tsx# LaTeX-style markdown preprint generator
│   ├── App.tsx               # Client state supervisor and navigation master
│   ├── types.ts              # TypeScript type interfaces & category definitions
│   └── index.css             # Theme typography imports (Space Grotesk, Mono)
├── server.ts                 # Full-stack entry-point (Vite middleware & REST controllers)
└── server_db.ts              # File-based database managers & baseline run generators
```

---

## 🚀 Installation & Local Execution

Ensure you have Node.js (v18+) installed.

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/prompt-lab.git
   cd prompt-lab
   ```

2. **Install core dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root directory:
   ```env
   GEMINI_API_KEY="your-google-api-key"
   ```

4. **Launch development server**:
   ```bash
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:3000` to interact with the laboratory.

5. **Compile production build**:
   ```bash
   npm run build
   ```
   This compiles assets into `dist/` and bundles the Express backend into `dist/server.cjs` using esbuild.

6. **Start production server**:
   ```bash
   npm run start
   ```

---

## 🤝 Contributing & License

We welcome contributions from alignment researchers and prompt engineers! Please refer to our [Contributing Guidelines](docs/CONTRIBUTING.md).

This project is licensed under the MIT License — see the [MIT License Document](docs/LICENSE.md) for details.
