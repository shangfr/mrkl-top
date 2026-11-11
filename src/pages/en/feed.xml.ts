import type { APIRoute } from "astro";
import { getCollection } from "astro:content";

export const GET: APIRoute = async () => {
  const items = (await getCollection("en")).sort((a, b) => a.data.order - b.data.order);
  const body = items.map(e => `
    <item>
      <title>${e.data.title}</title>
      <link>https://mrkl.top/en/articles/${e.id}.html</link>
      <guid isPermaLink="true">https://mrkl.top/en/articles/${e.id}.html</guid>
      <description>${e.data.description}</description>
      <pubDate>Tue, 10 Nov 2026 00:00:00 +0000</pubDate>
    </item>`).join("");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>MRKL.top — AI Agent Architecture (English)</title>
    <link>https://mrkl.top/en/</link>
    <description>MRKL / ReAct / Agent Loop for AI agents: English tutorials, deep dives, and framework guides.</description>
    <language>en</language>
    <atom:link href="https://mrkl.top/en/feed.xml" rel="self" type="application/rss+xml"/>
${body}
  </channel>
</rss>
`;
  return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
};
