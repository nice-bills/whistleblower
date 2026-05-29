import type { ReactNode } from "react";

type Props = {
  open: boolean;
  title: string;
  children: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmDialog({
  open,
  title,
  children,
  confirmLabel = "confirm",
  cancelLabel = "cancel",
  onConfirm,
  onCancel,
}: Props) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
    >
      <div className="pill-surface max-w-md rounded-2xl p-6">
        <h2 id="confirm-title" className="text-lg font-medium text-white">
          {title}
        </h2>
        <div className="mt-3 text-sm leading-relaxed text-white/70">{children}</div>
        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/80 hover:text-white"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-full bg-white px-4 py-2 text-sm text-black hover:bg-neutral-200"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
