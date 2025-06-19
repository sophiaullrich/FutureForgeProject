import React, {useState} from 'react';
import './TasksPage.css'; 
import { IoCheckboxOutline, IoSquareOutline } from "react-icons/io5";

const tasksData = [
    {
        id: 1,
        name: 'Create Visuals',
        due: {month: 'JUN', day: '12'},
        team: 'Team Marketing',
        done: false
    },
        {
        id: 2,
        name: 'Get Familiar with Team',
        due: {month: 'JUN', day: '30'},
        team: 'Code Commanders',
        done: false
    },
        {
        id: 3,
        name: 'Setup Environment',
        due: {month: 'JUN', day: '10'},
        team: 'Team 2',
        done: false
    },
        {
        id: 4,
        name: 'Firebase Authentication Setup',
        due: {month: 'JUN', day: '28'},
        team: 'Team 3',
        done: false
    },
];

export default function  TasksPage(){
    const [activeTab, setActiveTab] = useState('myTasks');
    const [tasks, setTasks] = useState(tasksData);

    const handleTaskToggle = (taskId) => {
        setTasks(tasks.map(task => 
            task.id === taskId ? { ...task, done: !task.done } : task
        ));
    };

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
                    <div className="table-header">
                        <div className="header-cell">Done?</div>
                        <div className="header-cell">Task Name</div>
                        <div className="header-cell">Due Date</div>
                        <div className="header-cell">Team</div>
                    </div>

                    {/* Table Rows */}
                    {tasks.map(task => (
                        <div key={task.id} className="table-row">
                            <div className="table-cell checkbox-cell">
                                <div 
                                className="custom-checkbox"
                                onClick={() => handleTaskToggle(task.id)}
                                >
                                    {task.done ? (
                                        <IoCheckboxOutline size={33} name="checkbox-outline"></IoCheckboxOutline>
                                    ) : (
                                        <IoSquareOutline size={33} name="square-outline"></IoSquareOutline>
                                    )}
                                </div>
                                {/* <input 
                                    type="checkbox" 
                                    checked={task.done}
                                    onChange={() => handleTaskToggle(task.id)}
                                /> */}
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
                            <div className="table-cell team-cell">
                                {task.team}
                            </div>
                        </div>
                    ))}
                </div>
            <button className='add-task-btn'>Add New Task</button>
            </div>
        </div>
    );
}