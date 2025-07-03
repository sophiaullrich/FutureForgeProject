import React from "react";

const JoinTeamModal = ({ onClose }) => {
  return (
    <div className="modal">
      <h2>Join a Team</h2>
      <input placeholder="Search by name or keyword..." />
      <div className="filters">
        <select><option>Career Focus</option></select>
        <select><option>Goal Type</option></select>
        <select><option>Work Type</option></select>
        <select><option>Team Size</option></select>
      </div>
      <div className="team-results">
        <div>Code Commanders - 4 Members</div>
        <div>Job Seeker Tips - 20 Members</div>
        <div>Cyber Unlocked - 3 Members</div>
        <div>Team 2048 - 12 Members</div>
      </div>
      <button onClick={onClose}>Close</button>
    </div>
  );
};

export default JoinTeamModal;