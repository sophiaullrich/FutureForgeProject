const service = require('./profile.service');

exports.getMe = async (req , res) => {
    const data = await service.getProfileUID(req.user.uid);
    res.json(data || {});
};

exports.patchMe = async (req, res) => {
    const {
        displayName, description,interests, careerGoals, socials, photoURL 
    } = req.body;

    const clean = {};
    if (displayName !== undefined) clean.displayName = displayName;
    if (description !== undefined) clean.description = description;
    if (Array.isArray(interests)) clean.interests = interests;
    if (Array.isArray(careerGoals)) clean.careerGoals = careerGoals;
    if (socials !== undefined) clean.socials = socials;
    if (photoURL !== undefined) clean.photoURL = photoURL;

    const doc = await service.updateProfileUID(req.user.uid, clean);
    res.json(doc);
};