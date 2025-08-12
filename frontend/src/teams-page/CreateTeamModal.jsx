// src/teams-page/CreateTeamModal.jsx
import React, { useState } from "react";

export default function CreateTeamModal({ onClose, onCreate }) {
  const [teamName, setTeamName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [error, setError] = useState("");

  const dummyMembers = ["Willie Dong", "Marcos Figueiredo", "William Cao"];

  const toggleMember = (name) => {
    setSelectedMembers((prev) =>
      prev.includes(name) ? prev.filter((m) => m !== name) : [...prev, name]
    );
  };

  const handleCreateTeam = () => {
    if (!teamName.trim()) {
      setError("Please enter a team name.");
      return;
    }

    const newTeam = {
      name: teamName,
      description,
      members: selectedMembers,
    };

    onCreate(newTeam);
  };

  return (
    <div className="modal-backdrop" style={backdropStyle}>
      <div className="modal-overlay" style={overlayStyle}>
        <div className="create-modal" style={modalStyle}>
          <button className="close-button" onClick={onClose} style={closeBtn}>✕</button>
          <h2 style={titleStyle}>Create Team</h2>

          {error && <div style={errorStyle}>{error}</div>}

          <input
            type="text"
            placeholder="Team Name"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            style={inputStyle}
          />

          <textarea
            placeholder="Team Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={textareaStyle}
          />

          <label style={labelStyle}>Select Members</label>
          <ul style={memberListStyle}>
            {dummyMembers.map((name) => (
              <li
                key={name}
                onClick={() => toggleMember(name)}
                style={{
                  ...memberItemStyle,
                  backgroundColor: selectedMembers.includes(name) ? "#d1e7dd" : "#fff",
                }}
              >
                {name}
              </li>
            ))}
          </ul>

          <div style={actionBtnRow}>
            <button onClick={handleCreateTeam} style={greenBtn}>Create</button>
            <button onClick={onClose} style={redBtn}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Styles
const backdropStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0, 0, 0, 0.6)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
};

const overlayStyle = {
  background: "#f8f6ef",
  padding: "2rem",
  borderRadius: "10px",
  width: "90%",
  maxWidth: "600px",
  boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
  position: "relative",
};

const modalStyle = {
  width: "100%",
};

const titleStyle = {
  marginBottom: "1rem",
};

const inputStyle = {
  width: "100%",
  padding: "0.6rem",
  borderRadius: "5px",
  border: "1px solid #ccc",
  marginBottom: "0.75rem",
};

const textareaStyle = {
  ...inputStyle,
  height: "100px",
  resize: "none",
};

const labelStyle = {
  fontWeight: "bold",
  marginTop: "1rem",
};

const memberListStyle = {
  listStyle: "none",
  padding: 0,
  marginBottom: "1rem",
};

const memberItemStyle = {
  cursor: "pointer",
  padding: "0.5rem",
  border: "1px solid #ccc",
  borderRadius: "5px",
  marginBottom: "4px",
};

const errorStyle = {
  color: "#c53030",
  marginBottom: "0.5rem",
};

const actionBtnRow = {
  display: "flex",
  justifyContent: "space-between",
};

const greenBtn = {
  backgroundColor: "#2f855a",
  color: "#fff",
  border: "none",
  padding: "0.5rem 1rem",
  borderRadius: "6px",
};

const redBtn = {
  backgroundColor: "#c53030",
  color: "#fff",
  border: "none",
  padding: "0.5rem 1rem",
  borderRadius: "6px",
};

const closeBtn = {
  position: "absolute",
  top: "1rem",
  right: "1rem",
  background: "none",
  border: "none",
  fontSize: "1.2rem",
  cursor: "pointer",
};
