import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { dangerBtnCls } from "@/components/ui";
import { prisma } from "@/lib/prisma";
import { getCurrentOrgId } from "@/lib/org";
import { ResidentForm } from "../ResidentForm";
import {
  deleteResident,
  listBehavioralContracts,
  listClientLogs,
  listResidentMeds,
  listUaResults,
  updateResident,
} from "../actions";
import { ContractsTab } from "./ContractsTab";
import { MedsTab } from "./MedsTab";
import { NotesTab } from "./NotesTab";
import { UaTab } from "./UaTab";

// DB-backed, per-request page.
export const instant = false;

const tabCls = (on: boolean) =>
  `border-b-2 px-1 pb-2 text-sm font-medium ${on ? "border-teal-700 text-teal-700" : "border-transparent text-slate-500 hover:text-slate-700"}`;

export default async function ResidentFolderPage({
  params, searchParams,
}: { params: Promise<{ id: string }>; searchParams: Promise<{ tab?: string }> }) {
  const { id } = await params;
  const { tab } = await searchParams;
  const orgId = await getCurrentOrgId();
  const r = await prisma.resident.findFirst({ where: { id, orgId } });
  if (!r) notFound();
  const isMeds = tab === "meds";
  const isNotes = tab === "notes";
  const isUa = tab === "ua";
  const isContracts = tab === "contracts";
  const meds = isMeds ? await listResidentMeds(id) : [];
  const logs = isNotes ? await listClientLogs(id) : [];
  const uaResults = isUa ? await listUaResults(id) : [];
  const contracts = isContracts ? await listBehavioralContracts(id) : [];
  const onFolder = !isMeds && !isNotes && !isUa && !isContracts;
  return (
    <AppShell active="/residents">
      <div className="max-w-3xl space-y-6">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">Client folder</p>
          <h1 className="text-2xl font-semibold tracking-tight">{r.firstName} {r.lastName}</h1>
        </div>
        <nav className="flex flex-wrap gap-6 border-b border-slate-200">
          <Link href={`/residents/${id}`} className={tabCls(onFolder)}>Client folder</Link>
          <Link href={`/residents/${id}?tab=meds`} className={tabCls(isMeds)}>Meds</Link>
          <Link href={`/residents/${id}?tab=notes`} className={tabCls(isNotes)}>Notes</Link>
          <Link href={`/residents/${id}?tab=ua`} className={tabCls(isUa)}>UA</Link>
          <Link href={`/residents/${id}?tab=contracts`} className={tabCls(isContracts)}>Behavioral contracts</Link>
        </nav>
        {isMeds ? (
          <MedsTab residentId={id} meds={meds} />
        ) : isNotes ? (
          <NotesTab residentId={id} logs={logs} />
        ) : isUa ? (
          <UaTab residentId={id} results={uaResults} />
        ) : isContracts ? (
          <ContractsTab residentId={id} contracts={contracts} />
        ) : (
          <>
            <ResidentForm action={updateResident.bind(null, id)} r={r} submit="Save changes" />
            <form action={deleteResident.bind(null, id)}>
              <button className={dangerBtnCls}>Delete resident</button>
            </form>
          </>
        )}
      </div>
    </AppShell>
  );
}
