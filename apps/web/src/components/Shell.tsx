import { Link, NavLink } from "react-router-dom";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import SearchBar from "./SearchBar";

const navItems = [
  { to: "/matchmaking", label: "Matchmaking" },
  { to: "/leaderboards", label: "Leaderboards" },
  { to: "/agents", label: "Agents" },
  { to: "/rulesets", label: "Rulesets" },
  { to: "/admin", label: "Admin" }
];

interface ShellProps {
  children: ReactNode;
}

export default function Shell({ children }: ShellProps) {
  const [language, setLanguage] = useState(() => {
    if (typeof window === "undefined") {
      return "ru";
    }
    return window.localStorage.getItem("ika:lang") ?? "ru";
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("ika:lang", language);
      document.documentElement.lang = language;
    }
  }, [language]);

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">
          <Link className="brand-mark" to="/" title="Inter-Knot Arena">
            <img className="brand-logo" src="/logoIKA.png" alt="Inter-Knot Arena" />
          </Link>
          <div>
            <div className="brand-title">Inter-Knot Arena</div>
            <div className="brand-subtitle">Competitive ZZZ platform</div>
          </div>
        </div>
        <nav className="nav-links">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                isActive ? "nav-link nav-link-active" : "nav-link"
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="header-actions">
          <SearchBar />
          <label className="lang-select">
            <span>Language</span>
            <select value={language} onChange={(event) => setLanguage(event.target.value)}>
              <option value="ru">RU</option>
              <option value="en">EN</option>
            </select>
          </label>
          <div className="status-pill">
            <span className="status-dot" />
            Season 01
          </div>
          <Link className="avatar-button" to="/profile/user_ellen" title="Open profile">
            <span className="avatar-initials">E</span>
          </Link>
        </div>
      </header>
      <main className="app-main">{children}</main>
      <footer className="app-footer">
        <div>Inter-Knot Arena beta</div>
        <div>Verifier-ready, API-free, proof-driven ranking.</div>
      </footer>
    </div>
  );
}
