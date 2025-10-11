import React, { useEffect, useMemo, useState } from "react";
import "./chat.css";
import { db, auth } from "../Firebase";
import {
  collection as fsCollection,
  query as fsQuery,
  where as fsWhere,
  onSnapshot,
  getDocs,
  getDoc,
  updateDoc,
  arrayUnion,
  doc,
} from "firebase/firestore";
import { IoCloseCircleOutline, IoSearchSharp } from "react-icons/io5";

const makeChatKey = ({ type, id }) => `${type}::${id}`;

export function ForumModal({
  showForumModal,
  setShowForumModal,
  setSelectedForum,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [publicTeams, setPublicTeams] = useState([]);
  const [loadingTeams, setLoadingTeams] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!showForumModal) return;

    const teamsRef = fsCollection(db, "teams");

    // Subscribe to visibility == 'public'
    const q1 = fsQuery(teamsRef, fsWhere("visibility", "==", "public"));
    const unsub1 = onSnapshot(
      q1,
      (snap) => {
        const updated = snap.docs.map((d) => {
          const data = d.data() || {};
          return {
            id: d.id,
            name: data.name || "(unnamed team)",
            description: data.description || "",
            kind: "team",
          };
        });
        setPublicTeams(updated);
        setLoadingTeams(false);
      },
      (e) => {
        console.error(e);
        setError("Couldn't load public teams.");
        setLoadingTeams(false);
      }
    );

    // Fallback: also include isPublic == true (for older docs)
    const q2 = fsQuery(teamsRef, fsWhere("isPublic", "==", true));
    getDocs(q2)
      .then((snap) => {
        const extra = snap.docs.map((d) => {
          const data = d.data() || {};
          return {
            id: d.id,
            name: data.name || "(unnamed team)",
            description: data.description || "",
            kind: "team",
          };
        });
        setPublicTeams((prev) => {
          const map = new Map(prev.map((t) => [t.id, t]));
          extra.forEach((t) => map.set(t.id, t));
          return Array.from(map.values());
        });
      })
      .catch((e) => console.error(e));

    return () => unsub1();
  }, [showForumModal]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return publicTeams;
    return publicTeams.filter((f) => f.name.toLowerCase().includes(q));
  }, [publicTeams, searchQuery]);

  if (!showForumModal) return null;

  return (
    <div className="modal-overlay">
      <div
        className="modal-content forum-modal"
        style={{
          position: "relative",
          maxHeight: "80vh",
          overflowY: "auto",
          paddingBottom: "20px",
        }}
      >
        <button
          className="modal-close"
          style={{ position: "absolute", top: 18, right: 24 }}
          onClick={() => setShowForumModal(false)}
          aria-label="Close"
        >
          <IoCloseCircleOutline size={45} />
        </button>

        <h2 className="forum-modal-title">Find Forums</h2>
        <div className="search-box elevated">
          <input
            placeholder="Search public teams..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <IoSearchSharp className="search-icon" />
        </div>
        {loadingTeams && (
          <div className="forum-loading">Loading public teams…</div>
        )}
        {error && <div className="forum-error">{error}</div>}

        <div
          className="forum-list"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "4px",
          }}
        >
          {filtered.map((forum) => (
            <button
              key={forum.id}
              className="forum-list-item"
              onClick={() => setSelectedForum(forum)}
            >
              {forum.name}
            </button>
          ))}

          {!loadingTeams && filtered.length === 0 && (
            <div className="forum-empty">No results.</div>
          )}
        </div>
      </div>
    </div>
  );
}

export function JoinForumModal({
  selectedForum,
  setSelectedForum,
  setShowForumModal,
}) {
  if (!selectedForum) return null;

  const handleJoin = async () => {
    try {
      const uid = auth.currentUser?.uid;
      if (!uid) throw new Error("You must be signed in.");

      const teamRef = doc(db, "teams", selectedForum.id);
      await updateDoc(teamRef, { members: arrayUnion(uid) });

      const snap = await getDoc(teamRef);
      const team = snap.exists() ? snap.data() : {};

      // Close modals
      setSelectedForum(null);
      setShowForumModal(false);
    } catch (e) {
      alert(e.message || "Failed to join forum.");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content join-forum-modal">
        <button className="closeButton" onClick={() => setSelectedForum(null)}>
          <IoCloseCircleOutline size={45} />
        </button>
        <h2>{selectedForum.name}</h2>
        <h3>{selectedForum.description}</h3>
        <p>Would you like to join this forum?</p>
        <button className="join-forum-btn" onClick={handleJoin}>
          Join Forum
        </button>
      </div>
    </div>
  );
}
