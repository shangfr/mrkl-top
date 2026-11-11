// 旧静态站 HTML 文章 -> Astro 内容集合 Markdown（v3：平衡列表扫描）
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
const BASE = "C:\\Users\\shang\\Desktop\\MRKL";
const ZH_ORDER = ["what-is-mrkl","react-vs-mrkl","mrkl-paper","agent-loop","loop-vs-react-vs-mrkl","agent-memory","tool-calling","langgraph-agent","agent-frameworks-compare","multi-agent","agent-safety"];
const EN_ORDER = ["mrkl-tutorial","what-is-mrkl","react-vs-mrkl","mrkl-paper","agent-loop","loop-vs-react-vs-mrkl","agent-memory","tool-calling","langgraph-agent","agent-frameworks-compare","multi-agent","agent-safety"];
function unescape(s){return s.replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&nbsp;/g," ");}
function inline(html){
  let s = html;
  s = s.replace(/<strong>([\s\S]*?)<\/strong>/g, (_,c)=>"**"+inline(c)+"**");
  s = s.replace(/<em>([\s\S]*?)<\/em>/g, (_,c)=>"*"+inline(c)+"*");
  s = s.replace(/<code>([\s\S]*?)<\/code>/g, (_,c)=>"`"+unescape(c).replace(/`/g,"\\`")+"`");
  s = s.replace(/<a href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g, (_,u,t)=>"["+inline(t)+"]("+u+")");
  s = s.replace(/<br\/?>/g," ");
  s = s.replace(/<[^>]+>/g,"");
  s = unescape(s);
  s = s.replace(/[ \t]+/g," ").replace(/\s*\n\s*/g," ").trim();
  return s;
}
const PRE_RE = /<pre[^>]*>\s*<code[^>]*>([\s\S]*?)<\/code>\s*<\/pre>/;
// 从 openIdx（<ul 或 <ol）找平衡闭合，返回闭合标签之后的位置
function closeOf(html, openIdx){
  let depth = 0;
  const re = /<ul[^>]*>|<\/ul>|<ol[^>]*>|<\/ol>/g;
  re.lastIndex = openIdx;
  let m;
  while((m = re.exec(html)) !== null){
    if(m[0][1] === "/") depth--; else depth++;
    if(depth === 0) return m.index + m[0].length;
  }
  return -1;
}
function splitListItems(html){
  const items = [];
  let depth = 0, start = -1;
  const re = /<li[^>]*>|<\/li>/g;
  let m;
  while((m = re.exec(html)) !== null){
    if(m[0][1] === "l"){ if(depth === 0) start = m.index; depth++; }
    else { depth--; if(depth === 0 && start >= 0){ items.push(html.slice(start, m.index + 5)); start = -1; } }
  }
  return items;
}
function renderLists(html, depth){
  const pad = "  ".repeat(depth);
  let out = "";
  for(const li of splitListItems(html)){
    let content = li.replace(/^<li[^>]*>/,"").replace(/<\/li>$/,"");
    let child = "";
    const ulm = content.match(/<ul[^>]*>([\s\S]*?)<\/ul>/);
    if(ulm){ child = "\n" + renderLists(ulm[1], depth+1); content = content.replace(/<ul[^>]*>[\s\S]*?<\/ul>/,""); }
    const olm = content.match(/<ol[^>]*>([\s\S]*?)<\/ol>/);
    if(olm){ child = "\n" + renderLists(olm[1], depth+1); content = content.replace(/<ol[^>]*>[\s\S]*?<\/ol>/,""); }
    const prem = content.match(PRE_RE);
    let tail = "";
    if(prem){ tail = "\n\n```\n" + unescape(prem[1]).replace(/\s+$/,"") + "\n```"; content = content.replace(PRE_RE,""); }
    const txt = inline(content);
    out += pad + "- " + (txt || "(text)") + tail + "\n" + (child ? child : "");
  }
  return out;
}
function table(html){
  const rows = [...html.matchAll(/<tr>([\s\S]*?)<\/tr>/g)].map(m=>m[1]);
  if(!rows.length) return "";
  const lines = [];
  const head = rows[0];
  const isHeader = /<th/i.test(head);
  if(isHeader){
    const cells = [...head.matchAll(/<th[^>]*>([\s\S]*?)<\/th>/g)].map(m=>inline(m[1]));
    lines.push("| " + cells.map(c=>c.replace(/\|/g,"\\|")).join(" | ") + " |");
    lines.push("|" + Array(cells.length).fill("---").join("|") + "|");
  }
  for(let i=isHeader?1:0;i<rows.length;i++){
    const cs = rows[i].match(/<td[^>]*>([\s\S]*?)<\/td>/g);
    if(!cs) continue;
    lines.push("| " + cs.map(c=>inline(c.replace(/<\/?td[^>]*>/g,"")).replace(/\|/g,"\\|")).join(" | ") + " |");
  }
  return lines.join("\n");
}
function convert(body){
  const parts = [];
  const re = /<h2[^>]*>|<h3[^>]*>|<h4[^>]*>|<pre[^>]*>|<p[^>]*>|<table[^>]*>|<ul[^>]*>|<ol[^>]*>|<blockquote[^>]*>|<div class="[^"]*"[^>]*>/g;
  let last = 0, m;
  while((m = re.exec(body)) !== null){
    if(m.index > last){
      const gap = body.slice(last, m.index).replace(/<[^>]+>/g,"").replace(/&nbsp;/g," ").trim();
      if(gap) parts.push(gap);
    }
    const tag = m[0];
    const name = tag.match(/<(h2|h3|h4|pre|p|table|ul|ol|blockquote|div)/)[1];
    let inner, end;
    if(name === "ul" || name === "ol"){
      end = closeOf(body, m.index);
      inner = body.slice(m.index + tag.length, end - (name.length + 3));
      parts.push(renderLists(inner, 0) + "\n");
    } else {
      const close = "</" + name + ">";
      end = body.indexOf(close, m.index);
      inner = body.slice(m.index + tag.length, end);
      if(name === "h2"){
        const idm = tag.match(/ id="([^"]+)"/);
        parts.push("## " + inline(inner) + (idm ? " {#" + idm[1] + "}" : "") + "\n");
      } else if(name === "h3") parts.push("### " + inline(inner) + "\n");
      else if(name === "h4") parts.push("#### " + inline(inner) + "\n");
      else if(name === "pre"){
        const cm = inner.match(/<code[^>]*>([\s\S]*?)<\/code>/);
        parts.push("```\n" + unescape(cm ? cm[1] : inner).replace(/\s+$/,"") + "\n```\n");
      }
      else if(name === "p"){
        const cls = tag.match(/class="([^"]+)"/);
        if(!cls || (!cls[1].includes("meta") && !cls[1].includes("breadcrumb"))) parts.push(inline(inner) + "\n");
      }
      else if(name === "table") parts.push(table(inner) + "\n");
      else if(name === "blockquote") parts.push("> " + inline(inner).replace(/\n/g,"\n> ") + "\n");
      else if(name === "div" && inner.trim()) parts.push(inner.trim() + "\n");
    }
    last = end;
    re.lastIndex = end;
  }
  const tail = body.slice(last).replace(/<[^>]+>/g,"").replace(/&nbsp;/g," ").trim();
  if(tail) parts.push(tail);
  return parts.join("\n\n").replace(/\n{3,}/g,"\n\n").trim() + "\n";
}
function convertFile(path, slug, lang){
  const h = readFileSync(path,"utf8");
  const title = (h.match(/<title>([^<]+)<\/title>/) || [,""])[1].replace(/\s*\|\s*MRKL\.top\s*$/,"").trim();
  const desc = (h.match(/name="description" content="([^"]+)"/) || [,""])[1].trim();
  const min = (h.match(/(?:about|约)\s*(\d+)\s*(?:min|分钟)/) || [,"8"])[1];
  const tagsRaw = (h.match(/(?:Tags|标签)\s*[：:]\s*([^<]+)/) || [,""])[1];
  const tags = tagsRaw.split(/[\s\/、]+/).map(t=>t.trim()).filter(Boolean);
  const body = h.slice(h.indexOf("<h2"));
  let b = body;
  const end = b.indexOf('<div class="related">');
  if(end > -1) b = b.slice(0, end);
  const bm = b.indexOf("</main>");
  if(bm > -1) b = b.slice(0, bm);
  const md = convert(b);
  const order = (lang==="zh"?ZH_ORDER:EN_ORDER).indexOf(slug)+1;
  const fm = "---\ntitle: \"" + title.replace(/"/g,'\\"') + "\"\ndescription: \"" + desc.replace(/"/g,'\\"') + "\"\ndate: 2026-11-10\nminutes: " + min + "\ntags:\n" + tags.map(t=>"  - " + t).join("\n") + "\nlang: " + lang + "\norder: " + order + "\n---\n\n";
  return fm + md;
}
mkdirSync(BASE + "\\src\\content\\zh", {recursive:true});
mkdirSync(BASE + "\\src\\content\\en", {recursive:true});
for(const s of ZH_ORDER){ writeFileSync(BASE + "\\src\\content\\zh\\" + s + ".md", convertFile(BASE + "\\articles\\" + s + ".html", s, "zh")); }
for(const s of EN_ORDER){ writeFileSync(BASE + "\\src\\content\\en\\" + s + ".md", convertFile(BASE + "\\en\\articles\\" + s + ".html", s, "en")); }
console.log("converted", ZH_ORDER.length + EN_ORDER.length);