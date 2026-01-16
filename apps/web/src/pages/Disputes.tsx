import { useEffect, useState } from "react";
import type { Dispute } from "@ika/shared";
import { fetchDisputes, resolveDispute } from "../api";

export default function Disputes() {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [decisions, setDecisions] = useState<Record<string, string>>({});

  const load = () => {
    fetchDisputes().then(setDisputes);
  };

  useEffect(() => {
    load();
  }, []);

  const handleResolve = async (disputeId: string) => {
    const decision = decisions[disputeId];
    if (!decision) {
      return;
    }
    await resolveDispute(disputeId, decision);
    load();
  };

  return (
    <div className="page">
      <section className="section-header">
        <h2>Judge Queue</h2>
        <p>Review verifier logs and issue decisions.</p>
      </section>

      <div className="grid">
        {disputes.length === 0 ? (
          <div className="card">No open disputes.</div>
        ) : (
          disputes.map((dispute) => (
            <div key={dispute.id} className="card">
              <div className="card-header">
                <h3>{dispute.id}</h3>
                <span className="badge">{dispute.status}</span>
              </div>
              <p>Match: {dispute.matchId}</p>
              <p>{dispute.reason}</p>
              <label>
                Decision
                <input
                  value={decisions[dispute.id] ?? ""}
                  onChange={(event) =>
                    setDecisions((prev) => ({ ...prev, [dispute.id]: event.target.value }))
                  }
                  placeholder="Decision summary"
                />
              </label>
              <div className="card-actions">
                <button className="primary-button" onClick={() => handleResolve(dispute.id)}>
                  Resolve
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
