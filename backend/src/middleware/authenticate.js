const { admin } = require("../firebase");

async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.warn("No Authorization header or wrong format:", authHeader);
    return res.status(401).json({ error: "Unauthorized" });
  }

  const idToken = authHeader.split(" ")[1]; 

  if (!idToken) {
    console.warn("Bearer token missing in header:", authHeader);
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken; 
    console.log("Authenticated user:", decodedToken.uid, decodedToken.email);
    next();
  } catch (error) {
    console.error("Token verification failed:", error);
    return res.status(401).json({ error: "Invalid token" });
  }
}

module.exports = { authenticate };
