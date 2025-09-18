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

        const res = await fetch(
          `http://localhost:5000/api/rewards/${u.uid}?email=${encodeURIComponent(u.email)}`
        );
        const data = await res.json();
        setPoints(data.points || 0);
        setRedeemed(data.redeemed || []);
        setBadges(data.badges || []);
      }
    });
    return () => unsubscribe();
  }, []);

  // Load leaderboard
  useEffect(() => {
    const fetchLeaderboard = async () => {
      const res = await fetch(`http://localhost:5000/api/rewards/leaderboard/all`);
      const data = await res.json();
      setLeaderboard(data);
    };
    fetchLeaderboard();
  }, [points]);

  // Redeem reward
  const redeemReward = async (amount) => {
    if (points < amount) return alert("Not enough points");

    const res = await fetch(`http://localhost:5000/api/rewards/${user.uid}/redeem`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cost: amount }),
    });

    const data = await res.json();
    if (data.error) {
      alert(data.error);
    } else {
      setPoints(data.points);
      setRedeemed(data.redeemed);
      setBadges(data.badges);
    }
  };

  return (
    <div className="rewards-content">
      {/* Badges Section */}
      <section className="badges-section">
        <h2>Your Badges</h2>
        <div className="badges">
          {badges.length > 0 ? (
            badges.map((badge, i) => (
              <div key={i} className={`badge-placeholder badge-gradient-${(i % 6) + 1}`}>
                <p
                  style={{
                    textAlign: 'center',
                    paddingTop: '40px',
                    fontWeight: 'bold',
                    color: '#fff',
                  }}
                >
                  {badge}
                </p>
              </div>
            ))
          ) : (
            <p>No badges yet...</p>
          )}
        </div>
      </section>

      <div className="sections-row">
        {/* Leaderboard Section */}
        <div className="left-column">
          <section className="leaderboard-section">
            <h2>Leaderboard</h2>
            <ol className="leaderboard">
              {leaderboard.map((lbUser, i) => (
                <li key={lbUser.uid}>
                  <span className="rank-number">{i + 1}</span>
                  <span>{lbUser.email || lbUser.uid}</span>
                  <span>{lbUser.points}</span>
                </li>
              ))}
            </ol>
          </section>
        </div>

        {/* Rewards Section */}
        <div className="right-column">
          <section className="rewards-grid">
            <h2>Redeem Your Rewards</h2>
            <p>Click to Redeem Reward</p>
            <div className="rewards-list">
              {rewards.map((amount, i) => (
                <div
                  key={i}
                  className="reward-item"
                  onClick={() => redeemReward(amount)}
                >
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