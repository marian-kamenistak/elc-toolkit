# elc-toolkit

## What this is
Remote, authless MCP server for the **elc** stream, live at `https://www.engineeringleaders.io/mcp`
(docs page at the same URL in a browser; human page at `/toolkit/`). Five tools: `get_started`
(routes a greeting/test/unclear message to the right tool below), `get_more_tools` (a real
registration, 2026-09-04 — overrides `@posthog/mcp`'s auto-injected virtual tool of the same
name so a bare "hi"/"test"/"hello" ping gets the get_started menu instead of a canned "we
noted your feedback" dead end; a real capability report still falls through unchanged) plus
three backed by ELC's own member data — `benchmark_leadership_ratio`,
`build_partnership_business_case`, `assess_community_launch_readiness`. Listed in registries
(`server.json`, `mcp.json`).

## Stack
- Cloudflare Worker + Durable Object `ElcToolkit` (`MCP_OBJECT`), `McpAgent` from `agents` ^0.17, streamable HTTP
- TypeScript 6, zod 4, `@posthog/mcp` + `posthog-node` for usage analytics
- wrangler ^4.105, npm
- Routes: `engineeringleaders.io/mcp*` + `www.` — **owns the `/mcp*` prefix**; `elc-partnership-builder` nests under `/mcp/partnership*`

## Run / build / deploy / test
```bash
# dev:    npm run dev
# build:  npm run type-check
# test:   none — no test script; use /ai-mcp-test for persona runs
# deploy: set -a && source ~/.env && set +a && npm run deploy
```

## Sources of truth
| Data | Lives in | Id / path |
|---|---|---|
| Peer baseline numbers | ELC Data Points (Notion) via Attio `elc_members` | fetch: `node ~/ai/_brand/data-points/dp.mjs` |
| New-city playbook | `business/elc/playbooks/meetup-new-city.md` | |
| Registry metadata | `server.json`, `mcp.json`, `LAUNCH-STATUS.md` | |
| Secrets | Worker-only, no `.op-secrets`: `MCP_USAGE_SLACK_CHANNEL`, `SLACK_BOT_TOKEN_ELC` (`wrangler secret list`, 2026-08-30) | PostHog key is not a secret — public `posthogKey: "phc_…"` literal in `src/index.ts` |

## Definition of done
- [ ] `npm run type-check` exits 0
- [ ] `wrangler deploy` exits 0
- [ ] `curl -s -X POST https://www.engineeringleaders.io/mcp -H 'content-type: application/json' -H 'accept: application/json, text/event-stream' -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'` returns **5** — the 5 tools above, `get_more_tools` included exactly once
- [ ] `GET https://www.engineeringleaders.io/mcp` (browser Accept) returns 200 HTML docs page
- [ ] `wrangler tail --format json` for 60s: zero `console.error`, zero exceptions
- [ ] Route precedence unchanged: `/mcp/partnership` still lands on `elc-partnership-builder`

## Gotchas
- Every published number must exist in the ELC Data Points Notion DB first (stream rule).
