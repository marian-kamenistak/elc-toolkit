/**
 * Every case here is a real production payload.
 *
 * Source: PostHog `$mcp_tool_call` where `$mcp_is_error`, projects 180652 + 214292, 30 days
 * to 2026-09-11, grouped by `$mcp_parameters`. The counts in the test names are how many
 * times that exact payload was rejected in that window. They are the reason this module
 * exists; if one of them regresses, the tool goes back to answering a cooperating caller
 * with a type error.
 */

import { describe, expect, it } from "vitest";
import { z } from "zod";
import {
	CONTEXT_FIELD,
	ignoredNotice,
	normalizeToolCallBody,
	parseArgs,
	permissiveShape,
} from "../src/mcp-tolerant";

const GOALS = [
	"hiring",
	"brand_awareness",
	"product_feedback",
	"thought_leadership",
	"people_development",
] as const;

const ONEOFF_IDS = [
	"newsletter-section",
	"newsletter-dedicated",
	"meetup-hosted",
	"podcast-episode",
	"dinner",
] as const;

/** Mirrors `build_partnership_business_case`. */
const CASE_SHAPE = {
	goal: z.enum(GOALS).describe("The primary reason to partner with ELC"),
	company_name: z.string().optional().describe("Optional: the company considering membership"),
	proposed_budget_eur: z.number().optional().describe("Optional: a proposed budget figure"),
};

/** Mirrors `benchmark_leadership_ratio`. */
const RATIO_SHAPE = {
	managers: z.number().min(0).describe("Count of people in Manager+/Leadership roles"),
	senior_ics: z.number().min(0).describe("Count of Senior/Staff-level individual contributors"),
};

/** Mirrors `quote_reach_combo` / `buy_reach`. */
const REACH_SHAPE = {
	oneoff_ids: z.array(z.enum(ONEOFF_IDS)).min(1).describe("Which one-off reach items to quote"),
};

describe("permissiveShape — what tools/list advertises", () => {
	it("makes every field optional so a bare {} reaches the handler", () => {
		const shape = permissiveShape(CASE_SHAPE);
		expect(z.object(shape).safeParse({}).success).toBe(true);
	});

	it("declares context itself, which is what stops @posthog/mcp injecting a required one", () => {
		expect(permissiveShape(CASE_SHAPE)[CONTEXT_FIELD]).toBeDefined();
		expect(z.object(permissiveShape(CASE_SHAPE)).safeParse({ context: undefined }).success).toBe(true);
	});

	it("moves 'required' and the enum values into the description, since the schema loses them", () => {
		const shape = permissiveShape(CASE_SHAPE);
		const goal = (shape.goal as z.ZodType).description ?? "";
		expect(goal).toContain("Required.");
		expect(goal).toContain("One of: hiring, brand_awareness");
		// …and does not claim an optional field is required.
		expect((shape.company_name as z.ZodType).description ?? "").not.toContain("Required.");
	});

	it("keeps container shape: an array stays an array", () => {
		const shape = permissiveShape(REACH_SHAPE);
		expect(z.object(shape).safeParse({ oneoff_ids: ["anything"] }).success).toBe(true);
		expect(z.object(shape).safeParse({ oneoff_ids: 5 }).success).toBe(false);
	});
});

describe("the bare probe — 28 of ~90 real errors in the window", () => {
	it.each([
		["quote_reach_combo", REACH_SHAPE, 10],
		["build_partnership_business_case", CASE_SHAPE, 7],
		["benchmark_leadership_ratio", RATIO_SHAPE, 7],
	])("%s: {} returns the field menu, not a type error (seen %i×)", (name, shape, _n) => {
		const r = parseArgs(name, shape, {});
		expect(r.ok).toBe(false);
		if (r.ok) return;
		expect(r.probe).toBe(true);
		expect(r.message).toContain("Accepted arguments:");
		// The menu has to name every field, or the next attempt is another guess.
		for (const field of Object.keys(shape)) expect(r.message).toContain(field);
	});

	it("oneoff_ids: [] is the same question asked differently (seen 5×)", () => {
		const r = parseArgs("quote_reach_combo", REACH_SHAPE, { oneoff_ids: [] });
		expect(r.ok).toBe(false);
		if (r.ok) return;
		expect(r.probe).toBe(true);
		expect(r.message).toContain("newsletter-section");
	});

	it("a context-only call is still a probe — context is not a tool argument", () => {
		const r = parseArgs("quote_reach_combo", REACH_SHAPE, { context: "pricing a meetup" });
		expect(r.ok).toBe(false);
		if (r.ok) return;
		expect(r.probe).toBe(true);
	});
});

describe("slug drift — the caller wrote the right item in the wrong shape", () => {
	it.each([
		["hosted_meetup", "meetup-hosted", 4],
		["newsletter_section", "newsletter-section", 1],
		["Meetup Hosted", "meetup-hosted", 0],
		["PODCAST-EPISODE", "podcast-episode", 0],
	])("%s -> %s", (sent, expected, _n) => {
		const r = parseArgs("quote_reach_combo", REACH_SHAPE, { oneoff_ids: [sent] });
		expect(r.ok).toBe(true);
		if (!r.ok) return;
		expect(r.data.oneoff_ids).toEqual([expected]);
	});

	it("brand -> brand_awareness (seen 4×)", () => {
		const r = parseArgs("build_partnership_business_case", CASE_SHAPE, { goal: "brand" });
		// `brand` is not a case/separator variant of `brand_awareness`, so it is NOT silently
		// mapped. It must fail — but fail naming the five real goals.
		expect(r.ok).toBe(false);
		if (r.ok) return;
		expect(r.message).toContain("hiring");
		expect(r.message).toContain("brand_awareness");
	});

	it("member_list is not a product and must stay rejected (seen 2×)", () => {
		const r = parseArgs("buy_reach", REACH_SHAPE, { oneoff_ids: ["member_list"] });
		expect(r.ok).toBe(false);
		if (r.ok) return;
		expect(r.message).toContain("newsletter-section");
	});
});

describe("shape drift", () => {
	it("a bare string where an array was wanted is wrapped (seen 1× live, 13 type errors total)", () => {
		const r = parseArgs("quote_reach_combo", REACH_SHAPE, { oneoff_ids: "hosted_meetup" });
		expect(r.ok).toBe(true);
		if (!r.ok) return;
		expect(r.data.oneoff_ids).toEqual(["meetup-hosted"]);
	});

	it("numeric strings become numbers (seen 1×; 14 type errors on this tool)", () => {
		const r = parseArgs("benchmark_leadership_ratio", RATIO_SHAPE, { managers: "12", senior_ics: "40" });
		expect(r.ok).toBe(true);
		if (!r.ok) return;
		expect(r.data).toEqual({ managers: 12, senior_ics: 40 });
	});

	it("null is treated as omitted, NOT coerced to zero", () => {
		const r = parseArgs("benchmark_leadership_ratio", RATIO_SHAPE, { managers: null, senior_ics: 40 });
		expect(r.ok).toBe(false);
		if (r.ok) return;
		// The bug this guards: z.coerce.number() parses null as 0 and would have answered with a
		// confident benchmark of zero managers.
		expect(r.message).toContain("managers");
	});

	it("a non-numeric string is reported, not invented", () => {
		const r = parseArgs("benchmark_leadership_ratio", RATIO_SHAPE, { managers: "a dozen", senior_ics: 40 });
		expect(r.ok).toBe(false);
	});

	it("a real constraint still fails: senior_ics -5 (seen 1×)", () => {
		const r = parseArgs("benchmark_leadership_ratio", RATIO_SHAPE, { managers: 0, senior_ics: -5 });
		expect(r.ok).toBe(false);
	});
});

describe("wrong field names", () => {
	it("engineers: 120 is named as ignored, not silently dropped (seen 2×)", () => {
		const r = parseArgs("benchmark_leadership_ratio", RATIO_SHAPE, { engineers: 120, managers: 14 });
		expect(r.ok).toBe(false);
		if (r.ok) return;
		expect(r.message).toContain("engineers");
		expect(r.message).toContain("senior_ics");
	});

	it("unknown keys alongside a valid call surface as an explicit notice (seen 1×)", () => {
		const r = parseArgs("build_partnership_business_case", CASE_SHAPE, {
			goal: "hiring",
			city: "Budapest",
			country: "Hungary",
		});
		expect(r.ok).toBe(true);
		if (!r.ok) return;
		expect(r.ignored.sort()).toEqual(["city", "country"]);
		const notice = ignoredNotice("build_partnership_business_case", r.ignored, CASE_SHAPE);
		expect(notice).toContain("city");
		expect(notice).toContain("had no effect");
	});

	it("no notice when nothing was ignored", () => {
		expect(ignoredNotice("x", [], CASE_SHAPE)).toBe("");
	});
});

describe("the happy path is untouched", () => {
	it("a correct call parses to exactly the same data as the strict schema would", () => {
		const args = { goal: "hiring", company_name: "Kentico", proposed_budget_eur: 12000 };
		const r = parseArgs("build_partnership_business_case", CASE_SHAPE, args);
		expect(r.ok).toBe(true);
		if (!r.ok) return;
		expect(r.data).toEqual(z.object(CASE_SHAPE).parse(args));
		expect(r.ignored).toEqual([]);
	});

	it("context is accepted and stripped before the tool sees it", () => {
		const r = parseArgs("build_partnership_business_case", CASE_SHAPE, {
			goal: "hiring",
			context: "helping a CTO justify budget",
		});
		expect(r.ok).toBe(true);
		if (!r.ok) return;
		expect(r.data).not.toHaveProperty("context");
		expect(r.ignored).toEqual([]);
	});
});

describe("normalizeToolCallBody — the spec says arguments is optional", () => {
	const call = (params: unknown) => JSON.stringify({ jsonrpc: "2.0", id: 2, method: "tools/call", params });

	it("gives a missing arguments key an empty object", () => {
		const out = JSON.parse(normalizeToolCallBody(call({ name: "get_started" })));
		expect(out.params.arguments).toEqual({});
	});

	it("treats a null arguments the same way", () => {
		const out = JSON.parse(normalizeToolCallBody(call({ name: "get_started", arguments: null })));
		expect(out.params.arguments).toEqual({});
	});

	it("leaves real arguments alone, byte for byte", () => {
		const body = call({ name: "x", arguments: { managers: 12 } });
		expect(normalizeToolCallBody(body)).toBe(body);
	});

	it("leaves every other method alone", () => {
		for (const method of ["initialize", "tools/list", "notifications/initialized"]) {
			const body = JSON.stringify({ jsonrpc: "2.0", id: 1, method, params: { name: "x" } });
			expect(normalizeToolCallBody(body)).toBe(body);
		}
	});

	it("handles the JSON-RPC batch form", () => {
		const body = JSON.stringify([
			{ jsonrpc: "2.0", id: 1, method: "tools/call", params: { name: "a" } },
			{ jsonrpc: "2.0", id: 2, method: "tools/call", params: { name: "b", arguments: { k: 1 } } },
		]);
		const out = JSON.parse(normalizeToolCallBody(body));
		expect(out[0].params.arguments).toEqual({});
		expect(out[1].params.arguments).toEqual({ k: 1 });
	});

	it("returns malformed input untouched rather than throwing", () => {
		expect(normalizeToolCallBody("not json")).toBe("not json");
		expect(normalizeToolCallBody("")).toBe("");
	});
})

/**
 * The bug this file exists to prevent from recurring.
 *
 * `parseArgs` can repair a lot, but the SDK validates against `permissiveShape` FIRST and the
 * handler never runs if that rejects. On 2026-09-11 `widen()` left `z.number()` strict, so
 * `managers: "12"` was still answered with a raw Zod dump after deploy — while every unit test
 * above passed, because they call `parseArgs` directly and never cross the SDK's schema.
 *
 * Each case asserts BOTH halves: the advertised schema admits it, and the real parse repairs it.
 */
describe("permissiveShape admits everything parseArgs repairs", () => {
	const cases: Array<[string, z.ZodRawShape, Record<string, unknown>]> = [
		["bare probe", RATIO_SHAPE, {}],
		["numeric strings", RATIO_SHAPE, { managers: "12", senior_ics: "40" }],
		["mixed number/string", RATIO_SHAPE, { managers: 12, senior_ics: "40" }],
		["scalar for an array", REACH_SHAPE, { oneoff_ids: "hosted_meetup" }],
		["array as normal", REACH_SHAPE, { oneoff_ids: ["meetup-hosted"] }],
		["empty array probe", REACH_SHAPE, { oneoff_ids: [] }],
		["enum slug drift", REACH_SHAPE, { oneoff_ids: ["hosted_meetup", "PODCAST-EPISODE"] }],
		["enum synonym (rejected, but must reach the handler)", CASE_SHAPE, { goal: "brand" }],
		["free-text enum", CASE_SHAPE, { goal: "I want to become a better manager" }],
		["unknown key", RATIO_SHAPE, { engineers: 120, managers: 14 }],
		["context only", CASE_SHAPE, { context: "why I am calling" }],
	];

	it.each(cases)("the SDK would let %s through to the handler", (_label, shape, args) => {
		const advertised = z.object(permissiveShape(shape)).safeParse(args);
		expect(advertised.success).toBe(true);
	});

	it("a null value is stripped at the transport, before the SDK can reject it", () => {
		const body = JSON.stringify({
			jsonrpc: "2.0",
			id: 2,
			method: "tools/call",
			params: { name: "benchmark_leadership_ratio", arguments: { managers: null, senior_ics: 40 } },
		});
		const args = JSON.parse(normalizeToolCallBody(body)).params.arguments;
		expect(args).toEqual({ senior_ics: 40 });
		expect(z.object(permissiveShape(RATIO_SHAPE)).safeParse(args).success).toBe(true);
	});

	it.each(cases)("%s then gets a useful answer, never a raw Zod dump", (label, shape, args) => {
		const r = parseArgs("t", shape, args);
		if (r.ok) return;
		expect(r.message).toContain("Accepted arguments:");
		expect(r.message).not.toContain('"code":');
		expect(label).toBeTruthy();
	});
})

describe("records — a questionnaire answered one level down", () => {
	const READINESS = {
		answers: z
			.record(z.string(), z.boolean())
			.optional()
			.describe("Answers keyed by dimension id, true/false"),
	};
	const SCORES = { answers: z.record(z.string(), z.number().min(0).max(3)).describe("q1-q17, 0-3") };

	it("admits string booleans the SDK would otherwise reject", () => {
		const args = { answers: { speaker_network: "true", promo_channels: "false" } };
		expect(z.object(permissiveShape(READINESS)).safeParse(args).success).toBe(true);
		const r = parseArgs("assess_community_launch_readiness", READINESS, args);
		expect(r.ok).toBe(true);
		if (!r.ok) return;
		expect(r.data.answers).toEqual({ speaker_network: true, promo_channels: false });
	});

	it("admits numeric strings inside a record", () => {
		const args = { answers: { q1: "3", q2: 0 } };
		expect(z.object(permissiveShape(SCORES)).safeParse(args).success).toBe(true);
		const r = parseArgs("assess_team_lead_readiness", SCORES, args);
		expect(r.ok).toBe(true);
		if (!r.ok) return;
		expect(r.data.answers).toEqual({ q1: 3, q2: 0 });
	});

	it("still rejects a value that is genuinely out of range", () => {
		expect(parseArgs("t", SCORES, { answers: { q1: "9" } }).ok).toBe(false);
	});
});

describe("permissiveShape never clobbers a tool's own context field", () => {
	// get_more_tools reads `context` AS its capability report, and its description is the only
	// cue telling an agent a bare greeting is welcome there.
	const OWN = {
		context: z
			.string()
			.optional()
			.describe("What you were looking for, OR a plain greeting like 'hi'. Omit for the menu."),
	};

	it("keeps the tool's description rather than the generic analytics one", () => {
		const shape = permissiveShape(OWN);
		expect((shape.context as z.ZodType).description).toContain("Omit for the menu");
	});

	it("still adds context to a shape that does not declare one", () => {
		const shape = permissiveShape({ a: z.string() });
		expect((shape.context as z.ZodType).description).toContain("Recorded as intent");
	});
})
