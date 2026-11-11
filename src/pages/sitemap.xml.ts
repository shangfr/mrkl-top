import type { APIRoute } from "astro";
import { getCollection } from "astro:content";

export const GET: APIRoute = async () => {
  const zh = (await getCollection("zh")).sort((a, b) => a.data.order - b.data.order);
  const en = (await getCollection("en")).sort((a, b) => a.data.order - b.data.order);
  const u = [];
  const L = (loc, alts, extra) => {
    u.push("  <url>\n    <loc>" + loc + "</loc>\n" + alts.map(a => '    <xhtml:link rel="alternate" hreflang="' + a[0] + '" href="' + a[1] + '"/>').join("\n") + "\n" + extra + "\n  </url>");
  };
  L("https://mrkl.top/", [["zh-CN", "https://mrkl.top/"], ["en", "https://mrkl.top/en/"], ["x-default", "https://mrkl.top/"]], "    <changefreq>weekly</changefreq>\n    <priority>1.0</priority>");
  L("https://mrkl.top/en/", [["zh-CN", "https://mrkl.top/"], ["en", "https://mrkl.top/en/"]], "    <changefreq>weekly</changefreq>\n    <priority>0.9</priority>");
  for (const e of zh) {
    const z = "https://mrkl.top/articles/" + e.id + ".html";
    const x = "https://mrkl.top/en/articles/" + e.id + ".html";
    L(z, [["zh-CN", z], ["en", x]], "    <lastmod>2026-11-10</lastmod>\n    <priority>0.9</priority>");
  }
  for (const e of en) {
    const x = "https://mrkl.top/en/articles/" + e.id + ".html";
    const zhSlug = e.id === "mrkl-tutorial" ? "what-is-mrkl" : e.id;
    const z = "https://mrkl.top/articles/" + zhSlug + ".html";
    L(x, [["zh-CN", z], ["en", x]], "    <lastmod>2026-11-10</lastmod>\n    <priority>0.8</priority>");
  }
  const xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n' + u.join("\n") + "\n</urlset>\n";
  return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
};
