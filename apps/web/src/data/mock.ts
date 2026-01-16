import type {
  Agent,
  Match,
  ProfileSummary,
  QueueConfig,
  Rating,
  Ruleset,
  User
} from "@ika/shared";

const now = Date.now();

export const users: User[] = [
  {
    id: "user_ellen",
    handle: "Ellen",
    displayName: "Ellen",
    region: "NA",
    roles: ["USER", "VERIFIED"],
    trustScore: 128,
    proxyLevel: 12,
    verifiedStatus: "VERIFIED"
  },
  {
    id: "user_lycaon",
    handle: "Lycaon",
    displayName: "Lycaon",
    region: "EU",
    roles: ["USER", "VERIFIED"],
    trustScore: 114,
    proxyLevel: 10,
    verifiedStatus: "VERIFIED"
  },
  {
    id: "user_nicole",
    handle: "Nicole",
    displayName: "Nicole",
    region: "ASIA",
    roles: ["USER"],
    trustScore: 98,
    proxyLevel: 6,
    verifiedStatus: "UNVERIFIED"
  },
  {
    id: "user_anby",
    handle: "Anby",
    displayName: "Anby",
    region: "NA",
    roles: ["USER"],
    trustScore: 102,
    proxyLevel: 7,
    verifiedStatus: "PENDING"
  }
];

export const ratings: Rating[] = [
  {
    userId: "user_ellen",
    leagueId: "league_standard",
    elo: 1684,
    provisionalMatches: 12,
    updatedAt: now
  },
  {
    userId: "user_lycaon",
    leagueId: "league_standard",
    elo: 1542,
    provisionalMatches: 8,
    updatedAt: now
  },
  {
    userId: "user_nicole",
    leagueId: "league_standard",
    elo: 1428,
    provisionalMatches: 9,
    updatedAt: now
  },
  {
    userId: "user_anby",
    leagueId: "league_standard",
    elo: 1394,
    provisionalMatches: 10,
    updatedAt: now
  },
  {
    userId: "user_ellen",
    leagueId: "league_f2p",
    elo: 1402,
    provisionalMatches: 9,
    updatedAt: now
  },
  {
    userId: "user_lycaon",
    leagueId: "league_unlimited",
    elo: 1705,
    provisionalMatches: 15,
    updatedAt: now
  }
];

export const profiles: ProfileSummary[] = users.map((user) => ({
  user,
  ratings: ratings.filter((rating) => rating.userId === user.id)
}));

export const agents: Agent[] = [
  {
    id: "agent_ellen",
    name: "Ellen",
    element: "Ice",
    faction: "Victoria Housekeeping",
    role: "Attack"
  },
  {
    id: "agent_lycaon",
    name: "Lycaon",
    element: "Ice",
    faction: "Victoria Housekeeping",
    role: "Stun"
  },
  {
    id: "agent_nicole",
    name: "Nicole",
    element: "Ether",
    faction: "Cunning Hares",
    role: "Support"
  },
  {
    id: "agent_anby",
    name: "Anby",
    element: "Electric",
    faction: "Cunning Hares",
    role: "Stun"
  },
  {
    id: "agent_billy",
    name: "Billy",
    element: "Physical",
    faction: "Cunning Hares",
    role: "Attack"
  },
  {
    id: "agent_zhu_yuan",
    name: "Zhu Yuan",
    element: "Ether",
    faction: "Public Security",
    role: "Attack"
  }
];

export const rulesets: Ruleset[] = [
  {
    id: "ruleset_f2p_v1",
    leagueId: "league_f2p",
    version: "v1.0",
    name: "F2P v1.0",
    description: "Strict ownership limits and roster proof.",
    requireVerifier: true,
    requireInrunCheck: false,
    evidencePolicy: {
      precheckRequired: true,
      inrunRequired: false,
      resultRequired: true,
      retentionDays: {
        precheck: 14,
        inrun: 14,
        result: 60
      }
    },
    precheckFrequencySec: 5,
    inrunFrequencySec: 15,
    privacyMode: "MODE_B",
    dupesPolicy: { mode: "LIMIT", max: 1 },
    signaturePolicy: { mode: "DISALLOW" }
  },
  {
    id: "ruleset_standard_v1",
    leagueId: "league_standard",
    version: "v1.0",
    name: "Standard v1.0",
    description: "Verifier required with in-run checks.",
    requireVerifier: true,
    requireInrunCheck: true,
    evidencePolicy: {
      precheckRequired: true,
      inrunRequired: true,
      resultRequired: true,
      retentionDays: {
        precheck: 14,
        inrun: 14,
        result: 90
      }
    },
    precheckFrequencySec: 5,
    inrunFrequencySec: 12,
    privacyMode: "MODE_B",
    levelCaps: { agentLevel: 60 },
    gearCaps: { diskLevel: 12 }
  },
  {
    id: "ruleset_unlimited_v1",
    leagueId: "league_unlimited",
    version: "v1.0",
    name: "Unlimited v1.0",
    description: "Open queue with result proof only.",
    requireVerifier: false,
    requireInrunCheck: false,
    evidencePolicy: {
      precheckRequired: false,
      inrunRequired: false,
      resultRequired: true,
      retentionDays: {
        precheck: 7,
        inrun: 7,
        result: 30
      }
    },
    precheckFrequencySec: 5,
    inrunFrequencySec: 15,
    privacyMode: "MODE_A"
  }
];

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

export const leaderboard: Rating[] = ratings
  .filter((item) => item.leagueId === "league_standard")
  .slice()
  .sort((a, b) => b.elo - a.elo);

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
      { type: "BAN_A", agentId: "agent_lycaon", userId: "user_ellen", timestamp: now - 400000 },
      { type: "BAN_B", agentId: "agent_ellen", userId: "user_lycaon", timestamp: now - 395000 },
      { type: "PICK_A", agentId: "agent_anby", userId: "user_ellen", timestamp: now - 380000 },
      { type: "PICK_B", agentId: "agent_billy", userId: "user_lycaon", timestamp: now - 370000 },
      { type: "PICK_A", agentId: "agent_nicole", userId: "user_ellen", timestamp: now - 360000 }
    ],
    uniqueMode: "GLOBAL"
  },
  evidence: {
    precheck: [],
    inrun: [],
    result: undefined
  },
  confirmedBy: [],
  createdAt: now - 600000,
  updatedAt: now - 120000
};
