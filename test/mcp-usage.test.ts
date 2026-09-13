/**
 * Demotion and labelling rules for the Slack usage channel (`#web-mcp-usage-bot`).
 *
 * Every client name and tool name below was read off production: `$mcp_initialize` and
 * `$mcp_tool_call` in PostHog 180652 / 214292 over the 30 days to 2026-09-11, cross-checked
 * against what the channel actually showed.
 */

import { describe, expect, it } from "vitest";
import { conversationKey, looksAutomated, unwrapArguments, formatArgs } from "../src/mcp-usage";

const geo = (org?: string) => ({ city: "Prague", country: "CZ", org });
const props = (clientName?: string, toolName = "get_started") => ({
	$mcp_client_name: clientName,
	$mcp_tool_name: toolName,
});

describe("looksAutomated — crawlers that were passing as real visitors", () => {
	it.each([
		["glimind-probe", 2425],
		["glama", 1432],
		["mcpbeat", 1415],
		["zevruna", 739],
		["meshdns-health", 429],
		["smithery-probe", 184],
		["agent-tools.cloud", 155],
		["rokmcp-probe", 252],
		["agentstatus-probe", 0],
		["uptime-probe", 3069],
	])("%s is demoted (%i handshakes in the window)", (client, _n) => {
		expect(looksAutomated(props(client), geo("Hetzner Online GmbH"))).toBe(true);
	});

	it.each(["verifymcp-probe", "mcp-dataset-probe/0.1", "mcp-vouch", "cracked-probe"])(
		"%s stays demoted (the original list must not regress)",
		(client) => {
			expect(looksAutomated(props(client), geo())).toBe(true);
		},
	);

	it.each([
		["agent-evidence-scanner", 277],
		["proofbench-probe", 216],
		["reliability-bureau-spike", 149],
		["mcpscan", 142],
		["factanker-probe", 122],
		["mcpindex-trust", 108],
		["ps-mcp-tools-probe", 95],
		["glama-mcp-inspector", 94],
	])("%s is demoted (%i handshakes; found on the second sweep)", (client, _n) => {
		expect(looksAutomated(props(client), geo())).toBe(true);
	});

	it("catches an unseen monitor by the shape of its name", () => {
		expect(looksAutomated(props("someacme-healthcheck"), geo())).toBe(true);
		expect(looksAutomated(props("newthing-monitor"), geo())).toBe(true);
		expect(looksAutomated(props("someone-scanner-thing"), geo())).toBe(true);
	});
});

describe("looksAutomated — the penetration scan that threaded itself as a conversation", () => {
	// 2026-09-10: an unnamed client on Tele2 *residential* broadband called 141 tools against
	// elc-conference-mcp-tickets. The "unnamed + datacentre" rule could not see it, so it
	// posted one threaded Slack session that read exactly like a real visitor.
	it.each([
		"delete_user",
		"run_shell",
		"drop_table",
		"transfer_money",
		"read_secrets",
		"admin_login",
		"get_api_key",
		"execute_command",
		"sudo",
	])("%s is a scan regardless of client name or network", (tool) => {
		expect(looksAutomated(props(undefined, tool), geo("Tele2 customer broadband access"))).toBe(true);
	});

	it("still catches the synthetic probe tool names", () => {
		expect(looksAutomated(props("x", "__verifymcp_auth_probe_a432df16__"), geo())).toBe(true);
		expect(looksAutomated(props("x", "__ratelimit_probe_nonexistent_tool__"), geo())).toBe(true);
	});

	it("still catches an unnamed client on a datacentre network", () => {
		expect(looksAutomated(props(undefined), geo("Vultr Holdings, LLC"))).toBe(true);
	});
});

describe("looksAutomated — what must NOT be demoted", () => {
	it.each([
		"claude-code",
		"claude-desktop",
		"grok-shell-marian-mentoring",
		"cursor",
		"vscode",
	])("%s is a real client", (client) => {
		expect(looksAutomated(props(client), geo("O2 Czech Republic"))).toBe(false);
	});

	it("our own verification harnesses stay visible — they are how a deploy is proved", () => {
		for (const client of ["usability-test", "argshape-check", "plan1-verify-toolkit", "deploy-verify"]) {
			expect(looksAutomated(props(client), geo())).toBe(false);
		}
	});

	it("a named client on a datacentre network is judged by its name, not its network", () => {
		// An agent legitimately running in CI or on a VPS is still a real caller.
		expect(looksAutomated(props("claude-code"), geo("Amazon Technologies Inc."))).toBe(false);
	});
});

describe("conversationKey", () => {
	it("separates two servers that share a domain", () => {
		const a = conversationKey("eng-leadership-toolkit", props("claude-code"), geo());
		const b = conversationKey("mentoring-inquiry-builder", props("claude-code"), geo());
		expect(a).not.toBe(b);
	});

	it("is stable for the same client across reconnects — that is the whole point", () => {
		expect(conversationKey("elc-toolkit", props("claude-code"), geo("O2"))).toBe(
			conversationKey("elc-toolkit", props("claude-code"), geo("O2")),
		);
	});
});

describe("argument rendering stays readable", () => {
	it("unwraps the JSON-RPC envelope rather than printing it", () => {
		const envelope = {
			request: {
				id: 2,
				jsonrpc: "2.0",
				method: "tools/call",
				params: { name: "benchmark_leadership_ratio", arguments: { managers: 12, senior_ics: 40 } },
			},
		};
		expect(unwrapArguments(envelope)).toEqual({ managers: 12, senior_ics: 40 });
		const line = formatArgs(unwrapArguments(envelope));
		expect(line).toBe("managers: 12 · senior_ics: 40");
		expect(line).not.toContain("jsonrpc");
	});

	it("keeps the injected context off the argument line", () => {
		expect(formatArgs({ managers: 12, context: "sizing an org" })).toBe("managers: 12");
	});
});
