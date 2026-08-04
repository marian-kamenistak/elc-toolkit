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
		"Is there one named person on the ground in that city who owns logistics — venue, local promotion follow-through, on-the-day running — not run remotely from Prague?",
	realistic_targets:
		"Have you set a first-meetup attendance target of 40-50 (not compared to an established city's 100+), so a full room of realistic size still feels like a win?",
	promo_budget:
		"Is there a small paid-promotion budget set aside (even a few thousand CZK for a targeted LinkedIn boost of the founder's post), rather than relying on organic reach alone?",
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

const VERDICTS = {
	ready: {
		title: "Ready to launch",
		body: "You have what ELC's own playbook treats as the non-negotiables. The room won't fill itself, but you're not launching blind.",
	},
	close: {
		title: "Close, fix the gaps first",
		body: "One or two real gaps. ELC's own experience: the speaker network is the single highest-leverage one to fix before a date goes on a calendar — everything else can be patched after the first event.",
	},
	notYet: {
		title: "Not yet — this is where new-city launches stall",
		body: "More than half the checklist is open. Launching now usually means a half-empty room and a discouraged local operator. Close the speaker-network and local-operator gaps first; the rest can follow.",
	},
} as const;

export function assessCommunityReadiness(
	answers: ReadinessAnswers,
): ReadinessResult {
	const met = READINESS_DIMENSIONS.filter((d) => answers[d] === true);
	const gaps = READINESS_DIMENSIONS.filter((d) => answers[d] !== true);
	const metCount = met.length;
	const total = READINESS_DIMENSIONS.length;

	let key: keyof typeof VERDICTS;
	if (metCount === total) key = "ready";
	else if (metCount >= total - 2) key = "close";
	else key = "notYet";

	const v = VERDICTS[key];
	const gapLines = gaps
		.map((d) => `- ${DIMENSION_LABELS[d]}`)
		.join("\n");

	return {
		metCount,
		total,
		verdict: v.title,
		body: `${v.body}\n\nChecked: ${metCount}/${total}.${gaps.length > 0 ? `\n\nOpen:\n${gapLines}` : ""}\n\nContext from running this in Brno, Bratislava and Kraków: speakers are the actual distribution channel in a new city — your Prague playbook (existing Slack, existing Luma subscribers, existing LinkedIn network) does not exist yet there. If speakers won't promote, the room does not fill, regardless of how good the promo-channel list looks on paper.`,
		gaps: gaps.map((d) => DIMENSION_LABELS[d]),
	};
}

export function readinessQuestionnaireText(): string {
	return READINESS_DIMENSIONS.map(
		(d, i) => `${i + 1}. ${DIMENSION_LABELS[d]} (key: ${d})`,
	).join("\n");
}
