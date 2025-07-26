import React from 'react';
import './DashboardPage.css';

export default function DashboardPage() {
  const teams = ['Team Marketing', 'Team 2', 'Team 3', 'Team 4'];
  const tasksDueSoon = [
    { team: 'Team 2', name: 'Upskilling in React', date: { month: 'MAY', day: '30' } },
    { team: 'Team 4', name: 'Firebase Authentication Setup', date: { month: 'JUN', day: '02' } },
    { team: 'Team 2', name: 'Setup Environment', date: { month: 'JUN', day: '10' } },
    { team: 'Team Marketing', name: 'Create Visuals', date: { month: 'JUN', day: '12' } },
  ];

  return (
    <div className="dashboard-main-content">
      <section className="top-section">
        <div className="teams-section">
          <h3>Your Teams</h3>
          {teams.map((team, index) => (
            <div key={index} className="team-card">
              {team}
              <span className="arrow">›</span>
            </div>
          ))}
        </div>

        <div className="tasks-due-section">
          <h3>Tasks Due Soon</h3>
          {tasksDueSoon.map((task, index) => (
            <div key={index} className="task-due-card">
              <div className="task-info">
                <div className="task-team">{task.team}</div>
                <div className="task-name">{task.name}</div>
              </div>
              <div className="task-date">
                <strong>{task.date.month}</strong>
                <div>{task.date.day}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="progress-section">
        <h3>Progress Overview</h3>
        <div className="progress-bar">
          <span className="label">POINTS</span>
          <div className="bar-bg">
            <div className="bar-fill" style={{ width: '80%' }}></div>
          </div>
        </div>
        <div className="progress-bar">
          <span className="label">BADGE</span>
          <div className="bar-bg">
            <div className="bar-fill" style={{ width: '60%' }}></div>
          </div>
        </div>
      </section>
    </div>
  );
}
