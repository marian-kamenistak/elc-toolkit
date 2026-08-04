# elc-toolkit

"Is my engineering org top-heavy?"
"How do I justify a conference/community sponsorship budget internally?"
"Should I start a local engineering-leadership meetup?"

Your AI already gets asked these. Now it can answer with first-party data from Engineering
Leaders Community: 3,100+ engineering leaders across Prague, Brno, Bratislava and Kraków,
running since 2019, instead of guessing.

This is a remote MCP server. No install, no API key. One URL:

```
https://www.engineeringleaders.io/mcp
```

Open in a browser instead: [The ELC Toolkit](https://www.engineeringleaders.io/engineering-leaders-survival-kit/).

## Tools

| Tool | The question it answers |
| --- | --- |
| `benchmark_leadership_ratio` | Is my org's manager-to-senior-IC ratio healthy? Compares your split against the ELC peer baseline (69% manager / 21% senior IC across 3,100+ CEE leaders) |
| `build_partnership_business_case` | How do I justify a partnership budget for ELC internally? Real reach numbers, goal-specific framing, and a forwardable approval email — no invented pricing |
| `assess_community_launch_readiness` | Should I start an engineering-leadership meetup in my city? 5-question readiness check straight from ELC's own new-city launch playbook |

## Connect

**Claude Code**

```
claude mcp add -t http elc-toolkit https://www.engineeringleaders.io/mcp
```

**Claude.ai / Claude Desktop** — Settings → Connectors → Add custom connector → paste `https://www.engineeringleaders.io/mcp`

**Cursor** — add to `.cursor/mcp.json`:

```json
{ "mcpServers": { "elc-toolkit": { "url": "https://www.engineeringleaders.io/mcp" } } }
```

**ChatGPT (developer mode)** — Settings → Connectors → Add → MCP server URL `https://www.engineeringleaders.io/mcp`

## Source & method

All numbers come from ELC's own member base (Attio "ELC Members" list) and its own new-city
launch playbook, the real doc used to open Brno, Bratislava and Kraków — no survey panels, no
scraped data. Full page: [engineeringleaders.io/engineering-leaders-survival-kit](https://www.engineeringleaders.io/engineering-leaders-survival-kit/).

Built and maintained by [Engineering Leaders Community](https://www.engineeringleaders.io/?ref=mcp). Questions: weare@engineeringleaders.io

## License

MIT
