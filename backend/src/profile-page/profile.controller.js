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

    // Combine firstName and lastName for displayName
    if (profile.firstName && profile.lastName) {
      profile.displayName = `${profile.firstName} ${profile.lastName}`;
    }

    // Initialize missing fields if they don't exist
    profile.description = profile.description || '';
    profile.interests = profile.interests || [];
    profile.careerGoals = profile.careerGoals || [];
    profile.socials = profile.socials || {
      google: '',
      github: '',
      linkedin: ''
    };
    profile.photoURL = profile.photoURL || '';
    profile.darkMode = profile.darkMode || false;
    profile.textSize = profile.textSize || 'normal';

    res.json(profile);
  } catch (error) {
    console.error('Error in getMe:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.patchMe = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      description,
      interests,
      careerGoals,
      socials,
      photoURL,
      darkMode,
      textSize
    } = req.body;

    const updates = {};
    
    // Update name fields
    if (firstName !== undefined) updates.firstName = firstName;
    if (lastName !== undefined) updates.lastName = lastName;
    if (firstName || lastName) {
      const profile = await service.getProfileUID(req.user.uid);
      updates.displayName = `${firstName || profile.firstName} ${lastName || profile.lastName}`;
    }

    // Update other fields
    if (description !== undefined) updates.description = description;
    if (Array.isArray(interests)) updates.interests = interests;
    if (Array.isArray(careerGoals)) updates.careerGoals = careerGoals;
    if (socials !== undefined) updates.socials = socials;
    if (photoURL !== undefined) updates.photoURL = photoURL;
    if (darkMode !== undefined) updates.darkMode = darkMode;
    if (textSize !== undefined) updates.textSize = textSize;

    const doc = await service.updateProfileUID(req.user.uid, updates);
    res.json(doc);
  } catch (error) {
    console.error('Error in patchMe:', error);
    res.status(500).json({ error: error.message });
  }
};
