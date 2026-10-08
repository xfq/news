import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import type { FeedItemSummary, ReportDetail, ReportKind, SiteItemDetail } from "@aihot/contracts/site";

const at = "2026-10-08T00:00:00Z";
const item: FeedItemSummary = {
  id: "english-fixture", title: "Unicode updates language support data", summary: "New locale data improves multilingual formatting and language support.",
  reason: "The update affects applications using locale-aware formatting.", source: { name: "Unicode Consortium" },
  publishedAt: at, timelineAt: at, category: "standards", tags: ["标准/数据更新", "Unicode"], score: 85, selected: true, channel: "news", x: null,
};
const detail: SiteItemDetail = {
  ...item, x: null, originalTitle: item.title, links: { original: "https://example.org/unicode" }, discoveredAt: at, story: null,
  readingMode: "full", author: null, body: { zh: "<h2>Language support</h2><p>English edition sample article.</p>", original: null, zhKind: "original", complete: true },
  outline: [], relatedStories: [], topics: [], indexable: true, markdownAvailable: true, group: null, hasTranslation: false, bodyLanguage: "zh",
};

export function englishFixtureApi() {
  const topics = JSON.parse(readFileSync(new URL("../../../industry/topics.json", import.meta.url), "utf8"));
  const changelog = JSON.parse(readFileSync(new URL("../../../site/changelog.json", import.meta.url), "utf8"));
  return createServer((req, res) => {
    const url = new URL(req.url!, "http://fixture.local");
    const p = url.pathname;
    res.setHeader("Content-Type", "application/json");
    const send = (value: unknown) => res.end(JSON.stringify(value));
    if (p === "/api/site/meta") return send({ changelogVersion: changelog.latestVersion });
    if (p === "/api/health") return send({ ok: true });
    if (p === "/api/site/changelog") return send(changelog);
    if (p === "/api/site/topics") return send({ ...topics, topics: topics.topics.map((t: object) => ({ ...t, brand: null, total: 1, recent: 1, indexable: true, latest: { title: item.title, at } })) });
    if (p === "/api/site/hot") return send({ computedAt: at, windowHours: 48, entries: [] });
    if (p === "/api/site/search/suggestions") return send({ topics: [], hot: [] });
    if (p === "/api/site/timeline") return send({ filters: { channel: "all", category: null, tag: null }, cards: [{ key: item.id, anchorAt: at, item, group: null }], nextCursor: null, hot: null, dayCounts: { "2026-10-08": 1 } });
    if (p === "/api/site/pool") return send({ filters: { channel: "all", category: null, tag: null, q: null, tab: "time" }, items: [item], page: 1, pageCount: 1, total: 1, todayCount: 1, freshness: at });
    if (p === `/api/site/items/${item.id}`) return send(detail);
    if (p === "/api/site/reports/daily") return send({ kind: "daily", items: [{ key: "2026-10-08", issueNumber: 1, title: item.title, count: 1 }] });
    const match = /^\/api\/site\/reports\/(daily|weekly|monthly)\/latest-page$/.exec(p);
    if (match) {
      const kind = match[1] as ReportKind;
      const report: ReportDetail = { kind, key: kind === "daily" ? "2026-10-08" : kind === "weekly" ? "2026-W41" : "2026-10", issueNumber: 1, title: item.title, generatedAt: at, lead: { title: item.title, leadParagraph: item.summary! }, leadItemId: null, overview: null, highlights: [], sections: [], flashes: [], cover: null, metrics: {}, readingMinutes: 1, prev: null, next: null };
      return send({ report, index: [{ key: report.key, issueNumber: 1, title: report.title, count: 1 }] });
    }
    res.statusCode = 404;
    return send({ code: "not_found" });
  });
}
