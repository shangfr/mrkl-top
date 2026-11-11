---
title: "Agent Memory Systems: Working, Short-Term, and Long-Term"
description: "The context window is never enough: a three-layer memory model, four context management strategies, RAG in practice, and how to fix memory pollution."
date: 2026-11-10
minutes: 8
tags:
  - Advanced
  - Concepts
lang: en
order: 7
---

## Why Memory Is the Core of an Agent {#why}

Look back at the standard Loop: every turn, the model must see the full reasoning trace in order to make a consistent decision. The longer the trace, the fuller the context — until it either crashes from exceeding the limit or is forced to drop earlier critical information. **The memory system is the engineering layer that solves "context not being enough."**

## The Three-Layer Memory Model {#three}

| Layer | Medium | Content | Lifecycle |
|---|---|---|---|
| **Working memory** | Context window | Current task, recent turns of thoughts and observations | Within a single task |
| **Short-term memory** | Conversation history / reasoning trace | Thought-Action-Observation sequence | During the session |
| **Long-term memory** | Vector store / database | Cross-session facts, preferences, and knowledge snippets | Persistent |

Think of it by analogy to the human brain: working memory is "what you're thinking about right now," short-term memory is "what was just said," and long-term memory is "the world you know." In MRKL, the **knowledge base module** is, in essence, explicit long-term memory.

## Four Strategies for Context Management {#strategies}

| Strategy | Approach | Pros | Cost |
|---|---|---|---|
| Sliding-window truncation | Keep only the most recent N turns | Zero cost | Loses early information |
| Summarization compression | Old traces summarized by an LLM | Keeps the key points | Each summary costs tokens |
| Vector retrieval | History stored in a vector store, retrieved by relevance | On-demand recall | Requires external storage and embeddings |
| Tool-result truncation | Truncate overly long Observations to the first few KB | Prevents context overflow | May lose critical details |

## Writing and Retrieving Memory {#flow}

```
Write: after each turn ends
  ① Extract information worth remembering (entities, conclusions, key data)
  ② Vectorize → store in the long-term memory store

Retrieve: before each turn begins
  ① Vectorize the current goal/question
  ② Similarity-search the Top-K most relevant memory snippets
  ③ Assemble into the prompt together with working memory
```

Key principle: **don't stuff all of history back in — retrieve what's most relevant to the current task**. This both saves tokens and keeps irrelevant history from interfering with reasoning.

## RAG as Long-Term Memory {#rag}

Retrieval-Augmented Generation (RAG) is the most common way long-term memory gets implemented: chunk the documents/knowledge base → vectorize and store → retrieve relevant snippets when answering questions. When combined with an Agent:

- treat RAG as a **retrieval tool** registered in the tool registry (from the MRKL perspective: an expert module);
- let the Agent decide for itself **when it needs to look things up**, instead of querying every time — saving cost and cutting down the sources of hallucination.

## Challenges and Countermeasures {#challenges}

- **Memory pollution**: wrong or outdated information gets written in → apply confidence filtering before writing, and refresh long-term memory on a schedule;
- **Retrieval conflicts**: retrieved snippets contradict current facts → annotate the sources on retrieval results and let the model judge;
- **Cost amplification**: summarization and vectorization both cost extra tokens → enable them only when a threshold is triggered; use a sliding window for day-to-day operation.

## Conclusion {#conclusion}

> The memory system determines an Agent's "horizon": an Agent without memory loses everything each turn; only an Agent with layered memory can handle real tasks that span sessions and data sources. The engineering mantra is — **stuff in as little as possible, persist what must be remembered, and retrieve by relevance when needed**.

Related reading: [Agent Loop Explained](/en/articles/agent-loop.html) · [Tool Calling Guide](/en/articles/tool-calling.html) · [What Is MRKL?](/en/articles/what-is-mrkl.html)
