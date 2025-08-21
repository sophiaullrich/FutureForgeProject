// frontend/src/teams-page/TeamsService.js
import {
  addDoc,
  arrayUnion,
  collection,
  collectionGroup,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { auth, db } from "../Firebase"; // <- keep this path/case

function requireUser() {
  const u = auth.currentUser;
  if (!u) throw new Error("Not signed in");
  return u;
}
const emailLower = (e) => (e || "").toLowerCase();

/** ---------------- Real-time listeners ---------------- **/

/**
 * Listen to teams where the current user is a member.
 * @param {(teams: any[]) => void} cb
 * @returns {() => void} unsubscribe
 */
export function observeMyTeams(cb) {
  const uid = requireUser().uid;
  const q = query(collection(db, "teams"), where("members", "array-contains", uid));
  return onSnapshot(q, (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
}

/**
 * Listen to invites for the current user's email (collection group).
 * @param {(invites: any[]) => void} cb
 * @returns {() => void} unsubscribe
 */
export function observeMyInvites(cb) {
  const e = emailLower(requireUser().email);
  const q = query(collectionGroup(db, "invites"), where("emailLower", "==", e));
  return onSnapshot(q, (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
}

/** ---------------- Actions ---------------- **/

/**
 * Create a new team with the signed-in user as owner and sole initial member.
 * Must satisfy Firestore rules: ownerId == uid, members includes uid, name is string.
 * @param {{name: string, description?: string}} params
 * @returns {Promise<string>} teamId
 */
export async function createTeam({ name, description = "" }) {
  const u = requireUser();
  const teamName = (name || "").trim();
  if (!teamName) throw new Error("Team name is required");

  const ref = await addDoc(collection(db, "teams"), {
    name: teamName,
    description,
    ownerId: u.uid,
    members: [u.uid],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

/**
 * Invite a member by email (stored under /teams/{id}/invites/{emailLower})
 * Only the owner is allowed by rules to create/delete invites.
 * @param {{teamId: string, inviteeEmail: string}} params
 */
export async function inviteMember({ teamId, inviteeEmail }) {
  requireUser(); // must be authed (rules also check owner)
  if (!teamId) throw new Error("teamId is required");
  const inviteId = emailLower(inviteeEmail);
  if (!inviteId) throw new Error("Invite email is required");

  const teamRef = doc(db, "teams", teamId);
  const invRef = doc(collection(teamRef, "invites"), inviteId);
  await setDoc(invRef, {
    emailLower: inviteId,
    inviterId: auth.currentUser.uid,
    teamId,
    createdAt: serverTimestamp(),
  });
}

/**
 * Accept an invite: adds the current user's UID to team.members and
 * best-effort deletes the invite doc.
 * @param {{teamId: string}} params
 */
export async function acceptInvite({ teamId }) {
  const u = requireUser();
  if (!teamId) throw new Error("teamId is required");
  const e = emailLower(u.email);

  const teamRef = doc(db, "teams", teamId);
  const invRef = doc(collection(teamRef, "invites"), e);

  // Rules only allow this if /teams/{teamId}/invites/{e} exists
  await updateDoc(teamRef, {
    members: arrayUnion(u.uid),
    updatedAt: serverTimestamp(),
  });

  // best-effort cleanup (ignore if already deleted)
  try {
    await deleteDoc(invRef);
  } catch {}
}

/**
 * Owner-only helper to add multiple members (UIDs) after creation.
 * Uses arrayUnion(...uids). Firestore rules allow owner updates.
 * @param {{teamId: string, memberUids: string[]}} params
 */
export async function addMembers({ teamId, memberUids = [] }) {
  requireUser();
  if (!teamId) throw new Error("teamId is required");
  const uids = (memberUids || []).filter(Boolean);
  if (!uids.length) return;

  await updateDoc(doc(db, "teams", teamId), {
    members: arrayUnion(...uids),
    updatedAt: serverTimestamp(),
  });
}

/**
 * Update team details (name/description). Owner-only per rules.
 * @param {{teamId: string, name?: string, description?: string}} params
 */
export async function updateTeamDetails({ teamId, name, description }) {
  if (!teamId) throw new Error("teamId is required");
  const patch = {
    updatedAt: serverTimestamp(),
  };
  if (name != null) patch.name = name;
  if (description != null) patch.description = description;
  await updateDoc(doc(db, "teams", teamId), patch);
}

/**
 * Delete a team and its invites (owner-only per rules).
 * @param {{teamId: string}} params
 */
export async function deleteTeam({ teamId }) {
  if (!teamId) throw new Error("teamId is required");
  const teamRef = doc(db, "teams", teamId);

  // Delete invites subcollection in a batch
  const invSnap = await getDocs(collection(teamRef, "invites"));
  const batch = writeBatch(db);
  invSnap.docs.forEach((d) => batch.delete(d.ref));
  batch.delete(teamRef);
  await batch.commit();
}
