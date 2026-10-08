// 这个行业的分类体系：类别、标签词表、公司（主体）名录，以及防止张冠李戴的身份词典。
// 模型按这里的词表打标签，主题页（topics.json）按标签归类，筛选栏按类别分组。
// 换行业时：类别的 key 会出现在网址里（/all?category=…），上线后就不要再改；标签和名录可以随时增减。

/**
 * 网页上的类别（筛选栏、卡片角标、RSS 分类订阅）。key 是网址和接口里的身份，上线后不要改。
 * section 是日报里的分节标题（几个类别可以共用一节，按这里的顺序排）；guide 告诉结构抽取模型这一类收什么、
 * 和相邻类别的边界在哪（总的归类原则写在 prompts/structure.md 里）。
 * commentary 标出评论类（教程、观点）：日报写过的事又有评论类的后续报道，只占一行快讯（报道它的信源够多时除外）。
 * 没归上类的资料在日报里放进第一个 key 为 industry 的类别所在的节（没有就放最后一节）。
 * feedLabel 是分类 RSS 标题里的名字（不写就用 label）。公开接口、RSS 和 MCP 里要把一类并进另一类发布，写在站点设置里（site/site.ts 的 PUBLIC_CATEGORIES）。
 */
export const CATEGORIES = [
  {
    "key": "standards",
    "label": "Standards and data",
    "section": "Standards and data",
    "guide": "规范、提案、决议、Unicode/CLDR/ICU 数据与 IETF/IANA 登记的变化；库代码修复归实现。"
  },
  {
    "key": "implementations",
    "label": "Implementation and interoperability",
    "section": "Implementation and interoperability",
    "guide": "Chromium、WebKit、Firefox、WPT、ICU、HarfBuzz 等实现发布、修复及跨实现差异。"
  },
  {
    "key": "languages",
    "label": "Languages and writing systems",
    "section": "Languages and writing systems",
    "guide": "语言社区、W3C Language Enablement、SIL 的具体排版与输入需求、障碍和进展；已发布实现修复归实现。"
  },
  {
    "key": "multilingual",
    "label": "Multilingual technology",
    "section": "Multilingual technology",
    "guide": "多语种 AI、低资源语言、语音技术的具体能力、研究与证据；普通翻译新品价值低。"
  },
  {
    "key": "access-publishing",
    "label": "Accessibility and publishing",
    "section": "Accessibility and publishing",
    "guide": "语言相关辅助技术、可访问阅读、电子书、数字出版与排版标准及实现。"
  },
  {
    "key": "commentary",
    "label": "Tutorials and analysis",
    "section": "Tutorials and analysis",
    "guide": "可复用国际化方法、测试教程与有证据的观点分析；具体新变化优先归前五类。",
    "commentary": true
  }
] as const satisfies ReadonlyArray<{ key: string; label: string; feedLabel?: string; section: string; guide: string; commentary?: true }>;

/**
 * 这个行业最受关注的一类发布（AI 行业是新模型）：日报报头的“N 个新模型”、改分类后修订已出的报告都按它数。
 * category 是类别，tag 是标签，两者都对上才算；unit 接在数字后面。
 * 没有这样一类的行业设成 null，报头就不显示这个数。
 */
export const RELEASE: { category: string; tag: string; unit: string } | null = null;

/** 周报月报的总述可以直接写、不必在报道里找到出处的行业通用词（小写）。站名会自动算进去。 */
export const PLAIN_TERMS: readonly string[] = ["i18n","l10n","unicode","cldr","icu","css","html","api","bcp 47","utf-8","rtl","ltr"];

/**
 * 内容理解一步给每篇资料判的“内容类型”（写在 prompts/content-understanding.md 里，改了类型要同步改那份提示词）。
 * 评分提示词（prompts/selection-score.md）按类型给五个维度不同的权重。
 */
export const ITEM_TYPES = ["model_release", "product_launch", "tool_or_prompt", "research_paper", "industry_event", "opinion_analysis", "tutorial_explainer"] as const;

// ── 标签词表 ────────────────────────────────────────────────────────────────────────────

/** 每篇资料的第一个标签必须是这些“分类标签”之一。 */
export const CATEGORY_TAGS = ["标准/数据更新","实现更新","互操作问题","语言需求","论文/研究","开源/仓库","教程/实践","评测/基准","现象/趋势","观点分析","其他"] as const;

/** 可选的主题标签。 */
export const TOPIC_TAGS = ["Unicode","CLDR","ICU","ECMA-402","CSS","HTML","语言标签","字符编码","排版","字体/塑形","双向文本","分词/断行","输入法","本地化","低资源语言","AI多语种","语音","无障碍","数字出版"] as const;

/** 可选的实体标签（公司、机构、平台）。 */
export const ENTITY_TAGS = ["Unicode","ICU","ECMA-402","CSSWG","WHATWG","IETF","IANA","Chromium","WebKit","Firefox","WPT","HarfBuzz","W3C","SIL","Google Research"] as const;

/** 模型常写的近义词，统一成词表里的写法。 */
export const TAG_SYNONYMS: Readonly<Record<string, string>> = { 标准更新: "标准/数据更新", 数据更新: "标准/数据更新", 浏览器更新: "实现更新", 兼容性: "互操作问题", 国际化: "本地化", 多语种: "AI多语种", 研究: "论文/研究", 教程: "教程/实践", 观点: "观点分析", 开源: "开源/仓库" };

// ── 公司与主体 ──────────────────────────────────────────────────────────────────────────

/**
 * 公司主题：id → 显示名、卡片上显示的标签（null 表示只用 entity:<id> 归类）、别名。
 * aliases 给结构抽取模型看；otherNames 是公司自己的其他称呼（官方账号名、子品牌），
 * 把事实的主体对到发布方时也认它们。
 */
export const ENTITIES: Record<string, { name: string; displayTag: string | null; aliases: string[]; otherNames?: string[] }> = {
  "unicode": {
    "name": "Unicode Consortium",
    "displayTag": "Unicode",
    "aliases": [
      "Unicode",
      "Unicode 联盟"
    ]
  },
  "icu": {
    "name": "ICU",
    "displayTag": "ICU",
    "aliases": [
      "ICU"
    ]
  },
  "ecma": {
    "name": "Ecma International",
    "displayTag": "ECMA-402",
    "aliases": [
      "ECMA-402",
      "TC39"
    ]
  },
  "csswg": {
    "name": "CSSWG",
    "displayTag": "CSSWG",
    "aliases": [
      "CSSWG",
      "CSS Working Group"
    ]
  },
  "whatwg": {
    "name": "WHATWG",
    "displayTag": "WHATWG",
    "aliases": [
      "WHATWG"
    ]
  },
  "ietf": {
    "name": "IETF",
    "displayTag": "IETF",
    "aliases": [
      "IETF"
    ]
  },
  "iana": {
    "name": "IANA",
    "displayTag": "IANA",
    "aliases": [
      "IANA"
    ]
  },
  "chromium": {
    "name": "Chromium",
    "displayTag": "Chromium",
    "aliases": [
      "Chromium"
    ]
  },
  "webkit": {
    "name": "WebKit",
    "displayTag": "WebKit",
    "aliases": [
      "WebKit"
    ]
  },
  "mozilla": {
    "name": "Mozilla / Firefox",
    "displayTag": "Firefox",
    "aliases": [
      "Firefox",
      "Mozilla"
    ]
  },
  "wpt": {
    "name": "Web Platform Tests",
    "displayTag": "WPT",
    "aliases": [
      "WPT",
      "web-platform-tests"
    ]
  },
  "harfbuzz": {
    "name": "HarfBuzz",
    "displayTag": "HarfBuzz",
    "aliases": [
      "HarfBuzz"
    ]
  },
  "w3c": {
    "name": "W3C",
    "displayTag": "W3C",
    "aliases": [
      "W3C",
      "Language Enablement"
    ]
  },
  "sil": {
    "name": "SIL",
    "displayTag": "SIL",
    "aliases": [
      "SIL"
    ]
  },
  "google-research": {
    "name": "Google Research",
    "displayTag": "Google Research",
    "aliases": [
      "Google Research"
    ]
  }
};

/**
 * 身份词典：摘要和标题里出现的公司，必须在原文里也出现过，否则退回原标题、丢掉摘要（防止模型张冠李戴）。
 * 行业没有这个问题时可以留空数组。
 */
export const IDENTITY_LEXICON: ReadonlyArray<{ id: string; name: string; patterns: RegExp[] }> = [
  { id: "unicode", name: "Unicode Consortium", patterns: [/\bUnicode\b/i, /Unicode 联盟|Unicode聯盟|统一码|統一碼/i] },
  { id: "icu", name: "ICU", patterns: [/\bICU\b/i] },
  { id: "ecma", name: "Ecma International", patterns: [/\b(?:ECMA-402|TC39|Ecma International)\b/i] },
  { id: "csswg", name: "CSSWG", patterns: [/\bCSSWG\b/i] },
  { id: "whatwg", name: "WHATWG", patterns: [/\bWHATWG\b/i] },
  { id: "ietf", name: "IETF", patterns: [/\bIETF\b/i] },
  { id: "iana", name: "IANA", patterns: [/\bIANA\b/i] },
  { id: "chromium", name: "Chromium", patterns: [/\bChromium\b/i] },
  { id: "webkit", name: "WebKit", patterns: [/\bWebKit\b/i] },
  { id: "mozilla", name: "Mozilla / Firefox", patterns: [/\b(?:Firefox|Mozilla)\b/i] },
  { id: "wpt", name: "Web Platform Tests", patterns: [/\b(?:WPT|Web Platform Tests|web-platform-tests)\b/i] },
  { id: "harfbuzz", name: "HarfBuzz", patterns: [/\bHarfBuzz\b/i] },
  { id: "w3c", name: "W3C", patterns: [/\bW3C\b/i] },
  { id: "sil", name: "SIL", patterns: [/\bSIL\b/i] },
  { id: "google-research", name: "Google Research", patterns: [/\bGoogle Research\b/i] },
];

/** 这些域名上的文章，发布方就是对应的公司（托管平台如 GitHub、arXiv 不算）。 */
export const PUBLISHER_DOMAINS: ReadonlyArray<{ entityId: string; domains: readonly string[] }> = [
  {"entityId":"icu","domains":["icu.unicode.org"]},
  {"entityId":"ecma","domains":["ecma-international.org"]},
  {"entityId":"whatwg","domains":["whatwg.org"]},
  {"entityId":"ietf","domains":["ietf.org"]},
  {"entityId":"iana","domains":["iana.org"]},
  {"entityId":"chromium","domains":["chromium.org"]},
  {"entityId":"webkit","domains":["webkit.org"]},
  {"entityId":"mozilla","domains":["mozilla.org"]},
  {"entityId":"wpt","domains":["web-platform-tests.org","wpt.fyi"]},
  {"entityId":"harfbuzz","domains":["harfbuzz.org"]},
  {"entityId":"w3c","domains":["w3.org"]},
  {"entityId":"sil","domains":["sil.org"]},
  {"entityId":"unicode","domains":["unicode.org"]},
];

/** 原文里的这些写法也算提到了对应公司。 */
export const IDENTITY_CONTEXT_ALIASES: ReadonlyArray<{ entityId: string; pattern: RegExp }> = [];

/** Display labels preserve the stored tag identifiers and existing filter URLs. */
export function tagLabel(tag: string): string {
  return TAG_LABELS[tag] ?? tag;
}

const TAG_LABELS: Readonly<Record<string, string>> = {
  "标准与数据": "Standards and data",
  "实现与互操作": "Implementation and interoperability",
  "语言与书写系统": "Languages and writing systems",
  "多语种技术": "Multilingual technology",
  "无障碍与出版": "Accessibility and publishing",
  "教程与观点": "Tutorials and analysis",
  "标准/数据更新": "Standards/data update",
  "实现更新": "Implementation update",
  "互操作问题": "Interoperability",
  "语言需求": "Language requirements",
  "论文/研究": "Research",
  "开源/仓库": "Open source",
  "教程/实践": "Tutorials/practice",
  "评测/基准": "Benchmarks",
  "现象/趋势": "Trends",
  "观点分析": "Analysis",
  "其他": "Other",
  "语言标签": "Language tags",
  "字符编码": "Character encoding",
  "排版": "Typography",
  "字体/塑形": "Fonts/shaping",
  "双向文本": "Bidirectional text",
  "分词/断行": "Segmentation/line breaking",
  "输入法": "Input methods",
  "本地化": "Localization",
  "低资源语言": "Low-resource languages",
  "AI多语种": "Multilingual AI",
  "语音": "Speech",
  "无障碍": "Accessibility",
  "数字出版": "Digital publishing"
};
