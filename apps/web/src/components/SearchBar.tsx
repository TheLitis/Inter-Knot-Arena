import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import type { Agent, Ruleset, User } from "@ika/shared";
import { fetchAgents, fetchRulesets, fetchUsers } from "../api";

interface SearchItem {
  id: string;
  label: string;
  meta: string;
  to: string;
}

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [rulesets, setRulesets] = useState<Ruleset[]>([]);
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetchUsers().then(setUsers);
    fetchAgents().then(setAgents);
    fetchRulesets().then(setRulesets);
  }, []);

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const results = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (trimmed.length < 2) {
      return [] as SearchItem[];
    }

    const userMatches = users
      .filter((user) => user.displayName.toLowerCase().includes(trimmed))
      .map((user) => ({
        id: user.id,
        label: user.displayName,
        meta: `Player · ${user.region}`,
        to: `/profile/${user.id}`
      }));

    const agentMatches = agents
      .filter((agent) => agent.name.toLowerCase().includes(trimmed))
      .map((agent) => ({
        id: agent.id,
        label: agent.name,
        meta: `Agent · ${agent.role}`,
        to: "/agents"
      }));

    const rulesetMatches = rulesets
      .filter((ruleset) => ruleset.name.toLowerCase().includes(trimmed))
      .map((ruleset) => ({
        id: ruleset.id,
        label: ruleset.name,
        meta: `Ruleset · ${ruleset.leagueId.replace("league_", "")}`,
        to: "/rulesets"
      }));

    return [...userMatches, ...agentMatches, ...rulesetMatches].slice(0, 6);
  }, [query, users, agents, rulesets]);

  const showResults = open && results.length > 0;
  const showEmpty = open && query.trim().length >= 2 && results.length === 0;

  return (
    <div className="search" ref={wrapperRef}>
      <input
        className="search-input"
        placeholder="Search players, agents, rulesets"
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
      />
      {showResults ? (
        <div className="search-results">
          {results.map((result) => (
            <Link
              key={result.id}
              className="search-result"
              to={result.to}
              onClick={() => setOpen(false)}
            >
              <div className="search-result-title">{result.label}</div>
              <div className="search-result-meta">{result.meta}</div>
            </Link>
          ))}
        </div>
      ) : null}
      {showEmpty ? (
        <div className="search-results">
          <div className="search-empty">No matches found.</div>
        </div>
      ) : null}
    </div>
  );
}
