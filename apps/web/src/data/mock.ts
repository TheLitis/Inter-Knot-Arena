import type { Match, QueueConfig, Rating } from "@ika/shared";

export const queues: QueueConfig[] = [
  {
    id: "queue_standard_weekly",
    leagueId: "league_standard",
    rulesetId: "ruleset_standard_v1",
    challengeId: "challenge_weekly_12",
    name: "Standard Weekly",
    description: "Verifier-required weekly time trial.",
    requireVerifier: true
  },
  {
    id: "queue_f2p_score",
    leagueId: "league_f2p",
    rulesetId: "ruleset_f2p_v1",
    challengeId: "challenge_score_08",
    name: "F2P Score Rush",
    description: "Roster checks, low-spend caps, fast reporting.",
    requireVerifier: true
  },
  {
    id: "queue_unlimited_weekly",
    leagueId: "league_unlimited",
    rulesetId: "ruleset_unlimited_v1",
    challengeId: "challenge_weekly_12",
    name: "Unlimited Weekly",
    description: "Open queue with proof submission.",
    requireVerifier: false
  }
];

export const leaderboard: Rating[] = [
  { userId: "Ellen", leagueId: "league_standard", elo: 1684, provisionalMatches: 12, updatedAt: Date.now() },
  { userId: "Lycaon", leagueId: "league_standard", elo: 1542, provisionalMatches: 8, updatedAt: Date.now() },
  { userId: "Zhu Yuan", leagueId: "league_standard", elo: 1491, provisionalMatches: 14, updatedAt: Date.now() },
  { userId: "Nicole", leagueId: "league_standard", elo: 1428, provisionalMatches: 9, updatedAt: Date.now() }
];

export const demoMatch: Match = {
  id: "match_demo",
  queueId: "queue_standard_weekly",
  state: "AWAITING_PRECHECK",
  leagueId: "league_standard",
  rulesetId: "ruleset_standard_v1",
  challengeId: "challenge_weekly_12",
  seasonId: "season_01",
  players: [
    { userId: "user_ellen", side: "A", checkin: true },
    { userId: "user_lycaon", side: "B", checkin: true }
  ],
  draft: {
    templateId: "bo1-standard",
    sequence: [
      "BAN_A",
      "BAN_B",
      "PICK_A",
      "PICK_B",
      "PICK_A",
      "PICK_B",
      "PICK_A",
      "PICK_B"
    ],
    actions: [
      { type: "BAN_A", agentId: "agent_lycaon", userId: "user_ellen", timestamp: Date.now() - 400000 },
      { type: "BAN_B", agentId: "agent_ellen", userId: "user_lycaon", timestamp: Date.now() - 395000 },
      { type: "PICK_A", agentId: "agent_anby", userId: "user_ellen", timestamp: Date.now() - 380000 },
      { type: "PICK_B", agentId: "agent_billy", userId: "user_lycaon", timestamp: Date.now() - 370000 },
      { type: "PICK_A", agentId: "agent_nicole", userId: "user_ellen", timestamp: Date.now() - 360000 }
    ],
    uniqueMode: "GLOBAL"
  },
  evidence: {
    precheck: [],
    inrun: [],
    result: undefined
  },
  confirmedBy: [],
  createdAt: Date.now() - 600000,
  updatedAt: Date.now() - 120000
};
