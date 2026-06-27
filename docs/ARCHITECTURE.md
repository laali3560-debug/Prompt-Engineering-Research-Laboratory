# Laboratory Technical Architecture & Compilers

This document describes the software architecture, compilation pipelines, routing mechanisms, and data schemas of the **Prompt Engineering Research Laboratory (PERL)**.

---

## 1. System Topology

PERL is designed as a fully-featured full-stack Node.js web application built with TypeScript, React 19, Express 4, and Vite 6.

```
                      ┌─────────────────────────────────┐
                      │          React Frontend         │
                      │       (Recharts / Lucide)       │
                      └────────────────┬────────────────┘
                                       │ HTTP REST Handshakes
                                       ▼
                      ┌─────────────────────────────────┐
                      │       Express Web Server        │
                      │    (API Routes / Asset Serving) │
                      └───────┬─────────────────┬───────┘
                              │                 │
             Vite Dev Proxy  │                 │ file read / write
             (in dev mode)    ▼                 ▼
             ┌─────────────────────┐   ┌─────────────────┐
             │   Vite Middleware   │   │   data/db.json  │
             │   & HMR Ingress     │   │  Local File DB  │
             └─────────────────────┘   └─────────────────┘
```

---

## 2. Compilation & Bundling Pipeline

To guarantee performance, compatibility, and standalone container readiness, we use distinct pipelines for development and production.

### A. Development Mode (`npm run dev`)
In development, the server boots using `tsx` (TypeScript Execute), which strips types natively at runtime. The Express server boots on port `3000`, mounts **Vite** as a development middleware, and intercepts front-end asset requests dynamically:
- REST API calls (e.g. `/api/*`) are handled by Express routers.
- Front-end imports are hot-reloaded and served by Vite directly, bypassing filesystem builds.

### B. Production Build (`npm run build` and `npm run start`)
When building for production, a dual-stage compilation is triggered:
1. **Frontend Compilation**: Vite compiles the React code, tree-shakes unused components, and bundles optimized, static HTML/JS/CSS assets into the `dist/` directory.
2. **Backend Compilation**: `esbuild` bundles the backend `server.ts` into a unified CommonJS file `dist/server.cjs` with these parameters:
   - `--bundle`: Packages all internal TypeScript imports (such as `server_db.ts` and shared types) into a single file to eliminate Relative ES Module loading problems.
   - `--platform=node`: Configures environment globals for Node.js runtimes.
   - `--packages=external`: Leaves native modules (like `express` and `@google/genai`) outside the bundle to maintain performance.
   - `--sourcemap`: Generates full mappings for accurate error traceback reporting.

The server is then run as a standalone process via Node: `node dist/server.cjs`.

---

## 3. Data Storage & Schema Models

PERL stores all data locally in `data/db.json` on the server. If missing on startup, `/server_db.ts` generates comprehensive baseline research records containing baseline trials, safety compliance profiles, and benchmark tasks.

### Database JSON Schema:
```json
{
  "strategies": [
    {
      "id": "cot",
      "name": "Chain of Thought (CoT)",
      "description": "Encourages step-by-step reasoning...",
      "category": "reasoning",
      "template": "Solve the task. Let's think step-by-step...",
      "isCustom": false
    }
  ],
  "tasks": [
    {
      "type": "math",
      "name": "Math Reasoning",
      "description": "Evaluates algebraic, logical puzzles...",
      "dataset": [
        {
          "id": "m1",
          "input": "If a farmer has 15 sheep...",
          "expectedOutput": "8"
        }
      ]
    }
  ],
  "runs": [
    {
      "id": "run_1719521000",
      "timestamp": "2026-06-27T10:00:00.000Z",
      "strategyId": "cot",
      "strategyName": "Chain of Thought (CoT)",
      "taskType": "math",
      "taskName": "Math Reasoning",
      "model": "gemini-3.5-flash",
      "temperature": 0.2,
      "promptText": "Solve the task. Let's think step-by-step...\n\nInput:\nIf a farmer has 15 sheep...",
      "rawResponse": "Based on analysis, the farmer has 8 sheep left...",
      "metrics": {
        "accuracy": 95,
        "hallucinationRate": 5,
        "consistency": 90,
        "latencyMs": 1450,
        "tokensUsed": 380,
        "costUSD": 0.000028,
        "safetyScore": 100,
        "jailbreakResistance": 100,
        "reasoningQuality": 92
      },
      "status": "completed"
    }
  ],
  "safetyReports": [
    {
      "strategyId": "cot",
      "strategyName": "Chain of Thought (CoT)",
      "jailbreakAttempts": 5,
      "jailbreakBypasses": 0,
      "alignmentScore": 95,
      "manipulationResistance": 92,
      "harmfulOutputRate": 0,
      "summary": "Chain of thought displays robust safety alignment..."
    }
  ]
}
```
This self-contained structure allows easy parsing, replication, and backup.
