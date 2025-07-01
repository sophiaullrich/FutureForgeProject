import React from "react";

const InviteMembersModal = ({ onClose }) => {
  return (
    <div className="modal">
      <h2>Invite Members</h2>
      <input placeholder="Name" />
      <input placeholder="Email Address" />
      <input placeholder="Phone Number (optional)" />
      <input placeholder="LinkedIn Profile (optional)" />
      <button>Copy Invite Link</button>

      <h3>Pending Invites</h3>
      <div className="invite-list">
        <div>William Cao - Declined</div>
        <div>Willie Dong - Pending</div>
        <div>Marcos Figueiredo - Pending</div>
      </div>

      <button onClick={onClose}>Close</button>
    </div>
  );
};

export default InviteMembersModal;

