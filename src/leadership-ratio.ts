/**
 * Org leadership-ratio benchmark. Compares a company's own management/senior-IC
 * split against the ELC community's own composition (69% Manager+/Leadership,
 * 21% Senior/Staff IC — computed from the "ELC Members" Attio list, verified
 * 2026-08-03). Both figures describe the SAME population: senior people who
 * could plausibly be in a management role (managers, tech leads, senior/staff
 * ICs) — junior/mid ICs are out of scope for both sides of the comparison, so
 * the two percentages are genuinely comparable, not apples to oranges.
 */

import { ELC_FACTS, LEADERSHIP_RATIO_BENCHMARK } from "./content";

export interface LeadershipRatioInput {
	managers: number;
	senior_ics: number;
}

export interface LeadershipRatioResult {
	managerPct: number;
	seniorIcPct: number;
	deltaFromPeer: number;
	verdict: string;
	body: string;
}

export function benchmarkLeadershipRatio(
	input: LeadershipRatioInput,
): LeadershipRatioResult {
	const { managers, senior_ics } = input;
	const total = managers + senior_ics;
	if (total <= 0) {
		return {
			managerPct: 0,
			seniorIcPct: 0,
			deltaFromPeer: 0,
			verdict: "No data",
			body: "Both managers and senior_ics were 0 or missing — nothing to compare. Count everyone in a Manager+/Leadership role, and everyone Senior/Staff level who is still an individual contributor (skip junior/mid ICs, they're out of scope for this comparison on both sides).",
		};
	}

	const managerPct = Math.round((managers / total) * 100);
	const seniorIcPct = 100 - managerPct;
	const peerManagerPct = ELC_FACTS.segmentManagerPlusPct;
	const delta = managerPct - peerManagerPct;

	let verdict: string;
	let read: string;
	if (Math.abs(delta) <= 5) {
		verdict = "In line with the peer group";
		read = `Your split (${managerPct}% manager / ${seniorIcPct}% senior IC) sits close to the ELC peer baseline (${peerManagerPct}% / ${ELC_FACTS.segmentSeniorIcPct}%). No structural red flag here — if something feels off, it's probably not the manager:IC ratio.`;
	} else if (delta > 5) {
		verdict = "Top-heavier than the peer group";
		read = `${managerPct}% of your senior people are managers, vs ${peerManagerPct}% across ${ELC_FACTS.membersLabel} ELC peers — ${delta} points higher. Worth asking: do you have a real senior/staff IC track people can grow into without taking headcount, or does "senior" here mostly mean "manager"? A thin IC track is the most common cause of this pattern.`;
	} else {
		verdict = "More IC-heavy than the peer group";
		read = `Only ${managerPct}% of your senior people are managers, vs ${peerManagerPct}% across ${ELC_FACTS.membersLabel} ELC peers — ${Math.abs(delta)} points lower. Worth asking: is management capacity actually the bottleneck (spans too wide, delivery slipping on coordination), or is this deliberate and your senior ICs are genuinely unblocked?`;
	}

	return {
		managerPct,
		seniorIcPct,
		deltaFromPeer: delta,
		verdict,
		body: `${LEADERSHIP_RATIO_BENCHMARK.headline}\n\n${read}\n\nThis reads company structure, not individual performance — a skew isn't a verdict on your people, it's a prompt to ask why the shape looks the way it does.`,
	};
}
