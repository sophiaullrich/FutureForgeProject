import React, { useState, useEffect } from "react";
import "./TasksPage.css";
import { IoCheckboxOutline, IoSquareOutline } from "react-icons/io5";
import { getAuth } from "firebase/auth";
import { db } from "../Firebase";
import {
  collection,
  query,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { observeMyTeams } from "../TeamsService";
import { listProfiles } from "../teams-page/ProfileService";
import TaskModal from "./TaskModal";
import TaskDetailModal from "./TaskDetailModal";

export default function TasksPage() {
  const [activeTab, setActiveTab] = useState("myTasks");
  const [tasks, setTasks] = useState([]);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [detailTask, setDetailTask] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState("");
  const [profiles, setProfiles] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);

  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => setCurrentUser(user));
    return () => unsubscribe();
  }, []);

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
          .map((p) => ({ uid: p.uid, email: p.email, displayName: p.displayName }));
      }
    }

    const currentUserObj = {
      uid: currentUser.uid,
      email: currentUser.email,
      displayName: currentUser.displayName || currentUser.email,
    };

    if (!members.some((m) => m.uid === currentUser.uid)) members.push(currentUserObj);
    setTeamMembers(members);
  }, [profiles, teams, selectedTeam, currentUser]);

  useEffect(() => {
    if (!currentUser) return;

    const tasksRef = collection(db, "tasks");

    const unsubscribe = onSnapshot(tasksRef, (snapshot) => {
      const fetchedTasks = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setTasks(fetchedTasks);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const filteredTasks =
    activeTab === "myTasks"
      ? tasks.filter((task) => task.assignedEmails?.includes(currentUser?.email.toLowerCase()))
      : tasks.filter((task) => task.team === selectedTeam);

  const handleTaskToggle = async (taskId, currentDone) => {
    try {
      const taskRef = doc(db, "tasks", taskId);
      await updateDoc(taskRef, { done: !currentDone });
      setTasks(tasks.map((t) => (t.id === taskId ? { ...t, done: !currentDone } : t)));
    } catch (err) {
      console.error("Error updating task:", err);
    }
  };

  const handleAddTask = async (taskData) => {
    if (!currentUser) return;

    const dueDateISO = taskData.due ? new Date(taskData.due).toISOString() : null;
    if (!taskData.name || !dueDateISO) return alert("Task name and due date are required");

    const formattedDate = new Date(dueDateISO)
      .toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
      .toUpperCase();

    let payload = {
      name: taskData.name,
      due: formattedDate,
      description: taskData.description || "",
      type: taskData.type,
      team: taskData.type === "team" ? taskData.team || selectedTeam : "",
      userId: currentUser.uid,
      done: false,
      createdAt: new Date().toISOString(),
    };

    if (taskData.type === "private") {
      payload.assignedUsers = [
        {
          uid: currentUser.uid,
          email: currentUser.email.toLowerCase(),
          displayName: currentUser.displayName || currentUser.email,
        },
      ];
      payload.assignedEmails = [currentUser.email.toLowerCase()];
    } else if (taskData.type === "team") {
      const selectedUser = teamMembers.find(
        (m) => m.email === taskData.assignedUsers?.[0]?.email
      );
      payload.assignedUsers = [
        {
          uid: selectedUser?.uid || null,
          email: selectedUser?.email?.toLowerCase() || "",
          displayName: selectedUser?.displayName || selectedUser?.email || "",
        },
      ];
      payload.assignedEmails = payload.assignedUsers.map((u) => u.email);
    }

    try {
      await addDoc(collection(db, "tasks"), payload);
      setShowTaskModal(false);
    } catch (error) {
      console.error("Error adding task:", error);
      alert("Failed to create task: " + error.message);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await deleteDoc(doc(db, "tasks", taskId));
      setTasks(tasks.filter((t) => t.id !== taskId));
    } catch (err) {
      console.error("Error deleting task:", err);
    }
  };

  const formatDate = (date) => {
    if (!date) return "—";

    let parsedDate;

    if (typeof date === "object" && date.seconds) {
      parsedDate = new Date(date.seconds * 1000);
    } else if (typeof date === "object" && typeof date.toDate === "function") {
      parsedDate = date.toDate();
    } else if (typeof date === "string" && !isNaN(Date.parse(date))) {
      parsedDate = new Date(date);
    } else {
      return date;
    }

    return parsedDate
      .toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
      .toUpperCase();
  };

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

        <div
          className={`tasks-table ${activeTab === "teamTasks" ? "team-tasks" : "my-tasks"}`}
        >
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
              style={{ cursor: "pointer" }}
            >
              <div
                className="table-cell checkbox-cell"
                onClick={(e) => {
                  e.stopPropagation();
                  handleTaskToggle(task.id, task.done);
                }}
              >
                {task.done ? <IoCheckboxOutline size={33} /> : <IoSquareOutline size={33} />}
              </div>
              <div className="table-cell task-name-cell">{task.name}</div>
              <div className="table-cell due-date-cell">{formatDate(task.due)}</div>
              {activeTab === "teamTasks" && (
                <div className="table-cell team-cell">
                  {task.assignedUsers?.map((u) => u.displayName).join(", ")}
                </div>
              )}
              {activeTab === "teamTasks" && <div className="table-cell team-cell">{task.team}</div>}
              <div className="table-cell actions-cell" onClick={(e) => e.stopPropagation()}>
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
        onClick={() => (currentUser ? setShowTaskModal(true) : alert("Please login to add a task"))}
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

      {detailTask && <TaskDetailModal task={detailTask} onClose={() => setDetailTask(null)} />}
    </div>
  );
}
 