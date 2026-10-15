import { AppShell } from "@/components/AppShell";
import { ResidentForm } from "../ResidentForm";
import { createResident } from "../actions";

export default function NewResidentPage() {
  return (
    <AppShell active="/residents">
      <div className="max-w-3xl space-y-6">
        <h1 className="text-2xl font-semibold tracking-tight">New resident</h1>
        <ResidentForm action={createResident} submit="Create client folder" />
      </div>
    </AppShell>
  );
}
