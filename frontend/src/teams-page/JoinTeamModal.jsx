// src/teams-page/JoinTeamModal.jsx
import React, { useState } from "react";

export default function JoinTeamModal({ onClose, onJoinTeam }) {
  const [search, setSearch] = useState("");
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [filters, setFilters] = useState({
    career: "",
    goal: "",
    workType: "",
    size: "",
  });

  const dummyTeams = [
    { name: "Code Commanders", focus: "Technology", goal: "CV Building", type: "Remote", size: 4,  description: "Mastering coding skills through collaboration." },
    { name: "Job Seeker Tips",  focus: "HR",         goal: "Job Applications", type: "Hybrid", size: 20, description: "Helping job seekers prepare for the workforce." },
    { name: "Cyber Unlocked",   focus: "Technology", goal: "Interview Prep",   type: "Remote", size: 3,  description: "Exploring cybersecurity strategies and skills." },
    { name: "Team 2048",        focus: "Technology", goal: "Portfolio Curation", type: "Remote", size: 12, description: "Working together to achieve personal dev goals." },
  ];

  const handleChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });

  const filtered = dummyTeams.filter((t) => {
    const s = search.trim().toLowerCase();
    const matchesSearch = !s || t.name.toLowerCase().includes(s);
    const matchesCareer = !filters.career || t.focus === filters.career;
    const matchesGoal = !filters.goal || t.goal === filters.goal;
    const matchesWorkType = !filters.workType || t.type === filters.workType;
    const matchesSize =
      !filters.size ||
      (filters.size === "1–3 Members" && t.size >= 1 && t.size <= 3) ||
      (filters.size === "4–6 Members" && t.size >= 4 && t.size <= 6) ||
      (filters.size === "7+ Members" && t.size >= 7);

    return matchesSearch && matchesCareer && matchesGoal && matchesWorkType && matchesSize;
  });

  return (
    <div className="modal-backdrop">
      <div className="join-modal">
        <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>

        <h2 className="join-title">Join a Team</h2>

        {/* Search */}
        <div className="search-row">
          <span className="search-icon">🔎</span>
          <input
            type="text"
            className="search-input"
            placeholder="Search by career goal, skill, or team name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Filters */}
        <div className="filter-row">
          <select name="career" value={filters.career} onChange={handleChange} className="filter-select">
            <option value="">Career Focus</option>
            <option>Marketing</option>
            <option>Technology</option>
            <option>HR</option>
            <option>Finance</option>
            <option>Engineering</option>
          </select>

          <select name="goal" value={filters.goal} onChange={handleChange} className="filter-select">
            <option value="">Goal Type</option>
            <option>CV Building</option>
            <option>Interview Prep</option>
            <option>Portfolio Curation</option>
            <option>Job Applications</option>
            <option>Graduate Programs</option>
          </select>

          <select name="workType" value={filters.workType} onChange={handleChange} className="filter-select">
            <option value="">Work Type</option>
            <option>Remote</option>
            <option>In-Person</option>
            <option>Hybrid</option>
          </select>

          <select name="size" value={filters.size} onChange={handleChange} className="filter-select">
            <option value="">Team Size</option>
            <option>1–3 Members</option>
            <option>4–6 Members</option>
            <option>7+ Members</option>
          </select>
        </div>

        {/* List / Detail */}
        <div className="team-list">
          {selectedTeam ? (
            <div className="team-detail">
              <button className="detail-close" onClick={() => setSelectedTeam(null)} aria-label="Back">✕</button>
              <h3 className="detail-title">{selectedTeam.name}</h3>
              <p className="detail-desc">{selectedTeam.description}</p>
              <div className="pill-row">
                <span className="pill">{selectedTeam.focus}</span>
                <span className="pill">{selectedTeam.type}</span>
                <span className="pill">{selectedTeam.size} Members</span>
              </div>
              <button
                className="join-btn"
                onClick={() => {
                  onJoinTeam?.(selectedTeam);
                  onClose?.();
                }}
              >
                Join Team
              </button>
            </div>
          ) : (
            filtered.map((team) => (
              <button
                key={team.name}
                className="team-card"
                onClick={() => setSelectedTeam(team)}
              >
                <div className="team-card-info">
                  <div className="team-name">{team.name}</div>
                  <div className="pill-row">
                    <span className="pill">{team.focus}</span>
                    <span className="pill">{team.type}</span>
                    <span className="pill">{team.size} Members</span>
                  </div>
                </div>
                <span className="team-card-arrow">›</span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
