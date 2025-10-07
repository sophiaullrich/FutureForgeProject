export const avatarColors = [
  "linear-gradient(135deg, #4e54c8, #8f94fb)",
  "linear-gradient(135deg, #ff5858, #f09819)",
  "linear-gradient(135deg, #43cea2, #185a9d)",
  "linear-gradient(135deg, #56ab2f, #a8e063)",
  "linear-gradient(135deg, #ff512f, #dd2476)",
];

export function sanitizeChatKey(name) {
  return name.replace(/[.#$[\]]/g, "_");
}

export function getChatKey(userId1, userId2) {
  return [userId1, userId2].sort().join("_");
}

export function capitalize(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function normalizeUser(u) {
  if (!u) return null;
  return {
    id: u.id || u.uid || (typeof u === "string" ? u : undefined),
    name: u.name || u.displayName || u.email || (typeof u === "string" ? u : ""),
    email: u.email || "",
  };
}

export function persistMessagedUsers(list) {
  try {
    const uid = window.auth?.currentUser?.uid;
    if (!uid) return;
    localStorage.setItem(`messagedUsers_${uid}`, JSON.stringify(list || []));
  } catch {}
}

export async function addAndPersistUser(user, setMessagedUsers, auth, BACKEND_URL) {
  const norm = normalizeUser(user);
  if (!norm || !norm.id) return;
  setMessagedUsers((prev = []) => {
    if (prev.find((x) => x.id === norm.id)) return prev;
    const next = [...prev, norm];
    const uid = auth.currentUser?.uid;
    if (uid) {
      fetch(`${BACKEND_URL.replace("/messages", "")}/messagedUsers/${uid}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: norm }),
      });
    }
    return next;
  });
}