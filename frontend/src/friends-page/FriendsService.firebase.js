// frontend/src/friends-page/FriendsService.firebase.js
import { auth, db } from "../Firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  addDoc, collection, doc, getDoc, getDocs, orderBy, query,
  serverTimestamp, updateDoc, where, writeBatch, limit
} from "firebase/firestore";

/** Wait until Firebase Auth delivers a user (or timeout). */
async function waitForUser(timeoutMs = 8000) {
  // fast path
  if (auth.currentUser) return auth.currentUser;

  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      off();
      resolve(null); // resolve null on timeout; caller will throw a friendly error
    }, timeoutMs);

    const off = onAuthStateChanged(auth, (u) => {
      if (u) {
        clearTimeout(timer);
        off();
        resolve(u);
      }
      // if u is null, keep waiting — auth may not be hydrated yet
    });
  });
}

async function meId() {
  const u = await waitForUser();
  if (!u?.uid) throw new Error("Not signed in");
  return u.uid;
}

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
  async search(queryStr) {
    const my = await meId();
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
      const qAny = query(collection(db, "profiles"), orderBy("displayName"), limit(10));
      const s = await getDocs(qAny);
      nameMatches = s.docs.map(d => ({ id: d.id, ...d.data() }));
    }

    const map = new Map();
    [...nameMatches, ...emailMatches].forEach(p => { if (p.id !== my) map.set(p.id, p); });
    const candidates = [...map.values()];

    const outQ = query(collection(db, "friendRequests"),
      where("fromId", "==", my), where("status", "==", "pending"));
    const inQ = query(collection(db, "friendRequests"),
      where("toId", "==", my), where("status", "==", "pending"));
    const [outS, inS] = await Promise.all([getDocs(outQ), getDocs(inQ)]);
    const outSet = new Set(outS.docs.map(d => d.data().toId));
    const inSet  = new Set(inS.docs.map(d => d.data().fromId));

    const friendsSnap = await getDocs(collection(db, "users", my, "friends"));
    const friendSet = new Set(friendsSnap.docs.map(d => d.id));

    return candidates.map(p => ({
      ...toUserCard(p),
      isFriend: friendSet.has(p.id),
      pendingOutgoing: outSet.has(p.id),
      pendingIncoming: inSet.has(p.id),
    }));
  },

  async listFriends() {
    const my = await meId();
    const s = await getDocs(collection(db, "users", my, "friends"));
    const ids = s.docs.map(d => d.id);
    if (ids.length === 0) return [];
    const results = [];
    for (let i = 0; i < ids.length; i += 10) {
      const chunk = ids.slice(i, i + 10);
      const qx = query(collection(db, "profiles"), where("__name__", "in", chunk));
      const sx = await getDocs(qx);
      sx.forEach(d => results.push(toUserCard({ id: d.id, ...d.data() })));
    }
    return results;
  },

  async listIncoming() {
    const my = await meId();
    const qx = query(
      collection(db, "friendRequests"),
      where("toId", "==", my),
      where("status", "==", "pending"),
      orderBy("createdAt", "desc")
    );
    const s = await getDocs(qx);
    return Promise.all(
      s.docs.map(async d => {
        const from = await getProfile(d.data().fromId);
        return { id: d.id, from: toUserCard(from) };
      })
    );
  },

  async listOutgoing() {
    const my = await meId();
    const qx = query(
      collection(db, "friendRequests"),
      where("fromId", "==", my),
      where("status", "==", "pending"),
      orderBy("createdAt", "desc")
    );
    const s = await getDocs(qx);
    return Promise.all(
      s.docs.map(async d => {
        const to = await getProfile(d.data().toId);
        return { id: d.id, to: toUserCard(to) };
      })
    );
  },

  async sendRequest(toUserId) {
    const my = await meId();
    if (my === toUserId) throw new Error("Can't friend yourself");

    const friendDoc = await getDoc(doc(db, "users", my, "friends", toUserId));
    if (friendDoc.exists()) throw new Error("Already friends");

    const [outS, inS] = await Promise.all([
      getDocs(query(collection(db, "friendRequests"),
        where("fromId", "==", my), where("toId", "==", toUserId), where("status", "==", "pending"))),
      getDocs(query(collection(db, "friendRequests"),
        where("fromId", "==", toUserId), where("toId", "==", my), where("status", "==", "pending")))
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
    const my = await meId();
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
    const my = await meId();
    const ref = doc(db, "friendRequests", requestId);
    const snap = await getDoc(ref);
    if (!snap.exists()) throw new Error("Request not found");
    const { toId, status } = snap.data();
    if (toId !== my || status !== "pending") throw new Error("Invalid request");
    await updateDoc(ref, { status: "declined" });
    return { ok: true };
  },

  async cancel(requestId) {
    const my = await meId();
    const ref = doc(db, "friendRequests", requestId);
    const snap = await getDoc(ref);
    if (!snap.exists()) throw new Error("Request not found");
    const { fromId, status } = snap.data();
    if (fromId !== my || status !== "pending") throw new Error("Invalid request");
    await updateDoc(ref, { status: "cancelled" });
    return { ok: true };
  },

  async unfriend(otherId) {
    const my = await meId();
    const batch = writeBatch(db);
    batch.delete(doc(db, "users", my, "friends", otherId));
    batch.delete(doc(db, "users", otherId, "friends", my));
    await batch.commit();
    return { ok: true };
  },
};

export default FriendsService;
