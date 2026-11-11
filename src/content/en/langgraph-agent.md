---
title: "LangGraph in Practice: Build Your First Agent with StateGraph"
description: "Nodes, edges, conditional routing, and checkpoints: a minimal runnable example that maps LangGraph's StateGraph onto the standard Agent Loop."
date: 2026-11-10
minutes: 9
tags:
  - Hands-on
  - Python
lang: en
order: 9
---

## Why a state graph instead of a while loop {#why}

As we covered in [How the Agent Loop Works](/en/articles/agent-loop.html), a standard loop is an implicit `while`: each round the model outputs a decision, and the framework executes it and writes the result back. Its problem is — **it's hard to intervene in the middle of the loop**: pausing, adding human review, or stepping back a round all require hacks.

LangGraph turns the loop into an **explicit directed graph**: each node is a piece of processing logic (think, execute a tool, summarize), and nodes are connected by edges. Every step of the loop thus becomes an observable, interruptible point in the graph where review can be inserted. This same idea is also being adopted by frameworks such as the OpenAI Agent SDK.

## Five core concepts {#concepts}

| Concept | Role | Standard-loop counterpart |
|---|---|---|
| **State (shared state)** | The data object all nodes read and write (question, observation, answer) | Context + history trail |
| **Node** | A piece of processing logic that reads State and returns incremental updates | One "think/act" round |
| **Edge** | Defines execution order | Sequential execution of the loop body |
| **Conditional Edge** | Branches on State to decide which node runs next | The model judging "continue or finish" |
| **Checkpointer** | Saves a snapshot of every step; interruptible and resumable | Persistent memory |

## A minimal runnable example {#minimal}

```
pip install langgraph langchain-openai
```

```
from typing import TypedDict
from langgraph.graph import StateGraph, END

class AgentState(TypedDict):
    question: str          # user question
    observation: dict | None   # result returned by the tool
    answer: str | None     # final answer

def decide(state):         # ① think node: the LLM decides which tool to call
    # a real implementation would call the LLM here and parse out the tool name and arguments
    return {"observation": None}

def execute(state):        # ② act node: execute the tool and write the result back to state
    return {"observation": {"price": 3310.5}}

def respond(state):        # ③ respond node: generate the final answer from the observation
    return {"answer": "The latest closing price is 3310.5"}

def route(state):          # conditional edge: if the data is not ready, execute again; if it is, respond
    return "respond" if state["observation"] else "execute"

g = StateGraph(AgentState)
g.add_node("decide", decide)
g.add_node("execute", execute)
g.add_node("respond", respond)
g.add_edge("decide", "execute")
g.add_conditional_edge("execute", route, {"execute": "execute", "respond": "respond"})
g.add_edge("respond", END)

app = g.compile()
result = app.invoke({"question": "What is the latest closing price of the Shanghai Composite Index?"})
print(result["answer"])
```

## Mapping to the standard Agent Loop {#mapping}

| Standard Agent Loop step | LangGraph equivalent |
|---|---|
| ① Think: LLM generates a decision | `decide` node (LLM Node) |
| ③ Act: call a tool | `execute` node (Tool Node) |
| ④ Observe: write results back to context | The node returns incremental updates, merged into State |
| ② Whether to finish | Conditional edge routes to `respond` or `END` |
| ⏱️ Iteration cap to prevent infinite loops | The `recursion_limit` parameter |
| 🧠 Memory / resume from checkpoints | Checkpointer (e.g., `SqliteSaver`) |
| 👤 Human review | `interrupt()` pauses and waits for human input |

## Three practical tips {#tips}

- **Set a `recursion_limit`**: prevents the model from chasing its tail into an infinite loop; equivalent to `max_iterations` in a standard loop;
- **Use a Checkpointer for long-running tasks**: if a time-consuming task breaks off midway, you can resume from a snapshot, and you also get conversation history for free;
- **Insert an `interrupt` at sensitive nodes**: for example, pause before the "send email" node for a human to confirm — that's how [Agent safety guardrails](/en/articles/agent-safety.html) are put into practice.

## Conclusion {#conclusion}

> A state graph isn't just a different way of writing the loop — it upgrades the implicit loop into an execution engine that is **observable, interruptible, and orchestratable**. Once you understand the standard Agent Loop, LangGraph is as simple as "turning every step into a node in the graph."

Related reading: [The Agent Loop, explained in depth](/en/articles/agent-loop.html) · [The Complete Guide to Tool Calling](/en/articles/tool-calling.html) · [A three-layer concept comparison](/en/articles/loop-vs-react-vs-mrkl.html)
