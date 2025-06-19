import React, { useState, useEffect } from 'react';
import './TasksPage.css';

const staticTasks = [
  { id: 1, title: 'Create Visuals', dueDate: '2025-06-12', assignee: 'Team Marketing', status: 'To Do', static: true },
  { id: 2, title: 'Get Familiar with Team', dueDate: '2025-06-30', assignee: 'Code Commanders', status: 'To Do', static: true },
  { id: 3, title: 'Setup Environment', dueDate: '2025-06-10', assignee: 'Team 2', status: 'To Do', static: true },
  { id: 4, title: 'Firebase Authentication Setup', dueDate: '2025-06-28', assignee: 'Team 3', status: 'To Do', static: true }
];

export default function TasksPage() {
  const [activeTab, setActiveTab] = useState('myTasks');
  const [tasks, setTasks] = useState(staticTasks);
  const [showPopup, setShowPopup] = useState(false);
  const [form, setForm] = useState({ name: '', dueDate: '', team: '' });

  const backendUrl = 'http://localhost:5000/tasks';
  const currentUser = 'Myself';

  useEffect(() => {
    fetch(backendUrl)
      .then(res => res.json())
      .then(backendTasks => {
        const merged = [...staticTasks, ...backendTasks];
        setTasks(merged);
      })
      .catch(err => console.error('Failed to fetch tasks:', err));
  }, []);

  const handleTaskToggle = async (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const newStatus = task.status === 'Done' ? 'To Do' : 'Done';
    const updatedTask = { ...task, status: newStatus };

    if (task.static) {
      setTasks(prev => prev.map(t => t.id === taskId ? updatedTask : t));
      return;
    }

    try {
      await fetch(`${backendUrl}/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTask)
      });
      const refreshed = await fetch(backendUrl).then(res => res.json());
      setTasks([...staticTasks, ...refreshed]);
    } catch (err) {
      console.error('Failed to update task:', err);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await fetch(`${backendUrl}/${taskId}`, { method: 'DELETE' });
      const refreshed = await fetch(backendUrl).then(res => res.json());
      setTasks([...staticTasks, ...refreshed]);
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleAddTask = async (e) => {
    e.preventDefault();

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(form.dueDate);
    dueDate.setHours(0, 0, 0, 0);

    if (dueDate < today) {
      alert('Due date cannot be in the past.');
      return;
    }

    const newTask = {
      title: form.name,
      dueDate: form.dueDate,
      assignee: form.team,
      status: 'To Do'
    };

    try {
      await fetch(backendUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask)
      });
      const updated = await fetch(backendUrl).then(res => res.json());
      setTasks([...staticTasks, ...updated]);
      setForm({ name: '', dueDate: '', team: '' });
      setShowPopup(false);
    } catch (err) {
      console.error('Failed to add task:', err);
    }
  };

  const todayString = new Date().toISOString().split('T')[0];
  const filteredTasks = tasks.filter(task =>
    activeTab === 'myTasks' ? task.assignee === currentUser : task.assignee !== currentUser
  );

  return (
    <div className="tasks-page">
      <div className="tabs-container">
        <button className={`tab ${activeTab === 'myTasks' ? 'active' : ''}`} onClick={() => setActiveTab('myTasks')}>My Tasks</button>
        <button className={`tab ${activeTab === 'teamTasks' ? 'active' : ''}`} onClick={() => setActiveTab('teamTasks')}>Team Tasks</button>
      </div>

      <div className="tasks-container">
        <div className="tasks-table">
          <div className="table-header">
            <div className="header-cell">Done?</div>
            <div className="header-cell">Task Name</div>
            <div className="header-cell">Due Date</div>
            <div className="header-cell">Team</div>
            <div className="header-cell"></div>
          </div>

          {filteredTasks.map(task => (
            <div key={task.id} className="table-row">
              <div className="table-cell checkbox-cell">
                <input
                  type="checkbox"
                  checked={task.status === 'Done'}
                  onChange={() => handleTaskToggle(task.id)}
                />
              </div>
              <div className="table-cell task-name-cell">{task.title}</div>
              <div className="table-cell due-date-cell">
                <div className="due-date">
                    {new Date(task.dueDate).toLocaleString('default', { month: 'short' }).toUpperCase()} {new Date(task.dueDate).getDate().toString().padStart(2, '0')}
                </div>
              </div>
              <div className="table-cell team-cell">{task.assignee}</div>
              <div className="table-cell">
                {!task.static && (
                  <button className="popup-submit-btn" onClick={() => handleDeleteTask(task.id)}>
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <button className="add-task-btn" onClick={() => setShowPopup(true)}>Add New Task</button>
      </div>

      {showPopup && (
        <div className="task-popup-overlay">
          <form className="task-popup-form" onSubmit={handleAddTask}>
            <div className="popup-field">
              <label>Task Name</label>
              <input name="name" type="text" value={form.name} onChange={handleChange} required />
            </div>
            <div className="popup-field">
              <label>Due Date</label>
              <input name="dueDate" type="date" value={form.dueDate} onChange={handleChange} required min={todayString} />
            </div>
            <div className="popup-field">
              <label>Assigned To</label>
              <select name="team" value={form.team} onChange={handleChange} required>
                <option value="">Select Name</option>
                <option value="Myself">Myself</option>
                <option value="Team Marketing">Team Marketing</option>
                <option value="Code Commanders">Code Commanders</option>
                <option value="Team 2">Team 2</option>
                <option value="Team 3">Team 3</option>
              </select>
            </div>
            <div className="popup-button-row">
              <button type="submit" className="popup-submit-btn">Add New Task</button>
              <button type="button" className="popup-submit-btn" onClick={() => setShowPopup(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
