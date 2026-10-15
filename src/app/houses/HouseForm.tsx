import { Field, Section, btnCls } from "@/components/ui";
type H = { name?: string; address?: string | null; city?: string | null; state?: string | null; zip?: string | null };
export function HouseForm({ action, house = {}, submit }: { action: (f: FormData) => Promise<void>; house?: H; submit: string }) {
  return (
    <form action={action} className="space-y-4">
      <Section title="House details">
        <Field label="Name" name="name" required defaultValue={house.name} />
        <Field label="Address" name="address" defaultValue={house.address} />
        <Field label="City" name="city" defaultValue={house.city} />
        <Field label="State" name="state" defaultValue={house.state} />
        <Field label="ZIP" name="zip" defaultValue={house.zip} />
      </Section>
      <button className={btnCls}>{submit}</button>
    </form>
  );
}
