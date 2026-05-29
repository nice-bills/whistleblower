import { Route, Routes } from "react-router-dom";
import AmbientBackground from "./components/AmbientBackground";
import DemoAutoConnect from "./components/DemoAutoConnect";
import SiteHeader from "./components/SiteHeader";
import Faucet from "./pages/Faucet";
import PairDetail from "./pages/PairDetail";
import Registry from "./pages/Registry";

export default function App() {
  return (
    <div className="app-shell">
      <AmbientBackground />
      <DemoAutoConnect />
      <SiteHeader />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Registry />} />
          <Route path="/pair/:confidentialAddress" element={<PairDetail />} />
          <Route path="/faucet" element={<Faucet />} />
        </Routes>
      </main>
      <footer className="site-footer">
        <div className="site-footer__inner">
          <span>
            Season 3 ·{" "}
            <a href="https://www.zama.org/post/zama-developer-program-mainnet-season-3-composable-privacy-is-the-key">
              Zama Developer Program
            </a>
          </span>
          <a href="https://docs.zama.org/protocol/protocol-apps/confidential-tokens/wrapper-registry">
            Registry documentation
          </a>
        </div>
      </footer>
    </div>
  );
}
