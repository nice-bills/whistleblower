import { NavLink } from "react-router-dom";
import ConnectWallet from "./ConnectWallet";
import RegistryLogo from "./RegistryLogo";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    "rounded-full px-5 py-2 text-sm transition-colors",
    isActive ? "text-white" : "text-neutral-300 hover:text-white",
  ].join(" ");

export default function PillNavbar() {
  return (
    <nav
      className="absolute left-0 right-0 top-0 z-20 flex flex-wrap items-center justify-between gap-3 px-6 pt-6 md:px-10"
      aria-label="Primary"
    >
      <NavLink
        to="/"
        className="flex items-center gap-2 rounded-full bg-neutral-900/90 py-3 pl-4 pr-6 backdrop-blur"
      >
        <RegistryLogo />
        <span className="text-sm font-normal tracking-tight text-white">wrapper registry</span>
      </NavLink>

      <div className="order-3 flex w-full items-center justify-center gap-1 rounded-full bg-neutral-900/90 px-3 py-2 backdrop-blur md:order-none md:w-auto">
        <NavLink to="/" end className={navLinkClass}>
          registry
        </NavLink>
        <NavLink to="/faucet" className={navLinkClass}>
          faucet
        </NavLink>
      </div>

      <ConnectWallet />
    </nav>
  );
}
