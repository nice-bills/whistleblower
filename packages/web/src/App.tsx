import { NavLink, Route, Routes } from "react-router-dom";
import Submit from "./pages/Submit";
import Investigate from "./pages/Investigate";

export default function App() {
  return (
    <>
      <header>
        <h1>Confidential Whistleblower</h1>
        <p className="tagline">
          Public document · encrypted source metadata · investigator selective disclosure
        </p>
        <nav>
          <NavLink to="/" end>
            Submit
          </NavLink>
          <NavLink to="/investigate">Investigate</NavLink>
        </nav>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Submit />} />
          <Route path="/investigate" element={<Investigate />} />
        </Routes>
      </main>
    </>
  );
}
