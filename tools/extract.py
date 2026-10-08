#!/usr/bin/env python3
"""从本机的 epub 解压目录提取每章文本到 source/text/NN.txt（00 引言，01–06 正文六章，07 结语）。
每行一段，行首 [段号]。`## §k` 行是原书的分节（书里用一条短横线隔开）；
{Q} 表示该段是原书的整段引文（引的是别人的话）；{C} 表示该段是原书插图的图注（纸质书里那一页有图）。"""
import html, os, re
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
SRC = os.path.join(ROOT, "source/epub/text")
os.makedirs(os.path.join(ROOT, "source/text"), exist_ok=True)
MARK = {"x06-Extract": "{Q} ", "x06-Poetry": "{Q} ", "x14-Captions": "{C} "}
for k in range(8):
    s = open(os.path.join(SRC, f"part{k + 5:04d}.html"), encoding="utf-8").read()
    out, sec, n, words = ["## §1"], 1, 0, 0
    for cls, p in re.findall(r'<p class="([^"]*)"[^>]*>(.*?)</p>', s, flags=re.S):
        t = re.sub(r"\s+", " ", html.unescape(re.sub("<[^>]+>", "", p))).strip()
        if cls.startswith("x04-Space-Break"):
            sec += 1; out.append(f"## §{sec}"); continue
        if not t or cls.startswith(("x01-", "x03-Chapter")): continue
        n += 1; words += len(t.split())
        out.append(f"[{n}] " + next((v for c, v in MARK.items() if cls.startswith(c)), "") + t)
    open(os.path.join(ROOT, f"source/text/{k:02d}.txt"), "w", encoding="utf-8").write("\n".join(out) + "\n")
    print(f"{k:02d} {sec:2d} 节 {n:3d} 段 {words:5d} 词")
