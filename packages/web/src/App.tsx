import { NavLink, Route, Routes } from "react-router-dom";
import Faucet from "./pages/Faucet";
import PairDetail from "./pages/PairDetail";
import Registry from "./pages/Registry";

export default function App() {
  return (
    <>
      <header>
        <h1>Confidential Wrapper Registry</h1>
        <p className="tagline">
          Official Zama ERC-20 ↔ ERC-7984 pairs · wrap · unwrap · EIP-712 balance decrypt · Sepolia
          faucet
        </p>
        <nav>
          <NavLink to="/" end>
            Registry
          </NavLink>
          <NavLink to="/faucet">Faucet</NavLink>
        </nav>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Registry />} />
          <Route path="/pair/:confidentialAddress" element={<PairDetail />} />
          <Route path="/faucet" element={<Faucet />} />
        </Routes>
      </main>
      <footer>
        <p className="muted small">
          Built for{" "}
          <a href="https://www.zama.org/post/zama-developer-program-mainnet-season-3-composable-privacy-is-the-key">
            Zama Developer Program Season 3
          </a>{" "}
          · Bounty Track ·{" "}
          <a href="https://docs.zama.org/protocol/protocol-apps/confidential-tokens/wrapper-registry">
            Registry docs
          </a>
        </p>
      </footer>
    </>
  );
}
