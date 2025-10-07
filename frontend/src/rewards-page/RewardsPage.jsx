import React, { useEffect, useState } from "react";
import "./RewardsPage.css";
import { auth, db } from "../Firebase";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
} from "firebase/firestore";

const RewardsPage = () => {
  const [user, setUser] = useState(null);
  const [points, setPoints] = useState(0);
  const [redeemed, setRedeemed] = useState([]);
  const [badges, setBadges] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);

  const rewards = [5, 10, 20, 25, 30, 50, 100, 300, 500];

  // User auth & profile subscription
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (u) => {
      if (!u) return;

      setUser(u);

      const userRef = doc(db, "rewards", u.uid);
      const userSnap = await getDoc(userRef);

      // Initialize if not exists
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          email: u.email,
          points: 0,
          redeemed: [],
          badges: [],
        });
      }

      // Listen for real-time updates
      onSnapshot(userRef, (snap) => {
        if (!snap.exists()) return;
        const data = snap.data();
        setPoints(data.points || 0);
        setRedeemed(data.redeemed || []);
        setBadges(data.badges || []);
      });
    });

    return () => unsubscribe();
  }, []);

  // Leaderboard subscription
  useEffect(() => {
    const leaderboardQuery = query(
      collection(db, "rewards"),
      orderBy("points", "desc"),
      limit(10)
    );

    const unsubscribe = onSnapshot(leaderboardQuery, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ uid: doc.id, ...doc.data() }));
      setLeaderboard(data);
    });

    return () => unsubscribe();
  }, []);

  // Redeem reward
  const redeemReward = async (amount) => {
    if (!user) return;
    if (points < amount) return alert("Not enough points");

    const userRef = doc(db, "rewards", user.uid);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) return;

    const data = userSnap.data();
    const newPoints = data.points - amount;
    const updatedRedeemed = [...(data.redeemed || []), amount];
    const newBadges = [...(data.badges || [])];

    // Badges logic
    if (updatedRedeemed.length === 1 && !newBadges.includes("first_redeem")) {
      newBadges.push("first_redeem");
    }
    if (newPoints >= 100 && !newBadges.includes("100_points")) {
      newBadges.push("100_points");
    }
    const totalRedeemed = updatedRedeemed.reduce((a, b) => a + b, 0);
    if (totalRedeemed >= 500 && !newBadges.includes("500_redeemed")) {
      newBadges.push("500_redeemed");
    }

    await updateDoc(userRef, {
      points: newPoints,
      redeemed: updatedRedeemed,
      badges: newBadges,
    });
  };

  return (
    <div className="rewards-content">
      {/* Badges Section */}
      <section className="badges-section">
        <h2>Your Badges</h2>
        <div className="badges">
          {badges.length ? (
            badges.map((badge, i) => (
              <div
                key={i}
                className={`badge-placeholder badge-gradient-${(i % 6) + 1}`}
              >
                <p
                  style={{
                    textAlign: "center",
                    paddingTop: "40px",
                    fontWeight: "bold",
                    color: "#fff",
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
              {leaderboard.map((entry, i) => (
                <li key={entry.uid}>
                  <span className="rank-number">{i + 1}</span>
                  <span>{entry.email || entry.uid}</span>
                  <span>{entry.points}</span>
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
            <p style={{ marginTop: "1rem" }}>Your Points: {points}</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default RewardsPage;
