import type { Resident } from "@prisma/client";
import { Field, Section, btnCls } from "@/components/ui";
import { ymd } from "@/lib/org";

export function ResidentForm({ action, r, submit }: { action: (f: FormData) => Promise<void>; r?: Resident; submit: string }) {
  return (
    <form action={action} className="space-y-4">
      <Section title="Client">
        <Field label="First name" name="firstName" required defaultValue={r?.firstName} />
        <Field label="Last name" name="lastName" required defaultValue={r?.lastName} />
        <Field label="Date of birth" name="dob" type="date" defaultValue={ymd(r?.dob)} />
        <Field label="Admission date" name="admissionDate" type="date" defaultValue={ymd(r?.admissionDate)} />
      </Section>
      <Section title="Insurance">
        <Field label="Carrier" name="insuranceCarrier" defaultValue={r?.insuranceCarrier} />
        <Field label="Member ID" name="insuranceMemberId" defaultValue={r?.insuranceMemberId} />
      </Section>
      <Section title="Emergency contact">
        <Field label="Name" name="emergencyContactName" defaultValue={r?.emergencyContactName} />
        <Field label="Phone" name="emergencyContactPhone" type="tel" defaultValue={r?.emergencyContactPhone} />
      </Section>
      <button className={btnCls}>{submit}</button>
    </form>
  );
}
