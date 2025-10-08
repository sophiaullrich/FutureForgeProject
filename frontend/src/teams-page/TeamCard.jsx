// TeamCard.jsx
import React from "react";

export default function TeamCard({ team, onClick }) {
  // render simple team card
  return (
    <div onClick={onClick} style={cardStyle}>
      <h3>{team.name}</h3>
    </div>
  );
}

// basic card styling
const cardStyle = {
  backgroundColor: "#fff",
  padding: "1rem",
  borderRadius: "10px",
  cursor: "pointer",
  boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
  color: "#000",
};
