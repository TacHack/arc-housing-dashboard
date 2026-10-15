"use server";
import type { BehavioralContractStatus, ClientLogType, UaOutcome } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { date, getCurrentOrgId, str } from "@/lib/org";
import { UA_OUTCOMES, uaNoteAllowed, type UaOutcomeValue } from "@/app/daily-ops/ua-meta";

const fields = (f: FormData) => ({
  firstName: str(f, "firstName") ?? "",
  lastName: str(f, "lastName") ?? "",
  dob: date(f, "dob"),
  insuranceCarrier: str(f, "insuranceCarrier"),
  insuranceMemberId: str(f, "insuranceMemberId"),
  emergencyContactName: str(f, "emergencyContactName"),
  emergencyContactPhone: str(f, "emergencyContactPhone"),
  admissionDate: date(f, "admissionDate"),
});

export async function createResident(f: FormData) {
  const orgId = await getCurrentOrgId();
  const r = await prisma.resident.create({ data: { orgId, ...fields(f) } });
  revalidatePath("/residents");
  redirect(`/residents/${r.id}`);
}
export async function updateResident(id: string, f: FormData) {
  const orgId = await getCurrentOrgId();
  await prisma.resident.updateMany({ where: { id, orgId }, data: fields(f) });
  revalidatePath("/residents"); revalidatePath(`/residents/${id}`);
  redirect(`/residents/${id}`);
}
export async function deleteResident(id: string) {
  const orgId = await getCurrentOrgId();
  await prisma.resident.deleteMany({ where: { id, orgId } });
  revalidatePath("/residents");
  redirect("/residents");
}

export async function listResidentMeds(residentId: string) {
  const orgId = await getCurrentOrgId();
  return prisma.residentMed.findMany({
    where: { orgId, residentId },
    orderBy: [{ active: "desc" }, { createdAt: "desc" }],
  });
}
export async function createResidentMed(residentId: string, f: FormData) {
  const orgId = await getCurrentOrgId();
  const description = str(f, "description");
  if (!description) return;
  const r = await prisma.resident.findFirst({ where: { id: residentId, orgId }, select: { id: true } });
  if (!r) return;
  await prisma.residentMed.create({
    data: { orgId, residentId, description, dosage: str(f, "dosage"), amount: str(f, "amount") },
  });
  revalidatePath(`/residents/${residentId}`);
  redirect(`/residents/${residentId}?tab=meds`);
}
export async function setResidentMedActive(residentId: string, medId: string, active: boolean) {
  const orgId = await getCurrentOrgId();
  await prisma.residentMed.updateMany({ where: { id: medId, residentId, orgId }, data: { active } });
  revalidatePath(`/residents/${residentId}`);
  redirect(`/residents/${residentId}?tab=meds`);
}

const LOG_TYPES = ["progress", "behavior", "shift"] as const;
const pickLogType = (v: string | null): ClientLogType =>
  LOG_TYPES.includes(v as (typeof LOG_TYPES)[number]) ? (v as ClientLogType) : "progress";

export async function listClientLogs(residentId: string) {
  const orgId = await getCurrentOrgId();
  return prisma.clientLog.findMany({
    where: { orgId, residentId },
    orderBy: { createdAt: "desc" },
  });
}

/** Immutable after create — no update/delete actions. */
export async function createClientLog(residentId: string, f: FormData) {
  const orgId = await getCurrentOrgId();
  const body = str(f, "body");
  if (!body) return;
  const r = await prisma.resident.findFirst({ where: { id: residentId, orgId }, select: { id: true } });
  if (!r) return;
  await prisma.clientLog.create({
    data: {
      orgId,
      residentId,
      type: pickLogType(str(f, "type")),
      body,
      author: str(f, "author") ?? "Staff",
    },
  });
  revalidatePath(`/residents/${residentId}`);
  redirect(`/residents/${residentId}?tab=notes`);
}

const isUaOutcome = (v: string | null): v is UaOutcomeValue =>
  !!v && (UA_OUTCOMES as readonly string[]).includes(v);

export async function listUaResults(residentId: string) {
  const orgId = await getCurrentOrgId();
  return prisma.uaResult.findMany({
    where: { orgId, residentId },
    orderBy: { testedAt: "desc" },
    include: {
      house: { select: { name: true } },
    },
  });
}

/** Immutable after create — notes only for pos/refused. */
export async function createResidentUaResult(residentId: string, f: FormData) {
  const orgId = await getCurrentOrgId();
  const outcomeRaw = str(f, "outcome");
  if (!isUaOutcome(outcomeRaw)) return;

  const r = await prisma.resident.findFirst({
    where: { id: residentId, orgId },
    select: { id: true, houseId: true },
  });
  if (!r) return;

  let shiftSessionId: string | null = null;
  if (r.houseId) {
    const openShift = await prisma.shiftSession.findFirst({
      where: { orgId, houseId: r.houseId, status: "open" },
      orderBy: { startedAt: "desc" },
      select: { id: true },
    });
    shiftSessionId = openShift?.id ?? null;
  }

  const note = uaNoteAllowed(outcomeRaw) ? str(f, "note") : null;

  await prisma.uaResult.create({
    data: {
      orgId,
      residentId: r.id,
      houseId: r.houseId,
      shiftSessionId,
      outcome: outcomeRaw as UaOutcome,
      note,
      author: str(f, "author") ?? "Staff",
    },
  });

  revalidatePath(`/residents/${residentId}`);
  revalidatePath("/daily-ops/ua");
  redirect(`/residents/${residentId}?tab=ua`);
}

const CONTRACT_STATUSES = ["active", "completed", "void"] as const;
type ContractStatusValue = (typeof CONTRACT_STATUSES)[number];
const isContractStatus = (v: string | null): v is ContractStatusValue =>
  !!v && (CONTRACT_STATUSES as readonly string[]).includes(v);

export async function listBehavioralContracts(residentId: string) {
  const orgId = await getCurrentOrgId();
  return prisma.behavioralContract.findMany({
    where: { orgId, residentId },
    orderBy: { createdAt: "desc" },
  });
}

export async function createBehavioralContract(residentId: string, f: FormData) {
  const orgId = await getCurrentOrgId();
  const title = str(f, "title");
  if (!title) return;

  const r = await prisma.resident.findFirst({
    where: { id: residentId, orgId },
    select: { id: true },
  });
  if (!r) return;

  const statusRaw = str(f, "status");
  const status = isContractStatus(statusRaw) ? statusRaw : "active";
  const notes = str(f, "notes");
  const signedAt = date(f, "signedAt");

  let fileName: string | null = null;
  let mimeType: string | null = null;
  let filePath: string | null = null;
  let fileUrl: string | null = null;

  const fileEntry = f.get("file");
  if (fileEntry instanceof File && fileEntry.size > 0) {
    const { saveContractUpload } = await import("@/lib/uploads");
    const saved = await saveContractUpload(residentId, fileEntry);
    fileName = saved.fileName;
    mimeType = saved.mimeType;
    filePath = saved.filePath;
  }

  const created = await prisma.behavioralContract.create({
    data: {
      orgId,
      residentId,
      title,
      notes,
      signedAt,
      status: status as BehavioralContractStatus,
      fileName,
      mimeType,
      filePath,
    },
  });

  if (filePath) {
    fileUrl = `/api/contracts/${created.id}/file`;
    await prisma.behavioralContract.update({
      where: { id: created.id },
      data: { fileUrl },
    });
  }

  revalidatePath(`/residents/${residentId}`);
  redirect(`/residents/${residentId}?tab=contracts`);
}
