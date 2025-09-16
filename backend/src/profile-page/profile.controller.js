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

/* const service = require('./profile.service');

exports.getMe = async (req, res) => {
    try {
        const data = await service.getProfileUID(req.user.uid);
        res.json(data || {});
    } catch (error) {
        res.status(404).json({ error: 'Profile not found' });
    }
};

exports.patchMe = async (req, res) => {
    try {
        // Get existing profile or create base profile if it doesn't exist
        let profile = await service.getProfileUID(req.user.uid).catch(() => ({
            email: req.user.email,
            emailLower: req.user.email.toLowerCase(),
            displayName: req.user.email,
            photoURL: req.user.picture || '',
            uid: req.user.uid,
            createdAt: new Date()
        }));

        // Update only the fields that are provided in the request
        const updateFields = [
            'displayName', 
            'description', 
            'interests', 
            'careerGoals', 
            'socials', 
            'photoURL'
        ];

        const updates = {};
        updateFields.forEach(field => {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        });

        const doc = await service.updateProfileUID(req.user.uid, updates);
        res.json(doc);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}; */