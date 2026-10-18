import { describe, expect, it } from "vitest";
import {
	CAREER_PATH_QUESTIONS,
	careerPathQuestionnaireText,
	missingCareerAnswers,
	planCareerPath,
	type CareerPathAnswers,
} from "../src/career-path";

const BASE: CareerPathAnswers = {
	energy: "people_and_org",
	people_led: 8,
	hands_on_hours_per_week: 6,
	product: "yes",
	self_management: "yes",
	ai: "yes",
	beyond_engineering: "yes",
};

describe("questionnaire", () => {
	it("lists every question with its key", () => {
		const text = careerPathQuestionnaireText();
		for (const q of CAREER_PATH_QUESTIONS) expect(text).toContain(`key: ${q.key}`);
	});

	it("reports every key as missing for an empty call", () => {
		expect(missingCareerAnswers({})).toHaveLength(CAREER_PATH_QUESTIONS.length);
	});

	it("reports nothing missing for a full answer set", () => {
		expect(missingCareerAnswers(BASE)).toEqual([]);
	});
});

describe("path pick", () => {
	it("people energy with a big org grows up", () => {
		const r = planCareerPath({ ...BASE, people_led: 25, hands_on_hours_per_week: 0 });
		expect(r.path).toBe("grow_up");
		expect(r.runnerUp).toBeUndefined();
	});

	it("systems energy goes deep", () => {
		const r = planCareerPath({ ...BASE, energy: "building_systems", people_led: 5, hands_on_hours_per_week: 3 });
		expect(r.path).toBe("go_deep");
	});

	it("customer energy goes product", () => {
		const r = planCareerPath({ ...BASE, energy: "customers_and_product", people_led: 6, hands_on_hours_per_week: 2 });
		expect(r.path).toBe("go_product");
	});

	it("names a close call instead of hiding it", () => {
		// people energy (3) vs lots of hands-on hours (2): one point apart
		const r = planCareerPath({ ...BASE, people_led: 6, hands_on_hours_per_week: 15 });
		expect(r.path).toBe("grow_up");
		expect(r.runnerUp).toBe("go_deep");
		expect(r.body).toContain("Close call");
	});
});

describe("edge cases found in live testing 2026-10-14", () => {
	it("names every path within one point, not just the first", () => {
		// customers (3) vs 20+ people (2) vs 10+ hands-on hours (2)
		const r = planCareerPath({
			...BASE,
			energy: "customers_and_product",
			people_led: 20,
			hands_on_hours_per_week: 10,
			product: "no",
			beyond_engineering: "no",
		});
		expect(r.path).toBe("go_product");
		expect(r.body).toContain("Grow up");
		expect(r.body).toContain("Go deep");
		expect(r.body.match(/The question that decides it/g)).toHaveLength(2);
	});

	it("tells someone already running 20+ people that they are on the path, not aiming at it", () => {
		const r = planCareerPath({ ...BASE, people_led: 40, hands_on_hours_per_week: 0, current_role: "VP Engineering" });
		expect(r.path).toBe("grow_up");
		expect(r.body).toContain("already");
	});

	it("does not say 'already' to a small-team manager on the grow-up path", () => {
		const r = planCareerPath({ ...BASE, people_led: 8, hands_on_hours_per_week: 0 });
		expect(r.body).not.toContain("You already run");
	});
});

describe("dead zone", () => {
	it("warns a small-team manager who no longer builds", () => {
		const r = planCareerPath({ ...BASE, people_led: 7, hands_on_hours_per_week: 0 });
		expect(r.deadZone).toBe(true);
		expect(r.body).toContain("Dead zone");
	});

	it("does not warn a director", () => {
		expect(planCareerPath({ ...BASE, people_led: 30, hands_on_hours_per_week: 0 }).deadZone).toBe(false);
	});

	it("does not warn a hands-on lead", () => {
		expect(planCareerPath({ ...BASE, people_led: 6, hands_on_hours_per_week: 12 }).deadZone).toBe(false);
	});

	it("says explicitly that a small-team lead who still builds is clear of the dead zone", () => {
		// Live test 2026-10-14: a client model told a 5-person tech lead coding 12h/week he was in
		// the dead zone, because the output was silent and the description named the term.
		const r = planCareerPath({ ...BASE, people_led: 5, hands_on_hours_per_week: 12 });
		expect(r.body).toContain("Dead zone check: clear");
		expect(r.body).not.toContain("**Dead zone check.**");
	});

	it("says nothing about the dead zone to a big-org leader", () => {
		expect(planCareerPath({ ...BASE, people_led: 30 }).body).not.toContain("Dead zone");
	});
});

describe("gaps and plan", () => {
	it("orders gaps no before not_sure, in question order within each", () => {
		const r = planCareerPath({
			...BASE,
			product: "not_sure",
			self_management: "no",
			ai: "yes",
			beyond_engineering: "no",
		});
		expect(r.gaps).toEqual(["self_management", "beyond_engineering", "product"]);
	});

	it("has no gaps when every check is yes", () => {
		expect(planCareerPath(BASE).gaps).toEqual([]);
	});

	it("always returns exactly 6 months, each with a proof", () => {
		for (const energy of ["people_and_org", "building_systems", "customers_and_product"] as const) {
			const r = planCareerPath({ ...BASE, energy, ai: "no", product: "no" });
			expect(r.months).toHaveLength(6);
			for (const m of r.months) expect(m.proof.length).toBeGreaterThan(0);
			for (let i = 1; i <= 6; i++) expect(r.body).toContain(`Month ${i}`);
		}
	});

	it("puts each gap into its own month", () => {
		const r = planCareerPath({ ...BASE, product: "no", self_management: "no", ai: "no", beyond_engineering: "no" });
		const withGap = r.months.filter((m) => m.gap);
		expect(withGap.map((m) => m.gap)).toEqual(["product", "self_management", "ai", "beyond_engineering"]);
	});

	it("links the B² track that fits the path", () => {
		expect(planCareerPath(BASE).body).toContain("B² (Builders for Builders) at the ELC Academy");
		expect(planCareerPath(BASE).body).not.toContain("AI Program");
		expect(planCareerPath({ ...BASE, people_led: 30 }).body).toContain("/academy/ai-managers");
		expect(planCareerPath({ ...BASE, energy: "building_systems" }).body).toContain("/academy/ai-masters");
	});
});
