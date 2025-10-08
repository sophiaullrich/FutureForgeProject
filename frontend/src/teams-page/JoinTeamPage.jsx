// JoinTeamPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { auth, db } from "../Firebase";
import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import FriendsService from "../friends-page/FriendsService.firebase";

export default function JoinTeamPage() {
  const { teamId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [joined, setJoined] = useState(false);
  const [teamName, setTeamName] = useState("");

  const [publicTeams, setPublicTeams] = useState([]);
  const [friendsUids, setFriendsUids] = useState([]);
  const [profilesByUid, setProfilesByUid] = useState({});

  const user = auth.currentUser;
  const uid = user?.uid || null;
  const emailLower = (user?.email || "").trim().toLowerCase();

  const isPublicTeam = (data) =>
    data?.isPublic === true || (data?.visibility || "") === "public";

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!uid) {
        setError("You must be signed in to continue.");
        setLoading(false);
        return;
      }


      if (teamId) {
        try {
          const teamRef = doc(db, "teams", teamId);
          const teamSnap = await getDoc(teamRef);
          if (!teamSnap.exists()) {
            setError("This team does not exist.");
            setLoading(false);
            return;
          }
          const data = teamSnap.data();
          const members = Array.isArray(data.members) ? data.members : [];
          setTeamName(data.name || "unnamed team");

          // already a member then redirects
          if (members.includes(uid)) {
            setJoined(true);
            setLoading(false);
            setTimeout(() => navigate("/teams"), 1200);
            return;
          }

          // public then free join
          if (isPublicTeam(data)) {
            await updateDoc(teamRef, { members: arrayUnion(uid) });
            setJoined(true);
            setLoading(false);
            setTimeout(() => navigate("/teams"), 1200);
            return;
          }

          // private then must have invite 
          const teamScopedInviteRef = doc(
            db,
            "teams",
            teamId,
            "invites",
            emailLower
          );
          const teamScopedInviteSnap = await getDoc(teamScopedInviteRef);

       
          const globalKey = `${teamId}:${emailLower}`;
          const globalInviteRef = doc(db, "invites", globalKey);
          let globalInviteSnap = { exists: () => false };
          try {
            globalInviteSnap = await getDoc(globalInviteRef);
          } catch (_) {
            /* ignore best-effort */
          }

          const hasInvite =
            teamScopedInviteSnap.exists() || globalInviteSnap.exists();
          if (!hasInvite) {
            setError("This is a private team. You need an invite to join.");
            setLoading(false);
            return;
          }

          await updateDoc(teamRef, { members: arrayUnion(uid) });
          setJoined(true);
          setLoading(false);
          setTimeout(() => navigate("/teams"), 1200);
          return;
        } catch (e) {
          console.error(e);
          setError("Something went wrong while joining the team.");
          setLoading(false);
          return;
        }
      }

      // No teamId then list public teams
      try {
        const [snapA, snapB] = await Promise.all([
          getDocs(query(collection(db, "teams"), where("isPublic", "==", true))),
          getDocs(query(collection(db, "teams"), where("visibility", "==", "public"))),
        ]);
        const byId = new Map();
        [...snapA.docs, ...snapB.docs].forEach((d) =>
          byId.set(d.id, { id: d.id, ...d.data() })
        );
        const teams = [...byId.values()]
          .sort((a, b) => (a.name || "").localeCompare(b.name || ""))
          .slice(0, 50);

       
        let fUids = [];
        try {
          fUids = await FriendsService.getFriendsUids(uid);
        } catch {
          fUids = [];
        }

        // Collect only the profile IDs needed
        const need = new Set();
        teams.forEach((t) =>
          (Array.isArray(t.members) ? t.members : []).forEach((m) => need.add(m))
        );
        fUids.forEach((m) => need.add(m));

        const profiles = {};
        if (need.size > 0) {
          
          try {
            const docs = await Promise.all(
              [...need].map((id) => getDoc(doc(db, "profiles", id)))
            );
            docs.forEach((snap) => {
              if (snap.exists()) {
                const p = snap.data() || {};
                profiles[snap.id] = {
                  id: snap.id,
                  displayName: p.displayName || p.name || p.email || "user",
                  email: p.email || "",
                };
              }
            });
          } catch {
            
          }
        }

        if (!mounted) return;
        setPublicTeams(teams);
        setFriendsUids(fUids);
        setProfilesByUid(profiles);
        setLoading(false);
      } catch (e) {
        console.error(e);
        setError("Could not load public teams.");
        setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [teamId, uid, emailLower, navigate]);

  const rows = useMemo(() => {
    return publicTeams.map((t) => {
      const memberUids = Array.isArray(t.members) ? t.members : [];
      const friendUidsInTeam = memberUids.filter((u) => friendsUids.includes(u));
      const friendNames = friendUidsInTeam
        .map((u) => profilesByUid[u]?.displayName || "friend")
        .slice(0, 3);
      const extraCount = Math.max(0, friendUidsInTeam.length - 3);
      return {
        id: t.id,
        name: t.name || "Untitled team",
        membersCount: memberUids.length,
        friendNames,
        extraCount,
      };
    });
  }, [publicTeams, friendsUids, profilesByUid]);

  // Join button from public list
  const handleJoin = async (id) => {
    if (!uid) {
      setError("You must be signed in to join.");
      return;
    }
    try {
      const ref = doc(db, "teams", id);
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        setError("Team not found.");
        return;
      }
      const data = snap.data();
      const name = data.name || "team";
      const members = Array.isArray(data.members) ? data.members : [];

      if (!isPublicTeam(data)) {
        setError("This team is private. You need an invite to join.");
        return;
      }
      if (members.includes(uid)) {
        setTeamName(name);
        setJoined(true);
        setTimeout(() => navigate("/teams"), 800);
        return;
      }
      await updateDoc(ref, { members: arrayUnion(uid) });
      setJoined(true);
      setTeamName(name);
      setTimeout(() => navigate("/teams"), 1200);
    } catch (e) {
      console.error(e);
      setError("Failed to join this team.");
    }
  };

  if (loading)
    return (
      <div className="join-modal">
        <div style={{ padding: 16 }}>loading…</div>
      </div>
    );

  if (error)
    return (
      <div className="join-modal">
        <div style={{ padding: 16, color: "red" }}>{error}</div>
      </div>
    );

  if (teamId) {
    return (
      <div className="join-modal">
        {joined ? (
          <>
            <h2 className="join-title">welcome to {teamName}</h2>
            <div style={{ textAlign: "center" }}>redirecting…</div>
          </>
        ) : (
          <>
            <h2 className="join-title">joining {teamName}…</h2>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="join-modal">
      <button
        className="modal-close"
        onClick={() => navigate("/teams")}
        aria-label="close"
      >
        ✕
      </button>
      <h2 className="join-title">join a team</h2>

      {rows.length === 0 ? (
        <div className="team-card" style={{ justifyContent: "center" }}>
          no public teams yet
        </div>
      ) : (
        <div className="team-list">
          {rows.map((row) => (
            <div className="team-card" key={row.id}>
              <div className="team-card-info">
                <div className="team-name">{row.name}</div>
                <div className="pill-row">
                  <span className="pill">{row.membersCount} members</span>
                  {row.friendNames.length > 0 && (
                    <span className="pill">
                      {row.friendNames.join(", ")}{" "}
                      {row.extraCount > 0 ? `+${row.extraCount}` : ""} here
                    </span>
                  )}
                </div>
              </div>
              <button
                className="join-btn"
                onClick={() => handleJoin(row.id)}
                aria-label={`join ${row.name}`}
              >
                join
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
