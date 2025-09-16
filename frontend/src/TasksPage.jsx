import React, { useState, useEffect } from "react";
import "./TasksPage.css";
import { IoCheckboxOutline, IoSquareOutline } from "react-icons/io5";
import { getAuth } from "firebase/auth";
import { observeMyTeams } from "./TeamsService";
import { listProfiles } from "./teams-page/ProfileService";
import { db } from "./Firebase";
import { collection, addDoc, updateDoc, serverTimestamp } from "firebase/firestore";

export default function TasksPage() {
  const [activeTab, setActiveTab] = useState("myTasks");
  const [tasks, setTasks] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [newTaskName, setNewTaskName] = useState("");
  const [newTaskDue, setNewTaskDue] = useState("");
  const [newTaskTeam, setNewTaskTeam] = useState("");
  const [newTaskMember, setNewTaskMember] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState("");
  const [profiles, setProfiles] = useState([]);

  const auth = getAuth();
  const API_URL = "http://localhost:5000/tasks";

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => setCurrentUser(user));
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    const unsubscribe = observeMyTeams((teams) => {
      setTeams(teams);
      if (teams.length > 0) {
        setSelectedTeam(teams[0].name);
        setNewTaskTeam(teams[0].name);
      }
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

  const getToken = async () => (currentUser ? await currentUser.getIdToken() : null);

  const fetchTasks = async () => {
    if (!currentUser) return;
    try {
      const token = await getToken();
      if (!token) return;

      const res = await fetch(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        let fetchedTasks = await res.json();
        fetchedTasks = fetchedTasks.map((task) => {
          const assignedUsers =
            task.assignedUsers ||
            [{ email: task.assignedEmail, displayName: task.assignedDisplayName || task.assignedEmail }];
          return { ...task, assignedUsers };
        });
        setTasks(fetchedTasks);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  useEffect(() => {
    if (!currentUser || profiles.length === 0) return;
    fetchTasks();
  }, [currentUser, profiles]);

  const filteredTasks =
    activeTab === "myTasks"
      ? tasks.filter((task) => task.assignedUsers.some((u) => u.email === currentUser?.email))
      : tasks.filter((task) => task.team === selectedTeam);

  const handleTaskToggle = async (taskId, currentDone) => {
    if (!currentUser) return;
    try {
      const token = await getToken();
      if (!token) return;

      const res = await fetch(`${API_URL}/${taskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ done: !currentDone }),
      });

      if (res.ok)
        setTasks(tasks.map((t) => (t.id === taskId ? { ...t, done: !currentDone } : t)));
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const handleAddTask = async () => {
    if (!currentUser) return alert("Please login to add a task");
    if (!newTaskName || !newTaskDue || !newTaskMember) return alert("Fill all fields");

    try {
      const token = await getToken();
      if (!token) return;

      const profile = profiles.find((p) => p.email === newTaskMember);
      const assignedEmail = profile?.email || newTaskMember;
      const assignedDisplayName = profile?.displayName || assignedEmail;

      const newTask = {
        name: newTaskName,
        due: new Date(newTaskDue).toISOString(),
        team: newTaskTeam,
        assignedUsers: [{ email: assignedEmail, displayName: assignedDisplayName }],
        userId: currentUser.uid,
        done: false,
      };

      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newTask),
      });

      if (res.ok) {
        const created = await res.json();
        const assignedUsers = created.assignedUsers || [{ email: created.assignedEmail, displayName: created.assignedDisplayName }];
        setTasks([...tasks, { ...created, assignedUsers }]);

        await addDoc(collection(db, "notifications"), {
        userId: profile?.uid || assignedEmail,
        notifId: "", 
        message: `You have been assigned a new task: ${created.name}. Due: ${new Date(created.due).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })}`,
      taskId: created.id,
      type: "task",   
      read: false,
      timestamp: serverTimestamp(),
      }).then(async (docRef) => {
      await updateDoc(docRef, { notifId: docRef.id });
    });

        setShowPopup(false);
        setNewTaskName("");
        setNewTaskDue("");
        setNewTaskMember("");
      } else {
        alert("Failed to create task");
      }
    } catch (error) {
      console.error("Error creating task:", error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!currentUser) return;
    try {
      const token = await getToken();
      if (!token) return;

      const res = await fetch(`${API_URL}/${taskId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setTasks(tasks.filter((task) => task.id !== taskId));
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const teamMembers =
    teams.length > 0
      ? (teams.find((t) => t.name === newTaskTeam)?.members || []).map((uid) => {
          const profile = profiles.find((p) => p.uid === uid);
          return profile ? { email: profile.email, displayName: profile.displayName } : { email: uid, displayName: uid };
        })
      : [];

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
            <div key={task.id} className="table-row">
              <div className="table-cell checkbox-cell" onClick={() => handleTaskToggle(task.id, task.done)}>
                {task.done ? <IoCheckboxOutline size={33} /> : <IoSquareOutline size={33} />}
              </div>
              <div className="table-cell task-name-cell">{task.name}</div>
              <div className="table-cell due-date-cell">
                <div className="due-date">
                  <strong>{new Date(task.due).toLocaleString("en-US", { month: "short" }).toUpperCase()}</strong>
                  <div>{new Date(task.due).getDate()}</div>
                </div>
              </div>
              {activeTab === "teamTasks" && <div className="table-cell team-cell">{task.assignedUsers.map(u => u.displayName).join(", ")}</div>}
              {activeTab === "teamTasks" && <div className="table-cell team-cell">{task.team}</div>}
              <div className="table-cell actions-cell">
                <button className="delete-btn" onClick={() => handleDeleteTask(task.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button className="add-task-btn" onClick={() => currentUser ? setShowPopup(true) : alert("Please login to add a task")}>
        Add New Task
      </button>

      {showPopup && (
        <div className="task-popup-overlay">
          <div className="task-popup-form">
            <div className="popup-fields-row">
              <div className="popup-field">
                <label>Task Name</label>
                <input value={newTaskName} onChange={(e) => setNewTaskName(e.target.value)} />
              </div>
              <div className="popup-field">
                <label>Due Date</label>
                <input type="date" value={newTaskDue} onChange={(e) => setNewTaskDue(e.target.value)} />
              </div>
              <div className="popup-field">
                <label>Team</label>
                <select value={newTaskTeam} onChange={(e) => setNewTaskTeam(e.target.value)}>
                  {teams.map((team) => <option key={team.id} value={team.name}>{team.name}</option>)}
                </select>
              </div>
              <div className="popup-field">
                <label>Assign To</label>
                <select value={newTaskMember} onChange={(e) => setNewTaskMember(e.target.value)}>
                  <option value="">Select member</option>
                  {teamMembers.map((member) => <option key={member.email} value={member.email}>{member.displayName}</option>)}
                </select>
              </div>
            </div>
            <div className="popup-button-row">
              <button className="popup-submit-btn" onClick={handleAddTask}>Add Task</button>
              <button className="popup-submit-btn" onClick={() => setShowPopup(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
