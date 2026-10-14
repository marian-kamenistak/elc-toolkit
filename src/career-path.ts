/**
 * Career path + 6-month plan for engineering leaders.
 *
 * Built from ELC meetup #43, "The Standard Tech/Engineering Manager Role Is Dead. How You
 * Survive 2027" (Apify, Prague, 2026-10-14). The thesis from the event page: the one-team EM
 * role is the first to go as orgs flatten; you grow up into a director running 20+ people or
 * step down into deep technical or product work, and every path needs AI, product thinking,
 * self-management and knowing how your feature is sold. The four checks are Yurii Bliuchak's
 * closing slide (Apify), month 1 is Jan Vrtiska's "first AI management workflow" (Everpure),
 * the closing question is Robert Jacko's (Applifting).
 *
 * Deterministic on purpose: same answers, same plan. Energy is the main signal, team size and
 * hands-on hours can override it only when they stack up, and a one-point margin is reported as
 * a close call with the question that decides it rather than hidden behind a single answer.
 */

export const PATHS = ["grow_up", "go_deep", "go_product"] as const;
export type CareerPath = (typeof PATHS)[number];

export const ENERGIES = ["people_and_org", "building_systems", "customers_and_product"] as const;
export type Energy = (typeof ENERGIES)[number];

export const CHECKS = ["product", "self_management", "ai", "beyond_engineering"] as const;
export type Check = (typeof CHECKS)[number];

export const CHECK_ANSWERS = ["yes", "not_sure", "no"] as const;
export type CheckAnswer = (typeof CHECK_ANSWERS)[number];

export interface CareerPathAnswers {
	current_role?: string;
	energy?: Energy;
	people_led?: number;
	hands_on_hours_per_week?: number;
	product?: CheckAnswer;
	self_management?: CheckAnswer;
	ai?: CheckAnswer;
	beyond_engineering?: CheckAnswer;
}

type RequiredKey = Exclude<keyof CareerPathAnswers, "current_role">;

export const CAREER_PATH_QUESTIONS: { key: RequiredKey; question: string; answer: string }[] = [
	{
		key: "energy",
		question:
			"Think of your best week in the last year. What gave you the energy: growing people and running the org, building and fixing systems yourself, or talking to customers and deciding what gets built?",
		answer: "people_and_org | building_systems | customers_and_product",
	},
	{
		key: "people_led",
		question: "How many people do you lead today, direct and indirect?",
		answer: "number",
	},
	{
		key: "hands_on_hours_per_week",
		question: "How many hours a week do you spend building yourself: code, architecture, prototypes, agents?",
		answer: "number",
	},
	{
		key: "product",
		question: "Product: do you know your product as well as you know your code?",
		answer: "yes | not_sure | no",
	},
	{
		key: "self_management",
		question: "Self-management: who set this week's priorities, you or your calendar?",
		answer: "yes (I did) | not_sure | no (my calendar did)",
	},
	{
		key: "ai",
		question: "AI: has your team shipped something it had never built before?",
		answer: "yes | not_sure | no",
	},
	{
		key: "beyond_engineering",
		question: "Beyond engineering: do you know how your feature is marketed, sold and supported?",
		answer: "yes | not_sure | no",
	},
];

export function careerPathQuestionnaireText(): string {
	return CAREER_PATH_QUESTIONS.map(
		(q, i) => `${i + 1}. ${q.question} (key: ${q.key}; answer: ${q.answer})`,
	).join("\n");
}

export function missingCareerAnswers(a: CareerPathAnswers): RequiredKey[] {
	return CAREER_PATH_QUESTIONS.map((q) => q.key).filter((k) => a[k] === undefined || a[k] === null);
}

const SITE = "https://www.engineeringleaders.io";

const PATH_INFO: Record<
	CareerPath,
	{ name: string; target: string; why: string; academy: { name: string; url: string }; months: Omit<Month, "gap" | "gapAction">[] }
> = {
	grow_up: {
		name: "Grow up",
		target: "Director or Head of Engineering, running 20+ people across several teams",
		why: "You get energy from people and the org. Flatter orgs still need someone who runs 20+ people, and that job is now more coordination, more dependencies and more decisions per week than a one-team role ever was.",
		academy: { name: "AI Managers", url: `${SITE}/academy/ai-managers` },
		months: [
			{
				focus: "Delegate to people",
				action:
					"Write down what only you can do. Everything else gets a written rule from month 1, a named owner, or you stop doing it.",
				proof: "A one-page delegation map: each recurring task, who owns it now, and the hours it gave you back.",
			},
			{
				focus: "Take a bigger scope",
				action:
					"Ask for a second team or a cross-team initiative with a date on it. Do not wait to be offered it.",
				proof: "A scope you own across more than one team, with an outcome and a deadline.",
			},
			{
				focus: "People first",
				action:
					"Keep your best people close. AI rarely keeps arguing, your best people do, so make sure they still argue with you. Name a successor for your current team and let them run it.",
				proof: "Your successor runs the team's week without you in the room.",
			},
		],
	},
	go_deep: {
		name: "Go deep",
		target: "Staff or Principal AI engineer, a deep technical role with agents doing most of the typing",
		why: "You get energy from building. The role that survives here is the person who makes agents produce work the team can trust: specs, evals, review rules and cost per task.",
		academy: { name: "AI Masters", url: `${SITE}/academy/ai-masters` },
		months: [
			{
				focus: "Back on the keyboard",
				action:
					"Own one hard technical problem end to end, with agents doing the typing and you owning the result.",
				proof: "Something you built, merged and running in production.",
			},
			{
				focus: "Make agents work for the team",
				action:
					"Write the team standard for working with agents: how a spec looks, what gets an eval, what a reviewer checks, what a task may cost.",
				proof: "A written standard other engineers use without asking you.",
			},
			{
				focus: "Build what you never built",
				action:
					"Pick a problem your company has not solved yet and ship a first version behind a flag. Yurii Bliuchak's team at Apify had never built a MITM proxy; AI closed the gap.",
				proof: "A capability in production that the company did not have before.",
			},
		],
	},
	go_product: {
		name: "Go product",
		target: "Product builder: an engineering leader who owns the why, the build and the launch",
		why: "You get energy from customers and from deciding what gets built. With AI, a small team without a PM can ship a product; someone still has to know why it exists and who pays for it.",
		academy: { name: "AI Masters", url: `${SITE}/academy/ai-masters` },
		months: [
			{
				focus: "Own the why",
				action:
					"For the next feature, write the problem, the user and the success metric before anyone estimates it.",
				proof: "A one-page brief a PM would sign, written by you.",
			},
			{
				focus: "Ship a small product end to end",
				action:
					"Ship one small thing with AI and a tiny team, including the price or packaging question. Yurii Bliuchak (Apify) set the pricing for both of his products.",
				proof: "A feature with real users and one number you can explain.",
			},
			{
				focus: "Put it where users already are",
				action:
					"Own adoption for four weeks. Yurii Bliuchak's team did not buy ads; they put the tool where agents already look.",
				proof: "An adoption chart, and the reason behind its shape.",
			},
		],
	},
};

const GAP_ACTION: Record<Check, string> = {
	product:
		"Close the product gap: sit in on 3 customer calls or 20 support tickets, then write half a page on why the feature you are building now exists and who pays for it.",
	self_management:
		"Close the self-management gap: every Monday write your 3 priorities before you open the calendar. On Friday count how many survived. Repeat until it is 3 of 3.",
	ai: "Close the AI gap: get your team to ship one thing it had never built before, with AI doing the heavy lifting. Give them a real tool budget and measure days, not opinions.",
	beyond_engineering:
		"Close the beyond-engineering gap: follow one feature end to end. Sit with marketing for the launch, with sales for one demo, with support for the first tickets.",
};

const CHECK_LABEL: Record<Check, string> = {
	product: "Product",
	self_management: "Self-management",
	ai: "AI",
	beyond_engineering: "Beyond engineering",
};

const DECIDER: Record<string, string> = {
	"go_deep|grow_up":
		"In a week where you shipped nothing yourself but your org shipped a lot, would you feel proud or restless?",
	"go_product|grow_up": "Would you rather own the people who build it, or own the decision about what gets built?",
	"go_deep|go_product":
		"Would you rather be the person who knows how it works, or the person who knows why customers pay for it?",
};

export interface Month {
	focus: string;
	action: string;
	proof: string;
	gap?: Check;
	gapAction?: string;
}

export interface CareerPathResult {
	path: CareerPath;
	runnerUp?: CareerPath;
	deadZone: boolean;
	gaps: Check[];
	months: Month[];
	verdict: string;
	body: string;
}

function score(a: Required<Omit<CareerPathAnswers, "current_role">>): Record<CareerPath, number> {
	const s: Record<CareerPath, number> = { grow_up: 0, go_deep: 0, go_product: 0 };
	if (a.energy === "people_and_org") s.grow_up += 3;
	if (a.energy === "building_systems") s.go_deep += 3;
	if (a.energy === "customers_and_product") s.go_product += 3;
	if (a.people_led >= 20) s.grow_up += 2;
	else if (a.people_led >= 10) s.grow_up += 1;
	if (a.hands_on_hours_per_week >= 10) s.go_deep += 2;
	else if (a.hands_on_hours_per_week >= 5) s.go_deep += 1;
	if (a.product === "yes") s.go_product += 1;
	if (a.beyond_engineering === "yes") s.go_product += 1;
	return s;
}

export function planCareerPath(input: CareerPathAnswers): CareerPathResult {
	const a = input as Required<Omit<CareerPathAnswers, "current_role">>;
	const s = score(a);
	// Stable order on ties: PATHS order, so the result never depends on object iteration quirks.
	const ranked = [...PATHS].sort((x, y) => s[y] - s[x]);
	const path = ranked[0];
	const runnerUp = s[ranked[0]] - s[ranked[1]] <= 1 ? ranked[1] : undefined;

	const deadZone = a.people_led <= 10 && a.hands_on_hours_per_week < 2;

	const gaps: Check[] = [
		...CHECKS.filter((c) => a[c] === "no"),
		...CHECKS.filter((c) => a[c] === "not_sure"),
	];

	const info = PATH_INFO[path];
	const months: Month[] = [
		{
			focus: "Scale yourself with AI",
			action:
				"Jan Vrtiska's first AI management workflow: pick one repetitive task (status chasing, 1:1 prep, risk spotting), write down how you decide it today as 3 to 5 rules, let AI apply them, fix the rules where it is wrong. Delegate the work, keep the responsibility.",
			proof: "A rules file in plain English and the hours per week it saves you, measured by you.",
		},
		...info.months,
		{
			focus: "Make it visible",
			action: `Write up your best month as one page: the problem, what you did, the number. Post it on LinkedIn and submit it as a talk to an ELC meetup: ${SITE}/cfp/`,
			proof: "One published post and one talk submission.",
		},
		{
			focus: "Market check",
			action:
				"Rewrite your LinkedIn headline and CV around the path and your proofs from months 1 to 5. Then have 3 conversations: one hiring manager, one peer a step ahead on this path, one recruiter. Ask each what is still missing.",
			proof: "A gap list from the market instead of from your own head. Run this plan again with it.",
		},
	];
	gaps.forEach((g, i) => {
		months[i].gap = g;
		months[i].gapAction = GAP_ACTION[g];
	});

	const role = input.current_role?.trim();
	const verdict = `${info.name}: ${info.target}${runnerUp ? ` (close call with ${PATH_INFO[runnerUp].name})` : ""}`;

	const lines: string[] = [];
	lines.push(`**Your path: ${info.name}.** ${info.target}.`);
	lines.push(
		`${role ? `From ${role}, with` : "With"} ${a.people_led} people led and ${a.hands_on_hours_per_week} hands-on ${a.hands_on_hours_per_week === 1 ? "hour" : "hours"} a week. ${info.why}`,
	);
	if (runnerUp) {
		const key = [path, runnerUp].sort().join("|");
		lines.push(
			`**Close call** with ${PATH_INFO[runnerUp].name} (${PATH_INFO[runnerUp].target}). The question that decides it: ${DECIDER[key]}`,
		);
	}
	if (deadZone) {
		lines.push(
			`**Dead zone check.** You lead ${a.people_led} people and build less than 2 hours a week. That is the one-team EM role the #43 speakers called the first to go. It is not a verdict on you, it is a deadline: pick a path this quarter and start month 1 now.`,
		);
	}

	lines.push(
		gaps.length === 0
			? "**The four checks:** yes to all four. Your plan focuses on the path itself."
			: `**The four checks, open:** ${gaps.map((g) => `${CHECK_LABEL[g]} (${a[g] === "no" ? "no" : "not sure"})`).join(", ")}. As Yurii Bliuchak put it: a "no" or "not sure" isn't a fail. It's your next step. Each one gets its own month below.`,
	);

	lines.push(
		"**Your 6-month plan.** Checkpoint every month: the ELC meetup. Bring that month's proof and show it to one person you trust.",
	);
	months.forEach((m, i) => {
		lines.push(
			`**Month ${i + 1}: ${m.focus}.** ${m.action}${m.gapAction ? `\n${m.gapAction}` : ""}\nProof: ${m.proof}`,
		);
	});

	lines.push(
		`**If you want help on the way.** AI Program at the ELC Academy: start with AI Augmented (${SITE}/academy/ai-augmented), then ${info.academy.name} for this path (${info.academy.url}). A mentor who has done this path: ${SITE}/mentor/. Upcoming meetups: ${SITE}/events/`,
	);
	lines.push(
		"**Last question** (Robert Jacko, Applifting): what is your superpower? Write it in one line on top of this plan. Every month should use it.",
	);
	lines.push(
		"Built from ELC meetup #43, \"The Standard Tech/Engineering Manager Role Is Dead. How You Survive 2027\", with Yurii Bliuchak (Apify), Jan Vrtiska (Everpure) and Robert Jacko (Applifting).",
	);

	return { path, runnerUp, deadZone, gaps, months, verdict, body: lines.join("\n\n") };
}
