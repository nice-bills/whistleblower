import type { ReactNode } from "react";

type Variant = "info" | "error" | "warn" | "success";

const styles: Record<Variant, string> = {
  info: "border-white/15 bg-neutral-900/80 text-white/80",
  success: "border-white/25 bg-neutral-900 text-white",
  warn: "border-white/20 bg-neutral-900 text-white/90",
  error: "border-white/20 bg-neutral-950 text-white/90",
};

type Props = {
  variant?: Variant;
  children: ReactNode;
};

export default function StatusMessage({ variant = "info", children }: Props) {
  return (
    <div
      className={`mt-4 rounded-2xl border px-4 py-3 text-sm leading-relaxed ${styles[variant]}`}
      role="status"
    >
      {children}
    </div>
  );
}
