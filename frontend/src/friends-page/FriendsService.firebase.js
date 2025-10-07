// Firebase-powered FriendsService (Firestore).
// Requires: db, auth from your Firebase config.
import { auth, db } from "../Firebase";
import {
  addDoc, collection, deleteDoc, doc, getDoc, getDocs,
  onSnapshot, orderBy, query, serverTimestamp, updateDoc, where,
  writeBatch, limit
} from "firebase/firestore";

function meId() {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("Not signed in");
  return uid;
}

// ---- helpers ----
async function getProfile(uid) {
  const snap = await getDoc(doc(db, "profiles", uid));
  if (!snap.exists()) return { id: uid, displayName: "Unknown", email: "" };
  return { id: uid, ...snap.data() };
}
function toUserCard(p) {
  return { id: p.id, name: p.displayName || p.name || "Unknown", email: p.email || "" };
}
function prefixRange(val) {
  const q = (val || "").trim().toLowerCase();
  if (!q) return null;
  return { gte: q, lt: q + "\uf8ff" };
}

const FriendsService = {
  // --- SEARCH real users by name/email (prefix) ---
  async search(queryStr) {
    const my = meId();
    const rng = prefixRange(queryStr);
    let nameMatches = [], emailMatches = [];

    if (rng) {
      const qName = query(
        collection(db, "profiles"),
        where("nameLower", ">=", rng.gte),
        where("nameLower", "<", rng.lt),
        limit(20)
      );
      const qEmail = query(
        collection(db, "profiles"),
        where("emailLower", ">=", rng.gte),
        where("emailLower", "<", rng.lt),
        limit(20)
      );
      const [s1, s2] = await Promise.all([getDocs(qName), getDocs(qEmail)]);
      nameMatches = s1.docs.map(d => ({ id: d.id, ...d.data() }));
      emailMatches = s2.docs.map(d => ({ id: d.id, ...d.data() }));
    } else {
      // empty query -> show a few suggestions (excluding self)
      const qAny = query(collection(db, "profiles"), orderBy("displayName"), limit(10));
      const s = await getDocs(qAny);
      nameMatches = s.docs.map(d => ({ id: d.id, ...d.data() }));
    }

    // merge & unique, drop self
    const map = new Map();
    [...nameMatches, ...emailMatches].forEach(p => {
      if (p.id !== my) map.set(p.id, p);
    });
    const candidates = [...map.values()];

    // annotate friend / pending states
    const outQ = query(collection(db, "friendRequests"),
      where("fromId", "==", my), where("status", "==", "pending"));
    const inQ = query(collection(db, "friendRequests"),
      where("toId", "==", my), where("status", "==", "pending"));
    const [outS, inS] = await Promise.all([getDocs(outQ), getDocs(inQ)]);

    const outSet = new Set(outS.docs.map(d => d.data().toId));
    const inSet  = new Set(inS.docs.map(d => d.data().fromId));

    // friends subcollection
    const friendsSnap = await getDocs(collection(db, "users", my, "friends"));
    const friendSet = new Set(friendsSnap.docs.map(d => d.id));

    return candidates.map(p => ({
      ...toUserCard(p),
      isFriend: friendSet.has(p.id),
      pendingOutgoing: outSet.has(p.id),
      pendingIncoming: inSet.has(p.id),
    }));
  },

  // --- LISTS ---
  async listFriends() {
    const my = meId();
    const s = await getDocs(collection(db, "users", my, "friends"));
    const ids = s.docs.map(d => d.id);
    if (ids.length === 0) return [];
    // Firestore 'in' supports up to 10 IDs; chunk if needed
    const chunks = [];
    for (let i = 0; i < ids.length; i += 10) chunks.push(ids.slice(i, i + 10));
    const results = [];
    for (const chunk of chunks) {
      const qx = query(collection(db, "profiles"), where("__name__", "in", chunk));
      const sx = await getDocs(qx);
      sx.forEach(d => results.push(toUserCard({ id: d.id, ...d.data() })));
    }
    return results;
  },

  async listIncoming() {
    const my = meId();
    const qx = query(
      collection(db, "friendRequests"),
      where("toId", "==", my),
      where("status", "==", "pending"),
      orderBy("createdAt", "desc")
    );
    const s = await getDocs(qx);
    const rows = await Promise.all(
      s.docs.map(async d => {
        const from = await getProfile(d.data().fromId);
        return { id: d.id, from: toUserCard(from) };
      })
    );
    return rows;
  },

  async listOutgoing() {
    const my = meId();
    const qx = query(
      collection(db, "friendRequests"),
      where("fromId", "==", my),
      where("status", "==", "pending"),
      orderBy("createdAt", "desc")
    );
    const s = await getDocs(qx);
    const rows = await Promise.all(
      s.docs.map(async d => {
        const to = await getProfile(d.data().toId);
        return { id: d.id, to: toUserCard(to) };
      })
    );
    return rows;
  },

  // --- COMMANDS ---
  async sendRequest(toUserId) {
    const my = meId();
    if (my === toUserId) throw new Error("Can't friend yourself");

    // already friends?
    const friendDoc = await getDoc(doc(db, "users", my, "friends", toUserId));
    if (friendDoc.exists()) throw new Error("Already friends");

    // pending duplicate?
    const [outS, inS] = await Promise.all([
      getDocs(query(collection(db, "friendRequests"),
        where("fromId", "==", my), where("toId", "==", toUserId), where("status", "==", "pending"))),
      getDocs(query(collection(db, "friendRequests"),
        where("fromId", "==", toUserId), where("toId", "==", my), where("status", "==", "pending"))),
    ]);
    if (!outS.empty) throw new Error("Request already pending");
    if (!inS.empty) throw new Error("They already requested you");

    await addDoc(collection(db, "friendRequests"), {
      fromId: my,
      toId: toUserId,
      status: "pending",
      createdAt: serverTimestamp(),
    });
    return { ok: true };
  },

  async accept(requestId) {
    const my = meId();
    const ref = doc(db, "friendRequests", requestId);
    const snap = await getDoc(ref);
    if (!snap.exists()) throw new Error("Request not found");
    const { fromId, toId, status } = snap.data();
    if (toId !== my || status !== "pending") throw new Error("Invalid request");

    const batch = writeBatch(db);
    batch.update(ref, { status: "accepted" });
    batch.set(doc(db, "users", my, "friends", fromId), { since: serverTimestamp() });
    batch.set(doc(db, "users", fromId, "friends", my), { since: serverTimestamp() });
    await batch.commit();
    return { ok: true };
  },

  async decline(requestId) {
    const my = meId();
    const ref = doc(db, "friendRequests", requestId);
    const snap = await getDoc(ref);
    if (!snap.exists()) throw new Error("Request not found");
    const { toId, status } = snap.data();
    if (toId !== my || status !== "pending") throw new Error("Invalid request");
    await updateDoc(ref, { status: "declined" });
    return { ok: true };
  },

  async cancel(requestId) {
    const my = meId();
    const ref = doc(db, "friendRequests", requestId);
    const snap = await getDoc(ref);
    if (!snap.exists()) throw new Error("Request not found");
    const { fromId, status } = snap.data();
    if (fromId !== my || status !== "pending") throw new Error("Invalid request");
    await updateDoc(ref, { status: "cancelled" });
    return { ok: true };
  },

  // --- UPDATED: split deletes with path logging to expose rule/path issues ---
  async unfriend(otherId) {
    const my = meId();
    const a = doc(db, "users", my, "friends", otherId);
    const b = doc(db, "users", otherId, "friends", my);

    try {
      await deleteDoc(a);
      console.log("Deleted A:", a.path);
    } catch (e) {
      console.error("Delete A failed:", a.path, e);
      throw e;
    }

    try {
      await deleteDoc(b);
      console.log("Deleted B:", b.path);
    } catch (e) {
      console.error("Delete B failed:", b.path, e);
      throw e;
    }

    return { ok: true };
  },
};

export default FriendsService;
