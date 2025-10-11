import React, { useEffect, useState } from "react";
import FriendsService from "./FriendsService";
import UserCard from "./UserCard";
import Toast from "./Toast";
import "./friends.css";

export default function PendingRequestsPage() {
  // store outgoing friend requests
  const [outgoing, setOutgoing] = useState([]);
  // show small messages to user
  const [toast, setToast] = useState("");

  // load pending requests
  async function refresh() {
    setOutgoing(await FriendsService.listOutgoing());
  }

  // load once on page open
  useEffect(() => {
    refresh();
  }, []);

  // cancel a pending request
  async function handleCancel(userId) {
    const req = outgoing.find((r) => r.to.id === userId);
    if (!req) return;
    const prev = outgoing;
    setOutgoing(prev.filter((r) => r.id !== req.id)); // optimistic update
    try {
      await FriendsService.cancel(req.id);
      setToast("request canceled");
    } catch {
      setOutgoing(prev);
      setToast("failed to cancel");
    }
  }

  // page layout
  return (
    <div className="friends-page">
      <h1>Pending Requests</h1>

      <div role="list" className="list">
        {outgoing.length === 0 ? (
          <div className="empty">No Pending Requests</div>
        ) : (
          outgoing.map((r) => (
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
