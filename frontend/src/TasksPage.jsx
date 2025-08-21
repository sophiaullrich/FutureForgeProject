import React, { useState, useEffect } from 'react';
import './TasksPage.css';
import { IoCheckboxOutline, IoSquareOutline } from "react-icons/io5";

export default function TasksPage() {
  const [activeTab, setActiveTab] = useState('myTasks');
  const [tasks, setTasks] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskDue, setNewTaskDue] = useState('');
  const [newTaskAssigned, setNewTaskAssigned] = useState('');
  
  const currentUser = "Current User"; 
  const usersList = [currentUser, "Diya", "Joseph", "Marcos", "Sophia", "William", "Willie"];

  useEffect(() => {
    fetch("http://localhost:5000/tasks")
      .then(res => res.json())
      .then(data => setTasks(data))
      .catch(err => console.error("Error fetching tasks:", err));
  }, []);

  const handleTaskToggle = async (taskId, currentDone) => {
    try {
      const updatedTask = { done: !currentDone };
      const res = await fetch(`http://localhost:5000/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedTask)
      });
      if (res.ok) {
        setTasks(tasks.map(task =>
          task.id === taskId ? { ...task, done: !currentDone } : task
        ));
      }
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const handleAddTask = async () => {
    if (!newTaskName || !newTaskDue || !newTaskAssigned) return alert("Fill all fields");
    const newTask = {
      name: newTaskName,
      due: new Date(newTaskDue),
      assigned: newTaskAssigned,
      team: "Future Forge",
      done: false
    };
    try {
      const res = await fetch("http://localhost:5000/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTask)
      });
      if (res.ok) {
        const created = await res.json();
        setTasks([...tasks, created]);
        setShowPopup(false);
        setNewTaskName('');
        setNewTaskDue('');
        setNewTaskAssigned('');
      }
    } catch (error) {
      console.error("Error creating task:", error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      const res = await fetch(`http://localhost:5000/tasks/${taskId}`, { method: "DELETE" });
      if (res.ok) setTasks(tasks.filter(task => task.id !== taskId));
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const filteredTasks = activeTab === 'myTasks'
    ? tasks.filter(task => task.assigned === currentUser)
    : tasks;

  return (
    <div>
      {/* Tabs */}
      <div className="tabs-container">
        <button className={`tab ${activeTab === 'myTasks' ? 'active' : ''}`} onClick={() => setActiveTab('myTasks')}>
          My Tasks
        </button>
        <button className={`tab ${activeTab === 'teamTasks' ? 'active' : ''}`} onClick={() => setActiveTab('teamTasks')}>
          Team Tasks
        </button>
      </div>

      {/* Tasks Table */}
      <div className="tasks-container">
        <div className="tasks-table">
          <div className={`table-header ${activeTab === 'teamTasks' ? 'team-tasks' : ''}`}>
            <div className="header-cell">Done?</div>
            <div className="header-cell">Task Name</div>
            <div className="header-cell">Due Date</div>
            {activeTab === 'teamTasks' && <div className="header-cell">Assigned To</div>}
            <div className="header-cell">Team</div>
            <div className="header-cell">Actions</div>
          </div>

          {filteredTasks.map(task => (
            <div key={task.id} className={`table-row ${activeTab === 'teamTasks' ? 'team-tasks' : ''}`}>
              <div className="table-cell checkbox-cell" onClick={() => handleTaskToggle(task.id, task.done)}>
                {task.done ? <IoCheckboxOutline size={33} /> : <IoSquareOutline size={33} />}
              </div>
              <div className="table-cell task-name-cell">{task.name}</div>
              <div className="table-cell due-date-cell">
                <div className="due-date">
                  <strong>{new Date(task.due).toLocaleString('en-US', { month: 'short' }).toUpperCase()}</strong>
                  <div>{new Date(task.due).getDate()}</div>
                </div>
              </div>
              {activeTab === 'teamTasks' && <div className="table-cell assigned-to-cell">{task.assigned}</div>}
              <div className="table-cell team-cell">{task.team}</div>
              <div className="table-cell actions-cell">
                <button className="delete-btn" onClick={() => handleDeleteTask(task.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Task Button */}
      <button className='add-task-btn' onClick={() => setShowPopup(true)}>Add New Task</button>

      {/* Popup Overlay */}
      {showPopup && (
        <div className="task-popup-overlay">
          <div className="task-popup-form">
            <div className="popup-fields-row">
              <div className="popup-field">
                <label>Task Name</label>
                <input value={newTaskName} onChange={e => setNewTaskName(e.target.value)} />
              </div>
              <div className="popup-field">
                <label>Due Date</label>
                <input type="date" value={newTaskDue} onChange={e => setNewTaskDue(e.target.value)} />
              </div>
              <div className="popup-field">
                <label>Assigned To</label>
                <select value={newTaskAssigned} onChange={e => setNewTaskAssigned(e.target.value)}>
                  <option value="">Select Name</option>
                  {usersList.map(user => <option key={user} value={user}>{user}</option>)}
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
