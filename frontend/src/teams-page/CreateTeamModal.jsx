// src/teams-page/CreateTeamModal.jsx
import React, { useState } from "react";

export default function CreateTeamModal({ onClose }) {
  const [teamName, setTeamName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);

  const dummyMembers = ["Willie Dong", "Marcos Figueiredo", "William Cao"];

  const toggleMember = (name) => {
    setSelectedMembers((prev) =>
      prev.includes(name)
        ? prev.filter((m) => m !== name)
        : [...prev, name]
    );
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h2>Create Team</h2>

        <label>Team Name</label>
        <input
          type="text"
          placeholder="Enter Team Name"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
        />

        <label>Description</label>
        <textarea
          placeholder="Enter Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <label>Add Members</label>
        <ul>
          {dummyMembers.map((name) => (
            <li
              key={name}
              onClick={() => toggleMember(name)}
              style={{
                cursor: "pointer",
                backgroundColor: selectedMembers.includes(name)
                  ? "#d1e7dd"
                  : "#fff",
                padding: "8px",
                border: "1px solid #ccc",
                marginBottom: "4px",
                borderRadius: "5px",
              }}
            >
              {name}
            </li>
          ))}
        </ul>

        <button onClick={onClose}>Create Team</button>
      </div>
    </div>
  );
}
