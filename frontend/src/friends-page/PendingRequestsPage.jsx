import React, { useEffect, useState } from "react";
import FriendsService from "./FriendsService";
import UserCard from "./UserCard";
import Toast from "./Toast";
import "./friends.css";

export default function PendingRequestsPage() {
  const [outgoing, setOutgoing] = useState([]);
  const [toast, setToast] = useState("");

  async function refresh() {
    setOutgoing(await FriendsService.listOutgoing());
  }
  useEffect(() => { refresh(); }, []);

  async function handleCancel(userId) {
    const req = outgoing.find(r => r.to.id === userId);
    if (!req) return;
    const prev = outgoing;
    setOutgoing(prev.filter(r => r.id !== req.id));
    try {
      await FriendsService.cancel(req.id);
      setToast("Request canceled");
    } catch {
      setOutgoing(prev);
      setToast("Failed to cancel");
    }
  }

  return (
    <div className="friends-page">
      <h1>Pending Requests</h1>

      <div role="list" className="list">
        {outgoing.length === 0 ? (
          <div className="empty">No pending requests</div>
        ) : (
          outgoing.map(r => (
            <UserCard
              key={r.id}
              user={{ id: r.to.id, name: r.to.name, pendingOutgoing: true }}
              onCancel={handleCancel}
            />
          ))
        )}
      </div>

      <Toast message={toast} onClose={() => setToast("")} />
    </div>
  );
}
