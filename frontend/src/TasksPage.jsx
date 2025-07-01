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
    const [tasks, setTasks] = useState(tasksData);

    const handleTaskToggle = (taskId) => {
        setTasks(tasks.map(task => 
            task.id === taskId ? { ...task, done: !task.done } : task
        ));
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
  );
}
