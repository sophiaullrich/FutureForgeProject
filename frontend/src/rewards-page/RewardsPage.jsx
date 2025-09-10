import React, { useEffect, useState } from 'react';
import './RewardsPage.css';
import { auth } from '../Firebase';

const RewardsPage = () => {
  const [user, setUser] = useState(null);
  const [points, setPoints] = useState(0);
  const [redeemed, setRedeemed] = useState([]);
  const [badges, setBadges] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);

  const rewards = [5, 10, 20, 25, 30, 50, 100, 300, 500];

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (u) => {
      if (u) {
        setUser(u);
        const res = await fetch(`http://localhost:5000/api/rewards/${u.uid}`);
        const data = await res.json();
        setPoints(data.points || 0);
        setRedeemed(data.redeemed || []);
      }
    });
    return () => unsubscribe();
  }, []);

  const redeemReward = async (amount) => {
    if (points < amount) return alert("Not enough points");

    const newPoints = points - amount;
    const updated = [...redeemed, amount];

    await fetch(`http://localhost:5000/api/rewards/${user.uid}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ points: newPoints, redeemed: updated }),
    });

    setPoints(newPoints);
    setRedeemed(updated);
  };

  return (
    <div className="rewards-content">
      <section className="badges-section">
        <h2>Your Badges</h2>
        <div className="badges">
          {[1, 2, 3, 4, 5, 6].map((b, i) => (
            <div key={i} className={`badge-placeholder badge-gradient-${i + 1}`} />
          ))}
        </div>
      </section>

      <div className="sections-row">
        <div className="left-column">
          <section className="leaderboard-section">
            <h2>Leaderboard</h2>
            <ol className="leaderboard">
              {/* Placeholder users, replace with actual leaderboard data */}
              {[{ name: 'User A', points: 200 }, { name: 'User B', points: 150 }].map((user, i) => (
                <li key={i}>
                  <span className="rank-number">{i + 1}</span>
                  <span>{user.name}</span>
                  <span>{user.points}</span>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <div className="right-column">
          <section className="rewards-grid">
            <h2>Redeem Your Rewards</h2>
            <p>Click to Redeem Reward</p>
            <div className="rewards-list">
              {rewards.map((amount, i) => (
                <div key={i} className="reward-item" onClick={() => redeemReward(amount)}>
                  <div className="reward-circle" />
                  <div className="reward-label">{amount} Points</div>
                </div>
              ))}
            </div>
            <p style={{ marginTop: '1rem' }}>Your Points: {points}</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default RewardsPage;
