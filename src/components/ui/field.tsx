import { cn } from "@/lib/utils";
export const inputClass =
  "w-full rounded-xl border border-border bg-white px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:opacity-60";
export function Input(props: React.ComponentProps<"input">) {
  return <input {...props} className={cn(inputClass, props.className)} />;
}
export function Textarea(props: React.ComponentProps<"textarea">) {
  return (
    <textarea
      {...props}
      className={cn(inputClass, "min-h-28", props.className)}
    />
  );
}
export function Field({
  label,
  children,
  error,
}: {
  label: string;
  children: React.ReactNode;
  error?: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium">
      {label}
      {children}
      {error && (
        <span className="text-xs font-normal text-red-700" role="alert">
          {error}
        </span>
      )}
    </label>
  );
}
