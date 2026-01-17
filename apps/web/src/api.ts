import type {
  Agent,
  Dispute,
  DraftActionType,
  EvidenceResult,
  League,
  Match,
  ProfileSummary,
  QueueConfig,
  Rating,
  Ruleset,
  User
} from "@ika/shared";
import { agents, demoMatch, leagues, profiles, queues, ratings, rulesets, users } from "./data/mock";

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

async function postJson<T>(path: string, payload: unknown, fallback: T): Promise<T> {
  try {
    const response = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
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

export function fetchLeagues(): Promise<League[]> {
  return safeFetch<League[]>("/leagues", leagues);
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

export function joinMatchmaking(userId: string, queueId: string): Promise<Match> {
  return postJson<Match>("/matchmaking/join", { userId, queueId }, demoMatch);
}

export function checkinMatch(matchId: string, userId: string): Promise<Match> {
  return postJson<Match>(`/matches/${matchId}/checkin`, { userId }, demoMatch);
}

export function submitDraftAction(
  matchId: string,
  userId: string,
  type: DraftActionType,
  agentId: string
): Promise<Match> {
  return postJson<Match>(`/matches/${matchId}/draft/action`, { userId, type, agentId }, demoMatch);
}

export function submitPrecheck(
  matchId: string,
  payload: {
    userId: string;
    detectedAgents: string[];
    confidence?: Record<string, number>;
    result: EvidenceResult;
    frameHash?: string;
    cropUrl?: string;
  }
): Promise<Match> {
  return postJson<Match>(`/matches/${matchId}/evidence/precheck`, payload, demoMatch);
}

export function submitInrun(
  matchId: string,
  payload: {
    userId: string;
    detectedAgents: string[];
    confidence?: Record<string, number>;
    result: EvidenceResult;
    frameHash?: string;
    cropUrl?: string;
  }
): Promise<Match> {
  return postJson<Match>(`/matches/${matchId}/evidence/inrun`, payload, demoMatch);
}

export function submitResult(
  matchId: string,
  payload: {
    metricType: "TIME_MS" | "SCORE" | "RANK_TIER";
    value: number | string;
    proofUrl: string;
  }
): Promise<Match> {
  return postJson<Match>(`/matches/${matchId}/result/submit`, payload, demoMatch);
}

export function confirmMatchResult(matchId: string, userId: string): Promise<Match> {
  return postJson<Match>(`/matches/${matchId}/confirm`, { userId }, demoMatch);
}

export function openDispute(
  matchId: string,
  userId: string,
  reason: string
): Promise<Dispute> {
  return postJson<Dispute>(`/matches/${matchId}/dispute/open`, { userId, reason }, {
    id: "dispute_demo",
    matchId,
    openedBy: userId,
    reason,
    status: "OPEN",
    createdAt: Date.now()
  });
}

export function fetchDisputes(): Promise<Dispute[]> {
  return safeFetch<Dispute[]>("/disputes/queue", []);
}

export function resolveDispute(disputeId: string, decision: string): Promise<Dispute> {
  return postJson<Dispute>(`/disputes/${disputeId}/decision`, { decision }, {
    id: disputeId,
    matchId: "match_demo",
    openedBy: "user_ellen",
    reason: "demo",
    status: "RESOLVED",
    decision,
    createdAt: Date.now()
  });
}
