import React, { useState, useEffect } from "react";
import "./TasksPage.css";
import { IoCheckboxOutline, IoSquareOutline } from "react-icons/io5";
import { useOutletContext } from "react-router-dom";
import { observeMyTeams } from "../TeamsService";
import { listProfiles } from "../teams-page/ProfileService";
import TaskModal from "./TaskModal";
import TaskDetailModal from "./TaskDetailModal";
import { db } from "../Firebase";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";

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
  }, [currentUser]);

  // --- Load all profiles
  useEffect(() => {
    if (!currentUser) return;
    (async () => {
      const allProfiles = await listProfiles();
      setProfiles(allProfiles || []);
    })();
  }, [currentUser]);

  // --- Compute teamMembers
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

  // --- Live Firestore listener
  useEffect(() => {
    if (!currentUser) return;

    const q = query(collection(db, "tasks"), orderBy("timestamp", "desc"));
    const unsub = onSnapshot(q, (snapshot) => {
      const all = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      const myEmail = (currentUser.email || "").toLowerCase();

      const visible = all.filter(
        (t) =>
          (t.assignedEmails || []).includes(myEmail) ||
          (t.type === "team" && !!selectedTeam && t.team === selectedTeam)
      );
      setTasks(visible);
    });

    return () => unsub();
  }, [currentUser, selectedTeam]);

  // --- ✅ Toggle task completion (Firestore direct)
  const handleTaskToggle = async (taskId, currentDone) => {
    console.log("Toggling task:", taskId);
    try {
      await updateDoc(doc(db, "tasks", taskId), {
        done: !currentDone,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.error("Error updating task:", err);
    }
  };

  // --- Create task (via API)
  const handleAddTask = async (taskData) => {
    if (!currentUser) return;

    const dueISO = taskData.due ? new Date(taskData.due).toISOString() : null;
    if (!taskData.name || !dueISO) {
      alert("Task name and due date are required");
      return;
    }

    const payload = {
      name: taskData.name.trim(),
      due: dueISO,
      description: taskData.description ?? "",
      team: taskData.type === "team" ? taskData.team || selectedTeam : "",
      assignedUsers: [],
      type: taskData.type,
      assignedEmails: [],
      done: false,
      timestamp: new Date().toISOString(),
    };

    if (taskData.type === "private") {
      const me = {
        uid: currentUser.uid,
        email: (currentUser.email || "").toLowerCase(),
        displayName: currentUser.displayName || currentUser.email,
      };
      payload.assignedUsers = [me];
      payload.assignedEmails = [me.email];
    } else if (taskData.type === "team") {
      const emailFromModal = (taskData.assignedUsers?.[0]?.email || "").toLowerCase();
      const selected =
        teamMembers.find((m) => m.email === emailFromModal) || null;

      const userObj = selected || {
        uid: taskData.assignedUsers?.[0]?.uid || null,
        email: emailFromModal,
        displayName:
          taskData.assignedUsers?.[0]?.displayName || emailFromModal || "",
      };

      payload.assignedUsers = [userObj];
      payload.assignedEmails = [userObj.email];
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
    } catch (error) {
      console.error("Error adding task:", error);
      alert("Failed to create task: " + error.message);
    }
  };

  // --- ✅ Delete task (Firestore direct)
  const handleDeleteTask = async (taskId) => {
    console.log("Deleting task:", taskId);
    try {
      await deleteDoc(doc(db, "tasks", taskId));
    } catch (err) {
      console.error("Error deleting task:", err);
    }
  };
  const dueParts = (date) => {
    if (!date) return { mon: "—", day: "" };
    const months = [
      "JAN",
      "FEB",
      "MAR",
      "APR",
      "MAY",
      "JUN",
      "JUL",
      "AUG",
      "SEP",
      "OCT",
      "NOV",
      "DEC",
    ];

    // already like "16 JUN 2024"
    const m = String(date).match(/^(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})$/);
    if (m) return { mon: m[2].toUpperCase(), day: m[1] };

    // try native parse
    const d = new Date(date);
    if (!isNaN(d)) {
      return { mon: months[d.getMonth()], day: String(d.getDate()) };
    }

    // fallback: just show raw
    return { mon: String(date).slice(0, 3).toUpperCase(), day: "" };
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
            <select
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
            >
              {teams.map((team) => (
                <option key={team.id} value={team.name}>
                  {team.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div
          className={`tasks-table ${
            activeTab === "teamTasks" ? "team-tasks" : "my-tasks"
          }`}
        >
          <div className="table-header">
            <div className="header-cell">Done?</div>
            <div className="header-cell">Task Name</div>
            <div className="header-cell">Due Date</div>
            {activeTab === "teamTasks" && (
              <div className="header-cell">Assigned To</div>
            )}
            {activeTab === "teamTasks" && (
              <div className="header-cell">Team</div>
            )}
            <div className="header-cell">Actions</div>
          </div>

          {filteredTasks.map((task) => {
            const d = dueParts(task.due);
            return (
              <div
                key={task.id}
                className="table-row"
                onClick={() => setDetailTask(task)}
              >
                <div
                  className="table-cell checkbox-cell"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTaskToggle(task.id, task.done);
                  }}
                >
                  {task.done ? (
                    <IoCheckboxOutline size={33} />
                  ) : (
                    <IoSquareOutline size={33} />
                  )}
                </div>
                <div className="table-cell task-name-cell">{task.name}</div>
                <div className="table-cell due-date-cell">
                  <div className="due">
                    <strong className="due-mon">{d.mon}</strong>
                    <span className="due-day">{d.day}</span>
                  </div>
                </div>
                {activeTab === "teamTasks" && (
                  <div className="table-cell team-cell">
                    {task.assignedUsers?.map((u) => u.displayName).join(", ")}
                  </div>
                )}
                {activeTab === "teamTasks" && (
                  <div className="table-cell team-cell">{task.team}</div>
                )}
                <div
                  className="table-cell actions-cell"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    className="delete-btn"
                    onClick={() => handleDeleteTask(task.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <button
        className="add-task-btn"
        onClick={() =>
          currentUser
            ? setShowTaskModal(true)
            : alert("Please login to add a task")
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
