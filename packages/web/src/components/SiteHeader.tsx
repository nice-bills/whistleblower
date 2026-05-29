import { NavLink } from "react-router-dom";
import ConnectWallet from "./ConnectWallet";

export default function SiteHeader() {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <NavLink to="/" className="brand" end>
          <span className="brand__mark" aria-hidden>
            ◈
          </span>
          <span className="brand__text">
            <span className="brand__name">Wrapper Registry</span>
            <span className="brand__sub">Zama confidential tokens</span>
          </span>
        </NavLink>

        <nav className="site-nav" aria-label="Primary">
          <NavLink to="/" end className={({ isActive }) => (isActive ? "site-nav__link is-active" : "site-nav__link")}>
            Registry
          </NavLink>
          <NavLink
            to="/faucet"
            className={({ isActive }) => (isActive ? "site-nav__link is-active" : "site-nav__link")}
          >
            Faucet
          </NavLink>
        </nav>

        <ConnectWallet />
      </div>
    </header>
  );
}
