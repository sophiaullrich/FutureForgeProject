// src/teams-page/TeamsService.js
import { auth, db } from "../Firebase";
import {
  addDoc,
  arrayUnion,
  collection,
  collectionGroup,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
  startAt,
  endAt,
  limit as qLimit,
} from "firebase/firestore";

// ---- utils ----
const emailLowerOf = (u) => (u?.email || "").trim().toLowerCase();
const isPublicTeam = (t) =>
  t?.isPublic === true || (t?.visibility || "") === "public";

// ---------- CREATE ----------
export async function createTeam({
  name,
  description = "",
  visibility = "private",
}) {
  const user = auth.currentUser;
  if (!user) throw new Error("not signed in");
  const isPublic = visibility === "public";
  const nameClean = (name || "").trim();

  const payload = {
    name: nameClean,
    nameLower: nameClean.toLowerCase(), // lowercase copy for search
    description: (description || "").trim(),
    ownerId: user.uid,
    members: [user.uid],
    visibility,
    isPublic,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const ref = await addDoc(collection(db, "teams"), payload);
  return ref.id;
}

// ---------- OBSERVE MY TEAMS  ----------
export function observeMyTeams(setTeams) {
  const user = auth.currentUser;
  if (!user) return () => {};

  const qMember = query(
    collection(db, "teams"),
    where("members", "array-contains", user.uid)
  );
  const qOwner = query(collection(db, "teams"), where("ownerId", "==", user.uid));

  let snapMember = null;
  let snapOwner = null;

  const apply = () => {
    const byId = new Map();
    if (snapMember)
      snapMember.forEach((d) => byId.set(d.id, { id: d.id, ...d.data() }));
    if (snapOwner)
      snapOwner.forEach((d) => byId.set(d.id, { id: d.id, ...d.data() }));

    // sort locally
    setTeams(
      Array.from(byId.values()).sort((a, b) =>
        (a.name || "").localeCompare(b.name || "")
      )
    );
  };

  const unsub1 = onSnapshot(qMember, (s) => {
    snapMember = s;
    apply();
  });
  const unsub2 = onSnapshot(qOwner, (s) => {
    snapOwner = s;
    apply();
  });

  return () => {
    unsub1 && unsub1();
    unsub2 && unsub2();
  };
}

// ---------- SEARCH PUBLIC TEAMS ----------
export async function searchPublicTeamsByName(input, limitCount = 20) {
  const qStr = (input || "").trim().toLowerCase();
  if (!qStr) return [];

  try {
    const start = qStr;
    const end = qStr + "\uf8ff";

    const base1 = query(
      collection(db, "teams"),
      where("isPublic", "==", true),
      startAt(start),
      endAt(end),
      qLimit(limitCount)
    );

    const base2 = query(
      collection(db, "teams"),
      where("visibility", "==", "public"),
      startAt(start),
      endAt(end),
      qLimit(limitCount)
    );

    const [snapA, snapB] = await Promise.all([getDocs(base1), getDocs(base2)]);
    const byId = new Map();
    [...snapA.docs, ...snapB.docs].forEach((d) =>
      byId.set(d.id, { id: d.id, ...d.data() })
    );

    const uid = auth.currentUser?.uid;
    return Array.from(byId.values()).filter(
      (t) => !Array.isArray(t.members) || !t.members.includes(uid)
    );
  } catch (e) {

  }


  const [snapA, snapB] = await Promise.all([
    getDocs(query(collection(db, "teams"), where("isPublic", "==", true))),
    getDocs(query(collection(db, "teams"), where("visibility", "==", "public"))),
  ]);
  const byId = new Map();
  [...snapA.docs, ...snapB.docs].forEach((d) =>
    byId.set(d.id, { id: d.id, ...d.data() })
  );

  const uid = auth.currentUser?.uid;
  const all = Array.from(byId.values()).filter(
    (t) => !Array.isArray(t.members) || !t.members.includes(uid)
  );

  return all
    .filter((t) =>
      ((t.nameLower || t.name || "").toLowerCase() || "").includes(qStr)
    )
    .slice(0, limitCount);
}

// ---------- INVITES ----------
export async function inviteMember({ teamId, inviteeEmail }) {
  const me = auth.currentUser;
  if (!me) throw new Error("not signed in");
  if (!teamId || !inviteeEmail) throw new Error("missing fields");

  const emailLower = inviteeEmail.trim().toLowerCase();

  const teamRef = doc(db, "teams", teamId);
  const teamSnap = await getDoc(teamRef);
  if (!teamSnap.exists()) throw new Error("team not found");

  await setDoc(
    doc(db, "teams", teamId, "invites", emailLower),
    {
      teamId,
      emailLower,
      fromId: me.uid,
      createdAt: serverTimestamp(),
    },
    { merge: true }
  );

  await setDoc(
    doc(db, "invites", `${teamId}:${emailLower}`),
    {
      teamId,
      emailLower,
      fromId: me.uid,
      createdAt: serverTimestamp(),
    },
    { merge: true }
  );
}

// ---------- OBSERVE INVITES  ----------
export function observeMyInvites(setInvites) {
  const user = auth.currentUser;
  if (!user) return () => {};
  const emailLower = emailLowerOf(user);
  if (!emailLower) return () => {};

  const qInv = query(
    collection(db, "invites"),
    where("emailLower", "==", emailLower)
  );

  const unsub = onSnapshot(qInv, (snap) => {
    const list = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .sort(
        (a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0)
      );
    setInvites(list);
  });
  return unsub;
}

// ---------- JOIN, ADD, DELETE ----------
export async function joinPublicTeam({ teamId }) {
  const user = auth.currentUser;
  if (!user) throw new Error("not signed in");

  const teamRef = doc(db, "teams", teamId);
  const snap = await getDoc(teamRef);
  if (!snap.exists()) throw new Error("team not found");

  const data = snap.data() || {};
  const members = Array.isArray(data.members) ? data.members : [];
  if (members.includes(user.uid)) return;

  if (!isPublicTeam(data)) throw new Error("This team is private.");

  await updateDoc(teamRef, {
    members: arrayUnion(user.uid),
    updatedAt: serverTimestamp(),
  });
}

export async function addMembers({ teamId, memberUids = [] }) {
  if (!auth.currentUser) throw new Error("not signed in");
  if (!teamId || memberUids.length === 0) return;

  const ref = doc(db, "teams", teamId);
  await updateDoc(ref, {
    members: arrayUnion(...memberUids),
    updatedAt: serverTimestamp(),
  });
}

export async function deleteTeam({ teamId }) {
  if (!auth.currentUser) throw new Error("not signed in");
  if (!teamId) return;

  const qInvForTeam = query(
    collection(db, "invites"),
    where("teamId", "==", teamId)
  );
  const snap = await getDocs(qInvForTeam);
  const batch = writeBatch(db);
  snap.forEach((d) => batch.delete(doc(db, "invites", d.id)));
  await batch.commit();

  await deleteDoc(doc(db, "teams", teamId));
}
