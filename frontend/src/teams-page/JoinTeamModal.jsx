// src/teams-page/JoinTeamModal.jsx
import React, { useState } from "react";

export default function JoinTeamModal({ onClose, onJoinTeam }) {
  const [search, setSearch] = useState("");
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [filters, setFilters] = useState({ career: "", goal: "", workType: "", size: "" });

  const dummyTeams = [
    { name: "Code Commanders", focus: "Technology", goal: "CV Building", type: "Remote", size: 4, description: "Mastering coding skills through collaboration." },
    { name: "Job Seeker Tips", focus: "HR", goal: "Job Applications", type: "Hybrid", size: 20, description: "Helping job seekers prepare for the workforce." },
    { name: "Cyber Unlocked", focus: "Technology", goal: "Interview Prep", type: "Remote", size: 3, description: "Exploring cybersecurity strategies and skills." },
    { name: "Team 2048", focus: "Technology", goal: "Portfolio Curation", type: "Remote", size: 12, description: "Working together to achieve personal dev goals." },
  ];

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const filtered = dummyTeams.filter((team) => {
    const matchesSearch = team.name.toLowerCase().includes(search.toLowerCase());
    const matchesCareer = !filters.career || team.focus === filters.career;
    const matchesGoal = !filters.goal || team.goal === filters.goal;
    const matchesWorkType = !filters.workType || team.type === filters.workType;
    const matchesSize = !filters.size ||
      (filters.size === "1–3 Members" && team.size >= 1 && team.size <= 3) ||
      (filters.size === "4–6 Members" && team.size >= 4 && team.size <= 6) ||
      (filters.size === "7+ Members" && team.size >= 7);
    return matchesSearch && matchesCareer && matchesGoal && matchesWorkType && matchesSize;
  });

  return (
    <div className="modal-backdrop" style={backdropStyle}>
      <div className="modal-overlay" style={overlayStyle}>
        <button onClick={onClose} style={closeBtn}>✕</button>
        <h2 style={titleStyle}>Join a Team</h2>

        <input
          type="text"
          placeholder="Search by career goal, skill, or team name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={inputStyle}
        />

        <div style={dropdownContainer}>
          <select name="career" value={filters.career} onChange={handleChange} style={dropdown}>
            <option value="">Career Focus</option>
            <option>Marketing</option>
            <option>Technology</option>
            <option>HR</option>
            <option>Finance</option>
            <option>Engineering</option>
          </select>

          <select name="goal" value={filters.goal} onChange={handleChange} style={dropdown}>
            <option value="">Goal Type</option>
            <option>CV Building</option>
            <option>Interview Prep</option>
            <option>Portfolio Curation</option>
            <option>Job Applications</option>
            <option>Graduate Programs</option>
          </select>

          <select name="workType" value={filters.workType} onChange={handleChange} style={dropdown}>
            <option value="">Work Type</option>
            <option>Remote</option>
            <option>In-Person</option>
            <option>Hybrid</option>
          </select>

          <select name="size" value={filters.size} onChange={handleChange} style={dropdown}>
            <option value="">Team Size</option>
            <option>1–3 Members</option>
            <option>4–6 Members</option>
            <option>7+ Members</option>
          </select>
        </div>

        <div style={{ marginTop: "1rem" }}>
          {selectedTeam ? (
            <div style={teamDetailBox}>
              <button onClick={() => setSelectedTeam(null)} style={closeBtnSmall}>✕</button>
              <h3>{selectedTeam.name}</h3>
              <p>{selectedTeam.description}</p>
              <div style={pillRow}>
                <span style={pill}>{selectedTeam.focus}</span>
                <span style={pill}>{selectedTeam.type}</span>
                <span style={pill}>{selectedTeam.size} Members</span>
              </div>
              <button style={joinBtn} onClick={() => { onJoinTeam(selectedTeam); onClose(); }}>Join Team</button>
            </div>
          ) : (
            filtered.map((team, index) => (
              <div key={index} style={teamCard} onClick={() => setSelectedTeam(team)}>
                <div>
                  <strong>{team.name}</strong>
                  <div style={pillRow}>
                    <span style={pill}>{team.focus}</span>
                    <span style={pill}>{team.type}</span>
                    <span style={pill}>{team.size} Members</span>
                  </div>
                </div>
                <span style={arrowBtn}>➤</span>
              </div>
            ))
          )}
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
  maxWidth: "850px",
  boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
  position: "relative",
};

const titleStyle = {
  fontSize: "1.8rem",
  fontWeight: "700",
  marginBottom: "1rem",
  color: "#2b2d63",
  textAlign: "left",
};


const inputStyle = {
  width: "100%",
  padding: "0.6rem",
  borderRadius: "6px",
  border: "1px solid #ccc",
  marginBottom: "1rem",
};

const dropdownContainer = {
  display: "grid",
  gridTemplateColumns: "repeat(4, 1fr)",
  gap: "0.5rem",
  marginBottom: "1rem",
};

const dropdown = {
  padding: "0.4rem",
  borderRadius: "4px",
  border: "1px solid #ccc",
  fontSize: "0.9rem",
};

const teamCard = {
  border: "1px solid #2b2d63",
  borderRadius: "8px",
  padding: "1rem",
  marginBottom: "1rem",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  cursor: "pointer",
  backgroundColor: "#fff",
};

const teamDetailBox = {
  border: "1px solid #2b2d63",
  padding: "1.5rem",
  borderRadius: "8px",
  backgroundColor: "#fff",
  position: "relative",
};

const pill = {
  backgroundColor: "#2b2d63",
  color: "#fff",
  borderRadius: "5px",
  padding: "0.2rem 0.5rem",
  marginRight: "0.5rem",
  fontSize: "0.8rem",
};

const pillRow = {
  marginTop: "0.5rem",
  display: "flex",
  flexWrap: "wrap",
  gap: "0.4rem",
};

const joinBtn = {
  marginTop: "1rem",
  backgroundColor: "#2b2d63",
  color: "#fff",
  padding: "0.6rem 1.2rem",
  border: "none",
  borderRadius: "6px",
  fontWeight: "bold",
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

const closeBtnSmall = {
  position: "absolute",
  top: "0.5rem",
  right: "0.5rem",
  background: "none",
  border: "none",
  fontSize: "1rem",
  cursor: "pointer",
};

const arrowBtn = {
  fontSize: "1.5rem",
  color: "#2b2d63",
};
