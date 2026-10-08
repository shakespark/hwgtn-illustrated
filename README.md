# 我们如何走到今天 · 英文伴读

陪读者读英文原版 *How We Got to Now: Six Innovations That Made the Modern World*（Steven Johnson，2014）。
每章一页：这一章在做什么、因果链（蜂鸟效应）示意图、分节地图、作者默认读者知道的背景、科学原理、
按节分组的词与短语、几道理解检查题。本站没有译文，不替代原书。

## 目录结构

- `index.html`：首页（全书一张图、目录、阅读进度、我的词本）
- `chapters/NN.html`：`00` 引言，`01`–`06` 正文六章（Glass / Cold / Sound / Clean / Time / Light），`07` 结语
- `assets/`：共享样式 `style.css`、脚本 `hw.js`、目录数据 `chapters.js`、图片 `img/`（出处见 `img/CREDITS.md`）
- `tools/`：`extract.py` 提取原书文本、`fetch_img.py` 从维基共享资源取图（转调 `~/tutorials-deploy/scripts/fetch_img.py`）、`lint.py` 结构检查、
  `overlap.py` 与原书的重合检查、`check.mjs` 浏览器检查
- `AUTHORING.md`：章节页编写规范
- `source/`：原书材料，只在本机，不入库、不部署

本地预览：`python3 -m http.server 8790`，打开 http://localhost:8790/ 。纯静态，无构建步骤。
localStorage 键一律带 `hw-` 前缀：`hw-done-N`（读完一章）、`hw-sec-N-K`（读完一节）、`hw-star-NN-词条`、`hw-theme`。

## 版权

原书版权归作者和出版方。本站不翻译、不转述原书，每页直接引用不超过三处、每处不超过 25 个英文单词。
照片来自维基共享资源，授权为公有领域或 CC BY / CC BY-SA，逐张登记在 `assets/img/CREDITS.md`；示意图是本站自己画的。

## 改完之后

```sh
python3 tools/lint.py chapters/*.html
python3 tools/overlap.py chapters/*.html
node tools/check.mjs
```
推送到 `main` 即自动部署（见 `.github/workflows/deploy.yml`，部署方式见 `~/tutorials-deploy`）。
