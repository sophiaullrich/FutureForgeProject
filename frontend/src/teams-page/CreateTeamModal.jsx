import React, { useMemo, useState } from "react";

export default function CreateTeamModal({ onClose, onCreate }) {
  const [teamName, setTeamName] = useState("");
  const [description, setDescription] = useState("");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState([]);
  const [error, setError] = useState("");

  const allMembers = ["Willie Dong", "Marcos Figueiredo", "William Cao"];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return !q ? allMembers : allMembers.filter(n => n.toLowerCase().includes(q));
  }, [query]);

  const toggle = (name) =>
    setSelected((prev) =>
      prev.includes(name) ? prev.filter((m) => m !== name) : [...prev, name]
    );

  const handleCreate = () => {
    if (!teamName.trim()) return setError("Please enter a team name.");
    onCreate?.({ name: teamName.trim(), description: description.trim(), members: selected });
  };

  return (
    <div className="modal-backdrop">
      <div className="create-modal">
        <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>

        <h2 className="create-title">Create Team</h2>

        {error && <div className="form-error">{error}</div>}

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

        <label className="form-label">Add Members</label>
        <div className="search-row">
          <span className="search-icon">🔎</span>
          <input
            className="search-input"
            placeholder="Search for Members..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="member-list">
          {filtered.map((name) => {
            const active = selected.includes(name);
            return (
              <button
                type="button"
                key={name}
                className={`member-row ${active ? "active" : ""}`}
                onClick={() => toggle(name)}
              >
                <span className="avatar-dot" />
                <span className="member-name">{name}</span>
              </button>
            );
          })}
        </div>

        <button className="primary-cta" onClick={handleCreate}>Create Team</button>
      </div>
    </div>
  );
}
