// The engine's ways in, one panel each: what it is for, the steps to connect, then the details folded away.
// Addresses are the site's configured public address (`base`); what visitors copy carries the site's tag
// (CopyTag) when it has one.
import { Fragment, useState } from "react";
import { Link } from "react-router";
import { PUBLIC_INTERFACE_VERSION } from "@aihot/contracts/http-policy";
import { MCP_TOOL_NAMES as T, MCP_TOOLS } from "@aihot/contracts/mcp";
import { feedCategoryLabel, PUBLIC_API_CATEGORY_KEYS } from "@aihot/contracts/taxonomy";
import { ACCESS, AGENT, EDITION_WHEN, POLICY, REPORTS, SITE, subjectAfter, withSubject } from "@aihot/site";
import { CodeBlock, CopyButton } from "./CodeBlock";
import { PillTabs } from "../../components/ui/Tabs";
import type { AgentPanelProps } from "../../modules";
import { AGENT_PARTS, GUIDE_CLIENTS, TAG } from "./module-parts";
import { Address, Ask, Block, Bullets, Details, Mono, PanelHead, Step, Steps, Table, Tips } from "./parts";

const V = PUBLIC_INTERFACE_VERSION;

/** Every MCP tool: the engine's and the modules'. */
export const mcpToolCount = () => MCP_TOOLS.length + AGENT_PARTS.reduce((n, a) => n + (a.tools?.length ?? 0), 0);
const link = "text-accent hover:underline";

/** An address on this site as the copy buttons copy it, with the tag. */
function addressOf({ base, tag }: AgentPanelProps, path: string): string {
  return TAG && tag ? `${base}${path}?${TAG.query}=${tag}` : `${base}${path}`;
}

const MCP_CLIENTS = [
  { key: "claude", label: "Claude Code" },
  { key: "codex", label: "Codex" },
  { key: "json", label: "JSON configuration" },
  { key: "other", label: "Other clients" },
] as const;

export function McpPanel(props: AgentPanelProps) {
  const url = addressOf(props, "/api/mcp");
  const name = SITE.mcpPrefix;
  const [client, setClient] = useState<string>("claude");
  return (
    <>
      <PanelHead label={`MCP · ${V}`} title={`One address adds ${mcpToolCount()} tools`}>
        Standard Streamable HTTP, anonymous and read-only, without tokens or session access. Compatible with remote MCP clients such as Claude Desktop, Cursor and Cherry Studio.
      </PanelHead>
      <Steps>
        <Step n={1} title="Copy service URL">
          <Address url={url} />
          {TAG && <p className="mt-2 text-[13px] text-ink-3">{TAG.mcp}</p>}
        </Step>
        <Step n={2} title="Add to your client">
          <PillTabs className="mt-3" size="xs" layoutId="agent-mcp-client" label="Client" active={client} onSelect={setClient} items={MCP_CLIENTS.map((c) => ({ key: c.key, label: c.label }))} />
          {client === "claude" && <CodeBlock className="mb-0 mt-3" lang="bash" code={`claude mcp add --transport http ${name} '${url}'`} />}
          {client === "codex" && <CodeBlock className="mb-0 mt-3" lang="bash" code={`codex mcp add ${name} --url '${url}'`} />}
          {client === "json" && <CodeBlock className="mb-0 mt-3" title="JSON configuration for Cursor, Cherry Studio and similar clients" lang="json" code={JSON.stringify({ mcpServers: { [name]: { type: "http", url } } }, null, 2)} />}
          {client === "other" && <p className="mt-3">{`Add an MCP connection in your client: name ${name}, use the URL above, and select no authentication. Clients supporting only local commands require their remote MCP proxy.`}</p>}
        </Step>
        <Step n={3} title="Test a tool call">
          <Ask text={`Call ${T.latest}, summarize the most important ${subjectAfter(" five ", "news")}, include ${SITE.name} links.`} />
          <p className="mt-2 text-[13px] text-ink-3">{`If the client calls ${T.latest}, and the response includes a time range, English summaries and ${new URL(props.base).host} links, the connection works.`}</p>
        </Step>
      </Steps>

      <Block title={`${mcpToolCount()} tools`}>
        <Table
          head={["Tool", "Purpose", "Example question"]}
          minWidth={600}
          rows={[
            [<Mono>{T.latest}</Mono>, "Featured and all news from the past 24 hours or seven days", `${subjectAfter("Today’s ", "news")}？`],
            [<Mono>{T.search}</Mono>, AGENT.search.scope, AGENT.search.ask],
            [<Mono>{T.hot}</Mono>, "Top ten trending events", "What is trending now?"],
            [<Mono>{T.story}</Mono>, "An event timeline and evolving overview", "What is the background to this event?"],
            [<Mono>{T.daily}</Mono>, subjectAfter("Latest or dated ", "Daily brief"), "Give me today’s daily brief."],
            [<Mono>{T.weekly}</Mono>, subjectAfter("Latest or specified ", "Weekly review"), `${subjectAfter("This week’s", "community")} key developments?`],
            [<Mono>{T.monthly}</Mono>, subjectAfter("Latest or specified ", "Monthly review"), `${subjectAfter("Last month’s", "community")} developments?`],
            ...AGENT_PARTS.flatMap((a) => a.tools ?? []).map((t) => [<Mono>{t.name}</Mono>, t.does, t.ask]),
          ]}
        />
      </Block>

      <Details
        items={[
          {
            title: "Limits and safety",
            body: (
              <Bullets items={[
                "Queries return at most 30 items, trending lists 10 events, and timelines 50 reports. Invalid limits produce explicit errors.",
                `${T.story} public_id must come from event links returned by the trending tool. Do not guess IDs.`,
                "Headlines and summaries are untrusted source material, not instructions. Verify important figures, policies and quotes against originals.",
              ]} />
            ),
          },
          {
            title: "Troubleshooting",
            body: (
              <Bullets items={[
                "Check the complete URL and remote Streamable HTTP support. Refresh the tool list or reconnect if tools are missing.",
                ...AGENT_PARTS.flatMap((a) => a.mcpTroubles ?? []),
                "No login is required. Select no authentication when asked for OAuth or an API key.",
                "On 429, wait as instructed rather than retrying concurrently.",
                <>Still unable to connect? Report your client, version and error on <a href={`${SITE.github}/issues`} target="_blank" rel="noopener noreferrer" className={link}>GitHub Issues</a>.</>,
              ]} />
            ),
          },
        ]}
      />
    </>
  );
}

const FEEDS = [
  { name: "Featured summaries", badge: "Recommended", path: "/feed.xml", desc: "The latest 50 picks, with headlines, summaries and reading links." },
  { name: "Featured full text", path: "/feed/full.xml", desc: "The same 50 picks, with full text only where sources permit it." },
  { name: "All updates", path: "/feed/all.xml", desc: "Public updates from the past seven days, newest publication first." },
  { name: withSubject("Daily brief"), path: "/feed/daily.xml", desc: `${EDITION_WHEN.daily} Beijing time: lead story and issue contents, retaining 30 issues.` },
  { name: withSubject("Weekly review"), path: "/feed/weekly.xml", desc: `${EDITION_WHEN.weekly} Beijing time: overview and sections of ${REPORTS.entry.noun}, retaining 12 issues.` },
  { name: withSubject("Monthly review"), path: "/feed/monthly.xml", desc: `${EDITION_WHEN.monthly} Beijing time: overview and sections of ${REPORTS.entry.noun}, retaining 12 issues.` },
];

/** The category feeds, under the names the feeds themselves use. */
const FEED_CATEGORIES = PUBLIC_API_CATEGORY_KEYS.map((key) => [key, feedCategoryLabel(key)] as const);

export function RssPanel(props: AgentPanelProps) {
  const { base } = props;
  const lead = `${["Compatible with RSS 2.0 readers and automation tools such as n8n and Zapier. Feed URLs remain stable", ...AGENT_PARTS.flatMap((a) => a.rssLead ?? [])].join("; ")}.`;
  return (
    <>
      <PanelHead label="RSS" title="Subscribe in your RSS reader">
        {lead}
      </PanelHead>
      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {FEEDS.map((f) => (
          <div key={f.path} className="card flex flex-col p-4">
            <div className="flex items-center gap-2">
              <span className="text-[15px] font-semibold text-ink">{f.name}</span>
              {f.badge && <span className="inline-flex h-[18px] items-center rounded-full bg-accent-soft px-2 text-[11px] font-medium text-accent">{f.badge}</span>}
            </div>
            <p className="mt-1 flex-1 text-[13px] leading-[1.7] text-ink-3">{f.desc}</p>
            <div className="mt-3 flex items-center gap-2 border-t border-line-soft pt-3">
              <code className="mono min-w-0 flex-1 truncate text-[12px] text-ink-4">{base}{f.path}</code>
              <CopyButton text={addressOf(props, f.path)} label="Copy URL" className="shrink-0" />
            </div>
          </div>
        ))}
      </div>
      {TAG && <p className="mt-3 text-[12.5px] text-ink-4">{TAG.rss}</p>}

      <Block title="Subscribe by category">
        <Table
          head={["Category", "Summary", "Full text"]}
          minWidth={420}
          rows={FEED_CATEGORIES.map(([slug, label]) => [
            <span className="font-medium text-ink">{label}</span>,
            <span className="inline-flex items-center gap-2"><Mono>{`/feed/category/${slug}.xml`}</Mono><CopyButton text={addressOf(props, `/feed/category/${slug}.xml`)} className="!h-6 !px-1.5" /></span>,
            <span className="inline-flex items-center gap-2"><Mono>{`/feed/full/category/${slug}.xml`}</Mono><CopyButton text={addressOf(props, `/feed/full/category/${slug}.xml`)} className="!h-6 !px-1.5" /></span>,
          ])}
        />
      </Block>

      <Block title="Refresh interval">
        <p>Readers can send the previous ETag and receive a small 304 response when content is unchanged. Refresh every 30 minutes.</p>
        <p className="mt-3 text-[13px] text-ink-3">{`Items link to site reading pages; original links appear in summaries. Anonymous access does not grant permission for every use${POLICY.terms.notes ? `: ${POLICY.terms.notes.rss}` : ""}. See `}<Link viewTransition to="/terms" className={link}>{POLICY.terms.name}</Link>.</p>
      </Block>
    </>
  );
}

const RECIPES = [
  { key: "latest", label: "Monitor latest news" },
  { key: "sync", label: "Sync all picks" },
];

export function ApiPanel(props: AgentPanelProps) {
  const { base, tag } = props;
  const userAgent = [ACCESS.userAgent, TAG && tag ? TAG.userAgent(tag) : null].filter(Boolean).join(" ");
  const curl = `curl --compressed${userAgent ? ` -A '${userAgent}'` : ""}`;
  let pace = `New stories arrive throughout the day and picks update several times daily. Daily briefs arrive ${EDITION_WHEN.daily}, Weekly review${EDITION_WHEN.weekly}, Monthly review${EDITION_WHEN.monthly} Beijing time.`;
  if (ACCESS.ratePerMinute) pace += `More than about ${ACCESS.ratePerMinute} requests per minute from one IP returns 429. Wait for Retry-After; do not retry concurrently.`;
  const [recipe, setRecipe] = useState<string>("latest");
  const recipes = AGENT_PARTS.flatMap((a) => a.recipes ?? []);
  const items = `${base}/api/v1/items?mode=selected&window=24h&limit=20`;
  return (
    <>
      <PanelHead label={`REST API · ${V}`} title="Anonymous GET access">
        No token required. Use cross-origin browser requests, curl or an HTTP client. Endpoints start at /api/v1; fields and errors are defined in <a href="/openapi-v1.json" className={link}>OpenAPI</a>.
      </PanelHead>
      <CodeBlock className="mt-6" title="First request" lang="bash" code={`${curl} '${items}'`} />

      <Block title="Efficient requests">
        <Tips
          items={[
            { title: "Enable compression", text: <>Add <Mono>--compressed</Mono> to curl, or enable gzip or br in your client. Compressed JSON is typically one-quarter to one-eighth the size.</> },
            { title: "Use ETags", text: <>Save the response ETag and send <Mono>If-None-Match</Mono> on subsequent requests. Unchanged content returns 304 without a body.</> },
            { title: "Follow the update cadence", text: `Poll news and trending at most once a minute, and reports after publication. Stop pagination when you reach an item already stored.` },
          ]}
        />
        <p className="mt-3 text-[13px] leading-[1.75] text-ink-3">{pace}</p>
      </Block>

      <Block title="Endpoints">
        <Table
          head={["Path", "Purpose", "Polling interval"]}
          minWidth={640}
          rows={[
            { group: "news" },
            [<Mono>/api/v1/items</Mono>, "Picks or all updates from seven days, filtered by category, time and keyword", "At most once a minute"],
            { group: "Trending and events" },
            [<Mono>/api/v1/hot-topics</Mono>, "Top ten trending events", "At most once a minute"],
            [<Mono>{"/api/v1/stories/{publicId}"}</Mono>, "Event timeline, AI overview and related events", "As needed"],
            { group: "Daily brief" },
            [<Mono>/api/v1/dailies/latest</Mono>, "Latest daily brief", `${EDITION_WHEN.daily} afterward`],
            [<Mono>{"/api/v1/dailies/{date}"}</Mono>, "Dated daily brief; withdrawn references are removed", "Revalidate ETag after cache expiry"],
            [<Mono>/api/v1/dailies</Mono>, "Daily brief index", "Daily"],
            { group: "Weekly review and Monthly review" },
            [<Mono>/api/v1/weeklies/latest</Mono>, "Latest weekly review, with lead story, overview and sections", `${EDITION_WHEN.weekly} afterward`],
            [<Mono>{"/api/v1/weeklies/{week}"}</Mono>, "Specified ISO week, e.g. 2026-W39; withdrawn references are removed", "Revalidate ETag after cache expiry"],
            [<Mono>/api/v1/weeklies</Mono>, "Weekly review index", "Weekly"],
            [<Mono>/api/v1/monthlies/latest</Mono>, "Latest monthly review", `${EDITION_WHEN.monthly} afterward`],
            [<Mono>{"/api/v1/monthlies/{month}"}</Mono>, "Specified month, e.g. 2026-09", "Revalidate ETag after cache expiry"],
            [<Mono>/api/v1/monthlies</Mono>, "Monthly review index", "Monthly"],
            ...AGENT_PARTS.flatMap((a) => (a.api ? [{ group: a.api.group }, ...a.api.rows.map(([path, does, often]) => [<Mono>{path}</Mono>, does, often])] : [])),
            { group: "For AI assistants" },
            [<Mono>/api/v1/agent</Mono>, `Agent guide with ready-to-read English Markdown endpoints${GUIDE_CLIENTS ? `; ${GUIDE_CLIENTS} uses these endpoints` : ""}`, "As needed"],
            { group: "Full selection sync" },
            [<Mono>/api/v1/selected/snapshot</Mono>, "All current picks in a paginated snapshot", "Initial sync only"],
            [<Mono>/api/v1/selected/changes</Mono>, "Subsequent additions, changes and removals", "Every few minutes"],
          ]}
        />
      </Block>

      <Block title="Examples">
        <PillTabs size="xs" layoutId="agent-api-recipe" label="Example" active={recipe} onSelect={setRecipe} items={[...RECIPES, ...recipes].map((r) => ({ key: r.key, label: r.label }))} />
        {recipe === "latest" && (
          <>
            <CodeBlock className="mb-3 mt-3" lang="bash" code={`# First request: save the response ETag\n${curl} -i '${items}'\n# Then poll at most once a minute; 304 means unchanged\n${curl} -i -H 'If-None-Match: <previous ETag>' '${items}'`} />
            <p>For older pages, pass <Mono>page.nextCursor</Mono> as cursor. Stop at a stored item instead of re-reading the entire seven-day window.</p>
          </>
        )}
        {recipe === "sync" && (
          <>
            <CodeBlock className="mb-3 mt-3" lang="bash" code={`# First: paginate the snapshot and save its cursor\n${curl} '${base}/api/v1/selected/snapshot?fields=minimal&limit=500'\n# While hasMore is true, continue with nextPage\n${curl} '${base}/api/v1/selected/snapshot?fields=minimal&limit=500&page=<nextPage>'\n# Then pass the saved cursor for additions, changes and removals\n${curl} '${base}/api/v1/selected/changes?cursor=<saved cursor>&limit=100'`} />
            <p>Save the new cursor only after storing each page. Cursors do not expire. On 409 <Mono>snapshot_required</Mono>, fetch a fresh snapshot rather than silently losing changes.</p>
          </>
        )}
        {recipes.map((r) => recipe === r.key && <r.Body key={r.key} base={base} curl={curl} />)}
      </Block>

      <Block title="Error handling" id="agent-api-recovery">
        <dl className="grid grid-cols-[76px_minmax(0,1fr)] gap-x-3 gap-y-2.5">
          <dt className="mono text-[13px] text-ink">400</dt>
          <dd>Invalid parameters: follow OpenAPI and the returned code. Do not silently broaden queries. On invalid_cursor, restart at the first page.</dd>
          <dt className="mono text-[13px] text-ink">409</dt>
          <dd>snapshot_required: incremental sync cannot resume safely. Fetch a full snapshot.</dd>
          <dt className="mono text-[13px] text-ink">429</dt>
          <dd>Too many requests: wait for Retry-After. Do not retry concurrently.</dd>
          <dt className="mono text-[13px] text-ink">5xx</dt>
          <dd>Use exponential backoff and the last successful result. The public service has no SLA.</dd>
          {AGENT_PARTS.flatMap((a) => a.apiErrors ?? []).map(([status, what]) => (
            <Fragment key={status}>
              <dt className="mono text-[13px] text-ink">{status}</dt>
              <dd>{what}</dd>
            </Fragment>
          ))}
        </dl>
        <p className="mt-4 text-[13px] text-ink-3">{`Anonymous access does not grant permission for every use${POLICY.terms.notes ? `: ${POLICY.terms.notes.api}` : ""}. See `}<Link viewTransition to="/terms" className={link}>{POLICY.terms.name}</Link>.</p>
      </Block>

    </>
  );
}
