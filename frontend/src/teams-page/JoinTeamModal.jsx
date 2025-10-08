// src/teams-page/JoinTeamModal.jsx
import React, { useEffect, useState, useMemo } from "react";
import {
  arrayUnion,
  collection,
  collectionGroup,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
  orderBy,
  limit,
} from "firebase/firestore";
import { auth, db } from "../Firebase";
import { searchPublicTeamsByName } from "./TeamsService";

export default function JoinTeamModal({ onClose }) {
  const [loading, setLoading] = useState(true);

  // lists
  const [publicTeams, setPublicTeams] = useState([]);
  const [inviteTeams, setInviteTeams] = useState([]); 

  // search state
  const [search, setSearch] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);

  const [error, setError] = useState("");

  const user = auth.currentUser;
  const uid = user?.uid || null;
  const emailLower = (user?.email || "").trim().toLowerCase();

  // load: public and invites 
  useEffect(() => {
    let alive = true;

    const run = async () => {
      if (!uid) {
        setError("Please sign in to join teams.");
        setLoading(false);
        return;
      }
      try {
        //  Public teams (both shapes)
        const [pubSnapA, pubSnapB] = await Promise.all([
          getDocs(query(collection(db, "teams"), where("isPublic", "==", true))),
          getDocs(query(collection(db, "teams"), where("visibility", "==", "public"))),
        ]);
        const byId = new Map();
        [...pubSnapA.docs, ...pubSnapB.docs].forEach((d) =>
          byId.set(d.id, { id: d.id, ...d.data() })
        );
        const pubList = Array.from(byId.values());
        if (alive) setPublicTeams(pubList);

        // helper to fetch team docs by IDs
        const fetchTeamsByIds = async (ids) => {
          const uniq = [...new Set(ids)].filter(Boolean);
          const out = [];
          await Promise.all(
            uniq.map(async (tid) => {
              try {
                const tRef = doc(db, "teams", tid);
                const tSnap = await getDoc(tRef);
                if (tSnap.exists()) out.push({ id: tSnap.id, ...tSnap.data() });
              } catch (_) {}
            })
          );
          return out;
        };


        let teamIdsFromMirror = [];
        try {
          const mirrorQ = query(
            collection(db, "invites"),
            where("emailLower", "==", emailLower)
          );
          const mirrorSnap = await getDocs(mirrorQ);
          teamIdsFromMirror = mirrorSnap.docs
            .map((d) => d.get("teamId"))
            .filter(Boolean);
        } catch (_) {}


        let teamIdsFromCG = [];
        if (teamIdsFromMirror.length === 0) {
          try {
            const cgQ = query(
              collectionGroup(db, "invites"),
              where("emailLower", "==", emailLower)
            );
            const cgSnap = await getDocs(cgQ);
            teamIdsFromCG = cgSnap.docs
              .map((d) => d.ref.parent.parent?.id)
              .filter(Boolean);
          } catch (_) {}
        }

        const teamIds = teamIdsFromMirror.length ? teamIdsFromMirror : teamIdsFromCG;
        const invited = teamIds.length ? await fetchTeamsByIds(teamIds) : [];
        if (alive) setInviteTeams(invited);
      } catch (e) {
        console.error(e);
        if (alive) setError("Failed to load teams or invites.");
      } finally {
        if (alive) setLoading(false);
      }
    };

    run();
    return () => {
      alive = false;
    };
  }, [uid, emailLower]);

  //  debounced search for public teams by name 
  useEffect(() => {
    let alive = true;
    const run = async () => {
      const q = search.trim();
      if (!q) {
        if (alive) setSearchResults([]);
        return;
      }
      setSearching(true);
      try {
        const rows = await searchPublicTeamsByName(q, 25);
        if (alive) setSearchResults(rows);
      } catch (e) {
        if (alive) setSearchResults([]);
      } finally {
        if (alive) setSearching(false);
      }
    };
    const t = setTimeout(run, 250);
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, [search]);

  const handleJoin = async (teamId) => {
    try {
      const ref = doc(db, "teams", teamId);
      await updateDoc(ref, { members: arrayUnion(uid) });
      onClose?.();
    } catch (e) {
      console.error(e);
      alert("Could not join this team.");
    }
  };

  if (loading) {
    return (
      <div className="join-modal">
        <div style={{ padding: 16 }}>Loading teams…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="join-modal">
        <div style={{ padding: 16, color: "red" }}>{error}</div>
      </div>
    );
  }

  // If user typed, show only search results
  const rows = search.trim()
    ? searchResults.map((t) => ({ ...t, _kind: "public" }))
    : [
        ...inviteTeams.map((t) => ({ ...t, _kind: "invite" })),
        ...publicTeams.map((t) => ({ ...t, _kind: "public" })),
      ];

  return (
    <div className="modal-backdrop">
      <div className="join-modal">
        <button className="modal-close" onClick={onClose} aria-label="close">
          ✕
        </button>
        <h2 className="join-title">Join a Team</h2>

        {/* Search input */}
        <div className="search-row" style={{ marginBottom: 12 }}>
          <span className="search-icon">🔎</span>
          <input
            className="search-input"
            placeholder="Search public teams by name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {searching && (
          <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 8 }}>
            searching…
          </div>
        )}

        {rows.length === 0 ? (
          <div className="tasks-empty" style={{ padding: 16 }}>
            {search.trim()
              ? "No public teams match your search."
              : "No public teams or invites yet."}
          </div>
        ) : (
          <div className="team-list">
            {rows.map((t) => (
              <div
                key={`${t._kind}:${t.id}`}
                className="team-card"
                style={{ justifyContent: "space-between" }}
              >
                <div className="team-card-info">
                  <div className="team-name">
                    {t._kind === "invite"
                      ? `Invited: ${t.name || "Team"}`
                      : t.name || "Unnamed Team"}
                  </div>
                  <div className="pill-row">
                    <span className="pill">{t._kind}</span>
                  </div>
                </div>
                <button
                  className="join-btn"
                  onClick={() => handleJoin(t.id)}
                  aria-label={`join ${t.name || "team"}`}
                >
                  Join
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
