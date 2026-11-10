/* MRKL.top — 全站交互脚本 */
(function () {
  "use strict";

  // 1. 暗色模式
  var root = document.documentElement;
  var saved = null;
  try { saved = localStorage.getItem("mrkl-theme"); } catch (e) {}
  var sysDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  var theme = saved || (sysDark ? "dark" : "light");
  root.setAttribute("data-theme", theme);
  var toggle = document.getElementById("themeToggle");
  if (toggle) {
    toggle.textContent = theme === "dark" ? "☀️" : "🌙";
    toggle.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      toggle.textContent = next === "dark" ? "☀️" : "🌙";
      try { localStorage.setItem("mrkl-theme", next); } catch (e) {}
    });
  }

  // 2. 移动端菜单
  var navToggle = document.getElementById("navToggle");
  var navLinks = document.querySelector(".nav-links");
  if (navToggle && navLinks) {
    navToggle.addEventListener("click", function () { navLinks.classList.toggle("open"); });
  }

  // 3. 阅读进度条
  var progress = document.getElementById("progressBar");
  if (progress) {
    var onScroll = function () {
      var h = document.documentElement;
      var total = h.scrollHeight - h.clientHeight;
      progress.style.width = (total > 0 ? (h.scrollTop / total) * 100 : 0) + "%";
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  // 4. 回到顶部
  var backTop = document.getElementById("backTop");
  if (backTop) {
    window.addEventListener("scroll", function () {
      backTop.classList.toggle("show", window.scrollY > 400);
    }, { passive: true });
    backTop.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });
  }

  // 5. 目录滚动高亮
  var tocLinks = document.querySelectorAll(".toc a");
  if (tocLinks.length) {
    var ids = [];
    tocLinks.forEach(function (a) { ids.push(a.getAttribute("href").slice(1)); });
    var map = {};
    ids.forEach(function (id) {
      var el = document.getElementById(id);
      if (el) map[id] = el;
    });
    var spy = function () {
      var pos = window.scrollY + 140;
      var current = "";
      Object.keys(map).forEach(function (id) {
        if (map[id].offsetTop <= pos) current = id;
      });
      tocLinks.forEach(function (a) {
        a.classList.toggle("active", a.getAttribute("href") === "#" + current);
      });
    };
    window.addEventListener("scroll", spy, { passive: true });
    spy();
  }

  // 6. 代码复制按钮
  document.querySelectorAll("pre").forEach(function (pre) {
    var btn = document.createElement("button");
    btn.className = "copy-btn";
    btn.textContent = "复制";
    btn.setAttribute("aria-label", "复制代码");
    pre.appendChild(btn);
    btn.addEventListener("click", function () {
      var code = pre.querySelector("code");
      var text = code ? code.innerText : pre.innerText;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () {
          btn.textContent = "✓ 已复制";
          setTimeout(function () { btn.textContent = "复制"; }, 1600);
        }, function () { btn.textContent = "复制失败"; });
      } else {
        btn.textContent = "不支持复制";
      }
    });
  });

  // 7. 点赞
  var likeBtn = document.getElementById("likeBtn");
  var likeCount = document.getElementById("likeCount");
  if (likeBtn && likeCount) {
    var key = "mrkl-like-" + location.pathname;
    var liked = false;
    try { liked = localStorage.getItem(key) === "1"; } catch (e) {}
    var base = parseInt(likeCount.getAttribute("data-base") || "0", 10) || 0;
    var update = function () {
      likeBtn.classList.toggle("liked", liked);
      likeCount.textContent = base + (liked ? 1 : 0);
    };
    likeBtn.addEventListener("click", function () {
      liked = !liked;
      try { localStorage.setItem(key, liked ? "1" : "0"); } catch (e) {}
      update();
    });
    update();
  }

  // 8. 分享
  document.querySelectorAll("[data-share]").forEach(function (el) {
    el.addEventListener("click", function () {
      var net = el.getAttribute("data-share");
      var url = encodeURIComponent(location.href);
      var title = encodeURIComponent(document.title);
      var targets = {
        x: "https://twitter.com/intent/tweet?text=" + title + "&url=" + url,
        linkedin: "https://www.linkedin.com/sharing/share-offsite/?url=" + url,
        weibo: "https://service.weibo.com/share/share.php?url=" + url + "&title=" + title
      };
      if (net === "copy") {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(location.href).then(function () {
            el.textContent = "✓ 已复制";
            setTimeout(function () { el.textContent = "🔗 链接"; }, 1600);
          });
        }
      } else if (targets[net]) {
        window.open(targets[net], "_blank", "width=620,height=520");
      }
    });
  });

  // 9. 上 / 下一篇
  var ORDER = [
    "articles/what-is-mrkl.html",
    "articles/react-vs-mrkl.html",
    "articles/mrkl-paper.html",
    "articles/agent-loop.html",
    "articles/loop-vs-react-vs-mrkl.html",
    "articles/agent-memory.html",
    "articles/tool-calling.html",
    "articles/langgraph-agent.html",
    "articles/agent-frameworks-compare.html",
    "articles/multi-agent.html",
    "articles/agent-safety.html"
  ];
  var here = location.pathname.replace(/^\/+/, "");
  var idx = ORDER.indexOf(here);
  var prevLink = document.getElementById("prevLink");
  var nextLink = document.getElementById("nextLink");
  if (prevLink && idx > 0) { prevLink.href = "/" + ORDER[idx - 1]; prevLink.classList.remove("hidden"); }
  if (nextLink && idx >= 0 && idx < ORDER.length - 1) { nextLink.href = "/" + ORDER[idx + 1]; nextLink.classList.remove("hidden"); }

  // 10. 随机文章
  var randBtn = document.getElementById("randBtn");
  if (randBtn) {
    randBtn.addEventListener("click", function () {
      location.href = "/" + ORDER[Math.floor(Math.random() * ORDER.length)];
    });
  }

  // 11. 站内搜索
  var searchBox = document.getElementById("searchBox");
  if (searchBox) {
    var cards = Array.prototype.slice.call(document.querySelectorAll(".card[data-title]"));
    var empty = document.getElementById("searchEmpty");
    searchBox.addEventListener("input", function () {
      var q = searchBox.value.trim().toLowerCase();
      var shown = 0;
      cards.forEach(function (c) {
        var text = (c.getAttribute("data-title") + " " + (c.getAttribute("data-tags") || "") + " " + (c.getAttribute("data-excerpt") || "")).toLowerCase();
        var hit = !q || text.indexOf(q) !== -1;
        c.style.display = hit ? "" : "none";
        if (hit) shown++;
      });
      if (empty) empty.style.display = shown === 0 ? "block" : "none";
    });
  }

  // 12. 滚动浮现
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("revealed"); io.unobserve(e.target); }
      });
    }, { threshold: 0.1 });
    document.querySelectorAll(".reveal").forEach(function (el) { io.observe(el); });
  } else {
    document.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("revealed"); });
  }

  // 13. Hero 打字动画
  var typer = document.getElementById("typer");
  if (typer) {
    var phrases = [
      "MRKL · 模块化推理、知识与语言",
      "ReAct · 边想边做的决策协议",
      "Agent Loop · 执行引擎的闭环",
      "从论文精读到框架实战"
    ];
    var pi = 0, ci = 0, deleting = false;
    var tick = function () {
      var p = phrases[pi];
      typer.textContent = p.slice(0, ci);
      if (!deleting) {
        if (ci < p.length) { ci++; setTimeout(tick, 70); }
        else { deleting = true; setTimeout(tick, 1800); }
      } else {
        if (ci > 0) { ci--; setTimeout(tick, 35); }
        else { deleting = false; pi = (pi + 1) % phrases.length; setTimeout(tick, 300); }
      }
    };
    tick();
  }

  // 14. 订阅表单（提交到 /api/newsletter，内联反馈）
  document.querySelectorAll(".subscribe-form").forEach(function (form) {
    var action = form.getAttribute("action") || "";
    if (action.indexOf("/") !== 0) return; // 外部表单（Buttondown embed）走原生提交，新标签页打开
    var msg = form.parentElement.querySelector(".subscribe-msg");
    if (!msg) {
      msg = document.createElement("p");
      msg.className = "subscribe-msg";
      msg.hidden = true;
      form.insertAdjacentElement("afterend", msg);
    }
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var input = form.querySelector("input[type=email]");
      var email = (input.value || "").trim();
      var btn = form.querySelector("button[type=submit]");
      var oldLabel = btn ? btn.textContent : "";
      if (btn) { btn.disabled = true; btn.textContent = "提交中…"; }
      msg.hidden = false;
      msg.className = "subscribe-msg";
      fetch(form.getAttribute("action") || "/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email })
      })
        .then(function (r) {
          return r.json().then(function (d) { return { ok: r.ok, data: d }; });
        })
        .then(function (res) {
          if (res.ok && res.data && res.data.ok) {
            msg.className = "subscribe-msg ok";
            msg.textContent = "✅ 订阅成功！确认邮件已发送，请查收。";
            if (input) input.value = "";
          } else {
            msg.className = "subscribe-msg err";
            msg.textContent = "⚠️ " + (res.data && res.data.error ? res.data.error : "订阅失败，请稍后再试");
          }
          if (btn) { btn.disabled = false; btn.textContent = oldLabel; }
        })
        .catch(function () {
          msg.className = "subscribe-msg err";
          msg.textContent = "⚠️ 网络错误，请稍后再试";
          if (btn) { btn.disabled = false; btn.textContent = oldLabel; }
        });
    });
  });
})();
