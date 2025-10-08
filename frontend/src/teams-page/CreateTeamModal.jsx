// CreateTeamModal.jsx
import React, { useEffect, useMemo, useState } from "react";
import { listProfiles } from "./ProfileService";

export default function CreateTeamModal({ onClose, onCreate, onAddMembers }) {
  // form fields
  const [teamName, setTeamName] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState("private"); // "public" or "private"

  // user profiles
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  // search & selection
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
        setLoadError("Could not load users. check signin and firestore rules.");
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
      // Prepare payload with visibility and isPublic
      const payload = {
        name,
        description: description.trim(),
        visibility,
        isPublic: visibility === "public",
      };
      const teamId = await onCreate?.(payload);
      const uids = Array.from(selectedUids);
      if (teamId && uids.length && onAddMembers) {
        await onAddMembers({ teamId, memberUids: uids });
      }
      onClose?.();
    } catch (e) {
      setSubmitError(e?.message || "Failed to create team.");
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="create-modal">
        <button className="modal-close" onClick={onClose} aria-label="close">
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
            />{" "}
            Public (anyone can join)
          </label>
          <label>
            <input
              type="radio"
              name="visibility"
              value="private"
              checked={visibility === "private"}
              onChange={() => setVisibility("private")}
            />{" "}
            Private (invite only)
          </label>
        </div>

        <label className="form-label">Add Members (From Registered Users)</label>
        <div className="search-row">
          <span className="search-icon">🔎</span>
          <input
            className="search-input"
            placeholder="Search By Name Or Email..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="member-list" style={{ maxHeight: 240, overflowY: "auto" }}>
          {loading ? (
            <div className="tasks-empty">loading users…</div>
          ) : loadError ? (
            <div className="form-error" style={{ marginTop: 8 }}>
              {loadError}
            </div>
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
                  <span className="member-name">
                    {p.displayName || p.email || uid}
                  </span>
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
