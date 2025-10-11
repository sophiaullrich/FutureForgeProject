// TeamDetailsModal.jsx

import React, { useMemo, useState, useEffect } from "react";
import AddTaskModal from "../AddTaskModal";
import { listProfiles } from "./ProfileService";
import {
  IoCloseCircleOutline,
  IoCheckboxOutline,
  IoSquareOutline,
} from "react-icons/io5";

export default function TeamDetailsModal({ team, onClose, onDelete }) {
  // tasks
  const [showAddModal, setShowAddModal] = useState(false);
  const [tasks, setTasks] = useState(
    (team?.tasks || []).map((t) => ({ ...t, done: !!t.done }))
  );

  // members
  const [memberNames, setMemberNames] = useState([]); // [{ uid, name }]
  const [uidToName, setUidToName] = useState({}); // { uid: name }

  // update tasks if team changes
  useEffect(() => {
    setTasks((team?.tasks || []).map((t) => ({ ...t, done: !!t.done })));
  }, [team?.tasks]);

  // fetch all profiles and build uid name map, then map team members to names
  useEffect(() => {
    let isMounted = true;
    const fetchNames = async () => {
      try {
        const profiles = await listProfiles();
        const map = {};
        for (const p of profiles || []) {
          const name =
            p.name ||
            p.displayName ||
            [p.firstName, p.lastName].filter(Boolean).join(" ") ||
            "Unknown User";
          if (p.uid) map[p.uid] = name;
          if (!p.uid && p.id) map[p.id] = name;
        }
        const members = (team?.members || []).map((m) => {
          if (typeof m === "string") return { uid: m, name: map[m] || m };
          if (m?.uid)
            return { uid: m.uid, name: m.name || map[m.uid] || m.uid };
          return { uid: String(m), name: String(m) };
        });
        if (isMounted) {
          setUidToName(map);
          setMemberNames(members);
        }
      } catch {
        const members = (team?.members || []).map((m) =>
          typeof m === "string"
            ? { uid: m, name: m }
            : { uid: m?.uid || "", name: m?.name || "" }
        );
        if (isMounted) {
          setMemberNames(members);
        }
      }
    };
    fetchNames();
    return () => {
      isMounted = false;
    };
  }, [team?.members]);

  // add new task
  const addTask = (task) => {
    setTasks((prev) => [...prev, { ...task, done: false }]);
    setShowAddModal(false);
  };

  // toggle done/undone
  const toggleDone = (index) => {
    setTasks((prev) =>
      prev.map((t, i) => (i === index ? { ...t, done: !t.done } : t))
    );
  };

  // calculate progress
  const progressPct = useMemo(() => {
    if (!tasks.length) return 0;
    const done = tasks.filter((t) => t.done).length;
    return Math.round((done / tasks.length) * 100);
  }, [tasks]);

  // format due date
  const formatDue = (d) => {
    if (!d) return { mon: "—", day: "" };
    const date = new Date(d);
    if (isNaN(date)) return { mon: "—", day: "" };
    return {
      mon: date.toLocaleString("en-US", { month: "short" }).toUpperCase(),
      day: String(date.getDate()),
    };
  };

  // show name for an assignee value
  const displayAssignee = (val) => {
    if (!val) return "";
    if (typeof val === "object" && val !== null) {
      return val.name || uidToName[val.uid] || val.uid || "";
    }
    return uidToName[val] || String(val);
  };

  return (
    <div className="details-modal">
      <button className="modal-close" onClick={onClose} aria-label="close">
        <IoCloseCircleOutline size={45} />
      </button>

      {/* title and description */}
      <h2 className="details-title">{team?.name || "team"}</h2>
      {team?.description && <p className="details-sub">{team.description}</p>}

      {/* members and progress */}
      <div className="details-top">
        <div className="members-card">
          <div className="card-title">members</div>
          <div className="members-list-chip">
            {memberNames.length === 0 ? (
              <div style={{ opacity: 0.6, padding: 8 }}>no members</div>
            ) : (
              memberNames.map(({ uid, name }) => (
                <input
                  key={uid}
                  className="member-chip"
                  value={name}
                  readOnly
                />
              ))
            )}
          </div>
        </div>

        <div className="progress-card">
          <div className="card-title center">team progress</div>
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
            <div
              style={{
                textAlign: "center",
                marginTop: 6,
                color: "#2b2d63",
                fontWeight: 600,
              }}
            >
              {progressPct}%
            </div>
          </div>
        </div>
      </div>

      {/* team tasks */}
      <div className="tasks-section">
        <div className="card-title">team tasks</div>
        <div className="tasks-card">
          <div className="tasks-head">
            <span>Done?</span>
            <span>Task Name</span>
            <span>Due Date</span>
            <span>Assigned To</span>
          </div>
          <div className="tasks-body">
            {tasks.length === 0 ? (
              <div className="tasks-empty">No Tasks Yet</div>
            ) : (
              tasks.map((t, i) => {
                const d = formatDue(t.dueDate);
                return (
                  <div className="task-row" key={`${t.name}-${i}`}>
                    <span className="check-cell">
                      <button
                        className="check-btn"
                        type="button"
                        role="checkbox"
                        aria-checked={!!t.done}
                        onClick={() => toggleDone(i)}
                        onKeyDown={(e) => {
                          if (e.key === " " || e.key === "Enter") {
                            e.preventDefault();
                            toggleDone(i);
                          }
                        }}
                        title={t.done ? "Mark as not done" : "Mark as done"}
                      >
                        {t.done ? (
                          <IoCheckboxOutline size={28} />
                        ) : (
                          <IoSquareOutline size={28} />
                        )}
                      </button>
                    </span>
                    <span className="team-task-name">{t.name}</span>
                    <span className="due">
                      <strong className="due-mon">{d.mon}</strong>
                      <span className="due-day">{d.day}</span>
                    </span>
                    <span>{displayAssignee(t.assignedTo)}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* buttons */}
      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <button
          className="primary-outline-btn"
          onClick={() => setShowAddModal(true)}
        >
          Add New Task
        </button>
        {onDelete && (
          <button className="revoke-btn" onClick={onDelete}>
            Delete Team (Owner)
          </button>
        )}
      </div>

      {/* add task modal */}
      {showAddModal && (
        <AddTaskModal
          members={memberNames.map((m) => m.name)}
          onClose={() => setShowAddModal(false)}
          onAdd={addTask}
        />
      )}
    </div>
  );
}
