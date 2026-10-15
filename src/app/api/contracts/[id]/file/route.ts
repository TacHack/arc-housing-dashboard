import { readFile } from "fs/promises";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentOrgId } from "@/lib/org";
import { resolveUploadPath } from "@/lib/uploads";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const orgId = await getCurrentOrgId();
  const row = await prisma.behavioralContract.findFirst({
    where: { id, orgId },
    select: { filePath: true, fileName: true, mimeType: true },
  });
  if (!row?.filePath) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const abs = resolveUploadPath(row.filePath);
    const data = await readFile(abs);
    const headers = new Headers();
    headers.set("Content-Type", row.mimeType || "application/octet-stream");
    headers.set(
      "Content-Disposition",
      `inline; filename="${(row.fileName || "contract").replace(/"/g, "")}"`,
    );
    return new NextResponse(data, { status: 200, headers });
  } catch {
    return NextResponse.json({ error: "File missing" }, { status: 404 });
  }
}
