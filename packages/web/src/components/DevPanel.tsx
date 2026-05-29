import CopyButton from "./CopyButton";

type Props = {
  confidential: string;
  underlying: string;
  chainId: number;
};

export default function DevPanel({ confidential, underlying, chainId }: Props) {
  const snippet = `import { useShield } from "@zama-fhe/react-sdk";

// tokenAddress = confidential ERC-7984 wrapper
const shield = useShield({
  tokenAddress: "${confidential}",
  wrapperAddress: "${confidential}",
});
await shield.mutateAsync({ amount: parseUnits("100", decimals) });`;

  return (
    <details className="pill-surface rounded-2xl p-5">
      <summary className="cursor-pointer text-sm font-medium text-white">developer panel</summary>
      <div className="mt-4 space-y-3 text-xs text-white/70">
        <div className="flex flex-wrap items-center gap-2">
          <span>underlying</span>
          <code className="font-mono text-white/90">{underlying}</code>
          <CopyButton text={underlying} />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span>confidential</span>
          <code className="font-mono text-white/90">{confidential}</code>
          <CopyButton text={confidential} />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span>chain id</span>
          <code className="font-mono">{chainId}</code>
        </div>
        <pre className="overflow-x-auto rounded-xl bg-black/60 p-3 font-mono text-[11px] leading-relaxed text-white/80">
          {snippet}
        </pre>
        <CopyButton text={snippet} label="copy snippet" />
        <a
          href="https://docs.zama.org/protocol/protocol-apps/confidential-tokens/wrapper-registry"
          className="inline-block text-white/80 underline hover:text-white"
          target="_blank"
          rel="noreferrer"
        >
          registry documentation →
        </a>
      </div>
    </details>
  );
}
