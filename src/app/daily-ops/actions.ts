"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { NightCheckEntryStatus, UaOutcome } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentOrgId, str } from "@/lib/org";
import { ENTRY_STATUSES, type MarkableStatus } from "./meta";
import { UA_OUTCOMES, uaNoteAllowed, type UaOutcomeValue } from "./ua-meta";

const isMarkable = (v: string | null): v is MarkableStatus =>
  !!v && (ENTRY_STATUSES as readonly string[]).includes(v);

const isUaOutcome = (v: string | null): v is UaOutcomeValue =>
  !!v && (UA_OUTCOMES as readonly string[]).includes(v);

export async function startNightCheck(f: FormData) {
  const orgId = await getCurrentOrgId();
  const houseId = str(f, "houseId");
  const house = houseId
    ? await prisma.house.findFirst({ where: { id: houseId, orgId }, select: { id: true } })
    : null;
  if (!house) throw new Error("A valid house is required");

  const existing = await prisma.nightCheck.findFirst({
    where: { orgId, houseId: house.id, status: "in_progress" },
    orderBy: { startedAt: "desc" },
    select: { id: true },
  });
  if (existing) {
    redirect(`/daily-ops/${existing.id}`);
  }

  const residents = await prisma.resident.findMany({
    where: { orgId, houseId: house.id, status: "active" },
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    select: { id: true },
  });

  const check = await prisma.$transaction(async (tx) => {
    const session = await tx.shiftSession.create({
      data: { orgId, houseId: house.id, status: "open" },
    });
    return tx.nightCheck.create({
      data: {
        orgId,
        houseId: house.id,
        shiftSessionId: session.id,
        status: "in_progress",
        entries: {
          create: residents.map((r) => ({
            orgId,
            residentId: r.id,
            status: "pending" as NightCheckEntryStatus,
          })),
        },
      },
    });
  });

  revalidatePath("/daily-ops");
  redirect(`/daily-ops/${check.id}`);
}

export async function setEntryStatus(checkId: string, entryId: string, f: FormData) {
  const orgId = await getCurrentOrgId();
  const statusRaw = str(f, "status");
  if (!isMarkable(statusRaw)) return;

  const check = await prisma.nightCheck.findFirst({
    where: { id: checkId, orgId, status: "in_progress" },
    select: { id: true },
  });
  if (!check) return;

  await prisma.nightCheckEntry.updateMany({
    where: { id: entryId, nightCheckId: checkId, orgId },
    data: { status: statusRaw, markedAt: new Date() },
  });

  revalidatePath(`/daily-ops/${checkId}`);
}

export async function completeNightCheck(checkId: string, f: FormData) {
  const orgId = await getCurrentOrgId();
  const handoffNote = str(f, "handoffNote");

  const check = await prisma.nightCheck.findFirst({
    where: { id: checkId, orgId, status: "in_progress" },
  });
  if (!check) {
    redirect(`/daily-ops/${checkId}`);
  }

  const now = new Date();
  await prisma.$transaction(async (tx) => {
    await tx.nightCheck.update({
      where: { id: checkId },
      data: {
        status: "completed",
        completedAt: now,
        handoffNote,
      },
    });
    await tx.shiftSession.update({
      where: { id: check.shiftSessionId },
      data: { status: "closed", endedAt: now },
    });
  });

  revalidatePath("/daily-ops");
  revalidatePath(`/daily-ops/${checkId}`);
  redirect(`/daily-ops/${checkId}`);
}

/** Immutable after create — log a UA result tied to house and optional open shift. */
export async function createUaResult(f: FormData) {
  const orgId = await getCurrentOrgId();
  const residentId = str(f, "residentId");
  const houseId = str(f, "houseId");
  const outcomeRaw = str(f, "outcome");
  if (!residentId || !isUaOutcome(outcomeRaw)) return;

  const resident = await prisma.resident.findFirst({
    where: { id: residentId, orgId },
    select: { id: true, houseId: true },
  });
  if (!resident) return;

  const resolvedHouseId = houseId ?? resident.houseId;
  if (resolvedHouseId) {
    const house = await prisma.house.findFirst({
      where: { id: resolvedHouseId, orgId },
      select: { id: true },
    });
    if (!house) return;
  }

  let shiftSessionId: string | null = null;
  if (resolvedHouseId) {
    const openShift = await prisma.shiftSession.findFirst({
      where: { orgId, houseId: resolvedHouseId, status: "open" },
      orderBy: { startedAt: "desc" },
      select: { id: true },
    });
    shiftSessionId = openShift?.id ?? null;
  }

  const noteRaw = str(f, "note");
  const note = uaNoteAllowed(outcomeRaw) ? noteRaw : null;

  await prisma.uaResult.create({
    data: {
      orgId,
      residentId: resident.id,
      houseId: resolvedHouseId,
      shiftSessionId,
      outcome: outcomeRaw as UaOutcome,
      note,
      author: str(f, "author") ?? "Staff",
    },
  });

  revalidatePath("/daily-ops");
  revalidatePath("/daily-ops/ua");
  revalidatePath(`/residents/${resident.id}`);
  const qs = resolvedHouseId ? `?house=${resolvedHouseId}` : "";
  redirect(`/daily-ops/ua${qs}`);
}
