type Props = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  symbol?: string;
  onMax?: () => void;
  placeholder?: string;
  hint?: string;
};

const inputClass =
  "w-full rounded-xl border border-white/10 bg-black/50 px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-white/25 focus:outline-none focus:ring-2 focus:ring-white/10";

export default function AmountInput({
  id,
  label,
  value,
  onChange,
  symbol,
  onMax,
  placeholder,
  hint,
}: Props) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <label className="text-xs text-white/60" htmlFor={id}>
          {label}
          {symbol ? ` (${symbol})` : ""}
        </label>
        {onMax && (
          <button
            type="button"
            onClick={onMax}
            className="text-xs text-white/50 transition-colors hover:text-white"
          >
            max
          </button>
        )}
      </div>
      <input
        id={id}
        className={inputClass}
        type="text"
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
      {hint && <p className="text-xs text-white/40">{hint}</p>}
    </div>
  );
}
