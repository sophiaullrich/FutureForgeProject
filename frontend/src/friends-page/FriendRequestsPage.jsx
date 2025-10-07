import React, { useEffect, useState } from "react";
import FriendsService from "./FriendsService";
import UserCard from "./UserCard";
import Toast from "./Toast";
import "./friends.css";

export default function FriendRequestsPage() {
  // store incoming friend requests
  const [incoming, setIncoming] = useState([]);
  // store toast message
  const [toast, setToast] = useState("");

  // get friend requests from firebase
  async function refresh() {
    setIncoming(await FriendsService.listIncoming());
  }

  // load requests when page opens
  useEffect(() => { refresh(); }, []);

  // accept a friend request
  async function handleAccept(userId) {
    const req = incoming.find(r => r.from.id === userId);
    if (!req) return;
    const prev = incoming;
    // remove request from list
    setIncoming(prev.filter(r => r.id !== req.id));
    try {
      await FriendsService.accept(req.id);
      setToast("friend added");
    } catch {
      // put request back if it fails
      setIncoming(prev);
      setToast("failed to accept");
    }
  }

  // decline a friend request
  async function handleDecline(userId) {
    const req = incoming.find(r => r.from.id === userId);
    if (!req) return;
    const prev = incoming;
    // remove request from list
    setIncoming(prev.filter(r => r.id !== req.id));
    try {
      await FriendsService.decline(req.id);
      setToast("request declined");
    } catch {
      // put request back if it fails
      setIncoming(prev);
      setToast("failed to decline");
    }
  }

  // render page
  return (
    <div className="friends-page">
      <h1>friend requests</h1>

      <div role="list" className="list">
        {incoming.length === 0 ? (
          <div className="empty">no incoming requests</div>
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

      {/* show toast messages */}
      <Toast message={toast} onClose={() => setToast("")} />
    </div>
  );
}
