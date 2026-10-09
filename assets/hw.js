// 我们如何走到今天 · 英文伴读：共享脚本。注入顶栏、章头、章末导航、页脚；接管分节地图的打勾、词条的"记下"和筛选。
// localStorage 键一律带 hw- 前缀（全站各教程同一个域名）：hw-done-N、hw-sec-N-节号、hw-star-NN-词条、hw-theme。
(() => {
  const CH = window.HW_CHAPTERS || [], READY = new Set(window.HW_READY || []);
  const ROOT = document.currentScript.src.replace(/assets\/hw\.js.*$/, "");
  const LS = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch {} },
    keys(prefix) { try { return Object.keys(localStorage).filter((k) => k.startsWith(prefix)); } catch { return []; } },
  };
  const h = (tag, attrs = {}, ...kids) => {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) k === "class" ? (el.className = v) : k.startsWith("on") ? (el[k] = v) : el.setAttribute(k, v);
    el.append(...kids.filter((x) => x != null));
    return el;
  };
  const pad = (n) => String(n).padStart(2, "0");
  const chHref = (n) => `${ROOT}chapters/${pad(n)}.html`;
  const LAST = Math.max(0, ...CH.map((c) => c.n));
  const chLabel = (n) => (n === 0 ? "引言" : n === LAST ? "结语" : `第 ${n} 章`);
  const chTitle = (c) => `${chLabel(c.n)} · ${c.t}`;
  const minutes = (words) => Math.max(5, Math.round(words / 90 / 5) * 5); // 按边读边查的速度估
  const isDone = (n) => LS.get(`hw-done-${n}`) === "1";
  const SCI = ["几乎没有科技名词", "有一些科技名词", "科技名词密集"];
  const secDone = (n, k) => LS.get(`hw-sec-${n}-${k}`) === "1";
  const badges = (c) => [
    h("span", { class: "badge" }, `约 ${c.words} 词 · ${c.secs} 节 · ${minutes(c.words)} 分钟`),
    c.sci == null ? null : h("span", { class: `badge l${c.sci}` }, SCI[c.sci]),
  ];

  const saved = LS.get("hw-theme");
  if (saved) document.documentElement.dataset.theme = saved;
  function themeBtn() {
    return h("button", { class: "btn", "aria-label": "切换深色/浅色", onclick() {
      const dark = document.documentElement.dataset.theme ? document.documentElement.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
      const next = dark ? "light" : "dark";
      document.documentElement.dataset.theme = next; LS.set("hw-theme", next);
    } }, "深/浅");
  }

  function mountChrome() {
    const n = document.body.dataset.chapter == null ? null : Number(document.body.dataset.chapter);
    const c = CH.find((x) => x.n === n);
    document.body.prepend(h("div", { class: "topbar" }, h("div", { class: "topbar-inner" },
      h("a", { class: "home", href: `${ROOT}index.html` }, "我们如何走到今天 · 英文伴读"),
      h("span", { class: "crumb" }, c ? chTitle(c) : ""),
      themeBtn())));
    document.body.append(h("footer", { class: "site-footer" },
      h("a", { href: "https://beian.miit.gov.cn/", target: "_blank", rel: "noopener" }, "京ICP备18057656号-1")));
    if (!c) return;
    const main = document.querySelector("main");
    document.title = `${chTitle(c)} · 我们如何走到今天 英文伴读`;
    main.prepend(h("div", { class: "chapter-head" },
      h("div", { class: "kicker" }, c.en),
      h("h1", {}, `${chLabel(n)}　${c.t}`),
      h("div", { class: "badges" }, ...badges(c))));
    const prev = CH.find((x) => x.n === n - 1), next = CH.find((x) => x.n === n + 1);
    const done = h("button", { class: "btn" });
    const paint = () => { done.textContent = isDone(n) ? "✓ 已读完这一章" : "标记：这一章读完了"; done.setAttribute("aria-pressed", isDone(n)); };
    done.onclick = () => { LS.set(`hw-done-${n}`, isDone(n) ? null : "1"); paint(); };
    paint();
    main.append(h("div", { class: "chapter-end" }, done, h("div", { class: "nav" },
      prev ? h("a", { class: "btn", href: chHref(prev.n) }, `← ${chLabel(prev.n)}`) : null,
      h("a", { class: "btn", href: `${ROOT}index.html` }, "目录"),
      next && READY.has(next.n) ? h("a", { class: "btn primary", href: chHref(next.n) }, `${chLabel(next.n)} →`) : null)));
  }

  // 词条：<div class="entry [trap]"><div class="en">…</div><div class="loc" data-p="段号">原句里的 4–6 个词</div><div class="zh">…</div><div class="note">…</div></div>
  function wireEntries() {
    const entries = [...document.querySelectorAll(".entry")];
    if (!entries.length) return;
    const n = pad(Number(document.body.dataset.chapter));
    const first = entries[0];
    const count = h("span", { class: "count" });
    const mk = (label, cls) => h("button", { class: "btn", "aria-pressed": String(!cls), onclick(e) {
      document.body.classList.remove("only-traps", "only-starred");
      if (cls) document.body.classList.add(cls);
      bar.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", String(b === e.currentTarget)));
    } }, label);
    const bar = h("div", { class: "toolbar" }, mk("全部", ""), mk("只看「每个字都认识」", "only-traps"), mk("只看我记下的", "only-starred"), count);
    (first.previousElementSibling?.matches("h3.sec-head") ? first.previousElementSibling : first).before(bar, h("p", { class: "empty-note" }, "还没有记下任何词条。回到「全部」，点词条右边的「记下」。"));
    const refresh = () => {
      const k = entries.filter((e) => e.classList.contains("starred")).length;
      document.body.classList.toggle("none-starred", k === 0);
      count.textContent = `共 ${entries.length} 条 · 已记下 ${k}`;
    };
    for (const e of entries) {
      const en = e.querySelector(".en"), text = en.textContent.trim();
      const key = `hw-star-${n}-${text}`;
      if (e.classList.contains("trap")) en.append(h("span", { class: "tag" }, "每个字都认识"));
      const btn = h("button", { class: "btn star" });
      const paint = () => { btn.textContent = e.classList.contains("starred") ? "已记下" : "记下"; };
      if (LS.get(key)) e.classList.add("starred");
      btn.onclick = () => {
        const on = e.classList.toggle("starred");
        LS.set(key, on ? JSON.stringify({ zh: e.querySelector(".zh")?.textContent.trim() || "" }) : null);
        paint(); refresh();
      };
      paint(); en.after(btn);
    }
    refresh();
  }

  // 分节地图：<ol class="secmap"><li data-sec="1"><b>开头几个词</b>一句话</li>…</ol>，每节前面加一个"读过了"的勾，并链到词条里对应的 #sK
  function wireSecmap() {
    const n = Number(document.body.dataset.chapter);
    for (const li of document.querySelectorAll(".secmap li[data-sec]")) {
      const k = li.dataset.sec, key = `hw-sec-${n}-${k}`;
      const box = h("input", { type: "checkbox", "aria-label": `第 ${k} 节读过了` });
      box.checked = secDone(n, k); li.classList.toggle("done", box.checked);
      box.onchange = () => { LS.set(key, box.checked ? "1" : null); li.classList.toggle("done", box.checked); };
      li.prepend(box, h("span", { class: "k" }, `§${k}`));
      if (document.getElementById(`s${k}`)) li.append(h("a", { class: "jump", href: `#s${k}` }, "词条 ↓"));
    }
  }
  const secProgress = (c) => {
    const k = Array.from({ length: c.secs }, (_, i) => i + 1).filter((i) => secDone(c.n, i)).length;
    return k && !isDone(c.n) ? h("span", { class: "sp" }, `　已读 ${k} / ${c.secs} 节`) : null;
  };

  // 首页：目录、进度、我的词本
  function mountHome() {
    const toc = document.getElementById("toc");
    if (!toc) return;
    for (const c of CH) {
      const ready = READY.has(c.n);
      toc.append(h("li", {}, h(ready ? "a" : "a", Object.assign({ class: (isDone(c.n) ? "done " : "") + (ready ? "" : "todo") }, ready ? { href: chHref(c.n) } : {}),
        h("span", { class: "n" }, isDone(c.n) ? "✓" : c.n === 0 ? "引" : c.n === LAST ? "结" : String(c.n)),
        h("span", { class: "t" }, c.t, h("span", { class: "te" }, c.en)),
        h("span", { class: "b" }, ...(ready ? badges(c) : [h("span", { class: "badge" }, "待写")])),
        c.d ? h("span", { class: "d" }, c.d, secProgress(c)) : null)));
    }
    const doneN = CH.filter((c) => isDone(c.n)).length;
    const p = document.getElementById("progress");
    if (p) p.append(h("div", { class: "progress" }, Object.assign(h("i"), { style: `width:${(100 * doneN) / CH.length}%` })), h("p", { class: "lede" }, `已读完 ${doneN} / ${CH.length}`));
    const wb = document.getElementById("wordbook");
    if (wb) {
      const keys = LS.keys("hw-star-").sort();
      if (!keys.length) wb.append(h("p", { class: "lede" }, "还是空的。在章节页里点词条右边的「记下」，它们会汇总到这里。"));
      for (const k of keys) {
        const m = k.match(/^hw-star-(\d\d)-(.*)$/); if (!m) continue;
        let zh = ""; try { zh = JSON.parse(LS.get(k)).zh; } catch {}
        wb.append(h("div", {}, h("b", {}, m[2]), h("span", {}, zh), h("a", { href: chHref(Number(m[1])) }, chLabel(Number(m[1])))));
      }
    }
  }

  document.addEventListener("DOMContentLoaded", () => { mountChrome(); wireSecmap(); wireEntries(); mountHome(); });
  // 跨设备同步：模块在首页仓库里（/_home/sync.js），所有教程站共用。只在线上加载；本地预览要联调时设 localStorage["sync-dev"] = "1"
  try { if (location.hostname === "t.miaowuao.cn" || localStorage.getItem("sync-dev")) document.head.append(Object.assign(document.createElement("script"), { src: "/_home/sync.js" })); } catch (e) {}
  window.HW = { h, LS, ROOT, chHref, chLabel, isDone };
})();
