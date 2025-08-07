// src/teams-page/TeamDetailsModal.jsx
import React from "react";

export default function TeamDetailsModal({ team, onClose }) {
  return (
    <div style={{
      background: "#fef6e4",
      border: "2px solid #a3bffa",
      borderRadius: "10px",
      padding: "2rem",
      width: "90%",
      maxWidth: "700px",
      position: "relative",
      boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
    }}>
      <button
        onClick={onClose}
        style={{
          position: "absolute",
          top: "1rem",
          right: "1rem",
          fontSize: "20px",
          background: "none",
          border: "none",
          cursor: "pointer"
        }}
      >
        ×
      </button>

      <h2>{team.name}</h2>
      <p>{team.description}</p>

      <h3>Members</h3>
      <ul>
        {team.members.map((member, idx) => (
          <li key={idx}>{member}</li>
        ))}
      </ul>

      <h3>Team Tasks</h3>
      <table style={{ width: "100%", marginTop: "1rem", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>Done?</th>
            <th>Task Name</th>
            <th>Due Date</th>
            <th>Assigned To</th>
          </tr>
        </thead>
        <tbody>
          {team.tasks?.map((task, idx) => (
            <tr key={idx}>
              <td><input type="checkbox" /></td>
              <td>{task.name}</td>
              <td>{task.dueDate}</td>
              <td>{task.assignedTo}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <button style={{
        marginTop: "1rem",
        padding: "0.5rem 1rem",
        backgroundColor: "#dbeafe",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer",
        fontWeight: "bold",
      }}>
        Add New Task
      </button>
    </div>
  );
}
