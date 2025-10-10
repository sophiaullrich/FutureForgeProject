// Route: /api/profile/me  (GET, PATCH)
const { authenticate } = require("../_auth");
const service = require("./_service");

// shape response without writing
function shapeResponse(profile) {
  return {
    ...profile,
    displayName:
      (profile.firstName && profile.lastName)
        ? `${profile.firstName} ${profile.lastName}`
        : (profile.displayName || profile.email || ""),
    description: profile.description ?? "",
    interests: profile.interests ?? [],
    careerGoals: profile.careerGoals ?? [],
    socials: profile.socials ?? { google: "", github: "", linkedin: "" },
    photoURL: profile.photoURL ?? "",
  };
}

module.exports = async (req, res) => {
  // require Firebase ID token (Bearer ...)
  if (!(await authenticate(req, res))) return;

  try {
    if (req.method === "GET") {
      let profile = await service.getProfileUID(req.user.uid);

      // create a minimal doc if not found
      if (!profile) {
        const base = {
          uid: req.user.uid,
          email: (req.user.email || "").toLowerCase(),
          displayName: req.user.email || "",
          description: "",
          interests: [],
          careerGoals: [],
          socials: { google: "", github: "", linkedin: "" },
          photoURL: req.user.picture || "",
          createdAt: new Date(), // ok to set a client timestamp at create-time
        };
        await service.updateProfileUID(req.user.uid, base);
        profile = await service.getProfileUID(req.user.uid);
      }

      return res.status(200).json(shapeResponse(profile));
    }

    if (req.method === "PATCH") {
      const {
        firstName, lastName, description, interests,
        careerGoals, socials, photoURL,
      } = req.body || {};

      const updates = {};
      if (firstName !== undefined) updates.firstName = firstName;
      if (lastName  !== undefined) updates.lastName  = lastName;

      // maintain displayName if first/last provided
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

      const doc = await service.updateProfileUID(req.user.uid, updates);
      return res.status(200).json(shapeResponse(doc));
    }

    // method not allowed
    res.setHeader("Allow", "GET, PATCH");
    return res.status(405).json({ error: "Method Not Allowed" });

  } catch (err) {
    console.error("profile/me error:", err);
    return res.status(500).json({ error: err.message || "Internal error" });
  }
};
