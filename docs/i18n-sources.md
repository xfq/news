# i18n 信源配置与覆盖边界

`industry/sources.json` 配置了 17 个官方入口，均只展示摘要和原文链接，不开放站内或 RSS 全文。广泛的官方博客仍由 i18n 预筛和评分筛掉无关消息，订阅本身不代表内容会入选。

## 已配置入口

2026-10-07 直接请求下列官方地址，均返回 HTTP 200，并核对了 RSS/Atom 条目或 JSON 的标题、原文链接和日期字段。未启动 worker、模型或生产采集。

| 覆盖 | 官方入口 | 配置边界 |
| --- | --- | --- |
| Unicode | [Unicode Blog](https://blog.unicode.org/feeds/posts/default?alt=rss) | 标准与组织公告；emoji 消息由编辑规则排除 |
| CLDR | [CLDR Releases](https://api.github.com/repos/unicode-org/cldr/releases) | 正式版与预发布；不是所有数据变更 |
| ICU | [ICU Releases](https://api.github.com/repos/unicode-org/icu/releases) | 正式版与预发布；不是逐条缺陷跟踪 |
| ECMA-402 | [ECMA-402 Commits](https://api.github.com/repos/tc39/ecma402/commits?per_page=30) | 合并的规范变动；含低价值编辑性提交，待评判 |
| CSSWG | [CSS WG Blog](https://www.w3.org/blog/CSS/feed/) | 规范公告与工作组记录；不覆盖全部 GitHub issues |
| WHATWG | [WHATWG Blog](https://blog.whatwg.org/feed) | 官方博客更新较少；不覆盖 Living Standard 的全部变动 |
| IETF | [IETF Blog](https://www.ietf.org/blog/feed/) | 广泛组织博客；不等于语言相关 Internet-Draft 与 RFC 的完整订阅 |
| IANA | [IANA News](https://www.iana.org/news.atom) | 官方公告；不等于 Language Subtag Registry 的逐项变动 |
| Chromium | [Chromium Blog](https://blog.chromium.org/feeds/posts/default?alt=rss) | 官方发布博客；不等于 Chromium issue tracker |
| WebKit | [WebKit](https://webkit.org/feed/) | 官方发布和技术文章 |
| Firefox | [Mozilla Hacks](https://hacks.mozilla.org/feed/) | 官方开发者博客，覆盖 Firefox；不等于 Bugzilla |
| WPT | [WPT CSS Text Commits](https://api.github.com/repos/web-platform-tests/wpt/commits?path=css/css-text&per_page=30) | 已合并 CSS 文本测试变动；不覆盖全仓库测试结果 |
| HarfBuzz | [HarfBuzz Releases](https://api.github.com/repos/harfbuzz/harfbuzz/releases) | 塑形引擎发布说明 |
| W3C Language Enablement | [W3C Internationalization Activity](https://www.w3.org/blog/international/feed/) | 国际化活动、语言需求与文档更新；不等于全部语言项目的 gap issues |
| SIL | [SIL Language Technology](https://software.sil.org/feed/) | 字体、输入及语言技术；不是 SIL 全组织新闻 |
| 无障碍、数字出版 | [W3C Blog](https://www.w3.org/blog/feed/) | 跨工作组公告；广泛内容需通过 i18n 编辑标准 |
| AI 多语种、语音 | [Google Research](https://research.google/blog/rss/) | 研究博客；普通翻译新品与无关 AI 研究不入选 |

GitHub JSON 配置使用项目支持的 `json_api` 模式。发布条目取 `name`/`tag_name`、`body`、`published_at`、`html_url`；提交条目取 `commit.message`、`commit.committer.date`、`html_url`。实际响应含可用条目与日期。提交日期只表示提交时间，不能当成浏览器已发布或规范已批准的时间。

## 还需决定和补接的范围

- 各书写系统社区没有一个统一入口。需要使用者决定优先语言、书写系统，以及愿意跟踪的社区与负责人；目前不擅自配置个人账号。
- 跨浏览器不一致和语言排版、输入缺陷通常首先出现在 Chromium/WebKit/Bugzilla、WPT 测试结果与 W3C Language Enablement issue tracker。现有博客和 WPT CSS Text 提交只是基础覆盖，不能称为完整缺陷监测。需要决定仓库、标签、组件和测试路径，再配置官方列表或外部推送。
- WHATWG Living Standard 变更、CSSWG/ECMA-402 尚未合并的能力缺口、IETF 语言相关草案、IANA Language Subtag Registry 增量尚未接入。不能用组织新闻订阅替代这些变更；应先确定追踪对象和更新含义，再接入。
- AI 多语种和语音目前由 Google Research 提供基础趋势覆盖；是否增加其他研究机构与具体语言的评测入口，由使用者决定。

这些入口没有臆造 RSS 或不经核对的网页选择器。SIL 的 `https://www.sil.org/news` 实测为 404，因此采用已核对的 SIL Language Technology 订阅。

## 导入与验证

种子文件只补充数据库中不存在的 ID，既有配置不会覆盖，旧 AI 信源也不会自动停用。已有部署应在后台暂停旧 AI 信源，检查这些 i18n 信源，再决定采集启用；本次没有改数据库或开关。

17 条配置均通过 `assertSupportedConfig`，全文开关均为 `false`。安装项目依赖后，使用已经下载的官方响应，离线运行项目实际的 `fetchRss` 与 `fetchJsonList` 解析器：17 条信源全部成功，共解析 1,111 条条目，均有标题、HTTP(S) 原文链接和有效发布时间。验证时替换列表读取为本地响应，并禁止外部 `fetch`，没有外联、启动 worker 或写数据库。这证明当前响应能被解析，不代表已完成生产采集或后续精选流程。CDP 前置检查显示 Chrome 未连接，公开内容采用直接 HTTP 核对，无需登录。

## 2026-10-08 新增

- [The Type](https://www.thetype.com/) → [RSS](https://www.thetype.com/feed/)，T2，关注中文书写系统、字体与排版；其其他设计内容仍经过国际化预筛。
- [W3C Internationalization 的 webi18n 账号](https://w3c.social/@webi18n) → [RSS](https://w3c.social/@webi18n.rss)，T1_5，归属 W3C，避免与 W3C 博客重复计算组织热度。

两个订阅均直接取得 HTTP 200 并核对 RSS 条目。信源总数为 19，新增两源继续关闭站内全文与全文 RSS。

实际运行验证：The Type 首轮采集成功，入库 8 条；W3C webi18n 的 RSS 在本机和容器原生请求均返回 200，但项目正式采集器连续出现 `UND_ERR_CONNECT_TIMEOUT`，暂未入库，信源保留启用并按现有调度重试。未绕过网络安全检查。新增配置通过配置检查及 `npm run typecheck`。
