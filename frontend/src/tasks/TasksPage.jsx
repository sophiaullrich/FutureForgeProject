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

const API_URL = "http://localhost:5001/tasks";

export default function TasksPage() {
  const { currentUser } = useOutletContext();

  const [activeTab, setActiveTab] = useState("myTasks");
  const [tasks, setTasks] = useState([]);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [detailTask, setDetailTask] = useState(null);
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState("");
  const [profiles, setProfiles] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);

  useEffect(() => {
    if (!currentUser) return;
    const unsubscribe = observeMyTeams((teams) => {
      setTeams(teams);
      if (teams.length > 0 && !selectedTeam) setSelectedTeam(teams[0].name);
    });
    return () => unsubscribe();
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    const fetchProfiles = async () => {
      const allProfiles = await listProfiles();
      setProfiles(allProfiles);
    };
    fetchProfiles();
  }, [currentUser]);

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
            email: p.email,
            displayName: p.displayName,
          }));
      }
    }

    const currentUserObj = {
      uid: currentUser.uid,
      email: currentUser.email,
      displayName: currentUser.displayName || currentUser.email,
    };

    if (!members.some((m) => m.uid === currentUser.uid))
      members.push(currentUserObj);
    setTeamMembers(members);
  }, [profiles, teams, selectedTeam, currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    const userEmail = currentUser.email.toLowerCase();

    const q = query(collection(db, "tasks"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allTasks = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      const visible = allTasks.filter(
        (t) =>
          t.assignedEmails?.includes(userEmail) ||
          (t.type === "team" && teams.some((team) => team.name === t.team))
      );
      setTasks(visible);
    });

    return () => unsubscribe();
  }, [currentUser, teams]);

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

  const handleAddTask = async (taskData) => {
    if (!currentUser) return;
    const dueDateISO = taskData.due
      ? new Date(taskData.due).toISOString()
      : null;
    if (!taskData.name || !dueDateISO)
      return alert("Task name and due date are required");

    const formattedDate = new Date(dueDateISO)
      .toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
      .toUpperCase();

    const payload = {
      name: taskData.name,
      due: formattedDate,
      description: taskData.description ?? "",
      team: taskData.type === "team" ? taskData.team || selectedTeam : "",
      assignedUsers: [],
      type: taskData.type,
    };

    if (taskData.type === "private") {
      payload.assignedUsers = [
        {
          uid: currentUser.uid,
          email: currentUser.email.toLowerCase(),
          displayName: currentUser.displayName || currentUser.email,
        },
      ];
    } else if (taskData.type === "team") {
      const selectedUser = teamMembers.find(
        (m) => m.email === taskData.assignedUsers?.[0]?.email
      );
      if (selectedUser) {
        payload.assignedUsers = [
          {
            uid: selectedUser.uid,
            email: selectedUser.email.toLowerCase(),
            displayName: selectedUser.displayName || selectedUser.email,
          },
        ];
      }
    }

    try {
      const token = await currentUser.getIdToken();
      await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      setShowTaskModal(false);
    } catch (error) {
      console.error("Error adding task:", error);
      alert("Failed to create task: " + error.message);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!currentUser) return;
    try {
      const token = await currentUser.getIdToken();
      const res = await fetch(`${API_URL}/${taskId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete task");
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
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
          task.assignedEmails?.includes(currentUser?.email?.toLowerCase())
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
