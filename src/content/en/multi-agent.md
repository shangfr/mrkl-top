---
title: "Multi-Agent Architectures: From Conversation to Orchestration"
description: "Manager-worker, debate, orchestrator, and swarm — four collaboration patterns, a framework comparison, and the convergence challenges."
date: 2026-11-10
minutes: 9
tags:
  - Advanced
  - Architecture
lang: en
order: 11
---

## Why multiple agents? {#why}

- **Division of labor and specialization**: a researcher agent, a code agent, and a reviewer agent each bring a specialty that a single generalist can't match reliably;
- **Adversarial review**: have one agent generate and another critique, which measurably improves quality (e.g., cross-reviewing code);
- **Parallel speed-up**: independent subtasks run concurrently, cutting end-to-end latency;
- **Context isolation**: each agent only sees its own slice, keeping a single context from blowing up.

## Four mainstream collaboration patterns {#patterns}

| Pattern | Structure | Typical scenario |
|---|---|---|
| **Manager-Worker (hierarchical)** | A manager plans and distributes subtasks; workers execute and report back | Breaking down and executing a complex project |
| **Debate** | Several agents answer and rebut each other, then a final verdict | Fact-checking, proposal review |
| **Orchestrator-Plugins** | One orchestrator calls a set of tool-ified agents | Customer support, RAG Q&A pipelines |
| **Swarm** | Agents pass messages directly, no central scheduler | Loosely coupled collaboration tasks |

## Communication mechanisms {#comms}

- **Message passing**: agents message each other directly (AutoGen's conversational style);
- **Shared blackboard**: all agents read and write one shared state object (LangGraph's State);
- **Structured calls**: like function calling, registering "call another agent" as a tool — agents literally "use each other as tools".

## Framework comparison {#frameworks}

| Framework | Collaboration style | Characteristics |
|---|---|---|
| AutoGen | Conversational multi-agent | Free-form dialogue between agents; speaker switching |
| CrewAI | Role-based (Role / Goal / Backstory) | Models business teams; fast to pick up |
| LangGraph | State-graph orchestration | Explicit control flow; observable and auditable; production-ready |
| OpenAI Swarm | Lightweight swarm collaboration | Agent handoffs; simple to implement |

## The relationship to MRKL {#mrkl}

MRKL's "expert modules" are **static** (knowledge bases, calculators); multi-agent systems **dynamize** them — each agent is an expert with its own reasoning ability. The router's role is upgraded to a Manager/Orchestrator, and every node in the loop may itself be a full mini Agent Loop. **In short: multi-agent = MRKL's organizational idea + ReAct's execution protocol + a composition of many loops.**

## Challenges: cost, convergence, and dead loops {#challenges}

- **Amplified token cost**: N agents passing messages multiplies cost by roughly N → cap the number of rounds and avoid pointless small talk;
- **Convergence**: debate can fail to reach agreement forever → set a max round count plus explicit termination conditions (voting, time, goal reached);
- **Dead loops / circular references**: agent A calls B, B calls A → like a single agent, you need an iteration cap, ideally with loop detection;
- **Context amplification**: if the shared blackboard is fully visible to everyone, you've just rebuilt one giant context → read/write on demand with isolated views.

## Summary {#conclusion}

> Multi-agent isn't "the more the better" — it's **the right division of labor + explicit control flow + hard termination conditions**. Decide who owns what, how they hand off, and how to stop — then pick a framework. Otherwise, the bigger the team, the faster it spins out of control.

Related: [The Agent Loop, explained](/en/articles/agent-loop.html) · [LangGraph tutorial](/en/articles/langgraph-agent.html) · [Safety and guardrails](/en/articles/agent-safety.html)
