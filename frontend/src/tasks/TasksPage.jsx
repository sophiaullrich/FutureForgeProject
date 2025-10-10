import React, { useState, useEffect } from "react";
import "./TasksPage.css";
import { IoCheckboxOutline, IoSquareOutline } from "react-icons/io5";
import { useOutletContext } from "react-router-dom";
import { observeMyTeams } from "../TeamsService";
import { listProfiles } from "../teams-page/ProfileService";
import TaskModal from "./TaskModal";
import TaskDetailModal from "./TaskDetailModal";
import { db } from "../Firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";

const API_URL =
  process.env.NODE_ENV === "development" ? "/api/tasks" : "/api/tasks";

export default function TasksPage() {
  const { currentUser } = useOutletContext();

  const [activeTab, setActiveTab] = useState("myTasks"); // myTasks | teamTasks
  const [tasks, setTasks] = useState([]);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [detailTask, setDetailTask] = useState(null);
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState("");
  const [profiles, setProfiles] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);

  // --- Load teams for the current user
  useEffect(() => {
    if (!currentUser) return;
    const unsub = observeMyTeams((tms) => {
      setTeams(tms || []);
      if ((tms || []).length > 0 && !selectedTeam) {
        setSelectedTeam(tms[0].name);
      }
    });
    return () => unsub?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  // --- Load all profiles (for assignment dropdowns)
  useEffect(() => {
    if (!currentUser) return;
    (async () => {
      const allProfiles = await listProfiles();
      setProfiles(allProfiles || []);
    })();
  }, [currentUser]);

  // --- Compute teamMembers for selected team + ensure currentUser present
  useEffect(() => {
    if (!currentUser) {
      setTeamMembers([]);
      return;
    }

    let members = [];
    if (selectedTeam && teams.length > 0 && profiles.length > 0) {
      const team = teams.find((t) => t.name === selectedTeam);
      if (team) {
        members = (team.members || [])
          .map((uid) => profiles.find((p) => p.uid === uid))
          .filter(Boolean)
          .map((p) => ({
            uid: p.uid,
            email: (p.email || "").toLowerCase(),
            displayName: p.displayName || p.email || p.uid,
          }));
      }
    }

    const currentUserObj = {
      uid: currentUser.uid,
      email: (currentUser.email || "").toLowerCase(),
      displayName: currentUser.displayName || currentUser.email,
    };
    if (!members.some((m) => m.uid === currentUser.uid)) {
      members.push(currentUserObj);
    }

    setTeamMembers(members);
  }, [profiles, teams, selectedTeam, currentUser]);

  // --- Live tasks feed; filter client-side for the current user/team
  useEffect(() => {
    if (!currentUser) return;

    const q = query(collection(db, "tasks"), orderBy("timestamp", "desc"));
    const unsub = onSnapshot(q, (snapshot) => {
      const all = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      const myEmail = (currentUser.email || "").toLowerCase();

      const visible = all.filter(
        (t) =>
          (t.assignedEmails || []).includes(myEmail) ||
          (t.type === "team" &&
            !!selectedTeam &&
            t.team === selectedTeam)
      );
      setTasks(visible);
    });

    return () => unsub();
  }, [currentUser, selectedTeam]);

  // --- Toggle done
  const handleTaskToggle = async (taskId, currentDone) => {
    if (!currentUser) return;
    try {
      const token = await currentUser.getIdToken();
      await fetch(`${API_URL}/${taskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ done: !currentDone }),
      });
    } catch (err) {
      console.error("Error updating task:", err);
    }
  };

  // --- Create task
  const handleAddTask = async (taskData) => {
    if (!currentUser) return;

    // keep ISO in the DB; format only for display
    const dueISO = taskData.due ? new Date(taskData.due).toISOString() : null;
    if (!taskData.name || !dueISO) {
      alert("Task name and due date are required");
      return;
    }

    const payload = {
      name: taskData.name.trim(),
      due: dueISO, // store ISO
      description: taskData.description ?? "",
      team: taskData.type === "team" ? taskData.team || selectedTeam : "",
      assignedUsers: [],
      type: taskData.type, // "private" | "team"
    };

    if (taskData.type === "private") {
      payload.assignedUsers = [
        {
          uid: currentUser.uid,
          email: (currentUser.email || "").toLowerCase(),
          displayName: currentUser.displayName || currentUser.email,
        },
      ];
    } else if (taskData.type === "team") {
      // single assignee from dropdown; extend to multi if needed
      const selected = teamMembers.find(
        (m) => m.email === taskData.assignedUsers?.[0]?.email
      );
      if (selected) {
        payload.assignedUsers = [
          {
            uid: selected.uid,
            email: (selected.email || "").toLowerCase(),
            displayName: selected.displayName || selected.email,
          },
        ];
      }
    }

    try {
      const token = await currentUser.getIdToken();
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || `HTTP ${res.status}`);
      }
      setShowTaskModal(false);
      // no manual refresh needed — onSnapshot will pick up the new doc
    } catch (error) {
      console.error("Error adding task:", error);
      alert("Failed to create task: " + error.message);
    }
  };

  // --- Delete task
  const handleDeleteTask = async (taskId) => {
    if (!currentUser) return;
    try {
      const token = await currentUser.getIdToken();
      const res = await fetch(`${API_URL}/${taskId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete task");
      // optimistic UI; onSnapshot will also remove it
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    } catch (err) {
      console.error("Error deleting task:", err);
    }
  };

  // --- Display formatter: accepts ISO or your older "DD MON YYYY"
  const formatDate = (val) => {
    if (!val) return "—";
    const s = String(val);
    // if it already looks like "20 OCT 2025", just show it
    if (/[A-Z]{3}/.test(s) && !s.includes("T")) return s;
    const d = new Date(s);
    if (Number.isNaN(d.getTime())) return s;
    return d
      .toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
      .toUpperCase();
  };

  const filteredTasks =
    activeTab === "myTasks"
      ? tasks.filter((task) =>
          (task.assignedEmails || []).includes(
            (currentUser?.email || "").toLowerCase()
          )
        )
      : tasks.filter((task) => task.team === selectedTeam);

  return (
    <div className="tasks-page">
      <div className="tabs-container">
        <button
          className={`tab ${activeTab === "myTasks" ? "active" : ""}`}
          onClick={() => setActiveTab("myTasks")}
        >
          My Tasks
        </button>
        <button
          className={`tab ${activeTab === "teamTasks" ? "active" : ""}`}
          onClick={() => setActiveTab("teamTasks")}
        >
          Team Tasks
        </button>
      </div>

      <div className="tasks-container">
        {activeTab === "teamTasks" && (
          <div style={{ margin: "10px 20px" }}>
            <label>Select Team: </label>
            <select value={selectedTeam} onChange={(e) => setSelectedTeam(e.target.value)}>
              {teams.map((team) => (
                <option key={team.id} value={team.name}>
                  {team.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className={`tasks-table ${activeTab === "teamTasks" ? "team-tasks" : "my-tasks"}`}>
          <div className="table-header">
            <div className="header-cell">Done?</div>
            <div className="header-cell">Task Name</div>
            <div className="header-cell">Due Date</div>
            {activeTab === "teamTasks" && <div className="header-cell">Assigned To</div>}
            {activeTab === "teamTasks" && <div className="header-cell">Team</div>}
            <div className="header-cell">Actions</div>
          </div>

          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className="table-row"
              onClick={() => setDetailTask(task)}
            >
              <div
                className="table-cell checkbox-cell"
                onClick={(e) => {
                  e.stopPropagation(); // don't open detail modal
                  handleTaskToggle(task.id, task.done);
                }}
                role="button"
                aria-label={task.done ? "Mark as not done" : "Mark as done"}
                title={task.done ? "Mark as not done" : "Mark as done"}
              >
                {task.done ? <IoCheckboxOutline size={33} /> : <IoSquareOutline size={33} />}
              </div>

              <div className="table-cell task-name-cell">{task.name}</div>
              <div className="table-cell due-date-cell">{formatDate(task.due)}</div>

              {activeTab === "teamTasks" && (
                <div className="table-cell team-cell">
                  {(task.assignedUsers || []).map((u) => u.displayName).join(", ")}
                </div>
              )}
              {activeTab === "teamTasks" && (
                <div className="table-cell team-cell">{task.team}</div>
              )}

              <div
                className="table-cell actions-cell"
                onClick={(e) => e.stopPropagation()}
              >
                <button className="delete-btn" onClick={() => handleDeleteTask(task.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        className="add-task-btn"
        onClick={() =>
          currentUser ? setShowTaskModal(true) : alert("Please login to add a task")
        }
      >
        Add New Task
      </button>

      {showTaskModal && (
        <TaskModal
          onClose={() => setShowTaskModal(false)}
          onSubmit={handleAddTask}
          teams={teams}
          teamMembers={teamMembers}
          currentUser={currentUser}
          defaultTeam={selectedTeam}
        />
      )}

      {detailTask && (
        <TaskDetailModal
          task={detailTask}
          onClose={() => setDetailTask(null)}
        />
      )}
    </div>
  );
}
