"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentOrgId, str } from "@/lib/org";

const fields = (f: FormData) => ({
  name: str(f, "name") ?? "Untitled house",
  address: str(f, "address"), city: str(f, "city"), state: str(f, "state"), zip: str(f, "zip"),
});

export async function createHouse(f: FormData) {
  const orgId = await getCurrentOrgId();
  const h = await prisma.house.create({ data: { orgId, ...fields(f) } });
  revalidatePath("/houses");
  redirect(`/houses/${h.id}`);
}
export async function updateHouse(id: string, f: FormData) {
  const orgId = await getCurrentOrgId();
  await prisma.house.updateMany({ where: { id, orgId }, data: fields(f) });
  revalidatePath("/houses"); revalidatePath(`/houses/${id}`);
  redirect(`/houses/${id}`);
}
export async function deleteHouse(id: string) {
  const orgId = await getCurrentOrgId();
  await prisma.house.deleteMany({ where: { id, orgId } });
  revalidatePath("/houses");
  redirect("/houses");
}
