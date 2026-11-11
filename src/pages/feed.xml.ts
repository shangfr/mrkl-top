import type { APIRoute } from "astro";
import { getCollection } from "astro:content";

export const GET: APIRoute = async () => {
  const items = (await getCollection("zh")).sort((a, b) => a.data.order - b.data.order);
  const body = items.map(e => `
    <item>
      <title>${e.data.title}</title>
      <link>https://mrkl.top/articles/${e.id}.html</link>
      <guid isPermaLink="true">https://mrkl.top/articles/${e.id}.html</guid>
      <description>${e.data.description}</description>
      <pubDate>Tue, 10 Nov 2026 00:00:00 +0000</pubDate>
    </item>`).join("");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>MRKL.top — AI Agent 架构学习站</title>
    <link>https://mrkl.top/</link>
    <description>MRKL / ReAct / Agent Loop 大模型智能体架构的中文学习站。</description>
    <language>zh-CN</language>
    <atom:link href="https://mrkl.top/feed.xml" rel="self" type="application/rss+xml"/>
${body}
  </channel>
</rss>
`;
  return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
};
