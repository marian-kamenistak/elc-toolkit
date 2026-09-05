/**
 * Community launch readiness test — should you start a local engineering-
 * leadership meetup in your city? Built directly from ELC's own new-city
 * playbook (playbooks/meetup-new-city.md), the real operating doc used to
 * launch Brno, Bratislava and Kraków. Not theory — the actual checklist.
 */

export const READINESS_DIMENSIONS = [
	"speaker_network",
	"promo_channels",
	"local_operator",
	"realistic_targets",
	"promo_budget",
] as const;

export type ReadinessDimension = (typeof READINESS_DIMENSIONS)[number];

export const DIMENSION_LABELS: Record<ReadinessDimension, string> = {
	speaker_network:
		"Do you have 2-3 speakers lined up who have real local reach (LinkedIn following, respected at their company) and will personally promote the event, not just show up?",
	promo_channels:
		"Do you have a plan for at least 3 of: LinkedIn event + geo-targeted invites, a local tech-event aggregator listing, a local tech-ecosystem org for cross-promotion, Meetup.com/Eventbrite cross-posting?",
	local_operator:
		"Is there one named person on the ground in that city who owns logistics — venue, local promotion follow-through, on-the-day running — not run remotely from another city?",
	realistic_targets:
		"Have you set a first-meetup attendance target of 40-50 (not compared to an established city's 100+ — a first meetup is not measured against a fifth-year one), so a full room of realistic size still feels like a win?",
	promo_budget:
		"Is there a small paid-promotion budget set aside (roughly 100-200 EUR is enough for a targeted LinkedIn boost of the organiser's post), rather than relying on organic reach alone?",
};

export interface ReadinessAnswers {
	[key: string]: boolean;
}

export interface ReadinessResult {
	metCount: number;
	total: number;
	verdict: string;
	body: string;
	gaps: string[];
}

/**
 * Short names for the open items, so the verdict can name the gaps the caller ACTUALLY has.
 *
 * 2026-09-05: the band text was a hardcoded string per bucket. Someone who answered
 * `local_operator: true` was told "Close the speaker-network and local-operator gaps first" —
 * advised to fix a gap they had just said they do not have — and someone with
 * `speaker_network: true` was told the speaker network was their highest-leverage fix. Two
 * visible bugs from one shortcut.
 */
const SHORT: Record<string, string> = {
	speaker_network: "the speaker network",
	promo_channels: "the promotion channels",
	local_operator: "a named local operator",
	realistic_targets: "a realistic attendance target",
	promo_budget: "a small promotion budget",
};

/** The order ELC's own experience says to close them in. */
const PRIORITY = ["speaker_network", "local_operator", "promo_channels", "realistic_targets", "promo_budget"];

const andList = (xs: string[]): string =>
	xs.length <= 1 ? (xs[0] ?? "") : `${xs.slice(0, -1).join(", ")} and ${xs[xs.length - 1]}`;

export function assessCommunityReadiness(
	answers: ReadinessAnswers,
): ReadinessResult {
	const met = READINESS_DIMENSIONS.filter((d) => answers[d] === true);
	const gaps = READINESS_DIMENSIONS.filter((d) => answers[d] !== true);
	const metCount = met.length;
	const total = READINESS_DIMENSIONS.length;

	// Gaps in the order they should be closed, named from the caller's own answers.
	const ranked = [...gaps].sort((a, b) => PRIORITY.indexOf(a) - PRIORITY.indexOf(b));
	const topTwo = andList(ranked.slice(0, 2).map((d) => SHORT[d] ?? d));

	let verdict: string;
	let body: string;
	if (metCount === total) {
		verdict = "Ready to launch";
		body =
			"You have what ELC's own playbook treats as the non-negotiables. The room won't fill itself, but you're not launching blind.";
	} else if (metCount >= total - 2) {
		verdict = "Close, fix the gaps first";
		body = `${gaps.length === 1 ? "One real gap" : "Two real gaps"}: ${topTwo}. Close ${gaps.length === 1 ? "it" : "them"} before a date goes on a calendar — everything else can be patched after the first event.`;
	} else if (metCount >= 2) {
		verdict = "Not yet — this is where new-city launches stall";
		body = `More than half the checklist is open. Launching now usually means a half-empty room and a discouraged local operator. Start with ${topTwo}; the rest can follow.`;
	} else {
		// 2026-09-05: 0/5, 1/5 and 2/5 all returned the same paragraph, so the tool could not
		// tell "you have one thing" from "you have nothing" — and its worst-case output was
		// still a to-do list. A persona whose stated fear was a third dead project would have
		// read "close two gaps and go" and launched. At this end the honest answer is don't.
		verdict = "Do not set a date yet";
		body = `${metCount === 0 ? "None" : "Only one"} of the five is in place. This is not a gap list, it is a decision: do not announce a date. The failure mode here is not a smaller room, it is one underattended event that burns the local goodwill you would need for the second. Spend a month on ${topTwo} with no event in the diary, then run this again — and if that month shows the interest is not there, that is a real answer and a cheap one.`;
	}

	const gapLines = gaps.map((d) => `- ${DIMENSION_LABELS[d]}`).join("\n");

	return {
		metCount,
		total,
		verdict,
		body: `${body}\n\nChecked: ${metCount}/${total}.${gaps.length > 0 ? `\n\nOpen:\n${gapLines}` : ""}\n\nContext from running this in Brno, Bratislava and Kraków: speakers are the actual distribution channel in a new city. Whatever audience an established city already has — its Slack, its Luma subscribers, its mailing list — does not exist yet in a new one, so if speakers won't personally promote, the room does not fill regardless of how good the promo-channel list looks on paper.`,
		gaps: gaps.map((d) => DIMENSION_LABELS[d]),
	};
}

export function readinessQuestionnaireText(): string {
	return READINESS_DIMENSIONS.map(
		(d, i) => `${i + 1}. ${DIMENSION_LABELS[d]} (key: ${d})`,
	).join("\n");
}
