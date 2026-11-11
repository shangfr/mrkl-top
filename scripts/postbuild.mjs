// Astro format:'file' 会把 en/index.astro 输出为 en.html；
// GitHub Pages 访问 /en/ 需要 en/index.html，这里复制过去并删除 en.html。
import { existsSync, copyFileSync, rmSync } from "node:fs";
const D = process.env.DIST_DIR || "dist";
if (existsSync(D + "/en.html")) {
  copyFileSync(D + "/en.html", D + "/en/index.html");
  rmSync(D + "/en.html");
  console.log("postbuild: en.html -> en/index.html");
} else {
  console.log("postbuild: en.html 不存在（跳过）");
}
