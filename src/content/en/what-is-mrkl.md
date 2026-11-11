---
title: "What Is MRKL? Modular Reasoning, Knowledge, and Language Explained"
description: "MRKL from AI21 Labs: router + expert modules that let LLMs delegate to knowledge bases, calculators, and specialized models — the first lesson in AI agent architecture."
date: 2026-11-10
minutes: 6
tags:
  - Getting
  - Started
  - Concepts
lang: en
order: 2
---

## Core Idea: Router + Expert Modules {#idea}

MRKL starts from a simple but important observation: **you shouldn't stuff every capability into a single large language model**. Math can be miscalculated, fact lookups can hallucinate, and vertical domains need specialized knowledge — rather than forcing a general-purpose LLM to handle it all, split the system into two kinds of components, each doing its own job:

- **Router** — played by the LLM. It understands the user's input, decides which module to call, and dispatches the task.
- **Expert Modules** — a set of specialized components, including:

  - **Expert LLMs**: models fine-tuned for specific domains (law, medicine, math, etc.);
  - **External knowledge bases**: databases, knowledge graphs, search engines;
  - **Discrete reasoning tools**: calculators, symbolic math engines (e.g., Wolfram Alpha), code interpreters, and more.

## Workflow {#flow}

```
User input → Router (LLM) analyzes intent
              ├── needs calculation → call calculator / math engine
              ├── needs facts       → query knowledge base / search engine
              ├── needs expertise   → call expert LLM
              └── general questions → answered directly by the general LLM
```

Routing happens at the front end: once a task is assigned to an expert module, the module's internals act as a relatively self-contained black box. This "triage first, execute later" flow makes the whole system work like a hospital with clearly divided responsibilities.

## How MRKL Differs from ReAct {#vs-react}

MRKL is often compared with ReAct — the two were proposed in the same year, but their approaches are completely different:

| Dimension | MRKL | ReAct |
|---|---|---|
| Proposed by | AI21 Labs | Google / Princeton |
| Dispatch | Router assigns tasks to static expert modules | Model decides its own "think–act–observe" loop |
| Module nature | Modules are independent, replaceable, and extensible | Mostly tool calls; no independent expert modules |
| Focus | Modular, composable, auditable | Generation of reasoning traces |

More precisely, MRKL answers "how the system organizes its capabilities and who should handle which task", while ReAct answers "what the model should think and do right now". The two have been converging in today's agent frameworks.

## Why Use MRKL {#why}

- **Accuracy**: math and fact lookups are delegated to deterministic tools, significantly reducing LLM hallucination;
- **Maintainability**: each expert module can be updated independently without retraining the entire model;
- **Explainable / auditable**: routing and invocations are transparent, making problems easy to trace;
- **Extensible**: new knowledge bases or tools can be plugged in at any time, and the system's capabilities grow linearly.

## Summary {#conclusion}

> MRKL is an important pioneer of the "tool calling / function calling" idea in the LLM era. The "LLM for planning + tools for execution" pattern found in today's mainstream agent frameworks largely carries forward its architectural thinking.

Next, read: [ReAct Loop vs. MRKL: A Comparison](/en/articles/react-vs-mrkl.html), or jump straight into [Agent Framework Loop Mechanics Explained](/en/articles/agent-loop.html).
