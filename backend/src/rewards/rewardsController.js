const { db } = require('./firebase');

exports.getUserRewards = async (req, res) => {
    const uid = req.params.uid;
    try {
        const userDoc = await db.collection('users').doc(uid).get();
        if (!userDoc.exists) return res.status(404).send('User not found');
        res.status(200).json(userDoc.data().rewards || {});
    }   catch (err) {
        res.status(500).send(err.message);
    }
};

exports.updateUserRewards = async (req, res) => {
    const uid = req.params.uid;
    const { points, redeemed } = req.body;
    try {
        await db.collection('users').doc(uid).set({
        rewards: { points, redeemed }
    }, { merge: true });
    res.status(200).send('Rewards updated');
  } catch (err) {
    res.status(500).send(err.message);
  }
};