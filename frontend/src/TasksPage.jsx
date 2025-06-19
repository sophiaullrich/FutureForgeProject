import React, {useState} from 'react';
import './TasksPage.css'; 
import { IoCheckboxOutline, IoSquareOutline } from "react-icons/io5";

// dummy data
const tasksData = [
    {
        id: 1,
        done: false,
        name: 'Create Visuals',
        due: {month: 'JUN', day: '12'},
        assigned: 'Diya Topiwala',
        team: 'Team Marketing',
    },        
    {
        id: 2,
        done: false,
        name: 'Page Descriptions',
        due: {month: 'JUN', day: '16'},
        assigned: 'Joseph Esguerra',
        team: 'Team Marketing'
    },
    {
        id: 3,
        done: false,
        name: 'Get User Feedback',
        due: {month: 'JUN', day: '22'},
        assigned: 'Sophia Ullrich',
        team: 'Team Marketing'
    },
    {
        id: 4,
        done: false,
        name: 'Get Familiar with Team',
        due: {month: 'JUN', day: '30'},
        assigned: 'Diya Topiwala',
        team: 'Code Commanders'
    },
    {
        id: 5,
        done: false,
        name: 'Setup Environment',
        due: {month: 'JUN', day: '10'},
        assigned: 'Diya Topiwala',
        team: 'Team 2'
    },
    {
        id: 6,
        done: false,
        name: 'Firebase Authentication Setup',
        due: {month: 'JUN', day: '28'},
        assigned: 'Diya Topiwala',
        team: 'Team 3'
    },
        {
        id: 7,
        done: false,
        name: 'Tasks Page',
        due: {month: 'JUL', day: '01'},
        assigned: 'Diya Topiwala',
        team: 'Coding'
    },
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

    // filtering tasks - change based on user's name!!
    const filteredTasks = activeTab === 'myTasks'
    ? tasks.filter(task => task.assigned === 'Diya Topiwala')
    : tasks;

    return (
        <div>
            {/* tabs */}
            <div className="tabs-container">
                <button 
                    className={`tab ${activeTab === 'myTasks' ? 'active' : ''}`}
                    onClick={() => setActiveTab('myTasks')}
                >
                    My Tasks
                </button>
                <button 
                    className={`tab ${activeTab === 'teamTasks' ? 'active' : ''}`}
                    onClick={() => setActiveTab('teamTasks')}
                >
                    Team Tasks
                </button>
            </div>
            {/* table */}
            <div className="tasks-container">
                <div className="tasks-table">
                    {/* Table Header */}
                    <div className={`table-header ${activeTab === 'teamTasks' ? 'team-tasks' : ''}`}>
                        <div className="header-cell">Done?</div>
                        <div className="header-cell">Task Name</div>
                        <div className="header-cell">Due Date</div>
                        {activeTab === 'teamTasks' && <div className="header-cell">Assigned To</div>}
                        <div className="header-cell">Team</div>
                    </div>

                    {/* Table Rows */}
                    {filteredTasks.map(task => (
                        <div key={task.id} className={`table-row ${activeTab === 'teamTasks' ? 'team-tasks' : ''}`}>
                            <div className="table-cell checkbox-cell">
                                <div 
                                    className="custom-checkbox"
                                    onClick={() => handleTaskToggle(task.id)}
                                >
                                    {task.done ? (
                                        <IoCheckboxOutline size={33} />
                                    ) : (
                                        <IoSquareOutline size={33} />
                                    )}
                                </div>
                            </div>
                            <div className="table-cell task-name-cell">
                                {task.name}
                            </div>
                            <div className="table-cell due-date-cell">
                                <div className="due-date">
                                    <strong>{task.due.month}</strong>
                                    <div>{task.due.day}</div>
                                </div>
                            </div>
                            {activeTab === 'teamTasks' && (
                                <div className="table-cell assigned-to-cell">
                                    {task.assigned}
                                </div>
                            )}
                            <div className="table-cell team-cell">
                                {task.team}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <button className='add-task-btn'>Add New Task</button>
        </div>
      )}
    </div>
  );
}
