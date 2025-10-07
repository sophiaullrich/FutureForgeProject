import React, { useEffect, useState } from "react";
import "./DashboardPage.css";
import { db } from "../Firebase";
import TeamDetailsModal from "../teams-page/TeamDetailsModal";
import { observeMyTeams } from "../TeamsService";
import { collection, query, where, onSnapshot, doc, getDoc, setDoc } from "firebase/firestore";
import { useOutletContext } from "react-router-dom";

export default function DashboardPage() {
  const { currentUser } = useOutletContext();

  const [teams, setTeams] = useState([]);
  const [tasksDue, setTasksDue] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [points, setPoints] = useState(0);
  const [badges, setBadges] = useState([]);

  // Observe teams
  useEffect(() => {
    if (!currentUser) return;
    const unsubscribe = observeMyTeams(setTeams);
    return () => unsubscribe && unsubscribe();
  }, [currentUser]);

  // Fetch tasks
  useEffect(() => {
    if (!currentUser) return;

    const tasksRef = collection(db, "tasks");
    const q = query(
      tasksRef,
      where("assignedEmails", "array-contains", currentUser.email.toLowerCase())
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedTasks = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      fetchedTasks.sort((a, b) => new Date(a.due) - new Date(b.due));
      setTasksDue(fetchedTasks);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Fetch rewards
  useEffect(() => {
    if (!currentUser) return;

    const rewardsRef = doc(db, "rewards", currentUser.uid);

    const setup = async () => {
      const snap = await getDoc(rewardsRef);
      if (!snap.exists()) {
        await setDoc(rewardsRef, {
          email: currentUser.email,
          points: 0,
          redeemed: [],
          badges: [],
        });
      }

      onSnapshot(rewardsRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setPoints(data.points || 0);
          setBadges(data.badges || []);
        }
      });
    };

    setup();
  }, [currentUser]);

  const pointsGoal = 500;
  const badgeGoal = 10;
  const pointsPct = Math.min((points / pointsGoal) * 100, 100);
  const badgePct = Math.min((badges.length / badgeGoal) * 100, 100);

  return (
    <div className="dashboard-main-content">
      <section className="top-section">
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
                const taskTitle =
                  task.type === "private" ? "Private Task" : task.team || "—";

                return (
                  <div key={task.id} className="task-due-card">
                    <div className="task-info">
                      <div className="task-team">{taskTitle}</div>
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

      <section className="progress-section">
        <h3 style={{ textAlign: "center" }}>Progress Overview</h3>

        {!currentUser ? (
          <p>Login to view progress</p>
        ) : (
          <>
            <div className="progress-bar">
              <span className="label">POINTS: {points} / {pointsGoal}</span>
              <div className="bar-bg">
                <div
                  className="bar-fill"
                  style={{ width: `${pointsPct}%`, backgroundColor: "#6aa6ff" }}
                />
              </div>
            </div>

            <div className="progress-bar">
              <span className="label">BADGES: {badges.length} / {badgeGoal}</span>
              <div className="bar-bg">
                <div
                  className="bar-fill"
                  style={{ width: `${badgePct}%`, backgroundColor: "#f9a825" }}
                />
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
