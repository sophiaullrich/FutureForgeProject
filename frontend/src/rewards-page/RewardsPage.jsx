import React from 'react';
import './RewardsPage.css';

const RewardsPage = () => {
  const badges = [1, 2, 3, 4, 5, 6]; // sample badge data
  const leaderboard = [
    { name: 'Stephen. T', points: 147 },
    { name: 'Joseph. E', points: 139 },
    { name: 'Sophia. U', points: 128 },
    { name: 'Marcos. F', points: 102 },
    { name: 'William. C', points: 73 },
    { name: 'Willie. D', points: 65 },
    { name: 'Diya. T', points: 11, rank: 32 },
  ];

  const rewards = [5, 10, 20, 25, 30, 50, 100, 300, 500];

  return (
    <main className="rewards-content">
      <header className="rewards-header">
        <h1>Rewards</h1>
      </header>

      <div className="rewards-sections">
        <div className="left-column">
          <section className="badges-section">
            <h2>Your Badges</h2>
            <div className="badges">
              {badges.map((b, index) => (
                <div key={index} className="badge-placeholder" />
              ))}
            </div>
          </section>

          <section className="leaderboard-section">
            <h2>Leaderboard</h2>
            <ol className="leaderboard">
              {leaderboard.slice(0, 6).map((user, index) => (
                <li key={index}>
                  <span className="rank-number">{index + 1}</span>
                  <span>{user.name}</span>
                  <span>{user.points}</span>
                </li>
              ))}
              <li className="leaderboard-last">
                <span className="rank-number">{leaderboard[6].rank}</span>
                <span>{leaderboard[6].name}</span>
                <span>{leaderboard[6].points}</span>
              </li>
            </ol>
          </section>
        </div>

        <div className="right-column">
          <section className="rewards-grid">
            <h2>Redeem Your Rewards</h2>
            <p>Click to Redeem Reward</p>
            <div className="rewards-list">
              {rewards.map((points, index) => (
                <div key={index} className="reward-circle">
                  {points} Points
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};

export default RewardsPage;
