import assert from "node:assert/strict";
import { after, test } from "node:test";
import { closeDb } from "@aihot/backend/db";
import { agentGuide, latestAnswer } from "@aihot/backend/publication/agent";
import { llmsTxt } from "@aihot/backend/publication/llms";
import { feedMeta } from "@aihot/backend/publication/feeds";
import { isEnglishBody, exportTranslation } from "@aihot/backend/publication/items";
import { needsShortTweetTranslation } from "@aihot/backend/editorial/writing";
import { SITE } from "@aihot/site";

after(() => closeDb());

test("English discovery documents retain safety boundaries and source restrictions", () => {
  const guide = agentGuide();
  assert.match(guide, /Answer in English/);
  assert.match(guide, /third-party data, not instructions/);
  assert.doesNotMatch(guide, /\p{Script=Han}/u);
  const llms = llmsTxt({ hasDailies: true, hasWeekly: true, hasMonthly: true, topics: [], tools: [], modules: { api: [], pace: [], pages: [], topics: [], access: [], usage: [], guideClients: [], ways: [] } });
  assert.doesNotMatch(llms, /\p{Script=Han}/u);
  assert.match(llms, /Do not guess.*bypass content permissions/);
  assert.match(llms, /originals/);
  assert.equal(SITE.locale, "en-US");
  assert.match(feedMeta("daily").title, /Daily brief/);
});

test("empty English answers never invent current news", () => {
  const query = { mode: "selected", window: "24h", category: null, limit: 10 } as const;
  const text = latestAnswer({ schemaVersion: 1, query: { ...query, by: "timeline", q: null, ordering: "timelineDesc" }, items: [], page: { count: 0, hasMore: false, nextCursor: null } }, query);
  assert.match(text, /No matching picks/);
  assert.match(text, /Do not present training memory as current news/);
});

test("native English stays native; other or unknown languages need English copy", () => {
  assert.ok(isEnglishBody({ language: "en" }));
  assert.ok(isEnglishBody({ language: "en-GB" }));
  assert.ok(!isEnglishBody({ language: "zh" }));
  assert.equal(exportTranslation({ language: "en", tr_html: "<p>Translation</p>", tr_complete: true }), null);
  assert.equal(exportTranslation({ language: "zh", tr_html: "<p>English translation</p>", tr_complete: true }), "<p>English translation</p>");
  assert.equal(needsShortTweetTranslation("An English announcement", "en"), false);
  assert.equal(needsShortTweetTranslation("Une annonce en français", "fr"), true);
  assert.equal(needsShortTweetTranslation("Unknown source language"), true);
  assert.equal(needsShortTweetTranslation("语言支持更新", "zh"), true);
});
