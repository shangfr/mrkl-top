---
title: "Tool Calling (Function Calling): The Complete Guide"
description: "Turning what the model thinks into what the program does: the full call flow, five tool-design principles, common pitfalls, and the MCP ecosystem."
date: 2026-11-10
minutes: 8
tags:
  - Advanced
  - Hands-on
lang: en
order: 8
---

## What Is Function Calling {#what}

Have the model output, as **structured JSON**, "which function I want to call and with what arguments" — instead of a piece of natural language. For example, when the user asks "What's the weather today?", the model returns:

```
{
  "tool_calls": [{
    "id": "call_01",
    "function": {
      "name": "get_weather",
      "arguments": "{\"city\": \"Shanghai\", \"unit\": \"celsius\"}"
    }
  }]
}
```

Once the framework receives this call, it executes the real function and sends the result back to the model as a new message, letting the model keep reasoning on top of it. The essence is: **separate "decision" from "execution"** — the model only makes decisions; execution is left to deterministic code.

## The Complete Call Flow {#flow}

```
① Define tools: write a JSON Schema for each function (name, parameters, description)
② Attach to the request: send the tool list to the model along with the user message
③ Model decides: the model returns tool_calls (or answers directly)
④ Framework executes: route by name to the real function with the parsed arguments
⑤ Feed back the result: append the function's return value to the conversation as a tool message
⑥ Back to ③: the model keeps going based on the result until it gives a final answer
```

## Five Principles of Tool Design {#design}

| Principle | Practice | Counter-example |
|---|---|---|
| Self-describing names | `get_stock_price` | `do_stuff` |
| Strict parameters | Required/optional, types, and enums all spelled out clearly | Lazily typing everything as a string |
| Sufficient descriptions | Tell the model "when to use it, and when not to" | Just "get the stock price" |
| Right-sized granularity | One tool does one job | One big do-everything tool |
| Safety first | Sensitive operations get their own tool so they can be intercepted | Hiding delete operations inside a generic tool |

## How It Relates to ReAct / MRKL {#react}

- **ReAct uses a text protocol** (Thought/Action/Observation); Function Calling uses a **structured protocol** — the latter is more stable and needs no regex parsing, which is why it dominates modern frameworks;
- The tool **registry + routing** is exactly the MRKL idea of "expert modules" in practice — each tool is one module;
- So the modern form that brings all three together is: **MRKL organizes the tools → Function Calling drives the calls → the Loop handles iteration and termination**.

## Common Pitfalls and Fixes {#pits}

- **Hallucinated arguments**: the model invents argument values that don't exist → validate against the Schema before executing; if validation fails, feed the error back to the model and retry;
- **Exception handling**: the function throws → return the exception message as the tool result and let the model decide whether to fix it or give up;
- **Overly long results**: a large return value blows up the context → truncate + summarize, or return only summary statistics;
- **Concurrent multi-tool calls**: the model returns several tool_calls at once → execute them in parallel and feed the results back in order, keeping dependencies in mind.

## The Ecosystem: MCP and Unified Tool Integration {#ecosystem}

Mainstream models such as OpenAI, Anthropic, and Gemini already support Function Calling natively; in late 2024, Anthropic's **MCP (Model Context Protocol)** went a step further: it standardizes "tool integration" into a USB-like protocol — tool providers write an MCP server once, and any MCP-capable client can plug into it directly, so the tool ecosystem has started growing the way app stores did.

## Summary {#conclusion}

> Function Calling turns "what the model thinks" into "what the program does" — the key leap from an agent that "can chat" to one that "can do real work". Design your tools well, handle exceptions properly, and stay on top of the MCP ecosystem, and your agent will reliably call any capability.

Related reading: [LangGraph in Practice](/en/articles/langgraph-agent.html) · [Agent Safety and Guardrails](/en/articles/agent-safety.html) · [What Is MRKL](/en/articles/what-is-mrkl.html)
