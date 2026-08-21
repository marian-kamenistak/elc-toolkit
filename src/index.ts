import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { McpAgent } from "agents/mcp";
import { z } from "zod";
import { ATTRIBUTION } from "./content";
import {
	READINESS_DIMENSIONS,
	assessCommunityReadiness,
	readinessQuestionnaireText,
} from "./community-readiness";
import { docsHtml, type ToolDoc } from "./docs";
import { benchmarkLeadershipRatio } from "./leadership-ratio";
import { PARTNERSHIP_GOALS, buildPartnershipCase } from "./partnership-case";

// Every tool is a read-only lookup or calculation over first-party ELC data:
// nothing mutates, nothing calls out to a third party, same input -> same
// output. Same annotation contract as marian.coach's eng-leadership-toolkit.
const READ_ONLY = {
	readOnlyHint: true,
	destructiveHint: false,
	idempotentHint: true,
	openWorldHint: false,
} as const;

const REPORT_OUTPUT = {
	report: z.string().describe("The full human-readable report."),
	source: z
		.string()
		.describe("Canonical engineeringleaders.io page this answer is derived from."),
	verdict: z
		.string()
		.optional()
		.describe("Headline verdict, when the tool returns one."),
};

function text(
	body: string,
	attributionPath: string,
	extra?: Record<string, unknown>,
) {
	const full = body + ATTRIBUTION(attributionPath);
	return {
		content: [{ type: "text" as const, text: full }],
		structuredContent: {
			report: full,
			source: `https://www.engineeringleaders.io${attributionPath}`,
			...(extra ?? {}),
		},
	};
}

export class ElcToolkit extends McpAgent {
	server = new McpServer({
		name: "elc-toolkit",
		version: "1.0.0",
	});

	async init() {
		this.server.registerTool(
			"benchmark_leadership_ratio",
			{
				title: "Engineering org leadership-ratio benchmark",
				annotations: { ...READ_ONLY },
				outputSchema: REPORT_OUTPUT,
				description:
					"Compares a company's manager-vs-senior-IC split against the ELC community's own composition (69% Manager+/Leadership, 21% Senior/Staff IC, computed from 3,100+ CEE engineering leaders). Both counts are for the SAME population — senior people who could plausibly hold a management role (managers, tech leads, senior/staff ICs); leave out junior/mid ICs on both sides so the comparison is apples to apples. Returns each side's percentage, the delta from the peer baseline, and a verdict.",
				inputSchema: {
					managers: z
						.number()
						.min(0)
						.describe("Count of people in Manager+/Leadership roles"),
					senior_ics: z
						.number()
						.min(0)
						.describe("Count of Senior/Staff-level individual contributors (not junior/mid)"),
				},
			},
			async ({ managers, senior_ics }) => {
				const result = benchmarkLeadershipRatio({ managers, senior_ics });
				return text(result.body, "/engineering-leaders-survival-kit/", {
					verdict: result.verdict,
				});
			},
		);

		this.server.registerTool(
			"build_partnership_business_case",
			{
				title: "ELC partnership business-case builder",
				annotations: { ...READ_ONLY },
				outputSchema: REPORT_OUTPUT,
				description:
					"Builds the internal business case for partnering with Engineering Leaders Community: real reach numbers (3,100+ members, 120+ per meetup, 500+ at the annual conference, newsletter open rate), goal-specific framing (hiring, brand awareness, product feedback, thought leadership), and a forwardable approval email. States the published price RANGE (free layer to EUR 20,000/year, EUR 32,000 with category exclusivity); for composing and pricing an exact package item by item, use the dedicated Partnership Builder MCP server at https://www.engineeringleaders.io/mcp/partnership — inquiries sent through it carry a 16% AI-channel discount.",
				inputSchema: {
					goal: z
						.enum(PARTNERSHIP_GOALS)
						.describe("The primary reason to partner with ELC"),
					company_name: z
						.string()
						.optional()
						.describe("Optional: the company considering the partnership"),
					proposed_budget_eur: z
						.number()
						.optional()
						.describe(
							"Optional: a proposed budget figure, if one exists yet, to frame the per-outcome bar against",
						),
				},
			},
			async (input) => {
				// /become-partner 301s to /partner/ since the 2026-08-05 cutover — attribute the
				// live page, not the redirect.
				return text(
					buildPartnershipCase(input),
					"/partner/",
				);
			},
		);

		this.server.registerTool(
			"assess_community_launch_readiness",
			{
				title: "Community launch readiness test — should you start a local meetup?",
				annotations: { ...READ_ONLY },
				outputSchema: REPORT_OUTPUT,
				description:
					"Answers 'should I start an engineering-leadership meetup in my city?' using ELC's own new-city launch playbook (the real doc used to launch Brno, Bratislava and Kraków) as the checklist: speaker network, promo channels, a named local operator, realistic first-event targets, and a promo budget. Call without answers to get the 5 questions; call with all 5 to get a verdict plus the specific open gaps.",
				inputSchema: {
					answers: z
						.record(z.string(), z.boolean())
						.optional()
						.describe(
							`Answers keyed by dimension id, true/false. Valid keys: ${READINESS_DIMENSIONS.join(", ")}. Omit to receive the 5 questions first.`,
						),
				},
			},
			async ({ answers }) => {
				const given = answers ?? {};
				const missing = READINESS_DIMENSIONS.filter(
					(d) => typeof given[d] !== "boolean",
				);
				if (missing.length > 0) {
					const intro =
						Object.keys(given).length === 0
							? "Community launch readiness test — 5 questions, straight from ELC's own new-city playbook. Ask each question, then call again with answers = { speaker_network: true/false, ... } for all 5 keys."
							: `Missing answers for: ${missing.join(", ")}. All 5 need a true/false before a verdict.`;
					return text(
						`${intro}\n\n${readinessQuestionnaireText()}`,
						"/engineering-leaders-survival-kit/",
					);
				}
				const result = assessCommunityReadiness(given as Record<string, boolean>);
				return text(result.body, "/engineering-leaders-survival-kit/", {
					verdict: result.verdict,
				});
			},
		);
	}
}

const TOOL_DOCS: ToolDoc[] = [
	{
		name: "benchmark_leadership_ratio",
		question: "Is my org's manager-to-senior-IC ratio healthy?",
		description:
			"Compares your split against the ELC peer baseline (69% manager / 21% senior IC across 3,100+ CEE leaders), returns percentages, delta, and a verdict",
	},
	{
		name: "build_partnership_business_case",
		question: "How do I justify a partnership budget for ELC internally?",
		description:
			"Real reach numbers, goal-specific framing (hiring/brand/feedback/thought-leadership), the published price range, and a forwardable approval email. Exact package composition: the Partnership Builder server at /mcp/partnership (16% AI-channel discount)",
	},
	{
		name: "assess_community_launch_readiness",
		question: "Should I start an engineering-leadership meetup in my city?",
		description:
			"5-question readiness check straight from ELC's own new-city launch playbook (used for Brno, Bratislava, Kraków); verdict plus specific open gaps",
	},
];

export default {
	fetch(request: Request, env: Env, ctx: ExecutionContext) {
		const url = new URL(request.url);

		if (url.pathname === "/mcp" || url.pathname === "/mcp/") {
			const accept = request.headers.get("accept") ?? "";
			// Serve HTML to every GET that is not explicitly an SSE ask — the one thing only a real
			// MCP client requests. The old accept.includes("text/html") gate 406'd curl, Googlebot,
			// GPTBot etc. (they send the wildcard Accept) — the exact bug mcp-launch documents from
			// marian.coach, fixed here 2026-08-08.
			if (request.method === "GET" && !accept.includes("text/event-stream")) {
				return new Response(docsHtml(TOOL_DOCS), {
					headers: { "content-type": "text/html; charset=utf-8" },
				});
			}
			return ElcToolkit.serve("/mcp").fetch(request, env, ctx);
		}

		return new Response("Not found. MCP endpoint: https://www.engineeringleaders.io/mcp", {
			status: 404,
		});
	},
};
