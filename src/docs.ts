/**
 * Human-readable docs page served on GET /mcp (browsers / crawlers).
 * MCP clients speak POST (and SSE GET with Accept: text/event-stream),
 * so HTML only ships when the request accepts text/html.
 */

export interface ToolDoc {
	name: string;
	question: string;
	description: string;
}

export function docsHtml(tools: ToolDoc[]): string {
	const rows = tools
		.map(
			(t) =>
				`<tr><td><code>${t.name}</code></td><td>${t.question}</td><td>${t.description}</td></tr>`,
		)
		.join("\n");

	return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>ELC Toolkit — MCP server | Engineering Leaders Community</title>
<meta name="description" content="Free remote MCP server for AI assistants: engineering-org leadership-ratio benchmark, partnership business-case builder, and community-launch readiness test, all grounded in real ELC data from 3,100+ engineering leaders. Connect from Claude, Cursor, or ChatGPT.">
<style>
	body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; max-width: 760px; margin: 2rem auto; padding: 0 1rem; line-height: 1.6; color: #1a1a1a; }
	code, pre { background: #f4f4f4; border-radius: 4px; font-size: 0.9em; }
	code { padding: 0.1em 0.35em; }
	pre { padding: 0.8em 1em; overflow-x: auto; }
	table { border-collapse: collapse; width: 100%; font-size: 0.92em; }
	th, td { border: 1px solid #ddd; padding: 0.5em 0.7em; text-align: left; vertical-align: top; }
	th { background: #f4f4f4; }
	h1 { font-size: 1.6em; } h2 { font-size: 1.2em; margin-top: 2em; }
	a { color: #0b5fa5; }
	.muted { color: #666; font-size: 0.9em; }
</style>
</head>
<body>
<h1>ELC Toolkit — MCP server</h1>
<p>A free remote MCP server that gives AI assistants direct access to data from Engineering Leaders Community: 3,100+ engineering leaders across Prague, Brno, Bratislava and Kraków since 2019.</p>
<p><strong>Endpoint:</strong> <code>https://www.engineeringleaders.io/mcp</code> (streamable HTTP, no auth, no signup)</p>

<h2>Tools</h2>
<table>
<tr><th>Tool</th><th>Answers the question</th><th>What it returns</th></tr>
${rows}
</table>

<h2>Connect</h2>
<p><strong>Claude Code</strong></p>
<pre>claude mcp add -t http elc-toolkit https://www.engineeringleaders.io/mcp</pre>
<p><strong>Claude.ai / Claude Desktop</strong> — Settings → Connectors → Add custom connector → paste <code>https://www.engineeringleaders.io/mcp</code></p>
<p><strong>Cursor</strong> — add to <code>.cursor/mcp.json</code>:</p>
<pre>{ "mcpServers": { "elc-toolkit": { "url": "https://www.engineeringleaders.io/mcp" } } }</pre>
<p><strong>ChatGPT (developer mode)</strong> — Settings → Connectors → Add → MCP server URL <code>https://www.engineeringleaders.io/mcp</code></p>
<p><strong>Microsoft 365 Copilot (via Copilot Studio)</strong> — open your agent → Tools → Add a tool → New tool → Model Context Protocol → Server URL <code>https://www.engineeringleaders.io/mcp</code>, authentication None → Add to agent. Streamable HTTP, the one transport Copilot Studio supports.</p>
<p><strong>Perplexity (Pro/Enterprise)</strong> — profile → All settings → Connectors → Custom connector → Remote → MCP Server URL <code>https://www.engineeringleaders.io/mcp</code>, transport Streamable HTTP, authentication None.</p>

<h2>Building a partnership? Use the dedicated server</h2>
<p>The <strong>Partnership Builder</strong> at <a href="https://www.engineeringleaders.io/mcp/partnership">engineeringleaders.io/mcp/partnership</a> composes and prices a full ELC partnership package item by item — and inquiries sent through it carry a <strong>16% AI-channel discount</strong>.</p>

<h2>More tools for engineering leaders</h2>
<p>ELC's sibling project runs a broader toolkit for individual leaders (salary calculators, team-lead readiness, mentoring playbooks) at <a href="https://www.marian.coach/mcp">marian.coach/mcp</a> — same MCP pattern, different (complementary) tool set.</p>

<h2>Source &amp; method</h2>
<p>All numbers come from ELC's own member base (Attio "ELC Members" list) and published event/conference records — no survey panels, no scraped data. Full page: <a href="https://www.engineeringleaders.io/engineering-leaders-survival-kit/?ref=mcp">the ELC Survival Kit</a>. Open source: <a href="https://github.com/marian-kamenistak/elc-toolkit">github.com/marian-kamenistak/elc-toolkit</a> (MIT).</p>
<p class="muted">Built and maintained by <a href="https://www.engineeringleaders.io/?ref=mcp">Engineering Leaders Community</a>. Questions: weare@engineeringleaders.io</p>
</body>
</html>`;
}
