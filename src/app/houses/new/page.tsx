import { AppShell } from "@/components/AppShell";
import { HouseForm } from "../HouseForm";
import { createHouse } from "../actions";

export default function NewHousePage() {
  return (
    <AppShell active="/houses">
      <div className="max-w-3xl space-y-6">
        <h1 className="text-2xl font-semibold tracking-tight">New house</h1>
        <HouseForm action={createHouse} submit="Create house" />
      </div>
    </AppShell>
  );
}
