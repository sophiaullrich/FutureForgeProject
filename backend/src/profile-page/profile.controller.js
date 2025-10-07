const service = require('./profile.service');

exports.getMe = async (req, res) => {
  try {
    let profile = await service.getProfileUID(req.user.uid);

    if (!profile) {
      const base = {
        uid: req.user.uid,
        email: (req.user.email || "").toLowerCase(),
        displayName: req.user.email || "",
        description: "",
        interests: [],
        careerGoals: [],
        socials: { google: "", github: "", linkedin: "" },
        createdAt: new Date()
      };
      if (req.user.picture) base.photoURL = req.user.picture; // only if present
      await service.updateProfileUID(req.user.uid, base);
      profile = await service.getProfileUID(req.user.uid);
    }

    // Response-only shaping (no writes)
    const response = {
      ...profile,
      displayName:
        (profile.firstName && profile.lastName)
          ? `${profile.firstName} ${profile.lastName}`
          : (profile.displayName || profile.email || ""),
      description: profile.description ?? "",
      interests: profile.interests ?? [],
      careerGoals: profile.careerGoals ?? [],
      socials: profile.socials ?? { google: "", github: "", linkedin: "" },
      photoURL: profile.photoURL ?? "",  // only for the response
    };

    res.json(response);
  } catch (err) {
    console.error("Error in getMe:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.patchMe = async (req, res) => {
  try {
    const {
      firstName, lastName, description, interests,
      careerGoals, socials, photoURL,
    } = req.body;

    const updates = {};

    if (firstName !== undefined) updates.firstName = firstName;
    if (lastName  !== undefined) updates.lastName  = lastName;

    if (firstName !== undefined || lastName !== undefined) {
      const current = (await service.getProfileUID(req.user.uid)) || {};
      const nextFirst = firstName !== undefined ? firstName : (current.firstName || "");
      const nextLast  = lastName  !== undefined ? lastName  : (current.lastName  || "");
      updates.displayName = `${nextFirst} ${nextLast}`.trim();
    }

    if (description !== undefined)  updates.description  = description;
    if (Array.isArray(interests))   updates.interests    = interests;
    if (Array.isArray(careerGoals)) updates.careerGoals  = careerGoals;
    if (socials !== undefined)      updates.socials      = socials;
    if (photoURL !== undefined)     updates.photoURL     = photoURL;

    console.log("patchMe received updates:", updates);
    const doc = await service.updateProfileUID(req.user.uid, updates);
    res.json(doc);
  } catch (err) {
    console.error("Error in patchMe:", err);
    res.status(500).json({ error: err.message });
  }
};
