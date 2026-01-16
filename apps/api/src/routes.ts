import type { FastifyInstance } from "fastify";
import type { DraftActionType, EvidenceRecord, EvidenceResult } from "@ika/shared";
import {
  applyDraftAction,
  confirmMatch,
  createMatchFromQueue,
  findUser,
  findMatch,
  findRuleset,
  getActiveSeason,
  getProfileSummary,
  listUsers,
  listLeaderboard,
  openDispute,
  recordInrun,
  recordPrecheck,
  recordResult,
  resolveDispute,
  store,
  transitionMatch,
  markCheckin
} from "./store";
import { createId, now, requireArray, requireString } from "./utils";

function sendError(reply: { code: (status: number) => { send: (payload: unknown) => void } }, error: unknown) {
  const message = error instanceof Error ? error.message : "Unknown error";
  reply.code(400).send({ error: message });
}

export async function registerRoutes(app: FastifyInstance) {
  app.get("/health", async () => ({ status: "ok" }));

  app.get("/agents", async () => store.agents);
  app.get("/leagues", async () => store.leagues);
  app.get("/rulesets", async () => store.rulesets);
  app.get("/challenges", async () => store.challenges);
  app.get("/queues", async () => store.queues);
  app.get("/seasons/current", async () => getActiveSeason());
  app.get("/users", async () => listUsers());

  app.get("/users/:id", async (request, reply) => {
    try {
      const userId = requireString((request.params as { id?: string }).id, "userId");
      reply.send(findUser(userId));
    } catch (error) {
      sendError(reply, error);
    }
  });

  app.get("/profiles/:id", async (request, reply) => {
    try {
      const userId = requireString((request.params as { id?: string }).id, "userId");
      reply.send(getProfileSummary(userId));
    } catch (error) {
      sendError(reply, error);
    }
  });

  app.get("/leaderboards/:leagueId", async (request, reply) => {
    try {
      const leagueId = requireString((request.params as { leagueId?: string }).leagueId, "leagueId");
      const ratings = listLeaderboard(leagueId);
      reply.send({ leagueId, ratings });
    } catch (error) {
      sendError(reply, error);
    }
  });

  app.post("/matchmaking/join", async (request, reply) => {
    try {
      const body = request.body as { userId?: string; queueId?: string };
      const userId = requireString(body?.userId, "userId");
      const queueId = requireString(body?.queueId, "queueId");
      const match = createMatchFromQueue(queueId, userId);
      reply.send(match);
    } catch (error) {
      sendError(reply, error);
    }
  });

  app.get("/matches/:id", async (request, reply) => {
    try {
      const matchId = requireString((request.params as { id?: string }).id, "matchId");
      reply.send(findMatch(matchId));
    } catch (error) {
      sendError(reply, error);
    }
  });

  app.post("/matches/:id/checkin", async (request, reply) => {
    try {
      const matchId = requireString((request.params as { id?: string }).id, "matchId");
      const body = request.body as { userId?: string };
      const userId = requireString(body?.userId, "userId");
      const match = findMatch(matchId);
      markCheckin(match, userId);
      reply.send(match);
    } catch (error) {
      sendError(reply, error);
    }
  });

  app.post("/matches/:id/draft/action", async (request, reply) => {
    try {
      const matchId = requireString((request.params as { id?: string }).id, "matchId");
      const body = request.body as {
        userId?: string;
        type?: DraftActionType;
        agentId?: string;
      };
      const userId = requireString(body?.userId, "userId");
      const type = requireString(body?.type, "type") as DraftActionType;
      const agentId = requireString(body?.agentId, "agentId");
      const match = findMatch(matchId);

      applyDraftAction(match, { type, agentId, userId, timestamp: now() });
      reply.send(match);
    } catch (error) {
      sendError(reply, error);
    }
  });

  app.post("/matches/:id/verifier/session", async (request, reply) => {
    try {
      const matchId = requireString((request.params as { id?: string }).id, "matchId");
      const match = findMatch(matchId);
      const ruleset = findRuleset(match.rulesetId);
      reply.send({
        sessionToken: createId("vsess"),
        nonce: createId("nonce"),
        privacyMode: ruleset.privacyMode,
        inrunFrequencySec: ruleset.inrunFrequencySec,
        requireInrunCheck: ruleset.requireInrunCheck
      });
    } catch (error) {
      sendError(reply, error);
    }
  });

  app.post("/matches/:id/evidence/precheck", async (request, reply) => {
    try {
      const matchId = requireString((request.params as { id?: string }).id, "matchId");
      const body = request.body as {
        userId?: string;
        detectedAgents?: string[];
        confidence?: Record<string, number>;
        result?: EvidenceResult;
        frameHash?: string;
        cropUrl?: string;
      };
      const match = findMatch(matchId);
      const record: EvidenceRecord = {
        id: createId("ev"),
        type: "PRECHECK",
        timestamp: now(),
        userId: body?.userId,
        detectedAgents: requireArray<string>(body?.detectedAgents, "detectedAgents"),
        confidence: body?.confidence ?? {},
        result: (body?.result ?? "LOW_CONF") as EvidenceResult,
        frameHash: body?.frameHash,
        cropUrl: body?.cropUrl
      };
      recordPrecheck(match, record);
      reply.send(match);
    } catch (error) {
      sendError(reply, error);
    }
  });

  app.post("/matches/:id/evidence/inrun", async (request, reply) => {
    try {
      const matchId = requireString((request.params as { id?: string }).id, "matchId");
      const body = request.body as {
        userId?: string;
        detectedAgents?: string[];
        confidence?: Record<string, number>;
        result?: EvidenceResult;
        frameHash?: string;
        cropUrl?: string;
      };
      const match = findMatch(matchId);
      const record: EvidenceRecord = {
        id: createId("ev"),
        type: "INRUN",
        timestamp: now(),
        userId: body?.userId,
        detectedAgents: requireArray<string>(body?.detectedAgents, "detectedAgents"),
        confidence: body?.confidence ?? {},
        result: (body?.result ?? "LOW_CONF") as EvidenceResult,
        frameHash: body?.frameHash,
        cropUrl: body?.cropUrl
      };
      recordInrun(match, record);
      reply.send(match);
    } catch (error) {
      sendError(reply, error);
    }
  });

  app.post("/matches/:id/result/submit", async (request, reply) => {
    try {
      const matchId = requireString((request.params as { id?: string }).id, "matchId");
      const body = request.body as {
        metricType?: string;
        value?: number | string;
        proofUrl?: string;
      };
      const match = findMatch(matchId);
      if (match.state === "IN_PROGRESS") {
        transitionMatch(match, "AWAITING_RESULT_UPLOAD");
      }
      recordResult(match, {
        metricType: requireString(body?.metricType, "metricType") as "TIME_MS" | "SCORE" | "RANK_TIER",
        value: body?.value ?? 0,
        proofUrl: requireString(body?.proofUrl, "proofUrl"),
        submittedAt: now()
      });
      reply.send(match);
    } catch (error) {
      sendError(reply, error);
    }
  });

  app.post("/matches/:id/confirm", async (request, reply) => {
    try {
      const matchId = requireString((request.params as { id?: string }).id, "matchId");
      const body = request.body as { userId?: string };
      const match = findMatch(matchId);
      confirmMatch(match, requireString(body?.userId, "userId"));
      reply.send(match);
    } catch (error) {
      sendError(reply, error);
    }
  });

  app.post("/matches/:id/dispute/open", async (request, reply) => {
    try {
      const matchId = requireString((request.params as { id?: string }).id, "matchId");
      const body = request.body as { userId?: string; reason?: string };
      const match = findMatch(matchId);
      const dispute = openDispute(
        match,
        requireString(body?.userId, "userId"),
        requireString(body?.reason, "reason")
      );
      reply.send(dispute);
    } catch (error) {
      sendError(reply, error);
    }
  });

  app.get("/disputes/queue", async () => {
    return Array.from(store.disputes.values()).filter((item) => item.status === "OPEN");
  });

  app.post("/disputes/:id/decision", async (request, reply) => {
    try {
      const disputeId = requireString((request.params as { id?: string }).id, "disputeId");
      const body = request.body as { decision?: string };
      const dispute = resolveDispute(disputeId, requireString(body?.decision, "decision"));
      reply.send(dispute);
    } catch (error) {
      sendError(reply, error);
    }
  });
}
