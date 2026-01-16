import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { QueueConfig, User } from "@ika/shared";
import { fetchQueues, fetchUsers, joinMatchmaking } from "../api";

export default function Matchmaking() {
  const [queues, setQueues] = useState<QueueConfig[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUserId, setCurrentUserId] = useState("user_ellen");
  const [status, setStatus] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchQueues().then(setQueues);
    fetchUsers().then(setUsers);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("ika:userId", currentUserId);
    }
  }, [currentUserId]);

  const handleJoin = async (queueId: string) => {
    setStatus("Joining queue...");
    const match = await joinMatchmaking(currentUserId, queueId);
    setStatus(null);
    navigate(`/match/${match.id}`);
  };

  return (
    <div className="page">
      <section className="section-header">
        <h2>Matchmaking</h2>
        <p>Pick a queue and create a match room.</p>
      </section>

      <div className="card">
        <div className="card-header">
          <h3>Current user</h3>
          <span className="badge-outline">MVP-1</span>
        </div>
        <label>
          User
          <select
            value={currentUserId}
            onChange={(event) => setCurrentUserId(event.target.value)}
          >
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.displayName}
              </option>
            ))}
          </select>
        </label>
        {status ? <p>{status}</p> : null}
      </div>

      <div className="grid">
        {queues.map((queue) => (
          <div key={queue.id} className="card">
            <div className="card-header">
              <h3>{queue.name}</h3>
              <span className={queue.requireVerifier ? "badge" : "badge-outline"}>
                {queue.requireVerifier ? "Verifier" : "Open"}
              </span>
            </div>
            <p>{queue.description}</p>
            <div className="card-footer">
              <div>
                <div className="meta-label">League</div>
                <div className="meta-value">{queue.leagueId.replace("league_", "")}</div>
              </div>
              <button className="primary-button" onClick={() => handleJoin(queue.id)}>
                Join queue
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
