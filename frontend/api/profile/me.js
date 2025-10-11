// Route: /api/profile/me  (GET, PATCH, OPTIONS)
// Mirrors your tasks API pattern: CORS + auth + Firestore (admin)

const { db, FieldValue } = require("../_admin.js");
const { authenticate } = require("../_auth.js");

// CORS (same as tasks)
function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*"); // tighten later if needed
  res.setHeader("Access-Control-Allow-Methods", "GET,PATCH,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

// shape response without extra writes
function shape(profile) {
  return {
    ...profile,
    displayName:
      profile?.firstName && profile?.lastName
        ? `${profile.firstName} ${profile.lastName}`
        : (profile?.displayName || profile?.email || ""),
    description: profile?.description ?? "",
    interests: profile?.interests ?? [],
    careerGoals: profile?.careerGoals ?? [],
    socials: profile?.socials ?? { google: "", github: "", linkedin: "" },
    photoURL: profile?.photoURL ?? "",
  };
}

module.exports = async (req, res) => {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(200).end(); // preflight ok

  // Verify Firebase ID token (Bearer ...)
  const user = await authenticate(req);
  if (!user) return res.status(401).json({ error: "unauthorized" });

  const uid = user.uid;
  const ref = db.collection("profiles").doc(uid);

  try {
    if (req.method === "GET") {
      let snap = await ref.get();

      // create minimal doc if not found
      if (!snap.exists) {
        const base = {
          uid,
          email: (user.email || "").toLowerCase(),
          displayName: user.email || "",
          description: "",
          interests: [],
          careerGoals: [],
          socials: { google: "", github: "", linkedin: "" },
          photoURL: "",
          createdAt: new Date(), // fine to use client here
          updatedAt: FieldValue.serverTimestamp(),
        };
        await ref.set(base, { merge: true });
        snap = await ref.get();
      }

      return res.status(200).json(shape(snap.data()));
    }

    if (req.method === "PATCH") {
      const body = req.body || {};
      const allowed = {};

      // whitelist
      if (typeof body.firstName === "string") allowed.firstName = body.firstName;
      if (typeof body.lastName === "string") allowed.lastName = body.lastName;
      if (typeof body.description === "string") allowed.description = body.description;
      if (Array.isArray(body.interests)) allowed.interests = body.interests;
      if (Array.isArray(body.careerGoals)) allowed.careerGoals = body.careerGoals;
      if (body.socials && typeof body.socials === "object") allowed.socials = body.socials;
      if (typeof body.photoURL === "string") allowed.photoURL = body.photoURL;

      // maintain displayName if first/last provided
      if ("firstName" in allowed || "lastName" in allowed) {
        const current = (await ref.get()).data() || {};
        const nextFirst = "firstName" in allowed ? allowed.firstName : (current.firstName || "");
        const nextLast  = "lastName"  in allowed ? allowed.lastName  : (current.lastName  || "");
        allowed.displayName = `${nextFirst} ${nextLast}`.trim();
      }

      if (Object.keys(allowed).length === 0) {
        return res.status(400).json({ error: "No valid fields to update" });
      }

      await ref.set({ ...allowed, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
      const updated = (await ref.get()).data();
      return res.status(200).json(shape(updated));
    }

    res.setHeader("Allow", "GET, PATCH, OPTIONS");
    return res.status(405).end("Method Not Allowed");
  } catch (err) {
    console.error("Error in /api/profile/me:", err);
    return res.status(500).json({ error: "server_error" });
  }
};
