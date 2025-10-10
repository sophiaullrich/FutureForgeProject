const { getAuth } = require("firebase-admin/auth");
const { admin } = require("./_admin.js");

async function authenticate(req) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) return null;

  try {
    const decoded = await getAuth(admin).verifyIdToken(token);
    return { uid: decoded.uid, email: decoded.email || "" };
  } catch (err) {
    console.error("Auth error:", err);
    return null;
  }
}

module.exports = { authenticate };
