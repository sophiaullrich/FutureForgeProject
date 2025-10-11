import React, { useState, useEffect } from "react";
import "./TaskModal.css";

export default function TaskModal({
  onClose,
  onSubmit,
  teams,
  teamMembers,
  currentUser,
  defaultTeam,
}) {
  const [name, setName] = useState("");
  const [due, setDue] = useState("");
  const [team, setTeam] = useState(defaultTeam || "");
  const [member, setMember] = useState(currentUser?.email || "");
  const [description, setDescription] = useState("");
  const [taskType, setTaskType] = useState("private");

  useEffect(() => {
    if (currentUser && !member) setMember(currentUser.email);
  }, [currentUser, member]);

  const handleSubmit = () => {
    if (!name || !due) return alert("Please fill in task name and due date");
    if (taskType === "team" && !team) return alert("Please select a team");

    const taskPayload = {
      name,
      due,
      description: description || "",
      type: taskType,
      team: taskType === "team" ? team : "",
    };

    if (taskType === "team") {
      const selectedUser = teamMembers.find((m) => m.email === member);
      taskPayload.assignedUsers = [
        {
          uid: selectedUser?.uid || null,
          email: member,
          displayName: selectedUser?.displayName || member,
        },
      ];
    } else {
      taskPayload.assignedUsers = [
        {
          uid: currentUser?.uid || null,
          email: currentUser?.email || "",
          displayName: currentUser?.displayName || currentUser?.email || "",
        },
      ];
    }

    onSubmit(taskPayload);
  };

  return (
    <div className="task-popup-overlay">
      <div className="task-popup-form">
        <h2>Create Task</h2>

        {taskType === "team" ? (
          <div className="popup-fields-row">
            <div className="popup-field">
              <label>Task Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="popup-field">
              <label>Due Date</label>
              <input
                type="date"
                value={due}
                onChange={(e) => setDue(e.target.value)}
              />
            </div>
            <div className="popup-field">
              <label>Team</label>
              <select value={team} onChange={(e) => setTeam(e.target.value)}>
                {teams.map((t) => (
                  <option key={t.id} value={t.name}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="popup-field">
              <label>Assign To</label>
              <select
                value={member}
                onChange={(e) => setMember(e.target.value)}
              >
                {teamMembers.map((m) => (
                  <option key={m.email} value={m.email}>
                    {m.displayName}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ) : (
          <>
            <div className="popup-field">
              <label>Task Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="popup-field">
              <label>Due Date</label>
              <input
                type="date"
                value={due}
                onChange={(e) => setDue(e.target.value)}
              />
            </div>
          </>
        )}

        <div className="popup-field">
          <label>Description (max 500 characters)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value.slice(0, 500))}
          />
          <small>{description.length}/500</small>
        </div>

        <div className="popup-field radio-field">
          <label>Task Type</label>
          <div>
            <label>
              <input
                type="radio"
                value="private"
                checked={taskType === "private"}
                onChange={() => setTaskType("private")}
              />
              Private
            </label>
            <label style={{ marginLeft: "10px" }}>
              <input
                type="radio"
                value="team"
                checked={taskType === "team"}
                onChange={() => setTaskType("team")}
              />
              Team
            </label>
          </div>
        </div>

        <div className="popup-button-row">
          <button className="popup-submit-btn" onClick={handleSubmit}>
            Add Task
          </button>
          <button className="popup-btn-cancel" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
