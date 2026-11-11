---
title: "Agent 框架横向对比：LangGraph、AutoGen 与 CrewAI 怎么选"
description: "LangGraph、AutoGen、CrewAI 三大 Agent 框架怎么选？从核心抽象出发，附逐维度对比表、最小示例与一份可直接照抄的选型决策清单。"
date: 2026-11-10
minutes: 9
tags:
  - 对比
  - 实战
  - 选型
lang: zh
order: 9
---

## 为什么会有这么多框架 {#why}

如果你读过本站的 [Agent Loop 原理](/articles/agent-loop.html)就会明白：所谓 Agent 框架，本质上都在实现同一个东西——**"思考 → 决策 → 调用工具 → 观察 → 再思考"的标准循环**。区别只在于：循环之外，谁提供了更好的**控制点、协作方式和工程配套**。

所以选框架不是选"谁更厉害"，而是选**你更愿意用哪种心智模型去管理这个循环**：是画一张图、发起一场对话，还是排一出角色扮演的戏。

## 三个框架的核心抽象 {#abstractions}

| 框架 | 核心抽象 | 一句话概括 |
|---|---|---|
| **LangGraph** | 有向状态图（节点 + 边 + 条件路由） | 把循环画成图，每一步都可观测、可打断、可回退 |
| **AutoGen** | 对话消息流（多智能体群聊） | 把协作模拟成一群 Agent 在群里聊天，消息即状态 |
| **CrewAI** | 角色 + 任务 + 流程（团队剧本） | 像组团队一样分配角色，按剧本顺序执行 |

这三个抽象对应着三种团队协作模式，也正好对应 [多智能体协作架构](/articles/multi-agent.html)里讲过的编排器、辩论和 Manager-Worker 模式——框架只是把模式固化成了 API。

## 逐维度对比表 {#compare}

| 维度 | LangGraph | AutoGen | CrewAI |
|---|---|---|---|
| **上手难度** | 中：要先懂图的概念 | 低：像写聊天机器人 | 最低：像写配置 + 业务函数 |
| **单 Agent 控制力** | 最强：节点级干预 | 中：靠会话轮次控制 | 中：靠任务定义控制 |
| **多 Agent 模式** | 任意拓扑（图说了算） | 对话式（天然支持辩论） | 顺序/层级流程为主 |
| **调试与可视化** | 强：官方可视化 + 断点回放 | 中：日志驱动 | 中：流程日志 |
| **持久化 / 记忆** | 内建 Checkpointer | 会话历史管理 | 记忆类（短期/长期/实体） |
| **部署形态** | 纯 Python 库，可嵌入任意服务 | Python 库，偏研究原型 | Python 库，偏业务流水线 |
| **生态与社区** | LangChain 生态 + 官方 SaaS | 微软维护，学术活跃 | 社区增长快，模板多 |
| **最适合的场景** | 生产级、需强可控的复杂 Agent | 研究探索、多角色辩论 | 业务流程自动化、快速交付 |

## 最小示例对比 {#minimal}

同样的需求——"让模型决定要不要调用工具"——三个框架各自的写法：

```
# LangGraph：定义节点，让条件边决定走哪条路
from langgraph.graph import StateGraph, END

def decide(state):
    if state.get("need_tool"):
        return {"next": "tool"}
    return {"next": "end"}

graph.add_conditional_edges("decide", lambda s: s["next"])
```

```
# AutoGen：两个角色对话，工具调用是消息的一部分
from autogen import ConversableAgent

assistant = ConversableAgent(name="assistant", llm_config=llm_config)
assistant.register_for_llm(name="search", description="搜索", function=search_fn)
user = ConversableAgent(name="user", llm_config=False)
user.initiate_chat(assistant, message="查一下最近的新闻")
```

```
# CrewAI：角色 + 任务 + 流程，框架负责编排
from crewai import Agent, Task, Crew

researcher = Agent(role="研究员", tools=[search_tool], goal="找到答案")
task = Task(description="回答用户问题", agent=researcher)
Crew(agents=[researcher], tasks=[task], process="sequential").kickoff()
```

三份代码都在表达同一个 Agent Loop，只是"控制点"放的位置不同：LangGraph 放在**节点与边**，AutoGen 放在**消息**，CrewAI 放在**任务与角色**。

## 怎么选：决策清单 {#choose}

- 要**上生产、要精细控制**（人工审核、断点续跑、灰度发布）→ 选 **LangGraph**，配合 [安全护栏](/articles/agent-safety.html)实践；
- 要快速验证**"多个 Agent 互相辩论/合作"的研究想法** → 选 **AutoGen**；
- 要做**业务流程自动化**（客服、内容流水线）、团队里非工程师也要看得懂 → 选 **CrewAI**；
- 团队已经用 **LangChain** → 优先 LangGraph，学习成本最低；
- 不确定 → 先用 **LangGraph** 把 [最小示例](/articles/langgraph-agent.html)跑通，再按需换。

另外提醒：框架只是脚手架。**真正的差距在工具设计、上下文管理和护栏**——详见 [工具调用指南](/articles/tool-calling.html)和 [记忆系统](/articles/agent-memory.html)。

## 三个常见误区 {#myths}

- **误区一："框架越火越安全"**——框架不解决提示注入和工具滥用，那是你自己的护栏责任；
- **误区二："多智能体一定比单智能体强"**——多数任务单 Agent + 好工具就够了，多 Agent 的通信开销和失控面都更大；
- **误区三："换了框架就要重写业务"**——只要把工具、状态、记忆从业务代码里解耦，换框架就是换一层编排壳。

## 总结 {#conclusion}

> LangGraph、AutoGen、CrewAI 的差别不在"能不能做 Agent"，而在**你愿意用图、对话还是剧本的心智模型去管理那个标准 Loop**。先想清楚场景需要哪种控制点，再选框架，而不是反过来被框架绑架。

相关阅读：[LangGraph 实战](/articles/langgraph-agent.html) · [多智能体协作架构](/articles/multi-agent.html) · [Agent Loop vs ReAct vs MRKL](/articles/loop-vs-react-vs-mrkl.html)
