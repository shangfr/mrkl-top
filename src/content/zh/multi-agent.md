---
title: "多智能体协作架构：从对话到编排"
description: "多智能体（Multi-Agent）协作架构详解：Manager-Worker、辩论、编排器、群体四种模式，AutoGen / CrewAI / LangGraph 框架对比，以及成本与收敛性挑战。"
date: 2026-11-10
minutes: 9
tags:
  - 进阶
  - 架构
lang: zh
order: 10
---

## 为什么需要多个 Agent {#why}

- **分工与专业化**：研究员 Agent、代码 Agent、审阅 Agent 各有专长，比一个万能 Agent 更可靠；
- **对抗与审查**：让一个 Agent 生成、另一个 Agent 挑错，能显著提升质量（如代码互审）；
- **并行提速**：独立的子任务可以并行执行，缩短端到端延迟；
- **上下文隔离**：每个 Agent 只看自己负责的部分，避免单一上下文被撑爆。

## 四种主流协作模式 {#patterns}

| 模式 | 结构 | 典型场景 |
|---|---|---|
| **Manager-Worker（层级）** | Manager 规划并分发子任务，Worker 执行并回报 | 复杂项目拆解执行 |
| **Debate（辩论）** | 多个 Agent 各自作答并互相反驳，最终裁决 | 事实核查、方案评审 |
| **Orchestrator-Plugins（编排器）** | 一个编排器调用一组工具化 Agent | 客服、RAG 问答流水线 |
| **Swarm（群体）** | Agent 之间直接传递消息，无中心调度 | 松耦合协作任务 |

## 通信机制 {#comms}

- **消息传递**：Agent 之间直接发消息（AutoGen 的对话式）；
- **共享黑板**：所有 Agent 读写同一个状态对象（LangGraph 的 State）；
- **结构化调用**：像 Function Calling 一样，把"调用另一个 Agent"也注册成一个工具——Agent 互相"当工具用"。

## 框架对比 {#frameworks}

| 框架 | 协作形态 | 特点 |
|---|---|---|
| AutoGen | 对话式多 Agent | Agent 之间自由对话、可切换发言者 |
| CrewAI | 角色分工（Role/Goal/Backstory） | 贴近业务团队建模，上手快 |
| LangGraph | 状态图编排 | 显式控制流，可观测可审核，适合生产 |
| OpenAI Swarm | 轻量群体协作 | Agent 可交接（handoff），实现简单 |

## 与 MRKL 的关系 {#mrkl}

MRKL 的"专家模块"是**静态**的（知识库、计算器）；多智能体系统把专家模块**动态化**——每个 Agent 就是一个带推理能力的专家。Router 的角色升级为 Manager/Orchestrator，循环的每个节点都可能是一个完整的小 Agent Loop。**可以说：多智能体 = MRKL 的组织思想 + ReAct 的执行协议 + 多个 Loop 的组合。**

## 挑战：成本、收敛与死循环 {#challenges}

- **token 成本放大**：N 个 Agent 互相传话，成本近似乘 N → 控制轮次上限、避免无意义寒暄；
- **收敛性**：辩论模式可能永远达不成一致 → 设置最大轮数 + 明确的终止条件（投票、时间、目标达成）；
- **死循环 / 循环引用**：Agent A 调用 B、B 又调回 A → 像单 Agent 一样需要迭代上限，最好再加循环检测；
- **上下文放大**：共享黑板如果全部可见，等于又造了一个大上下文 → 按需读写、隔离视图。

## 总结 {#conclusion}

> 多智能体不是"越多越好"，而是"合适的分工 + 明确的控制流 + 强硬的终止条件"。先想清楚谁负责什么、怎么交接、如何停止，再选框架——否则团队越大，失控越快。

相关阅读：[Agent Loop 原理](/articles/agent-loop.html) · [LangGraph 实战](/articles/langgraph-agent.html) · [安全与护栏](/articles/agent-safety.html)
