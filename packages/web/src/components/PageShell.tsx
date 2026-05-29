import type { ReactNode } from "react";
import PillNavbar from "./PillNavbar";

type Props = {
  children: ReactNode;
  title: string;
  description?: string;
};

export default function PageShell({ children, title, description }: Props) {
  return (
    <div className="relative min-h-screen bg-black">
      <PillNavbar />
      <main className="mx-auto max-w-6xl px-6 pb-20 pt-28 md:px-10">
        <header className="mb-10 max-w-2xl">
          <h1 className="hero-title text-4xl font-medium lowercase text-white md:text-5xl">{title}</h1>
          {description && <p className="mt-4 text-[15px] leading-snug text-white/70">{description}</p>}
        </header>
        {children}
      </main>
    </div>
  );
}
