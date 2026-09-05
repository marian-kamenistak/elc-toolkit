/**
 * Org leadership-ratio benchmark.
 *
 * Reframed 2026-09-05 after persona testing. The previous version computed a
 * "delta from the peer baseline" — your manager % minus ELC's 69% — and gave a
 * verdict on the gap ("12 points higher"). Testers were right to reject it: ELC's
 * 69/21 is the composition of a self-selected *community* (who joins a club for
 * engineering leaders), not a survey of org structures. Subtracting one from the
 * other produces a number that looks like a measurement and measures nothing, and
 * a "you are 12 points off" verdict implies 69% is a target. It is not.
 *
 * What survives is the honest part: the caller's own split, computed from the
 * caller's own counts, plus ELC's composition offered as context rather than as a
 * bar to clear. The read is a question to ask, not a score.
 *
 * Both figures still describe the SAME population — senior people who could
 * plausibly hold a management role (managers, tech leads, senior/staff ICs).
 * Junior/mid ICs are out of scope on both sides.
 */

import { ELC_FACTS, LEADERSHIP_RATIO_BENCHMARK } from "./content";

export interface LeadershipRatioInput {
	managers: number;
	senior_ics: number;
}

export interface LeadershipRatioResult {
	managerPct: number;
	seniorIcPct: number;
	verdict: string;
	body: string;
}

/** Below this, one person moving changes the percentage enough to mislead. */
const SMALL_SAMPLE = 10;

/**
 * 2026-09-05, second persona round. Reframing the ELC figure as "context, not a target" made a
 * bad comparison politer without making it valid, and a CFO persona took it apart in one line:
 *
 *   - The caller's two counts are normalised across TWO categories and sum to 100%.
 *   - ELC's 69% Manager+ and 21% Senior/Staff IC sum to 90%. It is a share of the whole member
 *     base, which contains roles in neither band. Different denominator, different universe.
 *   - Placed side by side they invite subtraction anyway. At 150 managers / 550 senior ICs the
 *     old output printed "21% manager" directly above "21% are Senior/Staff ICs" — the same
 *     number meaning opposite things, with nothing warning the reader.
 *
 * So the figure now states its own limits in the same breath: what it is a share OF, that it
 * does not total 100, that the denominator is a floor and self-selected, and that no comparison
 * is computed. Anything less and the reader does the invalid arithmetic the tool declined to do.
 */
const ELC_COMPOSITION_NOTE = `Not a benchmark, and deliberately not compared against: ${LEADERSHIP_RATIO_BENCHMARK.headline} Those two shares are of ELC's whole member base and total 90, not 100 — the rest hold roles in neither band — whereas your two counts above are normalised across only each other. Different denominators, so the two sets of percentages cannot be subtracted or ranked. ${LEADERSHIP_RATIO_BENCHMARK.note} ${LEADERSHIP_RATIO_BENCHMARK.source} It is a floor ("${ELC_FACTS.membersLabel}"), self-reported, and self-selected — people who join a community for engineering leaders.`;

export function benchmarkLeadershipRatio(
	input: LeadershipRatioInput,
): LeadershipRatioResult {
	const { managers, senior_ics } = input;
	const total = managers + senior_ics;
	if (total <= 0) {
		return {
			managerPct: 0,
			seniorIcPct: 0,
			verdict: "No data",
			body: "Both managers and senior_ics were 0 or missing — nothing to describe. Count everyone in a Manager+/Leadership role, and everyone Senior/Staff level who is still an individual contributor (skip junior/mid ICs, they're out of scope on both sides).",
		};
	}

	const managerPct = Math.round((managers / total) * 100);
	const seniorIcPct = 100 - managerPct;

	// The caller's own arithmetic on the caller's own numbers. No external claim.
	const span =
		managers === 0
			? "no managers at all in this population"
			: `1 manager for every ${(senior_ics / managers).toFixed(1)} senior ICs`;
	const verdict = `${managerPct}% manager / ${seniorIcPct}% senior IC — ${span}`;

	const read =
		managers === 0
			? "There are no managers in the population you counted. Either the senior ICs report somewhere outside this group, or nobody owns their growth and performance. Worth confirming which."
			: senior_ics === 0
				? "Everyone you counted is a manager. Either the senior IC track does not exist here, or the senior ICs sit outside the population you counted. Both are worth knowing, and they have opposite fixes."
				: // Branch on the caller's own majority, NOT on ELC's 69%. Branching on the
					// community figure would reinstate exactly the comparison the note above
					// explains is invalid — just hidden inside a conditional instead of printed.
					managerPct > 50
					? "More of your senior people carry a management title than carry a senior IC one. The question that usually matters: is there a real senior/staff IC track someone can grow into without taking headcount, or does \"senior\" here mostly mean \"manager\"? A thin IC track is the most common reason this shape appears."
					: "More of your senior people are individual contributors than managers. The question that usually matters: is management capacity the bottleneck — spans too wide, delivery slipping on coordination — or is this deliberate and your senior ICs are genuinely unblocked?";

	const smallSample =
		total < SMALL_SAMPLE
			? `\n\nYou counted ${total} people. At that size one person joining or leaving moves the percentage by roughly ${Math.round(100 / total)} points, so read the shape, not the number.`
			: "";

	return {
		managerPct,
		seniorIcPct,
		verdict,
		body: `Your split: **${managerPct}% manager / ${seniorIcPct}% senior IC** (${managers} and ${senior_ics} people).\n\n${read}${smallSample}\n\n${ELC_COMPOSITION_NOTE}\n\nThis reads company structure, not individual performance — a skew isn't a verdict on your people, it's a prompt to ask why the shape looks the way it does.`,
	};
}
