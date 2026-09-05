/**
 * Partnership business case builder — the reach math a partner's champion
 * needs to justify an ELC membership budget internally, plus a forwardable
 * approval email. Mirrors the shape of marian.coach's mentoring business-case
 * tool, but computes REACH VALUE, not a package composition.
 *
 * PRICING IS PUBLIC since 2026-08-05 (this file used to say the opposite —
 * corrected 2026-08-08): the full priced ladder renders on
 * /partner/membership/ and ships machine-readable at /partner/offer-catalog.json.
 * This tool states the published range and routes exact composition to the
 * dedicated Partnership Builder MCP server (/mcp/partnership), which also
 * carries the 16% AI-channel discount. Only the RANGE is stated here — per-item
 * prices live in the synced catalog that server reads, not in a third copy
 * that would drift.
 *
 * Rewritten 2026-09-05 after persona testing. Four findings, all fixed here:
 *   - The memo argued a goal but never said what you'd actually GET for the
 *     money. Every goal now names its own deliverables (categories, never
 *     prices — prices stay in the catalog so they cannot drift into a third copy).
 *   - There was no goal for the thing company membership actually sells.
 *     `people_development` added; it is the education half of the ELC wording
 *     split (partnership = reach, company membership = education).
 *   - A supplied budget only produced a rhetorical question. It now says what
 *     that budget reaches on the published ladder.
 *   - `[manager name]` / `[your name]` shipped as raw mail-merge tokens in a
 *     draft meant to be forwarded. Both are now optional inputs, with a
 *     working greeting and sign-off when they are not supplied.
 */

import { ELC_FACTS, andJoin } from "./content";

export const PARTNERSHIP_GOALS = [
	"hiring",
	"brand_awareness",
	"product_feedback",
	"thought_leadership",
	"people_development",
] as const;

export type PartnershipGoal = (typeof PARTNERSHIP_GOALS)[number];

const GOAL_LABELS: Record<PartnershipGoal, string> = {
	hiring: "Hiring senior engineers",
	brand_awareness: "Brand awareness with engineering leaders",
	product_feedback: "Product feedback from real buyers",
	thought_leadership: "Thought leadership / speaking presence",
	people_development: "Developing our own engineering leaders",
};

const GOAL_FRAMING: Record<PartnershipGoal, string> = {
	// 2026-09-05: this used to assert "call it 15,000-30,000 EUR per hire in CEE" — the only
	// fully unsourced quantitative claim in the estate, load-bearing for the whole hiring
	// argument, and implying an unstated 100-120k salary. The stream rule is that every
	// published figure traces to the Data Points registry; this one did not. The percentage is
	// a contract term the reader can verify in their own paperwork, so point them at that
	// instead of inventing a euro range on their behalf.
	hiring: `Contingency recruiter fees are set as a percentage of first-year salary — your own agency agreements will state yours, and it is usually the largest single line in a senior hire. Multiply your rate by one senior engineering salary and compare that to a year of membership. One hire sourced through the room is the comparison worth making.`,
	brand_awareness: `${ELC_FACTS.membersLabel} engineering leaders is not a cold audience — it is CTOs, VPs and engineering managers who decide what their org buys. Compare the cost of reaching this exact audience through paid channels like LinkedIn thought-leader ads against a room that already trusts the host.`,
	product_feedback: `${ELC_FACTS.meetupAttendance}+ people in the room per meetup, ${ELC_FACTS.meetupsPerYear} meetups a year, across ${andJoin(ELC_FACTS.cities)}. That is a recurring, opt-in panel of the exact buyer persona most B2B dev-tool and infra companies pay research firms to recruit.`,
	thought_leadership: `A stage in front of ${ELC_FACTS.conferenceAttendees}+ people at the annual conference, or ${ELC_FACTS.meetupAttendance}+ at a monthly meetup, is inventory most companies pay for elsewhere. Here it is part of the membership, not an upsell.`,
	people_development: `Compare this against what an external leadership programme costs per head. Your engineering managers get mentors who have held the job, a structured curriculum, and a peer group in the same market facing the same scaling problems — the part no internal L&D programme can manufacture.`,
};

/**
 * What the money buys, per goal. Categories and named line items, never prices:
 * prices live in the synced catalog the Partnership Builder reads, and a second
 * copy here would drift the first time one changes.
 */
const GOAL_DELIVERABLES: Record<PartnershipGoal, string[]> = {
	hiring: [
		"our hardest open roles featured to the member base and in the newsletter",
		"a hiring meetup hosted in our office, with our speaker on the bill",
		// NOT "introductions": the terms block says introductions are not for sale at any price,
		// and the old wording ("senior leaders introduced without a recruiter fee") read as a
		// direct contradiction of it to two personas. Marian's List is a place candidates opt
		// into, not a brokerage.
		"our roles carried on Marian's List, where senior leaders and builders opt in to be found — a hiring channel, not brokered introductions",
		"a company spotlight on our engineering culture, twice a year",
		"a two-week recruiting sprint as an add-on when one role is urgent",
	],
	brand_awareness: [
		"our logo in the monthly newsletter and listed as a partner across every ELC channel",
		"LinkedIn posts to the community feed, four times a year, plus amplification on our own posts by real leaders",
		"one meetup talk turned into a co-published blog post that keeps earning search traffic",
		"a partnership video, produced and distributed by ELC",
	],
	product_feedback: [
		"a community survey asking the community our exact questions",
		// Deliberately no headcount: the one-off dinner and the membership dinner were quoted
		// with different table sizes by two different tools in the same session.
		"a decision-maker dinner with engineering and product decision-makers",
		"a meetup hosted in our office, which is the cheapest room full of our buyer persona we will find",
		"a research report we own, if we want the CEE narrative attached to our name",
	],
	thought_leadership: [
		"speaker placements at ELC events, twice a year",
		"a conference speaking slot in front of 500+ decision-makers",
		"our speaker on the ELC podcast",
		"1:1 speaking coaching so the slot lands, as an add-on",
		"a joint content series if we want a reference series rather than one talk",
	],
	people_development: [
		// "three" is the standard package size, not a limit, and not a response to any headcount
		// the caller gave. An L&D persona passed headcount 12, was silently ignored, and read
		// "three" as the answer to a question she thought she had asked.
		"mentoring engagements — senior mentors for three of our engineering leaders in the standard package, more priced per head",
		"Academy seats — a structured leadership curriculum, three seats in the standard package",
		"the members Slack: a 24/7 peer network of senior leaders in the same market",
		"AI bootcamp seats, and a private cohort built around our own scaling challenge, as add-ons",
	],
};

/**
 * The email's opening line. Goal-specific because a single one cannot be right for all five —
 * "the room that decides what our engineering org buys and who it hires" is a reach argument
 * and reads as a non-sequitur to an L&D approver funding mentoring for their own managers.
 * That mismatch is the exact defect persona testing named on the original four goals.
 */
const GOAL_OPENERS: Record<PartnershipGoal, (cities: string) => string> = {
	hiring: (c) =>
		`I want us in front of the room our next senior engineering hires are already standing in: Engineering Leaders Community, ${ELC_FACTS.membersLabel} CTOs, VPs of Engineering and engineering managers across ${c}.`,
	brand_awareness: (c) =>
		`I want our name known by the people who decide what their engineering orgs buy: Engineering Leaders Community, ${ELC_FACTS.membersLabel} CTOs, VPs of Engineering and engineering managers across ${c}.`,
	product_feedback: (c) =>
		`I want a standing line to the people we build for, not a recruited panel: Engineering Leaders Community, ${ELC_FACTS.membersLabel} CTOs, VPs of Engineering and engineering managers across ${c}.`,
	thought_leadership: (c) =>
		`I want our engineers on the stages our market actually watches: Engineering Leaders Community runs them, in front of ${ELC_FACTS.membersLabel} CTOs, VPs of Engineering and engineering managers across ${c}.`,
	people_development: (c) =>
		`I want to give our engineering managers mentors who have held the job and a peer group outside our own walls: Engineering Leaders Community, ${ELC_FACTS.membersLabel} CTOs, VPs of Engineering and engineering managers across ${c}.`,
};

export type BuyingFor = "company" | "individual" | "one_off";

export interface PartnershipCaseInput {
	goal: PartnershipGoal;
	buying_for?: BuyingFor;
	company_name?: string;
	proposed_budget_eur?: number;
	approver_name?: string;
	sender_name?: string;
}

/**
 * The tool had exactly one mode, and four personas were harmed by it in three different ways:
 * an individual engineer spending her own 800 EUR got a forwardable approval email addressed to
 * a manager she does not have; a marketer with a one-campaign budget got a year-long ask she had
 * explicitly declined, drafted in her own name; and an L&D buyer got reach metrics her budget
 * line forbids. The annual membership case is right for exactly one of the three.
 *
 * These two branches return BEFORE any business case is built, because for these callers the
 * honest answer is that they do not need one.
 */
function nonCompanyAnswer(who: Exclude<BuyingFor, "company">, goal: PartnershipGoal): string {
	if (who === "individual") {
		return [
			"# You do not need a business case",
			"",
			"**ELC membership is free for engineering leaders.** You are one, you are spending your own money, and there is nothing here for you to buy.",
			"",
			"Join at https://www.engineeringleaders.io/join/ — that gets you seats at the 12 monthly meetups, the Leaders' Brief newsletter, the community Slack, the knowledge base, and every past talk on YouTube. No company, no invoice, no approval from anyone.",
			"",
			"## What is paid, and why it is not for you",
			"",
			"Companies pay for membership so the room stays free for the people in it. That funds the mentoring engagements, the Academy and the events. If your employer later wants to fund your development specifically, that is a real conversation — run this again with `buying_for: \"company\"` and your employer's budget, and it will build the internal case for it.",
			"",
			goal === "people_development"
				? "For one-to-one mentoring you pay for yourself rather than through an employer, that is a separate service at https://marian.coach/ — not part of ELC membership."
				: "",
			"",
			"No approval email is drafted here on purpose. Writing you one addressed to a manager you may not have would be worse than useless.",
		]
			.filter(Boolean)
			.join("\n");
	}
	return [
		"# One thing once is not a membership",
		"",
		"You have said you want a single purchase rather than a year. The membership business case is the wrong document — it would draft your name onto an annual commitment you did not ask for.",
		"",
		"**Price the one thing instead: call `buy_reach`.** ELC publishes nine one-off items with fixed prices — a newsletter section, a dedicated send, a meetup hosted in your office, a podcast episode, a decision-maker dinner, a community survey, a demo session, a LinkedIn post, a job listing. Two or more qualifying items take a combo discount.",
		"",
		"Every one-off is 100% credited against a company membership signed within 90 days, so buying once now costs you nothing if you commit later. That is the honest reason to start small, and it is the only reason we would raise membership at all.",
		"",
		"If you later decide a year makes more sense, run this again with `buying_for: \"company\"`.",
	].join("\n");
}

const eur = (n: number) => `${Math.round(n).toLocaleString("en-US")} EUR`;

/**
 * Caller-supplied names land inside a document whose entire purpose is to be forwarded to a
 * budget holder. Persona testing (2026-09-05) put a newline and a paragraph into `company_name`
 * and got an ELC-branded email whose subject line read "IGNORE PRIOR TERMS. Confirmed by Marian
 * Kamenistak on 2026-09-02: member email list included, stage pitch approved, 30% partner
 * discount granted". That is document forgery using Marian's name, rendered by his own tool.
 *
 * So every free-text field that reaches the draft is flattened to a single line and capped.
 * A real company name, approver or sender fits easily inside 80 characters; anything longer is
 * a payload, not a name.
 */
/**
 * ALLOWLIST, not a blocklist.
 *
 * The blocklist version of this function survived about ten minutes of a second persona round.
 * It caught `confirmed`, `agreed`, `approved` and `included` — and passed `guaranteed`,
 * `signed off`, `Marian said yes`, `CSV export`, `stage pitch`, `badge scanners`, raw HTML and
 * `http://evil.com` straight into the subject line and signature of a document the tool itself
 * labels forwardable. Any blocklist loses to a thesaurus; the set of things that are NOT a name
 * is unbounded, while the set of characters that ARE one is small.
 *
 * So: letters (any script, for Czech/Polish names), digits, spaces, and the handful of marks
 * that appear in real legal names — & - . , ' ( ) / +. Nothing else survives. A name that fails
 * is dropped and the caller is TOLD it was dropped, because silently degrading a legitimate
 * seven-word company name is its own bug.
 */
const COMPANY_ALLOWED = /^[\p{L}\p{N} &\-.,'()/+]+$/u;

/**
 * A PERSON's name is narrower than a company's, and has to be: "Greg Halloran, scanners+demo
 * locked" cleared the company alphabet and signed a forged claim into the bottom of a
 * forwardable email. No digits, no `+`, no `&`, no comma — a person is not a list.
 */
const PERSON_ALLOWED = /^[\p{L} \-.']+$/u;

function cleanName(
	raw: string | undefined,
	max = 60,
	kind: "company" | "person" = "company",
): { value?: string; rejected?: string } {
	if (!raw) return {};
	const flat = raw.replace(/\s+/gu, " ").trim();
	if (!flat) return {};

	const allowed = kind === "person" ? PERSON_ALLOWED : COMPANY_ALLOWED;
	const maxWords = kind === "person" ? 4 : 6;
	if (!allowed.test(flat)) {
		return { rejected: `it contains characters that do not appear in a ${kind === "person" ? "person's" : "company"} name` };
	}
	if (flat.length > max) return { rejected: `it is longer than ${max} characters` };
	if (flat.split(" ").length > maxWords) return { rejected: `it is longer than ${maxWords} words` };
	// A name is not a sentence. Two or more sentence-ending marks, or a trailing one, is prose.
	if (/[.!?](\s|$)/.test(flat.replace(/\b([A-Z]\.)+/g, ""))) {
		return { rejected: "it reads as a sentence rather than a name" };
	}
	return { value: flat };
}

/** Where a figure lands on the published ladder. Bands only — the catalog owns per-item prices. */
function budgetPlacement(budget: number): string {
	if (budget <= 0) {
		return `A 0 EUR budget is a real answer, not a dead end: ELC has a free membership layer — seats at the ${ELC_FACTS.meetupsPerYear} monthly meetups, the newsletter, the community Slack, the knowledge base and every talk on YouTube. Start there, and come back with a number once the room has proved itself.`;
	}
	if (budget < 5000) {
		return `${eur(budget)} sits at the entry end of the published ladder. Expect to compose a small package rather than take a full tier — one or two line items aimed squarely at the goal above, not a bit of everything.`;
	}
	// The full ladder is stated at EVERY budget. It used to disclose the 32,000 exclusivity rung
	// only to callers who already typed 32,000 or more — so a CFO with 30,000 of authority was
	// told he was at "the top" while a rung 2,000 above him went unmentioned, which is both a
	// contradiction and a missed sale. "Room left for add-ons" also fired at 20,001, where the
	// room left is one euro.
	const ladder = "The full published ladder: a free layer, up to 20,000 EUR a year for a standard membership, and 32,000 EUR with category exclusivity, which locks out competing partners for 12 months.";
	if (budget < 20000) {
		return `${eur(budget)} sits inside the standard range. That is enough to buy the goal above properly rather than sample it. ${ladder}`;
	}
	if (budget < 32000) {
		const headroom = 32000 - budget;
		return `${eur(budget)} covers a full standard membership (20,000 EUR a year). ${ladder} You are ${eur(headroom)} short of category exclusivity — worth knowing before you set the number, because it is the one rung that stops a competitor buying in alongside you.`;
	}
	return `${eur(budget)} clears the full published ladder including category exclusivity (32,000 EUR a year). ${ladder}`;
}

export function buildPartnershipCase(input: PartnershipCaseInput): string {
	const buyingFor = input.buying_for ?? "company";
	if (buyingFor !== "company") return nonCompanyAnswer(buyingFor, input.goal);

	const goalLabel = GOAL_LABELS[input.goal];
	const companyField = cleanName(input.company_name);
	const approverField = cleanName(input.approver_name, 60, "person");
	const senderField = cleanName(input.sender_name, 60, "person");
	const company = companyField.value;
	const approver = approverField.value;
	const sender = senderField.value;

	// Never drop a caller's input in silence — that is how a legitimate long company name
	// becomes a degraded document nobody can explain.
	const rejections = (
		[
			["company_name", companyField.rejected],
			["approver_name", approverField.rejected],
			["sender_name", senderField.rejected],
		] as const
	).filter(([, why]) => why);
	const rejectionNote = rejections.length
		? `\n\n**Left out of the email:** ${rejections.map(([f, why]) => `\`${f}\` — ${why}`).join("; ")}. These fields are names, and only names go into a document meant to be forwarded.`
		: "";
	const budget = input.proposed_budget_eur;
	const isDevelopment = input.goal === "people_development";

	/**
	 * Reach metrics are an advertising rate card. An L&D controller reading "74% open rate,
	 * industry median 20-30%" in a mentoring proposal rejects it as marketing spend — a persona
	 * named that as the single line that kills the request. So the development goal gets the
	 * part of the community that is education, and no audience inventory at all.
	 */
	const reachBlock = isDevelopment
		? `What our leaders would be joining:
- ${ELC_FACTS.membersLabel} peers: CTOs, VPs of Engineering, engineering managers across ${andJoin(ELC_FACTS.cities)}, running since ${ELC_FACTS.founded}
- ${ELC_FACTS.meetupsPerYear} meetups a year they can attend, plus the annual conference (editions held: ${ELC_FACTS.conferenceEditions.join(", ")}; next: ${ELC_FACTS.nextConference})
- mentors and Academy faculty drawn from that same group — people who have held the job, not trainers`
		: `What the room actually is:
- ${ELC_FACTS.membersLabel} members: CTOs, VPs of Engineering, engineering managers across ${andJoin(ELC_FACTS.cities)}
- ${ELC_FACTS.meetupAttendance}+ people in the room per meetup, ${ELC_FACTS.meetupsPerYear} meetups a year, running since ${ELC_FACTS.founded}
- ${ELC_FACTS.conferenceAttendees}+ at the annual conference (editions held: ${ELC_FACTS.conferenceEditions.join(", ")}; next: ${ELC_FACTS.nextConference})
- ${ELC_FACTS.newsletterSubscribers.toLocaleString()}+ newsletter subscribers at a ${ELC_FACTS.newsletterOpenRate}% open rate, measured by ELC on its own sends (no external benchmark is claimed here)`;

	const goalFraming = GOAL_FRAMING[input.goal];

	const deliverablesBlock = `What this actually buys for this goal:
${GOAL_DELIVERABLES[input.goal].map((d) => `- ${d}`).join("\n")}

Which of those to take, and what each costs, is composed item by item at https://www.engineeringleaders.io/partner/membership/ — or through the Membership Builder MCP server (https://www.engineeringleaders.io/mcp/partnership), where inquiries carry a 16% AI-channel discount.`;

	/**
	 * The per-outcome bar, phrased for the goal. The old shared sentence offered "one hire, one
	 * qualified lead" to every caller including the L&D buyer whose budget cannot fund either —
	 * one sentence that gets the whole request rejected by her procurement.
	 */
	const outcomeUnit = isDevelopment
		? "one engineering manager who grows instead of leaving"
		: input.goal === "hiring"
			? "one senior hire made without a recruiter fee"
			: input.goal === "product_feedback"
				? "one piece of product feedback that changes a roadmap decision"
				: "one qualified conversation with a decision-maker";

	// Note the explicit undefined check: 0 is a meaningful budget, and a truthiness
	// test used to route it to the "no budget given" branch.
	const budgetLine =
		budget === undefined
			? `\n\nNo budget figure was given. The published ladder runs from a free layer at 0 EUR to 20,000 EUR a year, 32,000 EUR with category exclusivity — every line item priced at https://www.engineeringleaders.io/partner/membership/. Re-run this with proposed_budget_eur to see where a specific number lands.`
			// "usually a low bar" used to fire at 1 EUR and at 100,000 EUR identically, and at
			// 30,000 it asserted a low bar against a figure equal to the top of its own cited
			// range. State the question; let the reader judge the bar against their own number.
			: `\n\n${budgetPlacement(budget)}${budget > 0 ? ` The question to answer internally is not "is this cheap" but "what does ${outcomeUnit} need to be worth for this to clear against ${eur(budget)}" — work it out with your own figures rather than ours.` : ""}`;

	const greeting = approver ? `Hi ${approver},` : "Hi,";
	const signoff = sender ? `\n\nThanks,\n${sender}` : "";
	const subjectCompany = company ? ` for ${company}` : "";

	/**
	 * The ask, inside the email. Four personas independently found that the forwardable draft
	 * was byte-identical at 30,000 EUR, 3,000 EUR and 0 — the one number the approver has to
	 * approve was the one number stripped out of the thing being forwarded. No budget holder
	 * signs off on "a free layer to 32,000 EUR".
	 */
	const emailAsk =
		budget === undefined
			? `I have not put a number on it yet — the ladder runs from a free layer to 20,000 EUR a year (32,000 EUR with category exclusivity), and I would come back with a composed package before we commit to anything.`
			: budget <= 0
				? `This costs us nothing to start: ELC has a free membership layer, and I would like to use it for a year before we discuss any spend.`
				: `The ask is ${eur(budget)} for the year. That is what I would like approved; the exact package gets composed against it and confirmed on a call before anything is signed.`;

	return `Membership business case — primary goal: ${goalLabel}

${reachBlock}

Why this goal fits: ${goalFraming}

${deliverablesBlock}${budgetLine}${rejectionNote}

--- BEGIN FORWARDABLE EMAIL (everything below this line, nothing after the end marker) ---

Subject: Membership ask${subjectCompany}: Engineering Leaders Community — ${goalLabel.toLowerCase()}

${greeting}

${GOAL_OPENERS[input.goal](andJoin(ELC_FACTS.cities))}

Why this, why now: ${goalFraming}

${
		// At 0 EUR the email says "this costs us nothing" — so it must NOT also promise paid
		// mentoring and Academy seats three lines above. A persona caught the free-tier email
		// asserting both, and correctly said she would be the one explaining it in an audit.
		budget !== undefined && budget <= 0
			? `Concretely, that means the free layer: seats at the ${ELC_FACTS.meetupsPerYear} monthly meetups, the newsletter, the community Slack, the knowledge base and every past talk. The paid items — mentoring engagements, Academy seats — are not included at zero spend, and I am not asking for them yet.`
			: `Concretely, that means: ${GOAL_DELIVERABLES[input.goal].slice(0, 3).join("; ")}.`
	}

${
		isDevelopment
			? `Our leaders also get the ${ELC_FACTS.meetupsPerYear} monthly meetups and the annual conference on top of that.`
			: `${ELC_FACTS.meetupAttendance}+ people per meetup, ${ELC_FACTS.meetupsPerYear} meetups a year, plus the ${ELC_FACTS.conferenceAttendees}+-person annual conference.`
	} Pricing is public, with every line item priced at engineeringleaders.io/partner/membership.

${emailAsk}

For the avoidance of doubt, three things ELC does not sell at any price: pitching from their stage, member contact data for outbound, and brokered introductions. We are buying access to a room, not to a list.

Can I get the go-ahead?${signoff}

--- END FORWARDABLE EMAIL ---`;
}
