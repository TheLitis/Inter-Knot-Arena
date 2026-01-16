import type { Match, QueueConfig, Rating } from "@ika/shared";
import { demoMatch, leaderboard, queues } from "./data/mock";

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
  const data = await safeFetch<{ leagueId: string; ratings: Rating[] }>(
    `/leaderboards/${leagueId}`,
    { leagueId, ratings: leaderboard }
  );
  return data.ratings;
}

export function fetchMatch(matchId: string): Promise<Match> {
  return safeFetch<Match>(`/matches/${matchId}`, demoMatch);
}
