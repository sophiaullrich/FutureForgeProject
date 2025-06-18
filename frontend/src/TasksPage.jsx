import React, {useState} from 'react';
import './TasksPage.css'; 

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

    return (
        <div>
            <div className="tabs-container">
                <button className={activeTab === 'myTasks' ? 'tab-active' : 'tab'} onClick={()=>setActiveTab('myTasks')}>My Tasks</button>
                <button className={activeTab === 'teamTasks' ? 'tab-active' : 'tab'} onClick={()=>setActiveTab('teamTasks')}>Team Tasks</button>
            </div>
            <div className='tasks-content-area'>
                <div className='task-header'>
                    <span>Done?</span>
                    <span>Task Name</span>
                    <span>Due Date</span>
                    <span>Team</span>
                </div>
                {tasksData.map(task => (
                    <div className='task-row' key={task.id}>
                        <input type='checkbox'/>
                        <span>{task.name}</span>
                        <span><strong>{task.due.month}</strong><br/>{task.due.day}</span>
                        <span>{task.team}</span>
                    </div>    
                ))}
            </div>
            <button className='add-task-btn'>Add New Task</button>
        </div>
    );
}