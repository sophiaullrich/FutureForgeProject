// src/teams-page/TeamDetailsModal.jsx
import React, { useMemo, useState } from "react";
import AddTaskModal from "../AddTaskModal";

export default function TeamDetailsModal({ team, onClose, onDelete }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [tasks, setTasks] = useState(
    (team?.tasks || []).map((t) => ({ ...t, done: !!t.done }))
  );

  const addTask = (task) => {
    setTasks((prev) => [...prev, { ...task, done: false }]);
    setShowAddModal(false);
  };

  const toggleDone = (index) => {
    setTasks((prev) =>
      prev.map((t, i) => (i === index ? { ...t, done: !t.done } : t))
    );
  };

  const progressPct = useMemo(() => {
    if (!tasks.length) return 0;
    const done = tasks.filter((t) => t.done).length;
    return Math.round((done / tasks.length) * 100);
  }, [tasks]);

  const formatDue = (d) => {
    if (!d) return { mon: "—", day: "" };
    const date = new Date(d);
    if (isNaN(date)) return { mon: "—", day: "" };
    return {
      mon: date.toLocaleString("en-US", { month: "short" }).toUpperCase(),
      day: String(date.getDate()),
    };
    };

  return (
    <div className="details-modal">
      <button className="modal-x" onClick={onClose} aria-label="Close">✕</button>

      {/* Header */}
      <h2 className="details-title">{team?.name || "Team"}</h2>
      {team?.description && <p className="details-sub">{team.description}</p>}

      {/* Top row: Members | Progress */}
      <div className="details-top">
        <div className="members-card">
          <div className="card-title">Members</div>
          <div className="members-list-chip">
            {(team?.members || []).map((m) => (
              <input key={m} className="member-chip" value={m} readOnly />
            ))}
          </div>
        </div>

        <div className="progress-card">
          <div className="card-title center">Team Progress</div>
          <div className="progress-bar-wrap">
            <div className="progress-bar-track">
              <div
                className="progress-bar-fill"
                style={{ width: `${progressPct}%` }}
                aria-valuenow={progressPct}
                aria-valuemin={0}
                aria-valuemax={100}
                role="progressbar"
              />
            </div>
            <div style={{ textAlign: "center", marginTop: 6, color: "#2b2d63", fontWeight: 600 }}>
              {progressPct}%
            </div>
          </div>
        </div>
      </div>

      {/* Tasks */}
      <div className="tasks-section">
        <div className="card-title">Team Tasks</div>

        <div className="tasks-card">
          <div className="tasks-head">
            <span>Done?</span>
            <span>Task Name</span>
            <span>Due Date</span>
            <span>Assigned To</span>
          </div>

          <div className="tasks-body">
            {tasks.length === 0 ? (
              <div className="tasks-empty">No tasks yet.</div>
            ) : (
              tasks.map((t, i) => {
                const d = formatDue(t.dueDate);
                return (
                  <div className="task-row" key={`${t.name}-${i}`}>
                    <span>
                      <input
                        type="checkbox"
                        checked={!!t.done}
                        onChange={() => toggleDone(i)}
                      />
                    </span>
                    <span className="task-name">{t.name}</span>
                    <span className="due">
                      <strong className="due-mon">{d.mon}</strong>
                      <span className="due-day">{d.day}</span>
                    </span>
                    <span>{t.assignedTo}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <button className="primary-outline-btn" onClick={() => setShowAddModal(true)}>
          Add New Task
        </button>
        {onDelete && (
          <button className="revoke-btn" onClick={onDelete}>
            Delete Team (owner)
          </button>
        )}
      </div>

      {showAddModal && (
        <AddTaskModal
          members={team?.members || []}
          onClose={() => setShowAddModal(false)}
          onAdd={addTask}
        />
      )}
    </div>
  );
}
