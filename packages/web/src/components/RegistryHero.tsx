import { HERO_VIDEO_SRC } from "../constants/hero-video";
import PillNavbar from "./PillNavbar";

type Props = {
  pairCount?: bigint;
  networkLabel: string;
};

export default function RegistryHero({ pairCount, networkLabel }: Props) {
  const countLabel = pairCount !== undefined ? pairCount.toString() : "…";

  return (
    <section className="relative h-screen w-full overflow-hidden bg-black">
      <video
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        loop
        muted
        playsInline
        src={HERO_VIDEO_SRC}
      />

      <div className="pointer-events-none absolute inset-0 bg-black/35" aria-hidden />

      <PillNavbar />

      <div className="relative h-full w-full">
        <h1 className="hero-title absolute left-4 top-[18%] text-[14vw] font-medium text-white md:left-10 md:text-[13vw]">
          every
        </h1>
        <h1 className="hero-title absolute right-4 top-[38%] text-[14vw] font-medium text-white md:right-10 md:text-[13vw]">
          official
        </h1>
        <h1 className="hero-title absolute left-[18%] top-[58%] text-[14vw] font-medium text-white md:left-[28%] md:text-[13vw]">
          pair
        </h1>

        <p className="absolute left-6 top-[46%] max-w-[240px] text-[15px] leading-snug text-white/90 md:left-10">
          browse erc-20 to erc-7984 mappings, wrap with one flow, and decrypt balances with eip-712
          on sepolia or mainnet
        </p>

        <div className="absolute right-6 top-[14%] md:right-24">
          <div className="flex items-center justify-end gap-3">
            <span className="hidden h-px w-24 rotate-[20deg] bg-white/40 md:block" aria-hidden />
            <span className="text-4xl font-medium tracking-tight md:text-5xl">{countLabel}</span>
          </div>
          <p className="mt-1 text-right text-xs text-white/70 md:text-sm">pairs indexed</p>
        </div>

        <div className="absolute bottom-20 left-6 md:bottom-24 md:left-20">
          <div className="flex items-center gap-3">
            <span className="text-4xl font-medium tracking-tight lowercase md:text-5xl">{networkLabel}</span>
            <span className="hidden h-px w-24 rotate-[-20deg] bg-white/40 md:block" aria-hidden />
          </div>
          <p className="mt-1 text-xs text-white/70 md:text-sm">active network</p>
        </div>

        <div className="absolute bottom-16 right-6 md:bottom-20 md:right-20">
          <div className="flex items-center justify-end gap-3">
            <span className="hidden h-px w-24 rotate-[-20deg] bg-white/40 md:block" aria-hidden />
            <span className="text-4xl font-medium tracking-tight md:text-5xl">eip-712</span>
          </div>
          <p className="mt-1 text-right text-xs text-white/70 md:text-sm">user decrypt</p>
        </div>

        <a
          href="#registry-panel"
          className="absolute bottom-8 left-1/2 -translate-x-1/2 rounded-full bg-white px-6 py-3 text-sm font-normal text-black transition-colors hover:bg-neutral-200"
        >
          browse pairs
        </a>
      </div>

      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-b from-transparent to-black"
        aria-hidden
      />
    </section>
  );
}
