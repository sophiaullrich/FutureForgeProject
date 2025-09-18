// src/teams-page/ProfileService.js
import { auth, db } from "../Firebase";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  collection,
  getDocs,
  orderBy,
  query,
  writeBatch,
} from "firebase/firestore";

/**
 * Ensure the current user has a profile document at /profiles/{uid}.
 * Creates it if missing; otherwise merges minimal updates (displayName/photo).
 * Returns the profile doc reference.
 */
export async function ensureProfile() {
  const user = auth.currentUser;
  if (!user) throw new Error("Not signed in");

  const { uid, email, displayName, photoURL } = user;
  const ref = doc(db, "profiles", uid);
  const snap = await getDoc(ref);

  const base = {
    uid,
    email: email || "",                           // keep original casing for display
    emailLower: (email || "").toLowerCase(),      // for ordering/search
    displayName: displayName || email || uid,     // never blank
    photoURL: photoURL || "",
    updatedAt: serverTimestamp(),
  };

  if (!snap.exists()) {
    await setDoc(
      ref,
      {
        ...base,
        createdAt: serverTimestamp(),
      },
      { merge: true }
    );
  } else {
    // keep createdAt, update basic fields
    await setDoc(ref, base, { merge: true });
  }

  return ref;
}

/**
 * List all user profiles for member picking.
 * Requires Firestore rules to allow read on /profiles/** for authed users.
 * Orders by emailLower so everyone sorts predictably even if displayName is missing.
 * @returns {Promise<Array<{id: string, uid: string, displayName?: string, email?: string, photoURL?: string}>>}
 */
export async function listProfiles() {
  const q = query(collection(db, "profiles"), orderBy("emailLower"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const x = d.data() || {};
    return {
      id: d.id,
      ...x,
      displayName: x.displayName || x.email || d.id, // defensive fallback
    };
  });
}

/**
 * Get the signed-in user’s profile data (or null if not found).
 * @returns {Promise<{id: string} & Record<string, any> | null>}
 */
export async function getMyProfile() {
  const user = auth.currentUser;
  if (!user) throw new Error("Not signed in");
  const ref = doc(db, "profiles", user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  const x = snap.data() || {};
  return { id: snap.id, ...x, displayName: x.displayName || x.email || snap.id };
}

/**
 * Update the signed-in user’s profile document with a partial patch.
 * Only whitelisted fields are allowed by default for safety.
 * @param {{displayName?: string, photoURL?: string, bio?: string}} patch
 */
export async function updateMyProfile(patch = {}) {
  const user = auth.currentUser;
  if (!user) throw new Error("Not signed in");
  const ref = doc(db, "profiles", user.uid);

  // Whitelist to avoid accidental overwrites
  const allowed = ["displayName", "photoURL", "bio"];
  const safePatch = Object.fromEntries(
    Object.entries(patch).filter(([k, v]) => allowed.includes(k) && v != null)
  );

  if (Object.keys(safePatch).length === 0) return;

  await updateDoc(ref, {
    ...safePatch,
    updatedAt: serverTimestamp(),
  });
}

/**
 * ONE-TIME BACKFILL: upsert many profiles into /profiles so your picker shows
 * everyone who has *ever* had an account. Call it once from the console.
 *
 * Usage in DevTools (while signed in as an allowed admin):
 *
 *   import { bulkUpsertProfiles } from "/src/teams-page/ProfileService.js"; // adjust path if needed
 *   const users = [
 *     { uid: "abc123", email: "alex@example.com", displayName: "Alex" },
 *     { uid: "def456", email: "bella@example.com" },
 *     // ...
 *   ];
 *   await bulkUpsertProfiles(users);
 */
export async function bulkUpsertProfiles(users = []) {
  const me = auth.currentUser;
  if (!me) throw new Error("Not signed in");

  // Guard to prevent random users from running this in prod.
  const adminEmails = ["sophia@uhl.co.nz"]; // <-- edit if you have more admins
  if (!adminEmails.includes((me.email || "").toLowerCase())) {
    throw new Error("Forbidden: admin only");
  }

  if (!Array.isArray(users) || users.length === 0) return;

  const batch = writeBatch(db);

  users.forEach((u) => {
    const uid = u?.uid;
    const email = (u?.email || "").trim();
    if (!uid || !email) return; // need both

    const ref = doc(db, "profiles", uid);
    batch.set(
      ref,
      {
        uid,
        email,
        emailLower: email.toLowerCase(),
        displayName: u.displayName || email || uid,
        photoURL: u.photoURL || "",
        updatedAt: serverTimestamp(),
        createdAt: serverTimestamp(), // merge keeps existing createdAt if present
      },
      { merge: true }
    );
  });

if (typeof window !== "undefined") {
  window.bulkUpsertProfiles = bulkUpsertProfiles;
}


  await batch.commit();
}
