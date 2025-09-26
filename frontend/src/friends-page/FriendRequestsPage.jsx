import React, { useEffect, useState } from "react";
import FriendsService from "./FriendsService";
import UserCard from "./UserCard";
import Toast from "./Toast";
import "./friends.css";

export default function FriendRequestsPage() {
  const [incoming, setIncoming] = useState([]);
  const [toast, setToast] = useState("");

  async function refresh() {
    setIncoming(await FriendsService.listIncoming());
  }
  useEffect(() => { refresh(); }, []);

  async function handleAccept(userId) {
    const req = incoming.find(r => r.from.id === userId);
    if (!req) return;
    const prev = incoming;
    setIncoming(prev.filter(r => r.id !== req.id));
    try {
      await FriendsService.accept(req.id);
      setToast("Friend added");
    } catch {
      setIncoming(prev);
      setToast("Failed to accept");
    }
  }

  async function handleDecline(userId) {
    const req = incoming.find(r => r.from.id === userId);
    if (!req) return;
    const prev = incoming;
    setIncoming(prev.filter(r => r.id !== req.id));
    try {
      await FriendsService.decline(req.id);
      setToast("Request declined");
    } catch {
      setIncoming(prev);
      setToast("Failed to decline");
    }
  }

  return (
    <div className="friends-page">
      <h1>Friend Requests</h1>

      <div role="list" className="list">
        {incoming.length === 0 ? (
          <div className="empty">No incoming requests</div>
        ) : (
          incoming.map(r => (
            <UserCard
              key={r.id}
              user={{ id: r.from.id, name: r.from.name, pendingIncoming: true }}
              onAccept={handleAccept}
              onDecline={handleDecline}
            />
          ))
        )}
      </div>

      <Toast message={toast} onClose={() => setToast("")} />
    </div>
  );
}
