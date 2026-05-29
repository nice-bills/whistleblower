import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  title: string;
  description?: string;
};

export default function PageShell({ children, title, description }: Props) {
  return (
    <div className="min-h-[100dvh] bg-black">
      <main className="mx-auto max-w-7xl px-5 pb-20 pt-[5.5rem] md:px-10 md:pb-24 md:pt-28">
        <header className="mb-10 max-w-2xl border-b border-white/10 pb-8">
          <h1 className="hero-title text-[clamp(2rem,6vw,3.25rem)] font-medium lowercase text-white">
            {title}
          </h1>
          {description && (
            <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-white/70">{description}</p>
          )}
        </header>
        {children}
      </main>
    </div>
  );
}
