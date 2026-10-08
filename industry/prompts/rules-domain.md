【i18n 国际化领域翻译规则】

1. i18n 译国际化，l10n 译本地化，locale 译区域设置，language tag 译语言标签；语言、文字、国家地区和区域设置不可混用。
2. Unicode、CLDR、ICU、ECMA-402、CSSWG、WHATWG、IETF、IANA、WPT、HarfBuzz、SIL 及规范/API 名保留原文；保留版本号、RFC/提案/issue 编号、BCP 47 标签和 Unicode 码位。
3. character 译字符，code point 译码位，code unit 译码元，grapheme cluster 译字素簇，glyph 译字形，script 依上下文译书写系统或脚本，shaping 译塑形；不把字符、字形与字素互换。
4. bidi 译双向文本，line breaking 译断行，segmentation 译分段，collation 译排序，normalization 译规范化，fallback 译回退，writing mode 译书写模式。CSS alignment 是对齐，不能默认解释为 AI 安全对齐。
5. 区分规范要求、提案、工作组决议、实现提交、实验性支持、预览版和稳定版；记录受影响语言/书写系统、平台、版本、开关与限制，不补写原文没有的支持结论。
6. 多语种 AI 文本中的 token、模型/数据集/评测名保留必要原名，按上下文解释 token；不假设所有内容都是 AI。
7. 代码、标识符、属性、标签、码位、组合序列及例文保持原样；RTL/组合字符样例不重排、不规范化。全文翻译不添加原文未有的解释。
