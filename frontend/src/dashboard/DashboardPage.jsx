import React, { useEffect, useState } from "react";
import "./DashboardPage.css";
import { auth, db } from "../Firebase";
import TeamDetailsModal from "../teams-page/TeamDetailsModal";
import { observeMyTeams } from "../TeamsService";
import { collection, query, where, onSnapshot } from "firebase/firestore";

export default function DashboardPage() {
  const [teams, setTeams] = useState([]);
  const [tasksDue, setTasksDue] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((user) => setCurrentUser(user));
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    const unsubscribe = observeMyTeams(setTeams);
    return () => unsubscribe && unsubscribe();
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return;

    const tasksRef = collection(db, "tasks");
    const q = query(
      tasksRef,
      where("assignedUsers", "array-contains", {
        email: currentUser.email,
        displayName: currentUser.displayName || currentUser.email,
      })
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedTasks = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      fetchedTasks.sort((a, b) => new Date(a.due) - new Date(b.due));
      setTasksDue(fetchedTasks);
    });

    return () => unsubscribe();
  }, [currentUser]);

  return (
    <div className="dashboard-main-content">
      <section className="top-section">
        {/* Teams Section */}
        <div className="teams-section">
          <h3>Your Teams</h3>
          <div className="scrollable-content">
            {!currentUser ? (
              <p>Login to view teams</p>
            ) : teams.length === 0 ? (
              <p>No teams yet</p>
            ) : (
              teams.map((team) => (
                <div
                  key={team.id}
                  className="team-card"
                  onClick={() => setSelectedTeam(team)}
                >
                  {team.name}
                  <span className="arrow">›</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Tasks Section */}
        <div className="tasks-due-section">
          <h3>Tasks Due Soon</h3>
          <div className="scrollable-content">
            {!currentUser ? (
              <p>Login to view tasks</p>
            ) : tasksDue.length === 0 ? (
              <p>No tasks assigned</p>
            ) : (
              tasksDue.map((task) => {
                const dateObj = task.due ? new Date(task.due) : null;
                const month = dateObj
                  ? dateObj.toLocaleString("en-US", { month: "short" }).toUpperCase()
                  : "—";
                const day = dateObj ? dateObj.getDate() : "";

                return (
                  <div key={task.id} className="task-due-card">
                    <div className="task-info">
                      <div className="task-team">{task.team}</div>
                      <div className="task-name">{task.name}</div>
                    </div>
                    <div className="task-date">
                      <strong>{month}</strong>
                      <div>{day}</div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* Progress Section */}
      <section className="progress-section">
        <h3 style={{ textAlign: "center" }}>Progress Overview</h3>
        {!currentUser ? (
          <p>Login to view progress</p>
        ) : (
          <>
            <div className="progress-bar">
              <span className="label">POINTS</span>
              <div className="bar-bg">
                <div className="bar-fill" style={{ width: "0%" }}></div>
              </div>
            </div>
            <div className="progress-bar">
              <span className="label">BADGE</span>
              <div className="bar-bg">
                <div className="bar-fill" style={{ width: "0%" }}></div>
              </div>
            </div>
          </>
        )}
      </section>

      {selectedTeam && (
        <div className="modal-backdrop">
          <TeamDetailsModal
            team={selectedTeam}
            onClose={() => setSelectedTeam(null)}
          />
        </div>
      )}
    </div>
  );
}
