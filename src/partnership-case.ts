/**
 * Partnership business case builder — the reach math a partner's champion
 * needs to justify an ELC partnership budget internally, plus a forwardable
 * approval email. Mirrors the shape of marian.coach's mentoring business-case
 * tool, but computes REACH VALUE, not a specific spend — ELC's own tier
 * pricing has an unresolved internal contradiction (data-points.json flags
 * it explicitly: "Do not publish any per-tier price until resolved"), and
 * the live /become-partner page itself states no price ("book a call for a
 * real quote"). This tool matches that convention: it never states what ELC
 * charges, only what showing up in front of the room is worth.
 */

import { ELC_FACTS, andJoin } from "./content";

export const PARTNERSHIP_GOALS = [
	"hiring",
	"brand_awareness",
	"product_feedback",
	"thought_leadership",
] as const;

export type PartnershipGoal = (typeof PARTNERSHIP_GOALS)[number];

const GOAL_LABELS: Record<PartnershipGoal, string> = {
	hiring: "Hiring senior engineers",
	brand_awareness: "Brand awareness with engineering leaders",
	product_feedback: "Product feedback from real buyers",
	thought_leadership: "Thought leadership / speaking presence",
};

const GOAL_FRAMING: Record<PartnershipGoal, string> = {
	hiring: `A recruiter fee for one senior engineering hire typically runs 15-25% of first-year salary — call it 15,000-30,000 EUR per hire in CEE. One hire sourced through the room pays for most partnership tiers outright.`,
	brand_awareness: `${ELC_FACTS.membersLabel} engineering leaders is not a cold audience — it is CTOs, VPs and engineering managers who decide what their org buys. Compare the cost of reaching this exact audience through paid channels (LinkedIn thought-leader ads, sponsored content) against a room that already trusts the host.`,
	product_feedback: `${ELC_FACTS.meetupAttendance}+ people in the room per meetup, ${ELC_FACTS.meetupsPerYear} meetups a year, across ${andJoin(ELC_FACTS.cities)}. That is a recurring, opt-in panel of the exact buyer persona most B2B dev-tool and infra companies pay research firms to recruit.`,
	thought_leadership: `A stage in front of ${ELC_FACTS.conferenceAttendees}+ people at the annual conference, or ${ELC_FACTS.meetupAttendance}+ at a monthly meetup, is inventory most companies buy through sponsorships or paid speaking slots. Here it is part of the partnership, not an upsell.`,
};

export interface PartnershipCaseInput {
	goal: PartnershipGoal;
	company_name?: string;
	proposed_budget_eur?: number;
}

const eur = (n: number) => `${Math.round(n).toLocaleString("en-US")} EUR`;

export function buildPartnershipCase(input: PartnershipCaseInput): string {
	const goalLabel = GOAL_LABELS[input.goal];
	const company = input.company_name?.trim() || "[company]";
	const budget = input.proposed_budget_eur;

	const reachBlock = `What the room actually is:
- ${ELC_FACTS.membersLabel} members: CTOs, VPs of Engineering, engineering managers across ${andJoin(ELC_FACTS.cities)}
- ${ELC_FACTS.meetupAttendance}+ people in the room per meetup, ${ELC_FACTS.meetupsPerYear} meetups a year, running since ${ELC_FACTS.founded}
- ${ELC_FACTS.conferenceAttendees}+ at the annual conference (editions held: ${ELC_FACTS.conferenceEditions.join(", ")}; next: ${ELC_FACTS.nextConference})
- ${ELC_FACTS.newsletterSubscribers.toLocaleString()}+ newsletter subscribers at a ${ELC_FACTS.newsletterOpenRate}% open rate (the industry median is closer to 20-30%)`;

	const goalFraming = GOAL_FRAMING[input.goal];

	const budgetLine = budget
		? `\n\nAgainst a proposed ${eur(budget)} spend, the question to answer is not "is this cheap" but "what does one outcome (one hire, one qualified lead, one piece of real product feedback) need to be worth for this to clear" — usually a low bar against ${eur(budget)}.`
		: `\n\nNo budget figure was given — ELC does not publish tier pricing (three tiers, scoped to what you actually want from the room; book a call for a real quote). Once you have a number from that call, re-run this with proposed_budget_eur to see the per-outcome bar.`;

	return `Partnership business case — primary goal: ${goalLabel}

${reachBlock}

Why this goal fits: ${goalFraming}${budgetLine}

---

Forwardable email draft:

Subject: Partnership ask: Engineering Leaders Community — ${goalLabel.toLowerCase()}

Hi [manager name],

I want us in front of ${company === "[company]" ? "the room" : "the audience"} that actually decides what our engineering org buys and who it hires: Engineering Leaders Community, ${ELC_FACTS.membersLabel} CTOs, VPs of Engineering and engineering managers across ${andJoin(ELC_FACTS.cities)}.

Why this, why now: ${goalFraming}

${ELC_FACTS.meetupAttendance}+ people per meetup, ${ELC_FACTS.meetupsPerYear} meetups a year, plus the ${ELC_FACTS.conferenceAttendees}+-person annual conference. There is no published rate card — the next step is a call to scope which of the three tiers (Nebula, Supernova, Quasar) fits what we're after, then I bring back a real number.

Can I get the go-ahead to book that call?

[your name]`;
}
