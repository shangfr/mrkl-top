---
title: "Agent 框架的 Loop 原理详解"
description: "Agent Loop 是所有 Agent 框架最核心的运行机制：LLM 在循环里反复思考、决策、调用工具、观察结果。本文讲清四个基本角色、标准循环、终止条件、三种变体与上下文管理。"
date: 2026-11-10
minutes: 8
tags:
  - 原理
  - 进阶
lang: zh
order: 4
---

## 循环的四个基本角色 {#roles}

一个 Agent Loop 需要四个组成部分，它们在每一轮迭代里协作：

| 角色 | 对应物 | 职责 |
|---|---|---|
| **大脑**（Planner/Reasoner） | LLM | 每轮判断"现在该想什么、下一步做什么" |
| **手**（Executor） | 工具 / 函数调用 | 执行具体动作：查库、算数、写文件、调 API |
| **感官**（Observer） | 工具返回结果 | 把执行结果反馈给大脑 |
| **记忆**（Memory） | 上下文窗口 / 存储 | 保存任务目标、历史思考、观察结果 |

## 标准 Agent Loop（ReAct 风格） {#standard}

这是最通用的形式，几乎所有框架默认的执行器都长这样：

```
loop {
    // ① 思考：LLM 基于当前状态生成下一步决策
    decision = LLM(目标 + 历史轨迹 + 可用工具描述 + 当前观察)

    // ② 判断是否结束
    if decision 是"最终答案"  →  break，返回答案

    // ③ 行动：解析 LLM 的输出，调用对应工具
    result = execute_tool(decision.tool, decision.args)

    // ④ 观察：把"工具结果"追加进上下文，作为下一轮输入
    history.append("Observation: " + result)

    // ⑤ 兜底保护
    if 迭代次数 > max_iterations  →  break（防死循环）
    if 上下文超限           →  压缩 / 截断记忆
}
```

**关键点：LLM 每次输出的是一个"决策 token"，不是最终答案。**框架负责把它解析成结构化调用（如 `{tool: "search", args: {...}}`），执行后把结果塞回 prompt，下一轮 LLM 再基于新观察继续推理。

## 一帧实际的循环内容 {#frame}

```
Human: 2024 年诺贝尔物理学奖得主是谁？他提出了什么理论？

Agent: Thought: 我需要查一下获奖者。
       Action: search["2024 Nobel Prize Physics winner"]

Observation: John Hopfield and Geoffrey Hinton ...

Agent: Thought: 获奖者找到了，Hinton 因神经网络物理基础获奖。
       Final Answer: 获奖者是 John Hopfield 和 Geoffrey Hinton，...
```

注意：**Thought / Action / Observation / Final Answer** 这四个标记就是 ReAct 论文定义的"语言协议"，框架用正则或结构化输出把它们从模型输出里解析出来。

## 终止条件：防止失控 {#terminate}

无限循环是 Agent 系统最大的工程风险，每一层循环都有硬性护栏：

- ✅ **Final Answer**：模型显式输出"最终答案"标记；
- ⏱️ **max_iterations**：迭代上限（最常用的兜底）；
- ⏳ **timeout**：总执行时长上限；
- 🔢 **max_tokens**：单轮 / 累计 token 预算；
- 🚫 **错误捕获**：工具抛异常 → 把错误作为 Observation 喂回模型，让它自己修复或放弃。

## Loop 的三种主要变体 {#variants}

### ① 单循环（Standard Loop）

就是上面第 2 节的形态。简单通用，但**没有全局规划**——模型走一步看一步，复杂任务容易迷路。代表：基础版 ReAct、LangChain 默认执行器。

### ② 规划-执行循环（Plan-and-Execute）

**先规划、后执行、再重规划**，分两个阶段交替：

```
规划阶段：LLM 把大任务拆成有序子任务清单 [T1, T2, T3]
执行阶段：逐个执行子任务，每个子任务内部仍是一个小 ReAct 循环
每完成一步 → 回到规划阶段：评估进度、更新剩余计划（Adaptive Planning）
```

解决单循环"没有全局视角"的缺点。代表：BabyAGI、LangChain 的 PlanAndExecute、HuggingGPT。

### ③ 反思循环（Reflexion / Reflection Loop）

在标准循环外加一层**自我评估**：

```
执行 → 生成 → 自我批评（LLM 评估自己刚才的答案错在哪）
      → 把"批评意见"作为下一轮输入 → 重试
```

通过把"失败的教训"显式写进上下文，让模型在下一轮改进。代表：Reflexion 论文、Self-Refine。

### ④ 层级循环（Hierarchical / Manager-Worker Loop）

外层一个 **Manager Agent** 做规划和调度，把子任务分发给内层的 **Worker Agent**（每个 Worker 各跑自己的小循环），结果回传给 Manager 汇总。代表：AutoGen 多 agent 对话、LangGraph 多节点图、CrewAI 角色分工。

## 循环里的上下文管理 {#memory}

Loop 迭代越多、历史轨迹越长，**上下文窗口迟早被撑爆**。框架普遍采用这些策略：

| 策略 | 做法 | 代价 |
|---|---|---|
| 滑动窗口截断 | 只保留最近 N 轮 Thought/Action | 丢失早期信息 |
| 摘要压缩 | 把旧轨迹交给 LLM 总结成一段话 | 每次摘要有 token 成本 |
| 向量检索记忆 | 历史存入向量库，按相关性取回片段 | 需要外部存储 |
| 工具结果截断 | Observation 超长时只取前几 KB | 可能丢失关键细节 |

这也是为什么现代框架（LangGraph、OpenAI SDK）把循环做成**显式的状态机**（State Graph）：每个节点（思考、行动、观察）读写共享状态对象，循环由图的边控制，而不是隐式的 while 循环——**可观测、可中断、可插入人工审核节点**，这是 Agent 框架工程化的趋势。

## 总结 {#conclusion}

> **Agent Loop = "LLM 每轮做一次决策 → 框架执行并反馈 → 结果写回上下文 → 下一轮决策"的闭环，外加终止条件、错误恢复和上下文压缩这三层保护。**

框架之间的差别，主要不在于"有没有循环"（都有），而在于：循环的**粒度**（整任务一次 vs 子任务小循环）、**编排方式**（单循环 vs 规划/反思/层级）、以及**状态管理**（隐式 while vs 显式状态图）。
