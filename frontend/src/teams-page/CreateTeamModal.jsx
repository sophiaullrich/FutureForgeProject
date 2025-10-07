// frontend/src/teams-page/CreateTeamModal.jsx
import React, { useEffect, useMemo, useState } from "react";
import { listProfiles } from "./ProfileService"; // <- make sure filename matches exactly
import { collection, doc, setDoc } from "firebase/firestore";

export default function CreateTeamModal({ onClose, onCreate, onAddMembers }) {
  const [teamName, setTeamName] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState("private"); // NEW: public/private toggle

  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [query, setQuery] = useState("");
  const [selectedUids, setSelectedUids] = useState(new Set());
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      setLoadError("");
      try {
        const ppl = await listProfiles();
        setProfiles(ppl);
      } catch (e) {
        console.error("Failed to load profiles:", e);
        setLoadError(
          "Could not load users. Make sure you are signed in and Firestore rules allow read on /profiles."
        );
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return profiles;
    return profiles.filter((p) => {
      const name = (p.displayName || "").toLowerCase();
      const email = (p.email || "").toLowerCase();
      return name.includes(q) || email.includes(q);
    });
  }, [profiles, query]);

  const toggle = (uid) => {
    setSelectedUids((prev) => {
      const next = new Set(prev);
      next.has(uid) ? next.delete(uid) : next.add(uid);
      return next;
    });
  };

  const handleCreate = async () => {
    setSubmitError("");
    const name = teamName.trim();
    if (!name) {
      setSubmitError("Please enter a team name.");
      return;
    }

    try {
      const teamId = await onCreate?.({
        name,
        description: description.trim(),
        isPublic: visibility === "public" // <- NEW
      });

      const uids = Array.from(selectedUids);
      if (teamId && uids.length && onAddMembers) {
        await onAddMembers({ teamId, memberUids: uids });
      }

      onClose?.();
    } catch (e) {
      console.error(e);
      setSubmitError(e?.message || "Failed to create team.");
    }
  };
  
  return (
    <div className="modal-backdrop">
      <div className="create-modal">
        <button className="modal-close" onClick={onClose} aria-label="Close">
          ✕
        </button>

        <h2 className="create-title">Create Team</h2>

        {submitError && <div className="form-error">{submitError}</div>}

        <label className="form-label">Team Name</label>
        <input
          className="form-input"
          placeholder="Enter Team Name"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
        />

        <label className="form-label">Description</label>
        <textarea
          className="form-textarea"
          placeholder="Enter Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <label className="form-label">Team Visibility</label>
        <div className="radio-row" style={{ marginBottom: "1rem" }}>
          <label style={{ marginRight: "1rem" }}>
            <input
              type="radio"
              name="visibility"
              value="public"
              checked={visibility === "public"}
              onChange={() => setVisibility("public")}
            />
            Public
          </label>
          <label>
            <input
              type="radio"
              name="visibility"
              value="private"
              checked={visibility === "private"}
              onChange={() => setVisibility("private")}
            />
            Private
          </label>
        </div>

        <label className="form-label">Add Members (from registered users)</label>
        <div className="search-row">
          <span className="search-icon">🔎</span>
          <input
            className="search-input"
            placeholder="Search by name or email..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="member-list" style={{ maxHeight: 240, overflowY: "auto" }}>
          {loading ? (
            <div className="tasks-empty">Loading users…</div>
          ) : loadError ? (
            <div className="form-error" style={{ marginTop: 8 }}>{loadError}</div>
          ) : filtered.length === 0 ? (
            <div className="tasks-empty">No users found.</div>
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
          Create Team
        </button>
      </div>
    </div>
  );
}
