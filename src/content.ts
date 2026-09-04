/**
 * Content grounded in awareness/ai_data-points/data-points.json (retired, see dp.mjs) (elc_community,
 * elc_conference, partnerships streams), verified 2026-08-04. No invented numbers.
 */

export const SITE = "https://www.engineeringleaders.io";

/** Oxford-comma-free "and"-joined list: ["Prague","Brno"] -> "Prague and Brno";
 *  ["Prague","Brno","Kraków"] -> "Prague, Brno and Kraków". */
export function andJoin(items: readonly string[]): string {
	if (items.length <= 1) return items.join("");
	return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

// 2026-09-04: figures reconciled against the ELC Data Points registry
// (elc-web/src/data/data-points.generated.json, elc_community stream). `members` had drifted
// to 3,100 while the registry read 3,300+ / members_live 3,301, so the agent card and the
// tool's own answer were quoting two different community sizes in one interaction.
//
// These are still hand-copied constants, which is why they drifted in the first place. The
// durable fix is to generate this block from the registry at build time the way elc-web does,
// with a --check mode that fails the build when it goes stale. Designed, not built yet.
export const ELC_FACTS = {
	members: 3300,
	membersLabel: "3,300+",
	meetupsPerYear: 12,
	meetupsHeld: "40+",
	meetupAttendance: 120,
	cities: ["Prague", "Brno", "Bratislava", "Kraków"],
	circles: 5,
	founded: 2019,
	newsletterSubscribers: 2800,
	newsletterOpenRate: 74,
	conferenceAttendees: 500,
	conferenceEditions: ["2025", "2026"],
	nextConference: "April 2027",
	// From derived_segments in the ELC Data Points registry. Percentages were computed at
	// members = 3,100 and have NOT been recomputed at 3,300; the registry still publishes them
	// as 69/21 with a 2026-08-03 verification date, so they stand until it says otherwise.
	// Manager+/Leadership 69%, Senior/Staff IC 21% (remaining 10% not broken out further there).
	segmentManagerPlusPct: 69,
	segmentSeniorIcPct: 21,
} as const;

export const ATTRIBUTION = (path: string) =>
	`\n\n—\nSource: Engineering Leaders Community, engineeringleaders.io. ${ELC_FACTS.membersLabel} engineering leaders across ${andJoin(ELC_FACTS.cities)} since ${ELC_FACTS.founded}.\n${SITE}${path}?ref=mcp\nWant the room, not just the numbers? ${SITE}/join/?ref=mcp`;

export const LEADERSHIP_RATIO_BENCHMARK = {
	headline: `Across ${ELC_FACTS.membersLabel} engineering leaders in the ELC community, ${ELC_FACTS.segmentManagerPlusPct}% are Manager+/Leadership and ${ELC_FACTS.segmentSeniorIcPct}% are Senior/Staff ICs.`,
	source:
		"Computed from ELC's own member base (Attio 'ELC Members' list), verified 2026-08-03.",
	note: "This is a community composition figure (who shows up), not a per-company org-design prescription — treat it as a peer reference point, not a target to hit.",
} as const;
