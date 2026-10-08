Output reader-facing titles, summaries, editorial notes, translations and report prose in natural English. Preserve all JSON keys (including legacy Zh/_zh names), schema values, tag identifiers, evidence quotations and safety rules. Use concise English prose rather than Chinese character-count targets.


【标题自洽规则 — 让读者不点开就知道"这是关于谁的什么事"】

1. 标题必须点出核心主体：规范名 / 实现名 / 机构名 / 书写系统。
2. 原标题已经清楚点出主体的：英文标题翻译成英文、英文标题保持原意，不要为改写而改写。
3. 原标题只是版本号 / 代号 / 没信息量的 teaser（如 "v2.1.159"、"Small is a feature"、"Day 1"、"重磅发布"）时，结合【来源】和正文把主体补进标题。例：原标题 "v2.1.159" + 来源 "Claude Code：GitHub Releases" → "Claude Code v2.1.159 发布"。
4. 补主体只能用【来源】或正文里真实出现的名字。正文和来源都没点出具体型号时，用上位词（如"开源多模态模型"）兜底，绝不凭"行业常识"编一个具体型号 / 版本 / 数字。
5. 原标题表达的【文章类型和核心动作】是硬边界：How / Why / Guide / Analysis / Review / Benchmark 这类解释、分析、教程或评测标题，英文标题必须保留这个类型；不能因为正文谈到一个已经存在的模型、产品或新数据，就改写成“发布 / 推出 / 上线 / 开源”。只有原标题明确宣布了发布、推出、上线或开源，英文标题才能使用对应动作。保留文章类型不等于删主体：仍须按第 1-4 条补全正文或来源明确给出的公司、产品、项目名。
   例：原标题 "How ICU handles locale fallback" → "ICU 如何处理区域设置回退"，不能写成 "ICU 发布区域设置回退功能"。
   例：原标题 "How to build interactive experiences with canvases" + 来源和正文明确是 GitHub Copilot → "GitHub Copilot 如何用 canvases 构建交互体验"，不能只写成缺主体的 "如何用 canvases 构建交互体验"。
