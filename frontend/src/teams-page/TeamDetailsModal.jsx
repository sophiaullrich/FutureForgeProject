// src/teams-page/TeamDetailsModal.jsx
import React, { useState } from "react";
import AddTaskModal from "../AddTaskModal"; // ✅ make sure path is correct

export default function TeamDetailsModal({ team, onClose }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [tasks, setTasks] = useState(team.tasks || []);

  if (!team) return null;

  const handleAddTask = (task) => {
    const updatedTask = { ...task, team: team.name };
    setTasks((prev) => [...prev, updatedTask]);
    setShowAddModal(false);
  };

  return (
    <div style={modalStyle}>
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

      <h2>{team.name || "Unnamed Team"}</h2>
      <p>{team.description || "No description provided."}</p>

      <h3>Members</h3>
      <ul>
        {team.members?.map((member, idx) => (
          <li key={idx}>{member}</li>
        )) || <li>No members listed.</li>}
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
          {tasks.map((task, idx) => (
            <tr key={idx}>
              <td><input type="checkbox" /></td>
              <td>{task.name}</td>
              <td>{task.dueDate}</td>
              <td>{task.assignedTo}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <button
        onClick={() => setShowAddModal(true)}
        style={addTaskBtnStyle}
      >
        Add New Task
      </button>

      {/* ✅ Show AddTaskModal when button is clicked */}
      {showAddModal && (
        <AddTaskModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddTask}
        />
      )}
    </div>
  );
}

const modalStyle = {
  background: "#fef6e4",
  border: "2px solid #a3bffa",
  borderRadius: "10px",
  padding: "2rem",
  width: "90%",
  maxWidth: "700px",
  position: "relative",
  boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
};

const addTaskBtnStyle = {
  marginTop: "1rem",
  padding: "0.5rem 1rem",
  backgroundColor: "#dbeafe",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
  fontWeight: "bold",
};
