import { NavLink } from "react-router-dom";
import ConnectWallet from "./ConnectWallet";
import RegistryLogo from "./RegistryLogo";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    "rounded-full px-4 py-2 text-sm transition-colors md:px-5",
    isActive ? "bg-white/10 text-white" : "text-neutral-300 hover:bg-white/5 hover:text-white",
  ].join(" ");

export default function PillNavbar() {
  return (
    <header className="fixed left-0 right-0 top-0 z-50 px-4 pt-4 md:px-8 md:pt-5">
      <nav
        className="pill-surface mx-auto grid max-w-7xl grid-cols-[1fr_auto] items-center gap-2 rounded-2xl p-2 md:grid-cols-[auto_1fr_auto] md:gap-3 md:rounded-full md:px-2 md:py-2"
        aria-label="Primary"
      >
        <NavLink
          to="/"
          className="flex min-w-0 items-center gap-2 rounded-full py-2 pl-3 pr-4 transition-colors hover:bg-white/5 md:pl-4"
        >
          <RegistryLogo className="h-5 w-5 shrink-0" />
          <span className="truncate text-sm font-normal tracking-tight text-white">
            wrapper registry
          </span>
        </NavLink>

        <div className="col-span-2 flex justify-center md:col-span-1 md:col-start-2">
          <div className="flex items-center gap-0.5 rounded-full bg-black/30 p-0.5">
            <NavLink to="/" end className={navLinkClass}>
              registry
            </NavLink>
            <NavLink to="/faucet" className={navLinkClass}>
              faucet
            </NavLink>
          </div>
        </div>

        <div className="flex justify-end md:col-start-3">
          <ConnectWallet compact />
        </div>
      </nav>
    </header>
  );
}
