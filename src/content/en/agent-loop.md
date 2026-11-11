---
title: "The Agent Loop, Explained: How Agent Frameworks Really Work"
description: "Think, decide, call tools, observe, repeat: the four roles of the standard Agent Loop, termination conditions, three variants, and context management strategies."
date: 2026-11-10
minutes: 8
tags:
  - Fundamentals
  - Advanced
lang: en
order: 5
---

## The Four Roles in the Loop {#roles}

An Agent Loop needs four components, which work together on every iteration:

| Role | Counterpart | Responsibility |
|---|---|---|
| **Brain** (Planner/Reasoner) | LLM | Decides each round “what to think about now and what to do next” |
| **Hands** (Executor) | Tools / function calls | Executes concrete actions: querying databases, doing math, writing files, calling APIs |
| **Senses** (Observer) | Tool return values | Feeds execution results back to the brain |
| **Memory** | Context window / storage | Stores the task goal, reasoning history, and observations |

## The Standard Agent Loop (ReAct Style) {#standard}

This is the most general form, and almost every framework’s default executor looks like this:

```
loop {
    // ① Think: the LLM decides the next step based on the current state
    decision = LLM(goal + trajectory + tool descriptions + current observation)

    // ② Decide whether to stop
    if decision is "final answer"  →  break, return the answer

    // ③ Act: parse the LLM's output and call the corresponding tool
    result = execute_tool(decision.tool, decision.args)

    // ④ Observe: append the "tool result" to the context as the next round's input
    history.append("Observation: " + result)

    // ⑤ Fallback protection
    if iterations > max_iterations  →  break (prevent infinite loop)
    if context limit exceeded       →  compress / truncate memory
}
```

**The key point: each time, the LLM outputs a “decision token,” not a final answer.** The framework parses it into a structured call (such as `{tool: "search", args: {...}}`), executes it, and feeds the result back into the prompt so that in the next round the LLM continues reasoning from the new observation.

## A Real Frame from the Loop {#frame}

```
Human: Who won the 2024 Nobel Prize in Physics? What theory did they propose?

Agent: Thought: I need to look up the winner.
       Action: search["2024 Nobel Prize Physics winner"]

Observation: John Hopfield and Geoffrey Hinton ...

Agent: Thought: The winner is found — Hinton won for the physics foundations of neural networks.
       Final Answer: The winners are John Hopfield and Geoffrey Hinton, ...
```

Note: **Thought / Action / Observation / Final Answer** — these four markers are the “language protocol” defined in the ReAct paper, and frameworks parse them out of the model’s output with regex or structured output.

## Termination Conditions: Preventing Runaway Loops {#terminate}

Infinite loops are the biggest engineering risk in agent systems, and every layer of the loop has hard guardrails:

- ✅ **Final Answer**: the model explicitly emits the “final answer” marker;
- ⏱️ **max_iterations**: the iteration cap (the most commonly used fallback);
- ⏳ **timeout**: the cap on total execution time;
- 🔢 **max_tokens**: the per-round / cumulative token budget;
- 🚫 **Error handling**: when a tool throws an exception, feed the error back to the model as an Observation and let it fix the problem itself or give up.

## The Loop’s Three Main Variants {#variants}

### ① Single Loop (Standard Loop)

This is the form from Section 2 above. Simple and versatile, but **it has no global planning** — the model takes one step at a time, and complex tasks can easily get lost. Examples: basic ReAct, LangChain’s default executor.

### ② Plan-and-Execute Loop

**Plan first, then execute, then re-plan**, alternating between two phases:

```
Planning phase: the LLM breaks the big task into an ordered subtask list [T1, T2, T3]
Execution phase: execute subtasks one by one; each subtask is itself a small ReAct loop
After each completed step → back to the planning phase: assess progress, update the remaining plan (Adaptive Planning)
```

This fixes the single loop’s “no global view” weakness. Examples: BabyAGI, LangChain’s PlanAndExecute, HuggingGPT.

### ③ Reflection Loop (Reflexion / Reflection)

On top of the standard loop it adds a layer of **self-evaluation**:

```
Execute → Generate → Self-critique (the LLM evaluates where its last answer went wrong)
      → Feed the "critique" in as the next round's input → Retry
```

By explicitly writing “lessons from failure” into the context, it lets the model improve on the next round. Examples: the Reflexion paper, Self-Refine.

### ④ Hierarchical Loop (Manager–Worker)

An outer **Manager Agent** handles planning and scheduling, dispatching subtasks to inner **Worker Agents** (each worker runs its own small loop), and the results flow back to the Manager to be aggregated. Examples: AutoGen multi-agent conversations, LangGraph multi-node graphs, CrewAI role-based division of labor.

## Context Management Inside the Loop {#memory}

The more iterations a Loop runs and the longer the trajectory grows, the sooner **the context window will be blown out**. Frameworks commonly adopt these strategies:

| Strategy | Approach | Cost |
|---|---|---|
| Sliding-window truncation | Keep only the most recent N rounds of Thought/Action | Loses early information |
| Summary compression | Have the LLM condense the old trajectory into a paragraph | Each summary costs tokens |
| Vector retrieval memory | Store history in a vector database and retrieve fragments by relevance | Requires external storage |
| Tool-result truncation | Keep only the first few KB when an Observation gets too long | May lose key details |

This is also why modern frameworks (LangGraph, OpenAI SDK) turn the loop into an **explicit state machine** (State Graph): each node (think, act, observe) reads and writes a shared state object, and the loop is controlled by the graph’s edges rather than an implicit while loop — **observable, interruptible, and able to insert human-review nodes**. This is the trend in agent-framework engineering.

## Summary {#conclusion}

> **Agent Loop = the closed loop of “the LLM makes one decision per round → the framework executes and feeds back → the result is written back to the context → the next round’s decision,” plus three layers of protection: termination conditions, error recovery, and context compression.**

The difference between frameworks is not mainly about “having a loop or not” (they all do), but about the loop’s **granularity** (one pass over the whole task vs. small loops per subtask), its **orchestration** (single loop vs. planning/reflection/hierarchical), and its **state management** (implicit while loop vs. explicit state graph).
