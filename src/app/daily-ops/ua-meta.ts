import type { UaOutcome } from "@prisma/client";

export const UA_OUTCOMES = ["neg", "pos", "refused", "unable"] as const satisfies readonly UaOutcome[];

export type UaOutcomeValue = (typeof UA_OUTCOMES)[number];

export const uaOutcomeLabel: Record<UaOutcome, string> = {
  neg: "Negative",
  pos: "Positive",
  refused: "Refused",
  unable: "Unable",
};

export const uaOutcomeBadge: Record<UaOutcome, string> = {
  neg: "bg-teal-50 text-teal-700",
  pos: "bg-red-50 text-red-700",
  refused: "bg-amber-50 text-amber-800",
  unable: "bg-slate-100 text-slate-600",
};

/** MVP: notes only for positive or refused. */
export const uaNoteAllowed = (outcome: UaOutcome) =>
  outcome === "pos" || outcome === "refused";
