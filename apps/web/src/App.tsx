import { Route, Routes } from "react-router-dom";
import Shell from "./components/Shell";
import Home from "./pages/Home";
import Leaderboards from "./pages/Leaderboards";
import Players from "./pages/Players";
import Agents from "./pages/Agents";
import Rulesets from "./pages/Rulesets";
import Profile from "./pages/Profile";
import MatchRoom from "./pages/MatchRoom";
import UidVerify from "./pages/UidVerify";
import Roster from "./pages/Roster";
import Disputes from "./pages/Disputes";
import Admin from "./pages/Admin";

export default function App() {
  return (
    <Shell>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/leaderboards" element={<Leaderboards />} />
        <Route path="/players" element={<Players />} />
        <Route path="/agents" element={<Agents />} />
        <Route path="/rulesets" element={<Rulesets />} />
        <Route path="/profile/:id" element={<Profile />} />
        <Route path="/match/:id" element={<MatchRoom />} />
        <Route path="/uid-verify" element={<UidVerify />} />
        <Route path="/roster" element={<Roster />} />
        <Route path="/disputes" element={<Disputes />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<div className="card">Page not found.</div>} />
      </Routes>
    </Shell>
  );
}
