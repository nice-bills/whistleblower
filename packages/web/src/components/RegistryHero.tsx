import { Link } from "react-router-dom";
import { HERO_VIDEO_SRC } from "../constants/hero-video";

type Props = {
  pairCount?: bigint;
  networkLabel: string;
};

function StatBlock({
  value,
  label,
  align = "left",
}: {
  value: string;
  label: string;
  align?: "left" | "right";
}) {
  return (
    <div className={align === "right" ? "text-right" : "text-left"}>
      <p className="text-2xl font-medium tracking-tight text-white md:text-4xl lg:text-5xl">{value}</p>
      <p className="mt-1 text-xs text-white/65 md:text-sm">{label}</p>
    </div>
  );
}

export default function RegistryHero({ pairCount, networkLabel }: Props) {
  const countLabel = pairCount !== undefined ? pairCount.toString() : "…";

  return (
    <section className="relative min-h-[100dvh] w-full overflow-hidden bg-black">
      <video
        className="hero-video absolute inset-0 h-full w-full scale-[1.03] object-cover"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        src={HERO_VIDEO_SRC}
      />

      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/75 via-black/50 to-black"
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-0 bg-black/25" aria-hidden />

      <div className="relative z-10 mx-auto flex min-h-[100dvh] max-w-7xl flex-col px-5 pb-12 pt-[5.5rem] md:px-10 md:pb-16 md:pt-28">
        {/* Mobile: stacked headlines (no overlap) */}
        <div className="space-y-0 md:hidden">
          <h1 className="hero-title text-[clamp(2.5rem,14vw,4rem)] font-medium text-white">every</h1>
          <h1 className="hero-title text-right text-[clamp(2.5rem,14vw,4rem)] font-medium text-white">
            official
          </h1>
          <h1 className="hero-title pl-[10%] text-[clamp(2.5rem,14vw,4rem)] font-medium text-white">pair</h1>
        </div>

        {/* Desktop: staggered stage */}
        <div className="relative hidden flex-1 md:block md:min-h-[42vh] lg:min-h-[48vh]">
          <h1 className="hero-title absolute left-0 top-[8%] text-[clamp(3.5rem,11vw,7.5rem)] font-medium text-white">
            every
          </h1>
          <h1 className="hero-title absolute right-0 top-[32%] text-[clamp(3.5rem,11vw,7.5rem)] font-medium text-white">
            official
          </h1>
          <h1 className="hero-title absolute left-[22%] top-[54%] text-[clamp(3.5rem,11vw,7.5rem)] font-medium text-white">
            pair
          </h1>

          <p className="absolute left-0 top-[42%] max-w-[260px] text-[15px] leading-snug text-white/90">
            browse erc-20 to erc-7984 mappings, wrap with one flow, and decrypt balances with eip-712
            on sepolia or mainnet
          </p>

          <div className="absolute right-0 top-[6%]">
            <StatBlock value={countLabel} label="pairs indexed" align="right" />
          </div>

          <div className="absolute bottom-[18%] left-0">
            <StatBlock value={networkLabel} label="active network" />
          </div>

          <div className="absolute bottom-[8%] right-0">
            <StatBlock value="eip-712" label="user decrypt" align="right" />
          </div>
        </div>

        {/* Mobile copy + stats */}
        <p className="mt-6 max-w-sm text-[15px] leading-snug text-white/85 md:hidden">
          browse erc-20 to erc-7984 mappings, wrap with one flow, and decrypt balances with eip-712 on
          sepolia or mainnet
        </p>

        <div className="mt-8 grid grid-cols-3 gap-3 border-t border-white/10 pt-6 md:hidden">
          <StatBlock value={countLabel} label="pairs" />
          <StatBlock value={networkLabel} label="network" align="right" />
          <StatBlock value="eip-712" label="decrypt" align="right" />
        </div>

        <div className="mt-auto flex flex-col gap-3 pt-10 sm:flex-row sm:items-center md:pt-8">
          <a
            href="#registry-panel"
            className="inline-flex w-fit items-center justify-center rounded-full bg-white px-7 py-3.5 text-sm font-normal text-black transition-colors hover:bg-neutral-200"
          >
            browse pairs
          </a>
          <Link
            to="/start"
            className="inline-flex w-fit items-center justify-center rounded-full border border-white/25 px-7 py-3.5 text-sm text-white transition-colors hover:bg-white/10"
          >
            guided demo
          </Link>
        </div>
      </div>

      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 z-[1] h-32 bg-gradient-to-b from-transparent to-black md:h-40"
        aria-hidden
      />
    </section>
  );
}
