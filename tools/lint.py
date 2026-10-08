#!/usr/bin/env python3
"""章节页结构检查：python3 tools/lint.py chapters/NN.html …
查：.en 重复、.loc 不在原文对应段落里、.loc 词数、词条是否放在对应的 § 小标题下、分节地图是否齐全、引用块数量、
图片文件是否存在、图的数量、页面里的 <style>/<script>/写死的颜色。"""
import html, os, re, sys
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
norm = lambda s: re.sub(r"\s+", " ", html.unescape(s).replace("’", "'").replace("‘", "'").replace("“", '"').replace("”", '"')).strip()
bad = 0
for path in sys.argv[1:]:
    t = open(path, encoding="utf-8").read(); errs = []
    nn = re.search(r"(\d\d)\.html$", path).group(1)
    src = os.path.join(ROOT, f"source/text/{nn}.txt")
    paras, sec_of, nsec = {}, {}, 0
    for line in (open(src, encoding="utf-8").read().splitlines() if os.path.exists(src) else []):
        m = re.match(r"\[(\d+)\] (?:\{[QC]\} )?(.*)$", line)
        if line.startswith("## §"): nsec = int(line[4:])
        elif m: paras[int(m.group(1))] = norm(m.group(2)); sec_of[int(m.group(1))] = nsec
    body = nn in ("01", "02", "03", "04", "05", "06")
    ens = re.findall(r'<div class="en">(.*?)</div>', t)
    for e in sorted({e for e in ens if ens.count(e) > 1}): errs.append(f".en 重复：{e}")
    entries = re.findall(r'<div class="entry( trap)?">(.*?)</div></div>', t, flags=re.S)
    locs = re.findall(r'<div class="loc" data-p="(\d+)">(.*?)</div>', t)
    if len(locs) != len(ens): errs.append(f"词条 {len(ens)} 条，但 .loc 只有 {len(locs)} 个")
    last = 0
    for p, loc in locs:
        s = norm(re.sub(r"<[^>]+>", "", loc)).strip("… ").strip()
        n = len(s.split()); p = int(p)
        if paras and s not in paras.get(p, ""):
            where = [k for k, v in paras.items() if s in v]
            errs.append(f".loc 不在第 {p} 段：{s!r}" + (f"（在第 {where[0]} 段）" if where else "（全章都找不到）"))
        if n > 9: errs.append(f".loc 太长（{n} 词）：{s!r}")
        if p < last: errs.append(f"词条顺序：第 {p} 段的词条排在第 {last} 段之后：{s!r}")
        last = max(last, p)
    # 分节：分节地图每节一行；词条的 § 小标题 <h3 class="sec-head" id="sK">，词条必须落在自己那一节下面
    if nsec > 1:
        got = [int(k) for k in re.findall(r'<li data-sec="(\d+)">', t)]
        if got != list(range(1, nsec + 1)): errs.append(f"分节地图应有 §1–§{nsec} 各一行（<li data-sec=…>），实际是 {got}")
        heads = [int(k) for k in re.findall(r'<h3 class="sec-head" id="s(\d+)">', t)]
        if heads != list(range(1, nsec + 1)): errs.append(f"词条的 § 小标题应有 s1–s{nsec}，实际是 {heads}")
        cur = 0
        for m in re.finditer(r'<h3 class="sec-head" id="s(\d+)">|<div class="loc" data-p="(\d+)">', t):
            if m.group(1): cur = int(m.group(1))
            elif sec_of.get(int(m.group(2))) not in (None, cur): errs.append(f"第 {m.group(2)} 段属于 §{sec_of[int(m.group(2))]}，词条却放在 §{cur} 下面")
    q = len(re.findall(r'<blockquote class="quote">', t))
    if q > 3: errs.append(f"引用块 {q} 处，超过 3 处")
    imgs = re.findall(r'<img[^>]+src="([^"]+)"', t)
    for i in imgs:
        if not re.fullmatch(r"\.\./assets/img/\d\d-[a-z0-9-]+\.jpg", i) or not os.path.exists(os.path.join(os.path.dirname(path), i)): errs.append(f"图片不存在，或不是 ../assets/img/NN-名字.jpg：{i}")
    svgs = len(re.findall(r"<svg\b", t))
    need = (6, 3) if body else (3, 1)
    if len(set(imgs)) < need[0] or svgs < need[1]: errs.append(f"图不够：照片 {len(set(imgs))}，SVG {svgs}（至少照片 {need[0]} 张、SVG {need[1]} 张）")
    if re.search(r"\.epub|part00\d\d|source/", t): errs.append("页面里出现了原书材料的路径或文件名")
    if re.search(r"<svg(?![^>]*class=\"diagram\")", t): errs.append("有 SVG 没用 class=\"diagram\"")
    if re.search(r"<style|<script(?![^>]*src=)", t): errs.append("页面里有 <style> 或内联 <script>")
    for m in set(re.findall(r'(?:fill|stroke)="(#[0-9a-fA-F]+|[a-z]+)"', t)) - {"none", "currentColor"}: errs.append(f"SVG 里写死了颜色：{m}")
    if re.search(r'style="', t): errs.append('有内联 style="…"')
    secs = ["这一章在做什么", "背景：作者默认你知道的事", "词与短语", "值得停下来的句子", "检查一下理解"]
    if nsec > 1: secs.insert(1, "分节地图")
    if body: secs[1:1] = ["因果链：这一章的蜂鸟效应"]; secs.insert(4, "这一章的科学，先用中文过一遍")
    pos = [t.find(f"<h2>{sec}</h2>") for sec in secs]
    for sec, k in zip(secs, pos):
        if k < 0: errs.append(f"缺少小节：{sec}")
    if -1 not in pos and pos != sorted(pos): errs.append("小节顺序不对，应为：" + " → ".join(secs))
    if '"' in re.sub(r"<[^>]+>", "", t): errs.append('正文里有英文直引号 "，中文引号用「」')
    traps = len(re.findall(r'class="entry trap"', t))
    print(("✗" if errs else "✓"), path, f"词条 {len(ens)}（trap {traps}） 照片 {len(imgs)} SVG {svgs} 引用 {q} 检查题 {len(re.findall('class=.check.', t))}")
    for e in errs: print("    " + e)
    bad += bool(errs)
sys.exit(1 if bad else 0)
