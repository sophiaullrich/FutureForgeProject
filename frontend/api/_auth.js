// frontend/api/_auth.cjs
const { admin } = require("./_admin.js");

async function authenticate(req) {
  const header = req.headers?.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return null;

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    return { uid: decoded.uid, email: decoded.email || "" };
  } catch (err) {
    console.error("Auth error:", err);
    return null;
  }
}

module.exports = { authenticate };
