import type { ReactNode } from "react";

type Variant = "info" | "error" | "warn" | "success";

type Props = {
  variant?: Variant;
  children: ReactNode;
};

export default function StatusMessage({ variant = "info", children }: Props) {
  const role = variant === "error" ? "alert" : "status";
  return (
    <div className={`status-message status-message--${variant}`} role={role}>
      {children}
    </div>
  );
}
