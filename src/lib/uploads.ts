import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const UPLOADS_ROOT = path.join(/*turbopackIgnore: true*/ process.cwd(), "uploads");

const ALLOWED_MIME = new Set([
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/heic",
  "image/heif",
]);

const EXT_BY_MIME: Record<string, string> = {
  "application/pdf": ".pdf",
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/png": ".png",
  "image/gif": ".gif",
  "image/webp": ".webp",
  "image/heic": ".heic",
  "image/heif": ".heif",
};

function safeBaseName(name: string): string {
  const base = path.basename(name).replace(/[^a-zA-Z0-9._-]+/g, "_");
  return base.slice(0, 120) || "scan";
}

export function isAllowedContractFile(file: File): boolean {
  if (ALLOWED_MIME.has(file.type)) return true;
  const lower = file.name.toLowerCase();
  return (
    lower.endsWith(".pdf") ||
    lower.endsWith(".jpg") ||
    lower.endsWith(".jpeg") ||
    lower.endsWith(".png") ||
    lower.endsWith(".gif") ||
    lower.endsWith(".webp") ||
    lower.endsWith(".heic") ||
    lower.endsWith(".heif")
  );
}

export type SavedContractFile = {
  /** Absolute path on disk */
  absolutePath: string;
  /** Path relative to project root, e.g. uploads/contracts/<residentId>/… */
  filePath: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
};

/** Persist a contract scan under uploads/contracts/<residentId>/. */
export async function saveContractUpload(
  residentId: string,
  file: File,
): Promise<SavedContractFile> {
  if (!isAllowedContractFile(file)) {
    throw new Error("Only PDF and image scans are allowed");
  }
  const dir = path.join(UPLOADS_ROOT, "contracts", residentId);
  await mkdir(dir, { recursive: true });

  const original = safeBaseName(file.name);
  const extFromName = path.extname(original);
  const ext =
    extFromName ||
    EXT_BY_MIME[file.type] ||
    (file.type === "application/pdf" ? ".pdf" : ".bin");
  const storedName = `${randomUUID()}-${original.endsWith(ext) ? original : `${original}${ext}`}`;
  const absolutePath = path.join(dir, storedName);
  const buf = Buffer.from(await file.arrayBuffer());
  await writeFile(absolutePath, buf);

  const filePath = path.posix.join("uploads", "contracts", residentId, storedName);
  return {
    absolutePath,
    filePath,
    fileName: file.name || storedName,
    mimeType: file.type || "application/octet-stream",
    sizeBytes: buf.length,
  };
}

/** Resolve a stored relative filePath under uploads/ with path-traversal guards. */
export function resolveUploadPath(filePath: string): string {
  const normalized = filePath.replace(/\\/g, "/");
  if (!normalized.startsWith("uploads/contracts/") || normalized.includes("..")) {
    throw new Error("Invalid upload path");
  }
  const relative = normalized.slice("uploads/".length);
  const resolved = path.join(UPLOADS_ROOT, relative);
  if (!resolved.startsWith(UPLOADS_ROOT + path.sep)) {
    throw new Error("Invalid upload path");
  }
  return resolved;
}
