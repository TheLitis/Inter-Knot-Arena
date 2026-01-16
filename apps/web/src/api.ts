import type { Agent, Match, ProfileSummary, QueueConfig, Rating, Ruleset, User } from "@ika/shared";
import { agents, demoMatch, profiles, queues, ratings, rulesets, users } from "./data/mock";

const API_BASE = import.meta.env.VITE_API_URL ?? "/api";

async function safeFetch<T>(path: string, fallback: T): Promise<T> {
  try {
    const response = await fetch(`${API_BASE}${path}`);
    if (!response.ok) {
      return fallback;
    }
    return (await response.json()) as T;
  } catch {
    return fallback;
  }
}

export function fetchQueues(): Promise<QueueConfig[]> {
  return safeFetch<QueueConfig[]>("/queues", queues);
}

export async function fetchLeaderboard(leagueId: string): Promise<Rating[]> {
  const fallback = ratings
    .filter((item) => item.leagueId === leagueId)
    .slice()
    .sort((a, b) => b.elo - a.elo);
  const data = await safeFetch<{ leagueId: string; ratings: Rating[] }>(
    `/leaderboards/${leagueId}`,
    { leagueId, ratings: fallback }
  );
  return data.ratings;
}

export function fetchMatch(matchId: string): Promise<Match> {
  return safeFetch<Match>(`/matches/${matchId}`, demoMatch);
}

export function fetchAgents(): Promise<Agent[]> {
  return safeFetch<Agent[]>("/agents", agents);
}

export function fetchRulesets(): Promise<Ruleset[]> {
  return safeFetch<Ruleset[]>("/rulesets", rulesets);
}

export function fetchUsers(): Promise<User[]> {
  return safeFetch<User[]>("/users", users);
}

export function fetchProfile(userId: string): Promise<ProfileSummary> {
  const fallback = profiles.find((item) => item.user.id === userId) ?? profiles[0];
  return safeFetch<ProfileSummary>(`/profiles/${userId}`, fallback);
}
