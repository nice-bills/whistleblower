import { Route, Routes } from "react-router-dom";
import DemoAutoConnect from "./components/DemoAutoConnect";
import LiveStatusFooter from "./components/LiveStatusFooter";
import PillNavbar from "./components/PillNavbar";
import Faucet from "./pages/Faucet";
import GettingStarted from "./pages/GettingStarted";
import PairDetail from "./pages/PairDetail";
import Portfolio from "./pages/Portfolio";
import Registry from "./pages/Registry";

export default function App() {
  return (
    <div className="min-h-full overflow-x-hidden bg-black text-white antialiased">
      <DemoAutoConnect />
      <PillNavbar />
      <Routes>
        <Route path="/" element={<Registry />} />
        <Route path="/pair/:confidentialAddress" element={<PairDetail />} />
        <Route path="/faucet" element={<Faucet />} />
        <Route path="/start" element={<GettingStarted />} />
        <Route path="/portfolio" element={<Portfolio />} />
      </Routes>
      <footer className="border-t border-white/10 px-5 py-8 text-sm text-white/50 md:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <span>
              season 3 ·{" "}
              <a
                href="https://www.zama.org/post/zama-developer-program-mainnet-season-3-composable-privacy-is-the-key"
                className="text-white/70 transition-colors hover:text-white"
              >
                zama developer program
              </a>
            </span>
            <a
              href="https://docs.zama.org/protocol/protocol-apps/confidential-tokens/wrapper-registry"
              className="text-white/70 transition-colors hover:text-white"
            >
              registry documentation
            </a>
          </div>
          <LiveStatusFooter />
        </div>
      </footer>
    </div>
  );
}
