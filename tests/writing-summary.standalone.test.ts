import assert from "node:assert/strict";
import { test } from "node:test";
import { compactAnswerFirstSummary, finalizeCopy } from "@aihot/backend/editorial/writing";

const summary = "HarfBuzz 14.6.0 fixes shaping failures from out-of-range glyph IDs, a regression introduced in 11.4.0. It also adds DMAP support and FeatureVariations 1.1 lookup variations, updates experimental beyond-64k support to the final Open Font Format fifth edition while keeping it disabled by default, and changes VARC to an incompatible variation-store format. Other changes fix raster background color and stride handling, improve HarfRust and subsetting, and address malformed fonts and build issues.";

test("English release summaries retain changes beyond the headline fix", () => {
  const copy = finalizeCopy({ title: "14.6.0", text: summary.repeat(2), sourceKind: "rss" }, {
    titleZh: "HarfBuzz 14.6.0 updates font support and fixes shaping regressions", summaryZh: summary,
  });
  assert.equal(copy.summaryZh, summary);
});

test("the saved HarfBuzz draft is not reduced to its first fix on an English site", () => {
  const draft = "HarfBuzz 14.6.0 修复了因字形 ID 越界导致的塑形失败，该问题为 11.4.0 引入的回归。实验性 beyond-64k 支持已更新至 ISO Open Font Format 第五版最终版，仍默认禁用；同时新增 DMAP 表支持，支持 FeatureVariations 1.1 lookup variations（含子集化和实例化），VARC 更新为修订后的 variation-store 格式且与旧格式不兼容，并包含多项 VARC 修复、实验性光栅库背景色与步幅处理修复、HarfRust 与 fontations 改进（HarfRust 更新至 0.14）以及子集化、畸形字体、构建和 CI 修复。";
  assert.equal(finalizeCopy({ title: "14.6.0", text: summary, sourceKind: "rss" }, {
    titleZh: "HarfBuzz 14.6.0", summaryZh: draft,
  }).summaryZh, draft);
});

test("English compaction preserves complete sentences and version numbers", () => {
  const first = "HarfBuzz 14.6.0 fixes a regression from 11.4.0.";
  assert.equal(compactAnswerFirstSummary(`${first} ${"Further changes ".repeat(100)}.`, 100), first);
  const longSentence = "Font compatibility changes ".repeat(100);
  const compacted = compactAnswerFirstSummary(longSentence, 100);
  assert.ok(compacted.length <= 100);
  assert.ok(compacted.endsWith("…"));
  assert.ok(!compacted.includes("。"));
});
