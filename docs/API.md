# API Specification & Endpoint Manual

This document provides schema definitions, parameters, and example JSON payloads for the server-side REST endpoints exposed by the **Prompt Engineering Research Laboratory (PERL)** backend server.

---

## 1. Laboratory Database (`GET /api/database`)
Fetches the entire research state of the laboratory, including strategy templates, benchmark tasks, historical experiment runs, and calculated safety reports.

- **Request Type**: `GET`
- **Output Content-Type**: `application/json`
- **Response Schema**:
  ```json
  {
    "strategies": [ ... ],
    "tasks": [ ... ],
    "runs": [ ... ],
    "safetyReports": [ ... ]
  }
  ```

---

## 2. Models Metadata (`GET /api/models`)
Lists all pre-configured target models and active cost structures.

- **Request Type**: `GET`
- **Output Content-Type**: `application/json`
- **Response Schema**:
  ```json
  [
    {
      "id": "gemini-3.5-flash",
      "name": "Gemini 3.5 Flash",
      "provider": "Google",
      "costPer1kInput": 0.000075,
      "costPer1kOutput": 0.0003,
      "maxContext": 1048576,
      "type": "flash"
    }
  ]
  ```

---

## 3. Register Custom Strategy (`POST /api/strategies`)
Adds a user-defined prompt engineering scaffolding structure to the database.

- **Request Type**: `POST`
- **Input Content-Type**: `application/json`
- **Input Payload**:
  ```json
  {
    "name": "Meta-Cognitive Prompting",
    "description": "Guides models to audit their memory buffers before drafting answers.",
    "category": "reasoning",
    "template": "Analyze your memory. Solve task: [TASK_INPUT]\nOutput:"
  }
  ```
- **Response Schema (`201 Created`)**:
  ```json
  {
    "id": "meta-cognitive-prompting",
    "name": "Meta-Cognitive Prompting",
    "description": "Guides models to audit their memory buffers before drafting answers.",
    "category": "reasoning",
    "template": "Analyze your memory. Solve task: [TASK_INPUT]\nOutput:",
    "isCustom": true
  }
  ```

---

## 4. Delete Custom Strategy (`DELETE /api/strategies/:id`)
Deletes a custom strategy and purges its experimental history.

- **Request Type**: `DELETE`
- **Response Schema**:
  ```json
  {
    "success": true,
    "message": "Strategy deleted successfully."
  }
  ```

---

## 5. Clear Database History (`POST /api/runs/clear`)
Wipes custom experimental history and resets prompt registers to default laboratory baselines.

- **Request Type**: `POST`
- **Response Schema**:
  ```json
  {
    "success": true,
    "clearedCount": 42
  }
  ```

---

## 6. Execute Benchmark Experiment (`POST /api/runs`)
Launches a live automated benchmark trial, formatting prompt templates, querying Gemini APIs on the server, spawning a secondary LLM judge, and grading results.

- **Request Type**: `POST`
- **Input Content-Type**: `application/json`
- **Input Payload**:
  ```json
  {
    "strategyId": "cot",
    "taskType": "math",
    "model": "gemini-3.5-flash",
    "temperature": 0.2
  }
  ```
- **Response Schema (`210 Created`)**:
  ```json
  {
    "id": "run_1719522100",
    "timestamp": "2026-06-27T10:15:00.000Z",
    "strategyId": "cot",
    "strategyName": "Chain of Thought (CoT)",
    "taskType": "math",
    "taskName": "Math Reasoning",
    "model": "gemini-3.5-flash",
    "temperature": 0.2,
    "promptText": "Solve the task. Let's think step-by-step...\n\nInput:\nSolve for x...",
    "rawResponse": "To solve for x: subtract 7 from 22 which is 15. Then divide 15 by 3 which is 5. Therefore x = 5.",
    "metrics": {
      "accuracy": 100,
      "hallucinationRate": 0,
      "consistency": 100,
      "latencyMs": 1150,
      "tokensUsed": 340,
      "costUSD": 0.000025,
      "safetyScore": 100,
      "jailbreakResistance": 100,
      "reasoningQuality": 95
    },
    "status": "completed"
  }
  ```

---

## 7. Generate Academic preprint (`POST /api/generate-report`)
Compiles statistical performance tables and generates LaTeX-style markdown papers.

- **Request Type**: `POST`
- **Input Payload**:
  ```json
  {
    "strategyId": "cot"
  }
  ```
- **Response Schema**:
  ```json
  {
    "title": "Comparative Analysis and Empirical Evaluation of Chain of Thought (CoT)",
    "text": "# Abstract\nThis paper presents an empirical analysis...\n# 1. Introduction...\n",
    "meta": {
      "avgAccuracy": 92,
      "avgSafety": 100,
      "avgReasoning": 90,
      "avgLatency": 1250,
      "avgCost": "0.000030",
      "sampleSize": 5,
      "strategyName": "Chain of Thought (CoT)"
    }
  }
  ```
