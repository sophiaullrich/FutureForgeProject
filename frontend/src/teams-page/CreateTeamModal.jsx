// modal for creating a new team
import React, { useEffect, useMemo, useState } from "react";
import { listProfiles } from "./ProfileService"; // <- make sure filename matches exactly
import { db } from "../Firebase";
import { doc, setDoc } from "firebase/firestore";
import { auth } from "../Firebase"; // Import auth to get current user

const BACKEND_URL = "http://localhost:5001/api/chat/createTeamChatBox"; // Adjust if needed

export default function CreateTeamModal({ onClose, onCreate, onAddMembers }) {
  // form fields
  const [teamName, setTeamName] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState("private"); // public or private

  // user profiles
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  // search and selection
  const [query, setQuery] = useState("");
  const [selectedUids, setSelectedUids] = useState(new Set());
  const [submitError, setSubmitError] = useState("");

  // load user profiles
  useEffect(() => {
    (async () => {
      setLoading(true);
      setLoadError("");
      try {
        const ppl = await listProfiles();
        setProfiles(ppl);
      } catch (e) {
        console.error("failed to load profiles:", e);
        setLoadError("could not load users. check signin and firestore rules.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // filter users by query
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return profiles;
    return profiles.filter((p) => {
      const name = (p.displayName || "").toLowerCase();
      const email = (p.email || "").toLowerCase();
      return name.includes(q) || email.includes(q);
    });
  }, [profiles, query]);

  // select or unselect a user
  const toggle = (uid) => {
    setSelectedUids((prev) => {
      const next = new Set(prev);
      next.has(uid) ? next.delete(uid) : next.add(uid);
      return next;
    });
  };

  // create team and add members
  const handleCreate = async () => {
    setSubmitError("");
    const name = teamName.trim();
    if (!name) {
      setSubmitError("please enter a team name.");
      return;
    }

    // Ensure owner of the group is always in the team
    const creatorUid = auth.currentUser?.uid;
    const uids = Array.from(selectedUids);
    if (creatorUid && !uids.includes(creatorUid)) uids.push(creatorUid);

    try {
      const teamId = await onCreate?.({
        name,
        description: description.trim(),
        isPublic: visibility === "public",
      });

      if (teamId && uids.length && onAddMembers) {
        await onAddMembers({ teamId, memberUids: uids });
      }

      // Call backend to create group chat box for the team
      if (teamId && uids.length) {
        await fetch(BACKEND_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            teamId,
            teamName: name,
            memberUids: uids,
          }),
        });
      }

      onClose?.();
    } catch (e) {
      console.error(e);
      setSubmitError(e?.message || "failed to create team.");
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="create-modal">
        <button className="modal-close" onClick={onClose} aria-label="close">
          ✕
        </button>

        <h2 className="create-title">create team</h2>

        {submitError && <div className="form-error">{submitError}</div>}

        <label className="form-label">team name</label>
        <input
          className="form-input"
          placeholder="enter team name"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
        />

        <label className="form-label">description</label>
        <textarea
          className="form-textarea"
          placeholder="enter description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <label className="form-label">team visibility</label>
        <div className="radio-row" style={{ marginBottom: "1rem" }}>
          <label style={{ marginRight: "1rem" }}>
            <input
              type="radio"
              name="visibility"
              value="public"
              checked={visibility === "public"}
              onChange={() => setVisibility("public")}
            />
            public
          </label>
          <label>
            <input
              type="radio"
              name="visibility"
              value="private"
              checked={visibility === "private"}
              onChange={() => setVisibility("private")}
            />
            private
          </label>
        </div>

        <label className="form-label">add members (from registered users)</label>
        <div className="search-row">
          <span className="search-icon">🔎</span>
          <input
            className="search-input"
            placeholder="search by name or email..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="member-list" style={{ maxHeight: 240, overflowY: "auto" }}>
          {loading ? (
            <div className="tasks-empty">loading users…</div>
          ) : loadError ? (
            <div className="form-error" style={{ marginTop: 8 }}>{loadError}</div>
          ) : filtered.length === 0 ? (
            <div className="tasks-empty">no users found.</div>
          ) : (
            filtered.map((p) => {
              const uid = p.uid || p.id;
              const active = selectedUids.has(uid);
              return (
                <button
                  type="button"
                  key={uid}
                  className={`member-row ${active ? "active" : ""}`}
                  onClick={() => toggle(uid)}
                  title={p.email}
                >
                  <span className="avatar-dot" />
                  <span className="member-name">{p.displayName || p.email || uid}</span>
                  <span className="member-sub">{p.email}</span>
                </button>
              );
            })
          )}
        </div>

        <button className="primary-cta" onClick={handleCreate}>
          create team
        </button>
      </div>
    </div>
  );
}
