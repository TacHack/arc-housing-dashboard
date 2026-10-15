"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { WorkOrderCategory, WorkOrderPriority, WorkOrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { date, getCurrentOrgId, str } from "@/lib/org";

const CATS = ["maintenance", "cleaning", "safety", "supplies", "other"] as const;
const PRIS = ["low", "normal", "high", "urgent"] as const;
const STATS = ["open", "in_progress", "blocked", "done", "cancelled"] as const;
const pick = <T extends string>(v: string | null, allowed: readonly T[], d: T): T =>
  allowed.includes(v as T) ? (v as T) : d;

const fields = (f: FormData) => ({
  title: str(f, "title") ?? "",
  description: str(f, "description"),
  room: str(f, "room"),
  category: pick<WorkOrderCategory>(str(f, "category"), CATS, "other"),
  priority: pick<WorkOrderPriority>(str(f, "priority"), PRIS, "normal"),
  status: pick<WorkOrderStatus>(str(f, "status"), STATS, "open"),
  assigneeName: str(f, "assigneeName"),
  dueAt: date(f, "dueAt"),
});
const completedAt = (s: WorkOrderStatus) => (s === "done" ? new Date() : null);

export async function createWorkOrder(f: FormData) {
  const orgId = await getCurrentOrgId();
  const houseId = str(f, "houseId");
  const house = houseId ? await prisma.house.findFirst({ where: { id: houseId, orgId }, select: { id: true } }) : null;
  if (!house) throw new Error("A valid house is required");
  const data = fields(f);
  if (!data.title) throw new Error("Title is required");
  const w = await prisma.workOrder.create({
    data: { orgId, houseId: house.id, ...data, completedAt: completedAt(data.status),
      events: { create: { orgId, type: "created", message: `Created as ${data.status}` } } },
  });
  revalidatePath("/work-orders");
  redirect(`/work-orders/${w.id}`);
}

export async function updateWorkOrder(id: string, f: FormData) {
  const orgId = await getCurrentOrgId();
  const prev = await prisma.workOrder.findFirst({ where: { id, orgId } });
  if (!prev) return;
  const data = fields(f);
  if (!data.title) data.title = prev.title;
  const houseId = str(f, "houseId");
  const house = houseId ? await prisma.house.findFirst({ where: { id: houseId, orgId }, select: { id: true } }) : null;
  await prisma.workOrder.update({
    where: { id },
    data: { ...data, houseId: house?.id ?? prev.houseId,
      completedAt: data.status === prev.status ? prev.completedAt : completedAt(data.status) },
  });
  if (data.status !== prev.status)
    await prisma.workOrderEvent.create({ data: { orgId, workOrderId: id, type: "status", message: `${prev.status} → ${data.status}` } });
  revalidatePath("/work-orders"); revalidatePath(`/work-orders/${id}`);
  redirect(`/work-orders/${id}`);
}

export async function setWorkOrderStatus(id: string, status: WorkOrderStatus) {
  const orgId = await getCurrentOrgId();
  const prev = await prisma.workOrder.findFirst({ where: { id, orgId } });
  if (!prev || prev.status === status) redirect(`/work-orders/${id}`);
  await prisma.workOrder.update({ where: { id }, data: { status, completedAt: completedAt(status) } });
  await prisma.workOrderEvent.create({ data: { orgId, workOrderId: id, type: "status", message: `${prev.status} → ${status}` } });
  revalidatePath("/work-orders"); revalidatePath(`/work-orders/${id}`);
  redirect(`/work-orders/${id}`);
}
