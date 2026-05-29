import { Route, Routes } from "react-router-dom";
import DemoAutoConnect from "./components/DemoAutoConnect";
import Faucet from "./pages/Faucet";
import PairDetail from "./pages/PairDetail";
import Registry from "./pages/Registry";

export default function App() {
  return (
    <div className="min-h-full bg-black text-white antialiased">
      <DemoAutoConnect />
      <Routes>
        <Route path="/" element={<Registry />} />
        <Route path="/pair/:confidentialAddress" element={<PairDetail />} />
        <Route path="/faucet" element={<Faucet />} />
      </Routes>
      <footer className="border-t border-white/10 px-6 py-8 text-sm text-white/50 md:px-10">
        <div className="mx-auto flex max-w-6xl flex-wrap gap-4">
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
      </footer>
    </div>
  );
}
