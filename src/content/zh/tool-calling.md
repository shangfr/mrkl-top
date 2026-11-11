---
title: "工具调用（Function Calling）完全指南"
description: "工具调用 / Function Calling 是 Agent 的'手'：定义工具 schema、模型返回结构化调用、执行并回填结果。本文讲清原理、流程、常见坑与 MCP 生态。"
date: 2026-11-10
minutes: 8
tags:
  - 进阶
  - 实战
lang: zh
order: 7
---

## 什么是 Function Calling {#what}

让模型以**结构化 JSON**输出"我要调用哪个函数、参数是什么"，而不是一段自然语言。例如用户问"今天的天气"，模型返回：

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

框架拿到这个调用后执行真实函数，再把结果作为新的消息回传给模型，让模型基于结果继续推理。它的本质是：**把"决策"和"执行"分离**——模型只负责决策，执行交给确定性的代码。

## 一次完整调用流程 {#flow}

```
① 定义工具：给每个函数写 JSON Schema（名称、参数、描述）
② 附加到请求：把工具列表随用户消息一起发给模型
③ 模型决策：模型返回 tool_calls（或直接回答）
④ 框架执行：按名称路由到真实函数，传入解析后的参数
⑤ 回填结果：把函数返回值作为 tool 消息追加进对话
⑥ 回到 ③：模型基于结果继续，直到给出最终答案
```

## 工具设计五原则 {#design}

| 原则 | 做法 | 反例 |
|---|---|---|
| 命名见义 | `get_stock_price` | `do_stuff` |
| 参数严格 | 必填/可选、类型、枚举都写清楚 | 全用字符串糊弄 |
| 描述充分 | 告诉模型"何时用、何时不用" | 只写"获取股票价格" |
| 粒度适中 | 一个工具干一件事 | 一个大而全的工具 |
| 安全第一 | 敏感操作单独成工具，便于拦截 | 把删除操作藏进通用工具 |

## 与 ReAct / MRKL 的关系 {#react}

- **ReAct 用文本协议**（Thought/Action/Observation），Function Calling 用**结构化协议**——后者更稳定、无需正则解析，是现代框架的主流；
- 工具的**注册表 + 路由**，正是 MRKL 里"专家模块"思想的实现——每个工具就是一个模块；
- 所以三者合体的现代形态是：**MRKL 组织工具 → Function Calling 驱动调用 → Loop 负责循环与终止**。

## 常见坑与对策 {#pits}

- **幻觉参数**：模型编造不存在的参数值 → 执行前做 Schema 校验，失败则把错误喂回模型重试；
- **异常处理**：函数抛异常 → 把异常信息作为工具结果返回，让模型自己决定修复还是放弃；
- **结果超长**：大返回值撑爆上下文 → 截断 + 摘要，或只返回统计值；
- **多工具并发**：一次返回多个 tool_calls → 并行执行后按顺序回填，注意依赖关系。

## 生态：MCP 与统一工具接入 {#ecosystem}

OpenAI、Anthropic、Gemini 等主流模型都已原生支持 Function Calling；2024 年底 Anthropic 提出的 **MCP（Model Context Protocol）**更进一步：把"工具接入"标准化成类似 USB 的协议——工具提供商写一次 MCP server，任何支持 MCP 的客户端都能直接挂接，工具生态开始像 App Store 一样发展。

## 总结 {#conclusion}

> Function Calling 把"模型的想法"翻译成"程序的行动"，是 Agent 从"会聊天"到"能干活"的关键一跃。设计好工具、处理好异常、跟上 MCP 生态，你的 Agent 就能可靠地调用任何能力。

相关阅读：[LangGraph 实战](/articles/langgraph-agent.html) · [Agent 的安全与护栏](/articles/agent-safety.html) · [什么是 MRKL](/articles/what-is-mrkl.html)
