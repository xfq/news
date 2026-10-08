# 行业包

这个行业的知识都在这里：分类、主题、信源、精选标准和门槛。换一个行业，主要就是改这个文件夹和 [`site/`](../site/)（站名、文案、品牌和页面），步骤见 [把它改成你的行业](../docs/customize.md)。

| 文件 | 内容 |
|---|---|
| `taxonomy.ts` | 分类、标签、公司与机构、防止模型写错公司的词表，这个行业最受关注的那类发布（`RELEASE`） |
| `topics.json` | 主题目录（`/topics`），站点启动时读取 |
| `sources.json` | 首次启动时导入的示范信源 |
| `prompts/` | 每一步的提示词：预筛、评分、写作、结构化、归组、事件综述、周报月报、翻译 |
| `selection.ts` | 入选门槛 |
| `gold.example.jsonl` | 精选评测样本的格式示例 |
| `relation-gold.example.jsonl` | 事件关系评测样本的格式示例 |
| `story-digest-eval.example.jsonl` | 事件综述评测案例的格式示例 |

## 当前分类

本站按主题使用三个类别：Standards and implementation（`standards`）、Languages and writing systems（`languages`）、Multilingual technology（`multilingual`）。教程与分析按主题归类，用“教程/实践”和“观点分析”标签标明内容形态。

此次合并只修改分类配置与结构化提示词，不自动改写已存内容。已有 `implementations` 内容应归入 `standards`，`access-publishing` 内容应归入 `languages`，`commentary` 内容需按主题重新归类；历史报告也需检查其已冻结的栏目。对已有数据执行迁移前须由站点使用者确认。
