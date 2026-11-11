// 支持 "## 标题 {#custom-id}" 语法：把 {#id} 写入 mdast 的 hProperties
export default function remarkHeadingId() {
  return (tree) => {
    const visit = (node) => {
      if (node.type === "heading" && node.children && node.children.length) {
        const last = node.children[node.children.length - 1];
        if (last.type === "text") {
          const m = last.value.match(/\s*\{#([A-Za-z0-9_-]+)\}\s*$/);
          if (m) {
            last.value = last.value.slice(0, last.value.length - m[0].length);
            node.data = node.data || {};
            node.data.hProperties = node.data.hProperties || {};
            node.data.hProperties.id = m[1];
          }
        }
      }
      (node.children || []).forEach(visit);
    };
    visit(tree);
  };
}
