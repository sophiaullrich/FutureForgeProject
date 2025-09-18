import React, { useEffect, useMemo, useState, useCallback } from "react";
import FriendsService from "./FriendsService.firebase"; // Firebase service
import SearchBar from "./SearchBar";
import UserCard from "./UserCard";
import Tabs from "./Tabs";
import Toast from "./Toast";
import "./friends.css";

// Wait for auth before first load
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../Firebase";

export default function MakeFriendsPage() {
  // UI state
  const [tab, setTab] = useState("friends"); // friends | requests | pending
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");
  const [authReady, setAuthReady] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);

  // Data state
  const [results, setResults] = useState([]);   // search results
  const [friends, setFriends] = useState([]);   // confirmed friends
  const [incoming, setIncoming] = useState([]); // requests to me
  const [outgoing, setOutgoing] = useState([]); // requests from me

  // Refresh helpers
  const refreshFriends  = useCallback(async () => setFriends(await FriendsService.listFriends()), []);
  const refreshIncoming = useCallback(async () => setIncoming(await FriendsService.listIncoming()), []);
  const refreshOutgoing = useCallback(async () => setOutgoing(await FriendsService.listOutgoing()), []);
  const refreshAll = useCallback(async () => {
    await Promise.all([refreshFriends(), refreshIncoming(), refreshOutgoing()]);
  }, [refreshFriends, refreshIncoming, refreshOutgoing]);

  // Tab badge counts
  const counts = useMemo(
    () => ({
      friends: friends.length,
      requests: incoming.length,
      pending: outgoing.length,
    }),
    [friends.length, incoming.length, outgoing.length]
  );

  // Initial load — wait for Firebase Auth to hydrate, then load lists
  useEffect(() => {
    const off = onAuthStateChanged(auth, (u) => {
      // 🔎 debug: confirm same project + UID
      console.log("MakeFriendsPage auth:", u?.uid, auth.app.options.projectId);

      setAuthReady(true);
      setIsSignedIn(!!u);
      if (u) {
        // user is signed in; now safe to hit Firestore
        refreshAll();
      } else {
        setFriends([]);
        setIncoming([]);
        setOutgoing([]);
        setResults([]);
      }
    });
    return () => off();
  }, [refreshAll]);

  // ---- SEARCH ----
  async function handleSearch(q) {
    if (!isSignedIn) {
      setToast("Please sign in first.");
      return;
    }
    setLoading(true);
    try {
      const data = await FriendsService.search(q);
      setResults(data);
    } catch (err) {
      console.error(err);
      setToast("Couldn't load results");
    } finally {
      setLoading(false);
    }
  }

  // ---- ACTIONS ----
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
    } catch (e) {
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
    } catch (e) {
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
    } catch (e) {
      setOutgoing(prev);
      setToast("Failed to cancel");
    }
  }

  async function handleUnfriend(userId) {
    const prev = friends;
    setFriends(prev.filter((f) => f.id !== userId)); // optimistic
    try {
      await FriendsService.unfriend(userId);
      await refreshFriends();
      setToast("Removed from friends");
    } catch (e) {
      setFriends(prev);
      setToast(e?.message || "Failed to unfriend");
    }
  }

  // Derived list for current tab
  const tabList = useMemo(() => {
    if (tab === "friends")
      return friends.map((f) => ({ id: f.id, name: f.name, email: f.email, isFriend: true }));
    if (tab === "requests")
      return incoming.map((r) => ({ id: r.from.id, name: r.from.name, pendingIncoming: true }));
    if (tab === "pending")
      return outgoing.map((r) => ({ id: r.to.id, name: r.to.name, pendingOutgoing: true }));
    return [];
  }, [tab, friends, incoming, outgoing]);

  // If auth hasn't hydrated yet, show a light placeholder
  if (!authReady) {
    return (
      <div className="friends-page">
        <h1>Make Friends</h1>
        <div className="empty">Loading your account…</div>
      </div>
    );
  }

  // If user is not signed in, show a friendly message
  if (authReady && !isSignedIn) {
    return (
      <div className="friends-page">
        <h1>Make Friends</h1>
        <div className="empty">Please sign in to search and manage friends.</div>
      </div>
    );
  }

  return (
    <div className="friends-page">
      <h1>Make Friends</h1>

      <SearchBar onSearch={handleSearch} loading={loading} />

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
                onUnfriend={handleUnfriend}
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
              onUnfriend={handleUnfriend}
            />
          ))
        )}
      </div>

      <Toast message={toast} onClose={() => setToast("")} />
    </div>
  );
}
