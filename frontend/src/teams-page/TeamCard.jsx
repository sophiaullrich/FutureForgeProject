// TeamCard.jsx
import React from "react";
import "./TeamsPage.css";
import { IoChevronForward } from "react-icons/io5";

export default function TeamCard({ team, onClick }) {
  return (
    <div className="team-card" onClick={onClick}>
      <h3 className="team-name">{team.name}</h3>
      <IoChevronForward size={20} className="team-forward-icon" />
    </div>
  );
}
