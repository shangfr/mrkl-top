---
title: "MRKL Tutorial: Modular Reasoning, Knowledge, and Language for AI Agents"
description: "A hands-on MRKL tutorial: what the modular reasoning, knowledge, and language architecture is, how its router and expert modules work, a minimal Python example, and when to use it."
date: 2026-11-10
minutes: 9
tags:
  - Tutorial
  - Architecture
  - Router
  - Python
lang: en
order: 1
---

## What is MRKL? {#what}

**MRKL** stands for **M**odular **R**easoning, **K**nowledge, and **L**anguage. It's a neuro-symbolic architecture proposed by AI21 Labs in 2022 (arXiv 2205.00445) that splits an AI system into two kinds of parts:

- **A router** — an LLM that understands the query and decides which expert to call;
- **Expert modules** — specialized components such as a knowledge base, a calculator or symbolic solver, a code interpreter, or a domain-specific LLM.

The core idea is simple: **no single model should do everything**. Delegate the query to the component that is actually good at it, then merge the result back. It's the same division of labor you'd use to build a company, which is why MRKL-style thinking keeps reappearing in modern agent frameworks.

## The Router: turning a question into a dispatch {#router}

The router is typically an LLM prompted to output a decision: which expert should handle this query, and with what arguments. A minimal router prompt looks like:

```
You are a router. Classify the query into one of:
1. "calc"  — arithmetic or math questions
2. "kb"    — factual questions about stored knowledge
3. "code"  — questions that need executing code
4. "llm"   — anything else, answer directly
Output only the category.
```

In practice, you can implement routing with structured output (JSON mode), function calling, or even a small classification model. The important property: **routing is cheap, and getting it wrong only costs one retry** — so don't over-engineer the router.

## Expert Modules: knowledge, computation, and specialists {#experts}

| Expert type | What it handles | Examples |
|---|---|---|
| **Knowledge base** | Stable, queryable facts | Vector DB with retrieval, structured DB, docs |
| **Symbolic / computational** | Exact math, logic, lookups | Calculator, Wolfram Alpha, SQL engine |
| **Code interpreter** | Run code to verify answers | Python sandbox, notebook runtime |
| **Specialized LLM** | Domain reasoning | Legal / medical / code-specialized models |

Each expert can be a black box as far as the router is concerned — it takes arguments, returns a result. This is exactly the [tool-calling interface](/en/articles/tool-calling.html) modern agents use, which is why MRKL feels so familiar today.

## Where MRKL meets the Agent Loop {#loop}

MRKL describes the **organization** (who does the work). It doesn't prescribe how the system decides to keep going — that's the [Agent Loop](/en/articles/agent-loop.html) (the execution engine) and [ReAct](/en/articles/react-vs-mrkl.html) (the think-then-act protocol). In practice, the three compose:

- The loop asks the router what to do next;
- The router dispatches to an expert module;
- The expert's output is written back to context;
- Repeat until the loop decides to answer.

If you already understand our [three-layer picture](/en/articles/loop-vs-react-vs-mrkl.html), MRKL is the "organizational architecture" layer, and any agent framework can be used to run it.

## A minimal Python example {#example}

```
import json

def calc(query: str) -> str:
    # A tiny safe evaluator for arithmetic only
    allowed = set("0123456789+-*/ .")
    if not set(query).issubset(allowed):
        return "cannot evaluate"
    return str(eval(query))  # demo only — use a real sandbox in prod

def kb(query: str) -> str:
    facts = {"mrkl_author": "AI21 Labs", "mrkl_year": 2022}
    return facts.get(query, "not found")

def router_llm(query: str) -> str:
    # In production this is an LLM call; here we stub a rule:
    if any(c.isdigit() for c in query):
        return "calc"
    if "who" in query or "when" in query:
        return "kb"
    return "llm"

def mrkl_agent(query: str) -> str:
    expert = router_llm(query)
    if expert == "calc":
        return calc(query)
    if expert == "kb":
        return kb(query)
    return f"llm answer for: {query}"  # your main LLM goes here

print(mrkl_agent("What is 12 * 8?"))   # -> 96
print(mrkl_agent("who is mrkl_author?"))  # -> AI21 Labs
```

The pattern to copy is the **dispatch table**: the router returns a key, the agent looks up a handler. Production versions add validation, retries, and observability — but the skeleton is exactly what LangGraph, AutoGen, and CrewAI wrap for you (see our [LangGraph tutorial](/en/articles/langgraph-agent.html)).

## When to use MRKL-style design {#when}

- You have **reliable, expensive, or specialized components** (a solver, a DB, a domain expert) that a general LLM shouldn't reinvent;
- Your queries are **highly heterogeneous** — math, facts, code, prose — with no single best model;
- You need **auditability**: knowing which expert answered, so you can test each module separately;
- Your bottleneck is **cost or latency**: route easy queries to small models and hard ones to big ones.

If instead your workload is homogeneous prose generation, a single well-prompted LLM is simpler and often better. Modularity has a real cost: more moving parts, more failure modes, more plumbing.

## MRKL vs ReAct vs a single LLM {#compare}

| Approach | Structure | Best for | Weakness |
|---|---|---|---|
| **Single LLM** | One model, everything in-context | Simple, homogeneous tasks | Hallucinated facts, weak arithmetic |
| **ReAct** | Model chooses actions, acts, observes | Interactive, exploratory tasks | Needs good tooling and grounding |
| **MRKL** | Router + expert modules | Heterogeneous queries, known experts | Routing overhead, integration work |

They're not rivals: ReAct can be the decision protocol *inside* an MRKL-organized system, and the Agent Loop is the engine running both. For the full picture, see [the paper deep dive](/en/articles/mrkl-paper.html) and [ReAct vs MRKL](/en/articles/react-vs-mrkl.html).

## Summary {#conclusion}

> MRKL is the original blueprint for "don't make one model do everything": a router that dispatches, and experts that specialize. Thirty lines of Python capture the essence, and every modern agent framework is, at heart, an opinionated MRKL+loop implementation.

Next: [ReAct Loop vs MRKL](/en/articles/react-vs-mrkl.html) · [The Agent Loop, explained](/en/articles/agent-loop.html) · [LangGraph tutorial](/en/articles/langgraph-agent.html)
