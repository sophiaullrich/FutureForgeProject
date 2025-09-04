import React, { useEffect, useMemo, useState, useCallback } from "react";
import FriendsService from "./FriendsService";
import SearchBar from "./SearchBar";
import UserCard from "./UserCard";
import Tabs from "./Tabs";
import Toast from "./Toast";
import "./friends.css";

export default function MakeFriendsPage() {
  // UI state
  const [tab, setTab] = useState("friends"); // friends | requests | pending
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");

  // Data state
  const [results, setResults] = useState([]);   // search results
  const [friends, setFriends] = useState([]);   // confirmed friends
  const [incoming, setIncoming] = useState([]); // requests to me
  const [outgoing, setOutgoing] = useState([]); // requests from me

  // Loaders wrapped in useCallback so ESLint is happy in effects
  const refreshFriends  = useCallback(async () => {
    setFriends(await FriendsService.listFriends());
  }, []);
  const refreshIncoming = useCallback(async () => {
    setIncoming(await FriendsService.listIncoming());
  }, []);
  const refreshOutgoing = useCallback(async () => {
    setOutgoing(await FriendsService.listOutgoing());
  }, []);
  const refreshAll = useCallback(async () => {
    await Promise.all([refreshFriends(), refreshIncoming(), refreshOutgoing()]);
  }, [refreshFriends, refreshIncoming, refreshOutgoing]);

  // Tab badges
  const counts = useMemo(
    () => ({
      friends: friends.length,
      requests: incoming.length,
      pending: outgoing.length,
    }),
    [friends.length, incoming.length, outgoing.length]
  );

  // Init + event listener
  useEffect(() => {
    refreshAll();
    const off = FriendsService.onIncomingRequest((evt) => {
      if (evt?.type === "incoming-request" && evt.from?.name) {
        setToast(`New friend request from ${evt.from.name}`);
        refreshIncoming();
      }
    });
    return () => typeof off === "function" && off();
  }, [refreshAll, refreshIncoming]);

  // Search
  async function handleSearch(q) {
    setLoading(true);
    try {
      const data = await FriendsService.search(q);
      setResults(data);
    } catch {
      setToast("Couldn't load results");
    } finally {
      setLoading(false);
    }
  }

  // Actions (optimistic)
  async function handleAdd(userId) {
    const prev = results;
    setResults(prev.map((u) => (u.id === userId ? { ...u, pendingOutgoing: true } : u)));
    try {
      await FriendsService.sendRequest(userId);
      await refreshOutgoing();
      setToast("Request sent");
    } catch (e) {
      setResults(prev);
      setToast(e?.message || "Failed to send request");
    }
  }

  async function handleAccept(userId) {
    const req = incoming.find((r) => r.from.id === userId);
    if (!req) return;
    const prev = incoming;
    setIncoming(prev.filter((r) => r.id !== req.id));
    try {
      await FriendsService.accept(req.id);
      await refreshFriends();
      setToast("Friend added");
    } catch {
      setIncoming(prev);
      setToast("Failed to accept");
    }
  }

  async function handleDecline(userId) {
    const req = incoming.find((r) => r.from.id === userId);
    if (!req) return;
    const prev = incoming;
    setIncoming(prev.filter((r) => r.id !== req.id));
    try {
      await FriendsService.decline(req.id);
      setToast("Request declined");
    } catch {
      setIncoming(prev);
      setToast("Failed to decline");
    }
  }

  async function handleCancel(userId) {
    const req = outgoing.find((r) => r.to.id === userId);
    if (!req) return;
    const prev = outgoing;
    setOutgoing(prev.filter((r) => r.id !== req.id));
    try {
      await FriendsService.cancel(req.id);
      setToast("Request canceled");
    } catch {
      setOutgoing(prev);
      setToast("Failed to cancel");
    }
  }

  // Derived list for current tab
  const tabList = useMemo(() => {
    if (tab === "friends")  return friends.map((f) => ({ id: f.id, name: f.name, isFriend: true }));
    if (tab === "requests") return incoming.map((r) => ({ id: r.from.id, name: r.from.name, pendingIncoming: true }));
    if (tab === "pending")  return outgoing.map((r) => ({ id: r.to.id,   name: r.to.name,   pendingOutgoing: true }));
    return [];
  }, [tab, friends, incoming, outgoing]);

  return (
    <div className="friends-page">
      <h1>Make Friends</h1>

      <SearchBar onSearch={handleSearch} loading={loading} />

      {/* Demo buttons to simulate requests */}
      <div className="demo">
        <button onClick={() => FriendsService.__simulateIncoming("u1")}>Simulate incoming from Rory</button>
        <button onClick={() => FriendsService.__simulateIncoming("u2")}>Simulate incoming from Holly</button>
      </div>

      {/* Search results */}
      {results.length > 0 && (
        <>
          <h2 className="subhead">Search Results</h2>
          <div role="list" className="list">
            {results.map((u) => (
              <UserCard
                key={`res-${u.id}`}
                user={u}
                onAdd={handleAdd}
                onAccept={handleAccept}
                onDecline={handleDecline}
                onCancel={handleCancel}
              />
            ))}
          </div>
        </>
      )}

      {/* Tabs + current list */}
      <Tabs tab={tab} counts={counts} onTab={setTab} />
      <div role="list" className="list">
        {tabList.length === 0 ? (
          <div className="empty">No items yet</div>
        ) : (
          tabList.map((u) => (
            <UserCard
              key={`${tab}-${u.id}`}
              user={u}
              onAdd={handleAdd}
              onAccept={handleAccept}
              onDecline={handleDecline}
              onCancel={handleCancel}
            />
          ))
        )}
      </div>

      <Toast message={toast} onClose={() => setToast("")} />
    </div>
  );
}
