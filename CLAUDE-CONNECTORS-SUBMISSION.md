# Anthropic Claude Connectors Directory — submission packet

Internal file, gitignored. Prepared 2026-08-04 for Marian to submit via
Claude.ai → admin settings → Connectors → Submit (claude.com/docs/connectors/building/submission).
This is a self-serve form followed by Anthropic's human/functional review — no API path exists,
has to be you, logged in as org admin.

## How to submit — step by step

1. Log into **claude.ai** with the account that is an **admin on a Team or Enterprise org**
   (a free/Pro personal account cannot submit — the submission form only appears for org admins).
   If ELC doesn't have a Claude Team/Enterprise workspace yet, that's the actual first blocker —
   stop here and set one up before anything else in this list matters.
2. Go to **Settings → Connectors** (org-level settings, not your personal account settings).
3. Click **Submit a connector** (or **Add connector → Submit for directory**, wording moves
   between Anthropic UI revisions — look for "submit"/"directory"/"review" near Connectors).
4. Fill the form using the copy-paste values in the sections below, in this order: URL →
   tagline → description → auth → ownership verification → privacy policy → docs URL → example
   prompts.
5. Anthropic runs an automated functional test against the live endpoint as part of review —
   this is why the endpoint must already be live and correct before you submit (it is: verified
   200 above). If review flags anything, it comes back as feedback on the submission, not a hard
   reject — fix and resubmit.
6. After submitting: do not publish "listed in the Claude Connectors Directory" or "approved by
   Anthropic" anywhere until you see it actually listed — see the Marketing rule at the bottom of
   this file for what you CAN say while it's pending.
7. Update `LAUNCH-STATUS.md` in this repo once submitted (date + status), and again once it goes
   live or comes back with review feedback.

**One thing I can't verify for you from here:** Cloudflare's Bot Fight Mode / Security Level
setting on this zone — my API token doesn't have Zone Settings read scope, so I can't confirm
it's off from the CLI. Custom WAF rules are clean (checked via the Rulesets API — no rule beyond
Cloudflare's standard managed sets, nothing blocking `/mcp`), so the residual risk is low, but a
30-second manual check is still worth doing before or right after you submit: Cloudflare
dashboard → engineeringleaders.io → Security → Bots — confirm Bot Fight Mode is off (or that
`/mcp*` is excluded), since a false positive there would fail Anthropic's automated functional
test in a way that looks identical to a real server bug.

## Form fields, copy-paste ready

**MCP Server URL:** select "Universal URL", enter:
```
https://www.engineeringleaders.io/mcp
```

**Tagline** (max 55 chars, 54 used):
```
Leadership, partnership and launch benchmarks from ELC
```

**MCP Server Description** (50-100 words, 80 used):
```
ELC Toolkit gives your AI agent direct access to real data from Engineering Leaders Community: 3,300+ engineering leaders across Prague, Brno, Bratislava and Kraków. Three tools: a leadership-ratio benchmark comparing your org's manager-to-senior-IC split against ELC's own member composition, a partnership business-case builder with real reach numbers and a forwardable approval email, and a community-launch readiness test built from the actual playbook ELC used to open its Brno, Bratislava and Kraków chapters. No authentication, no data collection, no invented numbers.
```

**Authentication:** None (public, read-only, no user data touched)

**Ownership verification:** domain is engineeringleaders.io — same domain you already control for
the GitHub repo, official MCP registry (DNS TXT verified), Smithery listing, etc. Bring one of
those as proof if the form asks.

**Privacy policy URL:**
```
https://www.engineeringleaders.io/privacy/
```
Already live, covers GDPR for website visitors/conference participants/speakers/partners, real
contact (weare@engineeringleaders.io). The MCP server itself collects nothing beyond normal HTTP
request logs, so the existing site-wide policy is accurate as-is — no separate MCP addendum
needed, it doesn't contradict anything the server actually does.

**Documentation URL:**
```
https://www.engineeringleaders.io/mcp
```
Same URL as the server endpoint — GET requests with an HTML Accept header serve human-readable
docs (tool list, connect snippets), so this single URL satisfies both fields.

## Use cases + examples (minimum 3, multi-step where possible)

**Example 1 — multi-tool orchestration (leads with this one):**
> Prompt: "My engineering org has 10 managers and 3 senior ICs out of a 40-person team — is that a
> healthy ratio? Also, I'm thinking about partnering with Engineering Leaders Community mainly
> for hiring. Build me the internal case."
>
> What fires: `benchmark_leadership_ratio` (managers: 10, senior_ics: 3) → verdict on whether the
> org is top-heavy vs the ELC peer baseline, then `build_partnership_business_case` (goal: hiring)
> → real reach numbers + a forwardable approval email. Two tools, one coherent conversation.

**Example 2 — questionnaire flow:**
> Prompt: "We're thinking about starting a CTO meetup in our city. Are we ready?"
>
> What fires: `assess_community_launch_readiness` called first with no arguments (returns the 5
> yes/no questions), then called again once the user answers them, returning a verdict + specific
> gaps to close first.

**Example 3 — straight business case:**
> Prompt: "Our VP wants to know if sponsoring Engineering Leaders Community is worth it for brand
> awareness. Draft something I can forward to get budget approved."
>
> What fires: `build_partnership_business_case` (goal: brand_awareness) → real reach numbers
> (3,300+ members, 120+/meetup, 500+ conference attendees, 74% newsletter open rate) framed to
> that goal, plus a ready-to-send email.

## Pre-submission checklist (the actual failure points reviewers flag)

- [x] Every tool annotated read-only (all 3 are `readOnlyHint: true, destructiveHint: false,
      idempotentHint: true, openWorldHint: false` in `src/index.ts`)
- [x] Public privacy policy, not missing/incomplete
- [x] Public docs URL with real content (not a stub)
- [x] 3+ example prompts, at least one multi-step
- [x] No OAuth to misconfigure — nothing to fail on token-endpoint format or WAF-blocked discovery
- [x] Responses are small and scoped (a few hundred words max per tool call), not unfiltered dumps
- [x] Error messages are actionable (e.g. "no data" case names exactly what's missing) — see
      `benchmark_leadership_ratio`'s zero-headcount guard in `src/leadership-ratio.ts`
- [ ] **Not yet checked:** whether Cloudflare's WAF/bot-fight settings on engineeringleaders.io
      block Anthropic's review crawler. Worth a quick look at Cloudflare's Security settings
      before submitting — if Bot Fight Mode or a challenge is on for `/mcp*`, Anthropic's
      functional-test pass could fail the exact way their own docs warn about ("OAuth discovery
      working in browser but failing from Claude due to WAF blocking Anthropic egress" — same
      failure class applies to the initial fetch even without OAuth).

## Marketing rule while pending

Anthropic's policy: you can say "works with Claude" or "built to the directory's technical
requirements" before approval, but not "listed in" or "approved by" Anthropic until it's real.
Keep any announcement copy in that lane until the review clears.
