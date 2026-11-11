---
title: "Agent Loop vs ReAct vs MRKL: Three Layers, One Clear Picture"
description: "Execution engine, decision protocol, organizational architecture — three layers that don't compete. A layered diagram and a full worked example."
date: 2026-11-10
minutes: 6
tags:
  - Comparison
  - Summary
lang: en
order: 6
---

## Positioning at a Glance (One Sentence Each) {#position}

| Concept | Essence | Question it answers |
|---|---|---|
| **MRKL** | System architecture (static organizational scheme) | "What capabilities does the system have? Which task goes to whom?" |
| **ReAct** | Decision protocol (model output format and reasoning pattern) | "How should the model think and act at each step?" |
| **Agent Loop** | Execution engine (runtime control flow) | "How does the whole process keep advancing, and how does it terminate?" |

## Layered Relationship Diagram {#layers}

```
┌───────────────────────────────────────────────┐
│  Agent Loop (execution engine)                │
│    while not terminated:                      │
│        ┌─────────────────────────────────┐    │
│        │  ReAct decision protocol        │    │
│        │  (inside each round)            │    │
│        │  Thought → Action → Obs         │    │
│        └────────────────┬────────────────┘    │
│                         │  call               │
│        ┌────────────────▼────────────────┐    │
│        │  MRKL organizational            │    │
│        │  architecture (tools/modules)   │    │
│        │  Router + expert module registry│    │
│        └─────────────────────────────────┘    │
└───────────────────────────────────────────────┘
```

**Loop is the "skeleton," ReAct is "how the brain works each round," and MRKL is "how the hands and resources are arranged."**

## Dimension-by-Dimension Comparison {#table}

| Dimension | MRKL | ReAct | Agent Loop |
|---|---|---|---|
| Originator / Source | AI21 Labs (2022 paper) | Google / Princeton (2022 paper) | Engineering concept (implemented by frameworks such as LangChain) |
| Abstraction layer | Architecture layer (static) | Reasoning layer (model behavior) | Runtime layer (control flow) |
| Core components | Router + expert modules | A single LLM + tools, advanced by Thought/Action/Observation | LLM + tools + memory + termination conditions + state management |
| Decision-making approach | One-shot "triage" at the front end; tasks handed off to expert modules | The model decides autonomously at each step, with planning and execution interleaved | Framework-driven loop; the model emits decision tokens each round |
| Error correction | Weak (hard to recover once a task is misrouted) | Strong (Observation feedback allows correction) | Depends on the internal pattern (strong when using the ReAct pattern) |
| Extensibility | Strongest (module isolation; modules can be added or removed independently) | Medium (extending = adding tool descriptions to the prompt) | Depends on implementation (state-graph-style Loops are highly extensible) |
| Explainability | Medium (routing is auditable; modules are black boxes) | Strong (the whole chain of thought is visible) | Depends on implementation (explicit state graphs are highly observable) |
| Typical scenarios | Production systems, domain-partitioned tasks | Open-ended multi-step reasoning, trial-and-error tasks | All Agent applications (a universal foundation) |
| Representative implementations | AI21 Studio, modular Agent design | ReAct prompt templates, LangChain ReAct style | LangGraph, OpenAI Agent SDK, AutoGen |

## How the Three Work Together: A Complete Example {#example}

Suppose the task is: **"Calculate the 30-day return of the Shanghai Composite Index and write an analysis report."**

- **MRKL layer (organization)**: the module registry holds three expert modules — `stock_api`, `calculator`, and `report_writer`; the router (LLM) determines that the task involves data fetching + calculation + generation and hands the first two steps to the corresponding modules.
- **Loop layer (engine)**: the loop starts, iteration count = 0, context = task objective + tool descriptions.
- **ReAct layer (per-round decisions)**:

```
Thought: First fetch the closing prices of the last 30 days
Action: stock_api["get_prices", "Shanghai Composite Index", 30 days]
Observation: [3245.2, 3260.1, ..., 3310.5]

Thought: Calculate return rate = (last - first) / first
Action: calculator["return_rate", 3310.5, 3245.2]
Observation: 0.0201

Thought: Data is ready, generate the report
Final Answer: The return rate over the last 30 days is 2.01%, ...
```
- **Loop layer (wrap-up)**: it detects `Final Answer` → break and returns the answer; if max_iterations is exceeded (e.g., still going in circles by round 4) → force termination to prevent an infinite loop.

## An Analogy to Help You Remember {#analogy}

Put all three into a "hospital" scenario:

- **MRKL = the hospital's organizational architecture**: triage desk + internal medicine + surgery + lab…… (how capabilities and departments are divided);
- **ReAct = the doctor's diagnostic approach**: first consult (Thought) → order tests (Action) → review the results (Observation) → reassess, revising as you go;
- **Agent Loop = the hospital's patient-flow engine**: a closed loop of registration → triage → examination → follow-up → discharge, with timeout limits and risk controls.

## Conclusion {#conclusion}

> **MRKL decides "what the system has and who does what," ReAct decides "how the model thinks and acts each round," and Agent Loop decides "how this process keeps running and when it stops."** The three stand in a complementary layering relationship, not a competitive one. The default Agent in mainstream frameworks (e.g., LangGraph + ReAct-style prompt + tool registry) is the combination of all three; the differences between frameworks are essentially differences in how these three layers are implemented in detail.
