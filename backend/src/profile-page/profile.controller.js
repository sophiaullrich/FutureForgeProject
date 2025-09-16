const service = require('./profile.service');

exports.getMe = async (req, res) => {
  try {
    let profile = await service.getProfileUID(req.user.uid);

    // If profile doesn't exist, create a base one
    if (!profile) {
      profile = {
        uid: req.user.uid,
        email: req.user.email,
        emailLower: req.user.email.toLowerCase(),
        displayName: req.user.email,
        photoURL: req.user.picture || '',
        createdAt: new Date()
      };
      await service.updateProfileUID(req.user.uid, profile);
    }

    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.patchMe = async (req, res) => {
  try {
    const {
      displayName,
      description,
      interests,
      careerGoals,
      socials,
      photoURL
    } = req.body;

    const updates = {};
    if (displayName !== undefined) updates.displayName = displayName;
    if (description !== undefined) updates.description = description;
    if (Array.isArray(interests)) updates.interests = interests;
    if (Array.isArray(careerGoals)) updates.careerGoals = careerGoals;
    if (socials !== undefined) updates.socials = socials;
    if (photoURL !== undefined) updates.photoURL = photoURL;

    const doc = await service.updateProfileUID(req.user.uid, updates);
    res.json(doc);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
