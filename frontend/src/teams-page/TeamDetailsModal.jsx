// modal for viewing a team's details
import React, { useMemo, useState, useEffect } from "react";
import AddTaskModal from "../AddTaskModal";
import { listProfiles } from "./ProfileService"; 

export default function TeamDetailsModal({ team, onClose, onDelete }) {
  // tasks
  const [showAddModal, setShowAddModal] = useState(false);
  const [tasks, setTasks] = useState(
    (team?.tasks || []).map((t) => ({ ...t, done: !!t.done }))
  );

  
  const [memberNames, setMemberNames] = useState([]); // [{ uid, name }]
  const [uidToName, setUidToName] = useState({});     // { uid: name }

  // update tasks if team changes
  useEffect(() => {
    setTasks((team?.tasks || []).map((t) => ({ ...t, done: !!t.done })));
  }, [team?.tasks]);

  
  useEffect(() => {
    let isMounted = true;

    const fetchNames = async () => {
      try {
        const profiles = await listProfiles(); // expects [{ uid, name, ... }]
        const map = {};
        for (const p of profiles || []) {
          // be flexible with field names
          const name =
            p.name ||
            p.displayName ||
            [p.firstName, p.lastName].filter(Boolean).join(" ") ||
            "Unknown User";
          if (p.uid) map[p.uid] = name;
        }

        // build member name list in the same order as team.members
        const members = (team?.members || []).map((m) => {
          // support either raw UID or stored object { uid, name }
          if (typeof m === "string") {
            return { uid: m, name: map[m] || m };
          } else if (m?.uid) {
            return { uid: m.uid, name: m.name || map[m.uid] || m.uid };
          }
          return { uid: String(m), name: String(m) };
        });

        if (isMounted) {
          setUidToName(map);
          setMemberNames(members);
        }
      } catch (e) {
        // fallback: show raw values if profiles can’t be fetched
        const members = (team?.members || []).map((m) =>
          typeof m === "string" ? { uid: m, name: m } : { uid: m?.uid || "", name: m?.name || "" }
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

  // ✅ helper: show name for an assignee UID
  const displayAssignee = (val) => {
    if (!val) return "";
    // if tasks store objects { uid, name }
    if (typeof val === "object" && val !== null) {
      return val.name || uidToName[val.uid] || val.uid || "";
    }
    // string: if it matches a known UID, show name; else show as-is (maybe already a name)
    return uidToName[val] || String(val);
  };

  return (
    <div className="details-modal">
      <button className="modal-x" onClick={onClose} aria-label="close">
        ✕
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
                <input key={uid} className="member-chip" value={name} readOnly />
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
            <span>done?</span>
            <span>task name</span>
            <span>due date</span>
            <span>assigned to</span>
          </div>

          <div className="tasks-body">
            {tasks.length === 0 ? (
              <div className="tasks-empty">no tasks yet.</div>
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
          add new task
        </button>
        {onDelete && (
          <button className="revoke-btn" onClick={onDelete}>
            delete team (owner)
          </button>
        )}
      </div>

      {/* add task modal */}
      {showAddModal && (
        <AddTaskModal
          members={(team?.members || []).map((m) =>
            typeof m === "string" ? { uid: m, name: uidToName[m] || m } : m
          )}
          onClose={() => setShowAddModal(false)}
          onAdd={addTask}
        />
      )}
    </div>
  );
}
