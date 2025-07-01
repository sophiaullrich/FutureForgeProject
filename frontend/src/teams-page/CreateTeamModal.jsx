import React from "react";

const CreateTeamModal = ({ onClose }) => {
  return (
    <div className="modal">
      <h2>Create Team</h2>
      <input placeholder="Enter Team Name" />
      <textarea placeholder="Enter Description" />
      <input placeholder="Search for Members..." />
      <div className="members-list">
        <div>Willie Dong</div>
        <div>Marcos Figueiredo</div>
        <div>William Cao</div>
      </div>
      <button>Create Team</button>
      <button onClick={onClose}>Close</button>
    </div>
  );
};

export default CreateTeamModal;

