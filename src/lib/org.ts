import { connection } from "next/server";
import { prisma } from "@/lib/prisma";

/** Until auth lands, all records are scoped to the first organization. */
export async function getCurrentOrgId(): Promise<string> {
  await connection();
  const org =
    (await prisma.organization.findFirst({ orderBy: { createdAt: "asc" } })) ??
    (await prisma.organization.create({ data: { name: "Summit Recovery Homes" } }));
  return org.id;
}

export const str = (f: FormData, k: string) => {
  const v = String(f.get(k) ?? "").trim();
  return v === "" ? null : v;
};
export const date = (f: FormData, k: string) => {
  const v = str(f, k);
  return v ? new Date(`${v}T00:00:00`) : null;
};
export const ymd = (d: Date | null | undefined) =>
  d ? d.toISOString().slice(0, 10) : "";
