import React, { useState, useEffect, useCallback, useRef } from "react";
import { db, auth } from "../Firebase";
import {
  collection as fsCollection,
  collectionGroup as fsCollectionGroup,
  query as fsQuery,
  orderBy as fsOrderBy,
  onSnapshot,
  getDocs,
  limit,
  where,
  doc,
  getDoc,
  addDoc
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import MessageModal from "./MessageModal";
import ChatSidebar from "./ChatSidebar";
import { ForumModal, JoinForumModal } from "./ForumModal";
import {
  getChatKey,
  capitalize,
  persistMessagedUsers,
  addAndPersistUser
} from "./chatUtils";
import "./chat.css";
import { useLocation } from "react-router-dom";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5001";
const BACKEND_URL = `${BASE_URL}/api/chat/messages`;

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChat, setSelectedChat] = useState(null);
  const location = useLocation();
  const [userResults, setUserResults] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [messagedUsers, setMessagedUsers] = useState([]);
  const [showForumModal, setShowForumModal] = useState(false);
  const [selectedForum, setSelectedForum] = useState(null);
  const [groupChats, setGroupChats] = useState([]);
  const [unreadChats, setUnreadChats] = useState(new Set());
  const [lastSeen, setLastSeen] = useState({});
  const lastSeenRef = useRef({});
  const [lastSeenReady, setLastSeenReady] = useState(false);
  const [lastActivity, setLastActivity] = useState({});

  const tsNum = (t) => typeof t === "number" ? t : (t?.toMillis?.() || 0);

  // flush lastSeen when tab is hidden or page is unloaded
  useEffect(() => {
  const handleFlushSeen = () => {
    const id = selectedChat?.id;
    if (!id) return;

    // compute a safe "latest we've seen" value
    const newestLocalTs =
      messages && messages.length
        ? tsNum(messages[0]?.timestamp)
        : 0;

    const prevSeen = Number(lastSeenRef.current?.[id] || 0);
    const ts = Math.max(prevSeen, newestLocalTs, Date.now());

    setLastSeen((prev) => {
      const next = { ...(prev || {}), [id]: ts };
      lastSeenRef.current = next;
      const uid = auth.currentUser?.uid;
      if (uid) { try { localStorage.setItem(`lastSeen_${uid}`, JSON.stringify(next)); } catch {} }
      return next;
    });
  };

  document.addEventListener('visibilitychange', handleFlushSeen);
  window.addEventListener('beforeunload', handleFlushSeen);
  return () => {
    document.removeEventListener('visibilitychange', handleFlushSeen);
    window.removeEventListener('beforeunload', handleFlushSeen);
  };
}, [selectedChat, messages]);

  // load from local storage when user logs in and out
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        const raw = localStorage.getItem(`lastSeen_${user.uid}`);
        let next = {};
        try { next = raw ? JSON.parse(raw) : {};} catch {next = {}; } 
        lastSeenRef.current = next;
        setLastSeen(next);
        setLastSeenReady(true);
        console.log('[lastSeen load]', { uid: user.uid, lastSeen: next });
      } else {
        lastSeenRef.current = {};
        setLastSeen({});
        setLastSeenReady(true); // to avoid blocking initial load
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    lastSeenRef.current = lastSeen || {};
  }, [lastSeen]);

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    try { localStorage.setItem(`lastSeen_${uid}`, JSON.stringify(lastSeen)); } catch {}
  }, [lastSeen]);

  // Fetch group chats when auth is ready
  useEffect(() => {
    let unsubTeams;
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setGroupChats([]);
        if (unsubTeams) unsubTeams();
        return;
      }
      const q = fsQuery(
        fsCollection(db, "teams"),
        where("members", "array-contains", user.uid)
      );
      unsubTeams?.();
      unsubTeams = onSnapshot(q, (snap) => {
        setGroupChats(
          snap.docs.map((d) => ({
            id: d.id,
            name: d.data().name,
            members: d.data().members,
            isGroup: true,
          }))
        );
      });
    });
    return () => {
      unsubAuth();
      unsubTeams && unsubTeams();
    };
  }, []);

  // Restore messaged users and last selected chat
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        const key = `messagedUsers_${user.uid}`;
        const raw = localStorage.getItem(key);
        if (raw) {
          try {
            setMessagedUsers(JSON.parse(raw));
          } catch {
            setMessagedUsers([]);
          }
        }
        (async () => {
          try {
            const last = localStorage.getItem(`lastSelectedChat_${user.uid}`);
            if (!last) return;
            const parsed = JSON.parse(last);
            if (!parsed || !parsed.id) return;
            const inList = (raw ? JSON.parse(raw) : []).find((u) => u.id === parsed.id);
            if (inList) {
              setSelectedChat(inList);
              return;
            }
            try {
              const snap = await getDoc(doc(db, "profiles", parsed.id));
              const p = snap.data() || {};
              setSelectedChat({
                id: parsed.id,
                name: p.displayName ? p.displayName.split(" ")[0] : (p.email ? p.email.split("@")[0] : parsed.id),
                email: p.email || "",
              });
            } catch {
              setSelectedChat({
                id: parsed.id,
                name: parsed.name || parsed.id,
                email: parsed.email || "",
              });
            }
          } catch {}
        })();
      } else {
        setMessagedUsers([]);
      }
    });
    return () => unsub();
  }, []);

  // Try to load messaged users from backend
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const res = await fetch(`${BACKEND_URL.replace("/messages", "")}/messagedUsers/${user.uid}`);
          if (res.ok) setMessagedUsers(await res.json());
        } catch {
          setMessagedUsers([]);
        }
      } else {
        setMessagedUsers([]);
      }
    });
    return () => unsub();
  }, []);

  // Persist messaged users locally
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;
    persistMessagedUsers(messagedUsers);
  }, [messagedUsers]);

  // Persist last selected chat
  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    if (!selectedChat) {
      localStorage.removeItem(`lastSelectedChat_${uid}`);
    } else {
      localStorage.setItem(`lastSelectedChat_${uid}`, JSON.stringify(selectedChat));
    }
  }, [selectedChat]);

  // list for testing purposes
  const chatList = [];

  // Live messages listener for selected chat
  useEffect(() => {
    if (!selectedChat?.id || !auth.currentUser) return;
    const myId = auth.currentUser.uid;

    if (selectedChat.isGroup) {
      const q = fsQuery(
        fsCollection(db, "groupMessages", selectedChat.id, "items"),
        fsOrderBy("timestamp", "desc")
      );
      const unsub = onSnapshot(q, (snap) => {
        if (snap.empty) return; 
        const msg = snap.docs[0].data() || {};
        setMessages(snap.docs.map((doc) => doc.data()));
        // while group chat is OPEN, mark lastSeen to newest group message ts
        const ts = typeof msg.timestamp === "number"
          ? msg.timestamp
          : (msg.timestamp?.toMillis?.() || 0);
        if (ts) {
          setLastSeen((prev) => {
            const prevVal = prev?.[selectedChat.id] || 0;
            if (prevVal >= ts) return prev;
            const next = { ...(prev || {}), [selectedChat.id]: ts };
            lastSeenRef.current = next;
            const uid = auth.currentUser?.uid;
            if (uid) { try { localStorage.setItem(`lastSeen_${uid}`, JSON.stringify(next)); } catch {} }
            return next;
          });
          setUnreadChats((prev) => {
            const s = new Set(prev instanceof Set ? prev : []);
            s.delete(selectedChat.id);
            return s;
          });
        }
      });
      return () => unsub();
    } else {
      const otherId = selectedChat.id;
      const chatKey = getChatKey(myId, otherId);
      const q = fsQuery(
        fsCollection(db, "messages", chatKey, "items"),
        fsOrderBy("timestamp", "desc")
      );
      const unsub = onSnapshot(q, (snap) => {
        let loaded = snap.docs.map((doc) => doc.data());
        loaded = loaded.filter(
          (msg) =>
            (msg.from === myId && msg.to === otherId) ||
            (msg.from === otherId && msg.to === myId)
        );
        setMessages(loaded);
      // while chat is OPEN, mark lastSeen to the newest message ts we actually have
      if (!snap.empty) {
        const latest = snap.docs[0].data() || {};
        const ts = typeof latest.timestamp === "number"
          ? latest.timestamp
          : (latest.timestamp?.toMillis?.() || 0);
        if (ts) {
          setLastSeen((prev) => {
            const prevVal = prev?.[otherId] || 0;
            if (prevVal >= ts) return prev; // already newer
            const next = { ...(prev || {}), [otherId]: ts };
            lastSeenRef.current = next;
            const uid = auth.currentUser?.uid;
            if (uid) { try { localStorage.setItem(`lastSeen_${uid}`, JSON.stringify(next)); } catch {} }
            return next;
          });
          // also ensure the dot is cleared for the open chat
          setUnreadChats((prev) => {
            const s = new Set(prev instanceof Set ? prev : []);
            s.delete(otherId);
            return s;
          });
        }
      }
      });
      return () => unsub();
    }
  }, [selectedChat]);

  // latest message listener
  useEffect(() => {
  const me = auth.currentUser;
  if (!me || !lastSeenReady) return;
  const myId = me.uid;

  const unsubs = [];

  const pushUnsub = (fn) => {
    if (typeof fn === "function") unsubs.push(fn);
  };

  // dm latest message
  (Array.isArray(messagedUsers) ? messagedUsers : []).forEach((u) => {
    const otherId = u && u.id;
    if (!otherId) return;

    const chatKey = getChatKey(myId, otherId);
    const q = fsQuery(
      fsCollection(db, "messages", chatKey, "items"),
      fsOrderBy("timestamp", "desc"),
      limit(1) 
    );

    const unsub = onSnapshot(q, (snap) => {
      if (snap.empty) return;
      const msg = snap.docs[0].data() || {};
      const isOpen = Boolean(
        selectedChat &&
        !selectedChat.isGroup &&
        selectedChat.id &&
        selectedChat.id === otherId
      );

      const ts = typeof msg.timestamp === "number" ? msg.timestamp : (msg.timestamp?.toMillis?.() || 0);
      // update last activity for sorting (regardless of who sent it)
      setLastActivity((prev) => ({ ...(prev || {}), [otherId]: Math.max(prev?.[otherId] || 0, ts) }));
      const iReceivedIt = msg.to === myId && msg.from !== myId;
      const last = Number(lastSeenRef.current?.[otherId] || 0);
      const isNewSinceLastSeen = ts > last;
      console.log('[DM latest]', {
        chatId: otherId, ts, lastSeen: last, isOpen, iReceivedIt, isNewSinceLastSeen
      });

      setUnreadChats((prev) => {
        const next = new Set(prev instanceof Set ? prev : []);
        if (iReceivedIt && !isOpen && isNewSinceLastSeen) next.add(otherId);
        else next.delete(otherId);        // if open, ensure it's cleared
        if (iReceivedIt && !isOpen && isNewSinceLastSeen) {
          console.log('[DM -> ADD dot]', { chatId: otherId });
          next.add(otherId);
        } else {
          console.log('[DM -> CLEAR dot]', { chatId: otherId });
          next.delete(otherId);
        }
        return next;
      });
    });

    pushUnsub(unsub);
  });

  // group latest message
  (Array.isArray(groupChats) ? groupChats : []).forEach((g) => {
    const groupId = g && g.id;
    if (!groupId) return;

    const q = fsQuery(
      fsCollection(db, "groupMessages", groupId, "items"),
      fsOrderBy("timestamp", "desc"),
      limit(1)
    );

    const unsub = onSnapshot(q, (snap) => {
      if (snap.empty) return;
      const msg = snap.docs[0].data() || {};
      const isOpen = Boolean(
      selectedChat &&
      selectedChat.isGroup &&
      selectedChat.id &&
      selectedChat.id === groupId
    );

    const ts = typeof msg.timestamp === "number" ? msg.timestamp : (msg.timestamp?.toMillis?.() || 0);
    // update last activity for sorting
    setLastActivity((prev) => ({ ...(prev || {}), [groupId]: Math.max(prev?.[groupId] || 0, ts) }));
    const iSentIt = msg.from === myId;
    const last = Number(lastSeenRef.current?.[groupId] || 0);
    const isNewSinceLastSeen = ts > last;
    console.log('[GROUP latest]', {
      chatId: groupId, ts, lastSeen: last, isOpen, iSentIt, isNewSinceLastSeen
    });
    
    setUnreadChats((prev) => {
      const next = new Set(prev instanceof Set ? prev : []);
      if (!iSentIt && !isOpen && isNewSinceLastSeen) next.add(groupId);
      else next.delete(groupId);        // if open, ensure it's cleared
      if (!iSentIt && !isOpen && isNewSinceLastSeen) {
       console.log('[GROUP -> ADD dot]', { chatId: groupId });
       next.add(groupId);
     } else {
       console.log('[GROUP -> CLEAR dot]', { chatId: groupId });
       next.delete(groupId);
     }
      return next;
    });
    });

    pushUnsub(unsub);
  });

  return () => {
    // Only call if it's actually a function
    unsubs.forEach((u) => { try { typeof u === "function" && u(); } catch {} });
  };
}, [auth.currentUser?.uid, lastSeenReady, messagedUsers, groupChats, selectedChat]);

// for clearing unread when chat is opened
  // when a chat is opened, mark as seen using the newest known ts (or now if empty)
  // and persist immediately
useEffect(() => {
  if (!selectedChat?.id) return;
  const id = selectedChat.id;

  const newestLocalTs =
    messages && messages.length
      ? (typeof messages[0]?.timestamp === "number"
          ? messages[0].timestamp
          : (messages[0]?.timestamp?.toMillis?.() || 0))
      : 0;

  const ts = newestLocalTs || Date.now();

  // persist lastSeen immediately (state + ref + localStorage)
  setLastSeen((prev) => {
    const next = { ...(prev || {}), [id]: ts };
    lastSeenRef.current = next;
    const uid = auth.currentUser?.uid;
    if (uid) {
      try { localStorage.setItem(`lastSeen_${uid}`, JSON.stringify(next)); } catch {}
    }
    return next;
  });

  // clear the blue dot for the open chat
  setUnreadChats((prev) => {
    const s = new Set(prev instanceof Set ? prev : []);
    s.delete(id);
    return s;
  });
}, [selectedChat, messages]);


  useEffect(() => {
  if (!lastSeenReady) return;
  setUnreadChats((prev) => {
    const next = new Set(prev instanceof Set ? prev : []);
    console.log('[reconcile before]', Array.from(next));
    for (const id of Array.from(next)) {
      const last = Number(lastSeenRef.current?.[id] || 0);
      const act  = Number(lastActivity[id] || 0);
      console.log('[reconcile check]', { id, act, last, willClear: act <= last });
      if (act <= last) next.delete(id); // already seen
    }
    console.log('[reconcile after]', Array.from(next));
    return next;
  });
}, [lastSeenReady, lastActivity]);

  // Auto-add inbound DM senders to my chat list
  const inboundRef = useRef(null);
  useEffect(() => {
  const me = auth.currentUser;
    if (!me) return;
    if (inboundRef.current) return; // already listening
    const myId = me.uid;
 
    const q = fsQuery(
      fsCollectionGroup(db, "items"), // groups dms, but the 'to' filter means DMs only
      where("to", "==", myId),
      fsOrderBy("timestamp", "desc"),
      limit(50)
    );
  
    const unsub = onSnapshot(q, async (snap) => {
      const current = new Set((messagedUsers || []).map(u => u.id));
      const candidates = new Map(); // fromId -> latest ts
  
      snap.docs.forEach((d) => {
        // ensure it's under root 'messages' (not groupMessages)
        const isDMItem = d.ref.parent?.parent?.parent?.id === "messages";
        if (!isDMItem) return;
        const m = d.data() || {};
        const fromId = m.from;
        if (!fromId || fromId === myId || current.has(fromId)) return;
        const ts = typeof m.timestamp === "number" ? m.timestamp : (m.timestamp?.toMillis?.() || 0);
        const prev = candidates.get(fromId) || 0;
        if (ts > prev) candidates.set(fromId, ts);
      });
  
      if (candidates.size === 0) return;
  
      // Optimistically stamp lastActivity so they sort to the top immediately
      setLastActivity((prev) => {
        const next = { ...(prev || {}) };
        for (const [fromId, ts] of candidates) {
          next[fromId] = Math.max(next[fromId] || 0, ts);
        }
       return next;
     });
 
     // Fetch minimal profile and add
     for (const [fromId] of candidates) {
       try {
         const pSnap = await getDoc(doc(db, "profiles", fromId));
         const p = pSnap.exists() ? pSnap.data() : {};
         const name = p.firstName
           ? `${capitalize(p.firstName)}${p.lastName ? " " + capitalize(p.lastName) : ""}` : (p.email || fromId);
           addAndPersistUser({ id: fromId, name, email: p.email || "" }, setMessagedUsers, auth, BACKEND_URL);
        } catch {
          addAndPersistUser({ id: fromId, name: fromId, email: "" }, setMessagedUsers, auth, BACKEND_URL);
        }
      }
    });
  
    inboundRef.current = unsub;
    return () => { try { inboundRef.current?.(); } catch {} inboundRef.current = null; };
  }, [auth.currentUser?.uid]); // note: not dependent on messagedUsers to avoid resubscribing

  // Search users
  useEffect(() => {
    let ignore = false;
    async function searchUsers(qstr) {
      if (!qstr || qstr.trim() === "") return [];
      const q = (qstr || "").trim().toLowerCase();
      try {
        const snapAll = await getDocs(fsCollection(db, "profiles"));
        const results = [];
        for (const d of snapAll.docs) {
          if (d.id === auth.currentUser?.uid) continue;
          const p = d.data() || {};
          const email = (p.email || "").toLowerCase();
          const firstName = (p.firstName || "").toLowerCase();
          const lastName = (p.lastName || "").toLowerCase();
          if (email.includes(q) || firstName.includes(q) || lastName.includes(q)) {
            results.push({
              id: d.id,
              name: p.firstName
                ? `${capitalize(p.firstName)}${p.lastName ? " " + capitalize(p.lastName) : ""}`
                : p.email || d.id,
              email: p.email || "",
            });
          }
        }
        return results;
      } catch {
        return [];
      }
    }

    let cancelled = false;
    (async () => {
      if (searchQuery.trim() === "") {
        setLoadingUsers(true);
        try {
          const snap = await getDocs(
            fsQuery(fsCollection(db, "profiles"), fsOrderBy("email"), limit(100))
          );
          const results = snap.docs
            .filter((d) => d.id !== auth.currentUser?.uid)
            .map((d) => {
              const p = d.data() || {};
              return {
                id: d.id,
                name: p.firstName
                  ? `${capitalize(p.firstName)}${p.lastName ? " " + capitalize(p.lastName) : ""}`
                  : p.email || d.id,
                email: p.email || "",
              };
            });
          if (!cancelled && !ignore) setUserResults(results);
        } catch {
          if (!cancelled && !ignore) setUserResults([]);
        } finally {
          if (!cancelled && !ignore) setLoadingUsers(false);
        }
        return;
      }

      setLoadingUsers(true);
      try {
        const res = await searchUsers(searchQuery);
        if (!cancelled && !ignore) setUserResults(res);
      } finally {
        if (!cancelled && !ignore) setLoadingUsers(false);
      }
    })();

    return () => {
      cancelled = true;
      ignore = true;
    };
  }, [searchQuery]);

  // Send message
const sendMessage = useCallback(
  async (e) => {
    e.preventDefault();
    if (newMessage.trim() === "" || !selectedChat || !auth.currentUser) return;

    const myId = auth.currentUser.uid;
    const myName =
      auth.currentUser.displayName ||
      auth.currentUser.email?.split("@")[0] ||
      myId;
    const myEmail = auth.currentUser.email || "";

    if (selectedChat.isGroup) {
      if (!selectedChat.members.includes(myId)) {
        alert("You are not a member of this team.");
        return;
      }
      const msgRef = fsCollection(db, "groupMessages", selectedChat.id, "items");
      await addDoc(msgRef, {
        text: newMessage,
        from: myId,
        timestamp: Date.now(),
      });

      for (const memberId of selectedChat.members) {
      if (memberId === myId) continue;
        await addDoc(fsCollection(db, "notifications"), {
          userId: memberId,
          title: `New message in ${selectedChat.name}`,
          message: `${myName}: ${newMessage}`,
          type: "chat",             
          isGroup: true,             
          chatUserId: selectedChat.id, 
          read: false,
          timestamp: new Date(),
        });
      }


    } else {
      const otherId = selectedChat.id;
      const chatKey = getChatKey(myId, otherId);
      const msgRef = fsCollection(db, "messages", chatKey, "items");

      await addDoc(msgRef, {
        text: newMessage,
        from: myId,
        to: otherId,
        timestamp: Date.now(),
      });

      addAndPersistUser(selectedChat, setMessagedUsers, auth, BACKEND_URL);

      try {
        await fetch(`${BACKEND_URL.replace("/messages", "")}/messagedUsers/${otherId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user: {
              id: myId,
              name: myName,
              email: myEmail,
            },
          }),
        });
      } catch (err) {
        console.warn("Failed to update receiver's messagedUsers:", err);
      }

      await addDoc(fsCollection(db, "notifications"), {
        userId: otherId,
        title: `New message from ${myName}`,
        message: newMessage,
        type: "chat",   
        chatUserId: myId,
        read: false,
        timestamp: new Date(),
      });
    }

    setNewMessage("");
  },
  [newMessage, selectedChat]
);


  const allChats = [
    ...groupChats,
    ...messagedUsers.filter(
      (u) => !chatList.some((c) => c.id === u.id || c.name === u.name)
    ),
    ...chatList, // keep test items at the end by default
  ];
  
  // sort by latest activity (missing ids fall back to 0)
  const sortedChats = [...allChats].sort((a, b) => {
    const ta = a?.id ? (lastActivity[a.id] || 0) : 0;
    const tb = b?.id ? (lastActivity[b.id] || 0) : 0;
    return tb - ta;
});

  const displayChats =
    searchQuery.trim() === ""
      ? sortedChats
      : userResults.map((user) => ({
          name: user.name,
          preview: user.email || user.name || "",
          id: user.id,
        }));

const onOpenChat = (chat) => {
  setSelectedChat(chat);
  const idToClear = chat?.id;
  if (!idToClear) return;

  // mark as seen now
  const now = Date.now();
    setLastSeen((prev) => {
     const next = { ...(prev || {}), [idToClear]: now };
     lastSeenRef.current = next; // keep ref instantly in sync
     const uid = auth.currentUser?.uid;
     if (uid) { try { localStorage.setItem(`lastSeen_${uid}`, JSON.stringify(next)); } catch {} }
     return next;
   });

  // clear the blue dot
  setUnreadChats((prev) => {
    const next = new Set(prev instanceof Set ? prev : []);
    next.delete(idToClear);
    return next;
  });
  console.log('[onOpenChat mark seen]', { id: idToClear, now });
};

const handleCloseChat = () => {
  const id = selectedChat?.id;
  if (id) {
    // figure out the newest timestamp we actually have locally
    const newestLocalTs =
      (messages && messages.length
        ? (typeof messages[0]?.timestamp === "number"
            ? messages[0].timestamp
            : (messages[0]?.timestamp?.toMillis?.() || 0))
        : 0);

    const newestActivityTs = Number(lastActivity[id] || 0);
    const prevSeen = Number(lastSeenRef.current?.[id] || 0);

    // pick the max to be safe
   
    const ts = Math.max(prevSeen, newestLocalTs, newestActivityTs);
    console.log('[handleCloseChat]', {
      id,
      newestLocalTs,
      newestActivityTs,
      prevSeen,
      chosen: ts
    });

    if (ts) {
      // persist immediately (state + ref + localStorage)
      setLastSeen((prev) => {
        const next = { ...(prev || {}), [id]: ts };
        lastSeenRef.current = next;
        const uid = auth.currentUser?.uid;
        if (uid) {
          try { localStorage.setItem(`lastSeen_${uid}`, JSON.stringify(next)); } catch {}
        }
        return next;
      });

      // make sure the dot for this chat is gone right now
      setUnreadChats((prev) => {
        const next = new Set(prev instanceof Set ? prev : []);
        next.delete(id);
        return next;
      });
    }
  }

  setSelectedChat(null);
  };
  
  // ensure lastSeen is stamped if the tab is hidden/closed while a chat is open
  useEffect(() => {
    const handleFlushSeen = () => {
      const id = selectedChat?.id;
      if (!id) return;

      const newestLocalTs =
        messages && messages.length
          ? (typeof messages[0]?.timestamp === "number"
              ? messages[0].timestamp
              : (messages[0]?.timestamp?.toMillis?.() || 0))
          : 0;

      const newestActivityTs = Number(lastActivity[id] || 0);
      const prevSeen = Number(lastSeenRef.current?.[id] || 0);
      const ts = Math.max(prevSeen, newestLocalTs, newestActivityTs, Date.now());

      setLastSeen((prev) => {
        const next = { ...(prev || {}), [id]: ts };
        lastSeenRef.current = next;
        const uid = auth.currentUser?.uid;
        if (uid) {
          try { localStorage.setItem(`lastSeen_${uid}`, JSON.stringify(next)); } catch {}
        }
        return next;
      });
    };

    document.addEventListener('visibilitychange', handleFlushSeen);
    window.addEventListener('beforeunload', handleFlushSeen);
    return () => {
      document.removeEventListener('visibilitychange', handleFlushSeen);
      window.removeEventListener('beforeunload', handleFlushSeen);
    };
  }, [selectedChat, messages, lastActivity]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const userId = params.get("userId");
    const groupId = params.get("groupId");

    if (!auth.currentUser || (!userId && !groupId)) return;

    const openChatFromNotification = async () => {
      try {
        if (userId) {
          const userSnap = await getDoc(doc(db, "profiles", userId));
          const u = userSnap.exists() ? userSnap.data() : {};
          console.log("[Chat.jsx] Auto-opening DM from notification:", userId, u);
          setSelectedChat({
            id: userId,
            name:
              u.displayName ||
              u.firstName ||
              u.email ||
              "User",
            email: u.email || "",
            isGroup: false,
          });
        } else if (groupId) {
          const groupSnap = await getDoc(doc(db, "teams", groupId));
          const g = groupSnap.exists() ? groupSnap.data() : {};
          console.log("[Chat.jsx] Auto-opening Group Chat from notification:", groupId, g);
          setSelectedChat({
            id: groupId,
            name: g.name || "Group Chat",
            members: g.members || [],
            isGroup: true,
          });
        }
      } catch (err) {
        console.warn("Failed to open chat from notification:", err);
      }
    };

    openChatFromNotification();
  }, [location.search, location.state, auth.currentUser]);

  return (
    <div className="chat-app">
      <ChatSidebar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        loadingUsers={loadingUsers}
        displayChats={displayChats}
        selectedChat={selectedChat}
        setSelectedChat={setSelectedChat}
        setShowForumModal={setShowForumModal}
        unreadChats={unreadChats}
        onOpenChat={onOpenChat}
      />
      <MessageModal
        open={!!selectedChat}
        onClose={handleCloseChat}
        chat={selectedChat}
        messages={messages}
        newMessage={newMessage}
        setNewMessage={setNewMessage}
        sendMessage={sendMessage}
        setMessages={setMessages}
        db={db}
      />
      <ForumModal
        showForumModal={showForumModal}
        setShowForumModal={setShowForumModal}
        setSelectedForum={setSelectedForum}
      />
      <JoinForumModal
        selectedForum={selectedForum}
        setSelectedForum={setSelectedForum}
        addAndPersistUser={(user) =>
          addAndPersistUser(user, setMessagedUsers, auth, BACKEND_URL)
        }
        setShowForumModal={setShowForumModal}
      />
    </div>
  );
};

export default Chat;