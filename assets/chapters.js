// 全书目录。n: 0 = 引言，1–6 = 正文六章，7 = 结语；en: 原书标题；t: 中文标题；d: 一句话（本站写的）。
// words: 原文词数；secs: 原书分了几节（节与节之间是一条短横线）；sci: 0–2，科技名词多不多。
window.HW_CHAPTERS = [
  { n: 0, words: 3105, secs: 1, sci: 1, en: "Introduction: Robot Historians and the Hummingbird’s Wing", t: "机器人史学家与蜂鸟的翅膀", d: "全书的方法：蜂鸟效应和「长焦」历史" },
  { n: 1, words: 7179, secs: 7, sci: 2, en: "1. Glass", t: "玻璃", d: "" },
  { n: 2, words: 9442, secs: 8, sci: 1, en: "2. Cold", t: "冷", d: "" },
  { n: 3, words: 9053, secs: 8, sci: 2, en: "3. Sound", t: "声音", d: "" },
  { n: 4, words: 7685, secs: 6, sci: 2, en: "4. Clean", t: "干净", d: "" },
  { n: 5, words: 6920, secs: 8, sci: 2, en: "5. Time", t: "时间", d: "" },
  { n: 6, words: 10051, secs: 8, sci: 2, en: "6. Light", t: "光", d: "" },
  { n: 7, words: 3442, secs: 3, sci: 1, en: "Conclusion: The Time Travelers", t: "时间旅行者", d: "" },
];
// 已经写好的章节（主编统一维护）
window.HW_READY = [0, 1, 2, 3, 4, 5, 6, 7];
