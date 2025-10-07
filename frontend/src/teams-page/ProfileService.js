// service for managing user profiles
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

// make sure current user has a profile in /profiles/{uid}
export async function ensureProfile() {
  const user = auth.currentUser;
  if (!user) throw new Error("not signed in");

  const { uid, email, displayName, photoURL } = user;
  const ref = doc(db, "profiles", uid);
  const snap = await getDoc(ref);

  const base = {
    uid,
    email: (email || "").toLowerCase(),
    displayName: displayName || email || uid,
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
    await setDoc(ref, base, { merge: true });
  }

  return ref;
}

// list all user profiles for member picking
export async function listProfiles() {
  const q = query(collection(db, "profiles"), orderBy("email"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const x = d.data() || {};
    return {
      id: d.id,
      ...x,
      displayName: x.displayName || x.email || d.id,
    };
  });
}

// get signed-in user’s profile data
export async function getMyProfile() {
  const user = auth.currentUser;
  if (!user) throw new Error("not signed in");
  const ref = doc(db, "profiles", user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  const x = snap.data() || {};
  return { id: snap.id, ...x, displayName: x.displayName || x.email || snap.id };
}

// update signed-in user’s profile (only allowed fields)
export async function updateMyProfile(patch = {}) {
  const user = auth.currentUser;
  if (!user) throw new Error("not signed in");
  const ref = doc(db, "profiles", user.uid);

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

// admin function: add many profiles at once
export async function bulkUpsertProfiles(users = []) {
  const me = auth.currentUser;
  if (!me) throw new Error("not signed in");

  // only allowed for admins
  const adminEmails = ["sophia@uhl.co.nz"]; // edit if needed
  if (!adminEmails.includes((me.email || "").toLowerCase())) {
    throw new Error("forbidden: admin only");
  }

  if (!Array.isArray(users) || users.length === 0) return;

  const batch = writeBatch(db);

  users.forEach((u) => {
    const uid = u?.uid;
    const email = (u?.email || "").trim();
    if (!uid || !email) return;

    const ref = doc(db, "profiles", uid);
    batch.set(
      ref,
      {
        uid,
        email,
        displayName: u.displayName || email || uid,
        nameLower: (u.displayName || email || uid).toLowerCase(),
        photoURL: u.photoURL || "",
        updatedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
      },
      { merge: true }
    );
  });

  // make callable from browser console
  if (typeof window !== "undefined") {
    window.bulkUpsertProfiles = bulkUpsertProfiles;
  }

  await batch.commit();
}
