const { db, admin } = require('./firebase');

// GET /api/rewards/:uid
exports.getUserRewards = async (req, res) => {
  const uid = req.params.uid;
  const { email } = req.query; // frontend passes ?email=user@example.com

  try {
    const docRef = db.collection('rewards').doc(uid);
    const doc = await docRef.get();

    if (!doc.exists) {
      // Create a new rewards doc with email if provided
      await docRef.set({
        email: email || "unknown@example.com",
        points: 0,
        redeemed: [],
        badges: []
      });
      return res.status(200).json({
        email: email || "unknown@example.com",
        points: 0,
        redeemed: [],
        badges: []
      });
    }

    res.status(200).json(doc.data());
  } catch (err) {
    res.status(500).send(err.message);
  }
};

// POST /api/rewards/:uid/redeem
exports.redeemReward = async (req, res) => {
  const uid = req.params.uid;
  const { cost } = req.body;

  try {
    const userRef = db.collection('rewards').doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) return res.status(404).json({ error: 'User not found' });

    const userData = userDoc.data();

    if (userData.points < cost) {
      return res.status(400).json({ error: 'Not enough points' });
    }

    const newPoints = userData.points - cost;
    const updatedRedeemed = [...(userData.redeemed || []), cost];

    // Award badges
    let newBadges = userData.badges || [];
    if (updatedRedeemed.length === 1 && !newBadges.includes("first_redeem")) {
      newBadges.push("first_redeem");
    }
    if (newPoints >= 100 && !newBadges.includes("100_points")) {
      newBadges.push("100_points");
    }

    await userRef.update({
      points: newPoints,
      redeemed: updatedRedeemed,
      badges: newBadges
    });

    res.status(200).json({
      email: userData.email,
      points: newPoints,
      redeemed: updatedRedeemed,
      badges: newBadges
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
};

// GET /api/rewards/leaderboard/all
exports.getLeaderboard = async (req, res) => {
  try {
    const snapshot = await db.collection('rewards')
      .orderBy('points', 'desc')
      .limit(10)
      .get();

    const leaderboard = snapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data()
    }));

    res.status(200).json(leaderboard);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

// POST /api/rewards/:uid/badge
exports.addBadge = async (req, res) => {
  const uid = req.params.uid;
  const { badge } = req.body;

  try {
    const userRef = db.collection('rewards').doc(uid);
    await userRef.update({
      badges: admin.firestore.FieldValue.arrayUnion(badge)
    });

    res.status(200).send('Badge added');
  } catch (err) {
    res.status(500).send(err.message);
  }
};
