import React, { useState, useEffect } from "react";
import "./TasksPage.css";
import { IoCheckboxOutline, IoSquareOutline } from "react-icons/io5";
import { getAuth } from "firebase/auth";

export default function TasksPage() {
  const [activeTab, setActiveTab] = useState("myTasks");
  const [tasks, setTasks] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [newTaskName, setNewTaskName] = useState("");
  const [newTaskDue, setNewTaskDue] = useState("");
  const [newTaskTeam, setNewTaskTeam] = useState("Team Marketing");
  const [newTaskMember, setNewTaskMember] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState("Team Marketing");

  const auth = getAuth();
  const API_URL = "http://localhost:5000/tasks";

  const TEAMS = {
    "Team Marketing": ["Diya", "Joseph", "Sophia"],
    "Code Commanders": ["Marcos", "William", "Willie"]
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => setCurrentUser(user));
    return () => unsubscribe();
  }, []);

  const getToken = async () => currentUser ? await currentUser.getIdToken() : null;

  const fetchTasks = async () => {
    try {
      const token = await getToken();
      if (!token) return;

      const res = await fetch(API_URL, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setTasks(await res.json());
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  useEffect(() => { if (currentUser) fetchTasks(); }, [currentUser]);

  const handleTaskToggle = async (taskId, currentDone) => {
    try {
      const token = await getToken();
      if (!token) return;

      const res = await fetch(`${API_URL}/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ done: !currentDone }),
      });

      if (res.ok) setTasks(tasks.map(t => t.id === taskId ? { ...t, done: !currentDone } : t));
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const handleAddTask = async () => {
    if (!newTaskName || !newTaskDue || !newTaskMember) return alert("Fill all fields");
    if (!currentUser) return alert("User not logged in");

    try {
      const token = await getToken();
      if (!token) return;

      const displayName = currentUser.displayName || currentUser.email || "Unknown User";
      const assignedTo = newTaskMember === "Myself" ? displayName : newTaskMember;

      const newTask = {
        name: newTaskName,
        due: new Date(newTaskDue).toISOString(),
        team: newTaskTeam,
        assigned: assignedTo
      };

      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(newTask),
      });

      if (res.ok) {
        const created = await res.json();
        setTasks([...tasks, created]);
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
    try {
      const token = await getToken();
      if (!token) return;

      const res = await fetch(`${API_URL}/${taskId}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setTasks(tasks.filter(task => task.id !== taskId));
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const filteredTasks = activeTab === "myTasks"
    ? tasks.filter(task => task.assigned === (currentUser?.displayName || currentUser?.email))
    : tasks.filter(task => task.team === selectedTeam);

  const teamMembers = [...TEAMS[newTaskTeam]];
  if (newTaskTeam === "Code Commanders" && currentUser) teamMembers.unshift("Myself");

  return (
    <div className="tasks-page">
      <div className="tabs-container">
        <button className={`tab ${activeTab === "myTasks" ? "active" : ""}`} onClick={() => setActiveTab("myTasks")}>My Tasks</button>
        <button className={`tab ${activeTab === "teamTasks" ? "active" : ""}`} onClick={() => setActiveTab("teamTasks")}>Team Tasks</button>
      </div>

      <div className="tasks-container">
        {activeTab === "teamTasks" && (
          <div style={{ margin: "10px 20px" }}>
            <label>Select Team: </label>
            <select value={selectedTeam} onChange={(e) => setSelectedTeam(e.target.value)}>
              {Object.keys(TEAMS).map(team => <option key={team} value={team}>{team}</option>)}
            </select>
          </div>
        )}

        <div className="tasks-table">
          <div className={`table-header ${activeTab === "teamTasks" ? "team-tasks" : ""}`}>
            <div className="header-cell">Done?</div>
            <div className="header-cell">Task Name</div>
            <div className="header-cell">Due Date</div>
            {activeTab === "teamTasks" && <div className="header-cell">Assigned To</div>}
            {activeTab === "teamTasks" && <div className="header-cell">Team</div>}
            <div className="header-cell">Actions</div>
          </div>

          {filteredTasks.map(task => (
            <div key={task.id} className={`table-row ${activeTab === "teamTasks" ? "team-tasks" : ""}`}>
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
              {activeTab === "teamTasks" && <div className="table-cell team-cell">{task.assigned}</div>}
              {activeTab === "teamTasks" && <div className="table-cell team-cell">{task.team}</div>}
              <div className="table-cell actions-cell">
                <button className="delete-btn" onClick={() => handleDeleteTask(task.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button className="add-task-btn" onClick={() => { if (!currentUser) { alert("Please login to add a task"); return; } setShowPopup(true); }}>
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
                  {Object.keys(TEAMS).map(team => <option key={team} value={team}>{team}</option>)}
                </select>
              </div>
              <div className="popup-field">
                <label>Assign To</label>
                <select value={newTaskMember} onChange={(e) => setNewTaskMember(e.target.value)}>
                  <option value="">Select member</option>
                  {teamMembers.map(member => <option key={member} value={member}>{member}</option>)}
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
