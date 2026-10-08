import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import * as cheerio from "cheerio";
import { chromium } from "@playwright/test";
import { englishFixtureApi } from "./english-fixtures.ts";
import { startWebServer, type WebServer } from "./web-server.ts";
import { monthDay, relativeTime, weekdayShort } from "../app/lib/format.ts";
import { parseCopyFile, renderMarkdown } from "../app/lib/markdown.ts";

let web: WebServer;
before(async () => { web = await startWebServer(englishFixtureApi()); });
after(async () => { if (web) await web.stop(); });

test("English dates retain the edition's calendar and use English units", () => {
  assert.equal(monthDay("2026-10-08"), "Oct 8");
  assert.equal(weekdayShort("2026-10-08"), "Thu");
  assert.equal(relativeTime("2026-10-08T00:00:00Z", Date.parse("2026-10-09T00:00:00Z")), "1 day ago");
  const doc = parseCopyFile("# Privacy\n\n| Field | Value |\n| Version | 1 |\n\nIntroduction:\n\n> Plain English.\n\n## Storage\n\nFirst line\nsecond line");
  assert.deepEqual(doc.meta, { Version: "1" });
  assert.equal(doc.intro, "Plain English.");
  assert.match(renderMarkdown(doc.body, web.origin).html, /First line second line/);
});

for (const path of ["/", "/all", "/hot", "/topics", "/about", "/more", "/starred", "/changelog", "/terms", "/privacy", "/agent?tab=mcp", "/agent?tab=rss", "/agent?tab=api", "/daily", "/weekly", "/monthly", "/daily/archive", "/items/english-fixture"]) {
  test(`${path} renders an English public interface`, async () => {
    const response = await fetch(`${web.origin}${path}`);
    assert.equal(response.status, 200, web.logs());
    const $ = cheerio.load(await response.text());
    assert.equal($("html").attr("lang"), "en-US");
    $("script, style").remove();
    assert.doesNotMatch($("body").text(), /\p{Script=Han}/u);
  });
}

test("English screens fit desktop and mobile, and filters remain usable", async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    for (const width of [1440, 390]) {
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      for (const path of ["/", "/about", "/topics", "/daily", "/agent?tab=api"]) {
        await page.goto(`${web.origin}${path}`);
        const fits = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
        assert.ok(fits, `${path} overflows at ${width}px`);
        if (path === "/daily") {
          const plateFits = await page.locator("#report-start svg").evaluate((svg) => svg.getBoundingClientRect().right <= svg.parentElement!.getBoundingClientRect().right + 1);
          assert.ok(plateFits, `Report nameplate is clipped at ${width}px`);
        }
        await page.screenshot({ path: `/private/tmp/news-english-${width}-${path.split("?")[0].replaceAll("/", "") || "home"}.png`, fullPage: true });
      }
      if (width === 390) {
        await page.goto(web.origin);
        await page.getByRole("button", { name: "Filters", exact: true }).click();
        assert.ok(await page.getByRole("link", { name: "Standards and implementation", exact: true }).isVisible());
      }
      await page.close();
    }
  } finally { await browser.close(); }
});
