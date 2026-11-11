---
title: "LangGraph 实战：用状态图构建你的第一个 Agent"
description: "LangGraph 实战教程：用 StateGraph 状态图把标准 Agent Loop 落地——节点、边、条件路由、检查点，附可运行的最小示例与对照表。"
date: 2026-11-10
minutes: 9
tags:
  - 实战
  - Python
lang: zh
order: 8
---

## 为什么用状态图而不是 while 循环 {#why}

我们在 [Agent Loop 原理](/articles/agent-loop.html)里讲过：标准循环是一个隐式的 `while`，模型每轮输出决策，框架执行并回填。它的问题是——**你很难在循环中间插手**：想暂停、想人工审核、想回退一步，都得靠 hack。

LangGraph 把循环改成**显式的有向图**：每个节点是一段处理逻辑（思考、执行工具、总结），节点之间是边。于是循环的每一步都变成了图里可观测、可中断、可插入审核的位置。这个思路也正在被 OpenAI Agent SDK 等框架采用。

## 五个核心概念 {#concepts}

| 概念 | 作用 | 对应标准 Loop 的… |
|---|---|---|
| **State（共享状态）** | 所有节点读写的数据对象（问题、观察、答案） | 上下文 + 历史轨迹 |
| **Node（节点）** | 一段处理逻辑，读 State 并返回增量更新 | 一轮"思考/行动" |
| **Edge（边）** | 定义执行顺序 | 循环体的顺序执行 |
| **Conditional Edge（条件边）** | 根据 State 分支，决定下一步走哪个节点 | 模型判断"继续还是结束" |
| **Checkpointer（检查点）** | 保存每一步快照，可中断、可续跑 | 持久化记忆 |

## 最小可运行示例 {#minimal}

```
pip install langgraph langchain-openai
```

```
from typing import TypedDict
from langgraph.graph import StateGraph, END

class AgentState(TypedDict):
    question: str          # 用户问题
    observation: dict | None   # 工具返回的结果
    answer: str | None     # 最终答案

def decide(state):         # ① 思考节点：LLM 决定调用哪个工具
    # 真实实现里这里调用 LLM，解析出工具名与参数
    return {"observation": None}

def execute(state):        # ② 行动节点：执行工具并把结果写回状态
    return {"observation": {"price": 3310.5}}

def respond(state):        # ③ 终止节点：基于观察生成最终答案
    return {"answer": "最新收盘价是 3310.5"}

def route(state):          # 条件边：数据没齐就再执行一次，齐了就回答
    return "respond" if state["observation"] else "execute"

g = StateGraph(AgentState)
g.add_node("decide", decide)
g.add_node("execute", execute)
g.add_node("respond", respond)
g.add_edge("decide", "execute")
g.add_conditional_edge("execute", route, {"execute": "execute", "respond": "respond"})
g.add_edge("respond", END)

app = g.compile()
result = app.invoke({"question": "上证指数最新收盘价是多少？"})
print(result["answer"])
```

## 与标准 Agent Loop 的对照 {#mapping}

| 标准 Agent Loop 环节 | LangGraph 中的落地 |
|---|---|
| ① 思考：LLM 生成决策 | `decide` 节点（LLM Node） |
| ③ 行动：调用工具 | `execute` 节点（Tool Node） |
| ④ 观察：结果写回上下文 | 节点返回增量更新，合并进 State |
| ② 是否结束 | 条件边路由到 `respond` 或 `END` |
| ⏱️ 迭代上限防死循环 | `recursion_limit` 参数 |
| 🧠 记忆 / 断点续跑 | Checkpointer（如 `SqliteSaver`） |
| 👤 人工审核 | `interrupt()` 暂停并等待人类输入 |

## 三个实战要点 {#tips}

- **设好 `recursion_limit`**：防止模型钻牛角尖无限循环，等价于标准 Loop 的 `max_iterations`；
- **用 Checkpointer 做长任务**：耗时任务中途断掉可以从快照恢复，也天然获得对话历史；
- **在敏感节点插 `interrupt`**：比如"发送邮件"节点前暂停，由人来确认——这就是 [Agent 安全护栏](/articles/agent-safety.html)的落地姿势。

## 总结 {#conclusion}

> 状态图不是换一种写法，而是把隐式循环升级成**可观测、可中断、可编排**的执行引擎。理解了标准 Agent Loop，再看 LangGraph 就是"把每一步变成图里的节点"这么简单。

相关阅读：[Agent 框架的 Loop 原理详解](/articles/agent-loop.html) · [工具调用完全指南](/articles/tool-calling.html) · [三层概念对比](/articles/loop-vs-react-vs-mrkl.html)
