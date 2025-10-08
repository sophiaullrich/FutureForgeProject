import React, { useState, useEffect, useCallback, useRef } from "react";
import { db, auth } from "../Firebase";
import {
  collection as fsCollection,
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

const BACKEND_URL = "http://localhost:5001/api/chat/messages";

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChat, setSelectedChat] = useState(null);
  const [userResults, setUserResults] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [messagedUsers, setMessagedUsers] = useState([]);
  const [showForumModal, setShowForumModal] = useState(false);
  const [selectedForum, setSelectedForum] = useState(null);
  const [groupChats, setGroupChats] = useState([]);
  const [unreadChats, setUnreadChats] = useState(new Set());
  const [lastSeen, setLastSeen] = useState({});
  const lastSeenRef = useRef({});

  // load from local storage when user logs in and out
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        const raw = localStorage.getItem(`lastSeen_${user.uid}`);
        try { setLastSeen(raw ? JSON.parse(raw) : {}); } catch { setLastSeen({}); }
      } else {
        setLastSeen({});
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

  const chatList = [
    { name: "Sophia", preview: "Hey what..." },
    { name: "Developer Forum", preview: "Yes" },
    { name: "Team Marketing", preview: "No it's..." },
    { name: "William", preview: "Whats up?" },
    { name: "Willie", preview: "hii" },
  ];

  // Live messages listener for selected chat
  useEffect(() => {
    if (!selectedChat?.id || !auth.currentUser) return;
    const myId = auth.currentUser.uid;

    if (selectedChat.isGroup) {
      const q = fsQuery(
        fsCollection(db, "groupMessages", selectedChat.id, "items"),
        fsOrderBy("timestamp")
      );
      const unsub = onSnapshot(q, (snap) => {
        setMessages(snap.docs.map((doc) => doc.data()));
      });
      return () => unsub();
    } else {
      const otherId = selectedChat.id;
      const chatKey = getChatKey(myId, otherId);
      const q = fsQuery(
        fsCollection(db, "messages", chatKey, "items"),
        fsOrderBy("timestamp")
      );
      const unsub = onSnapshot(q, (snap) => {
        let loaded = snap.docs.map((doc) => doc.data());
        loaded = loaded.filter(
          (msg) =>
            (msg.from === myId && msg.to === otherId) ||
            (msg.from === otherId && msg.to === myId)
        );
        setMessages(loaded);
      });
      return () => unsub();
    }
  }, [selectedChat]);

  // latest message listener
  useEffect(() => {
  const me = auth.currentUser;
  if (!me) return;
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
      const iReceivedIt = msg.to === myId && msg.from !== myId;
      const last = Number(lastSeenRef.current?.[otherId] || 0);
      const isNewSinceLastSeen = typeof msg.timestamp === "number" ? (msg.timestamp > last) : true;

      setUnreadChats((prev) => {
        const next = new Set(prev instanceof Set ? prev : []);
        if (iReceivedIt && !isOpen && isNewSinceLastSeen) next.add(otherId);
        else next.delete(otherId);        // if open, ensure it’s cleared
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
    const iSentIt = msg.from === myId;
    const last = Number(lastSeenRef.current?.[groupId] || 0);
    const isNewSinceLastSeen = typeof msg.timestamp === "number" ? (msg.timestamp > last) : true;

    setUnreadChats((prev) => {
      const next = new Set(prev instanceof Set ? prev : []);
      if (!iSentIt && !isOpen && isNewSinceLastSeen) next.add(groupId);
      else next.delete(groupId);        // if open, ensure it’s cleared
      return next;
    });

    });

    pushUnsub(unsub);
  });

  return () => {
    // Only call if it’s actually a function
    unsubs.forEach((u) => { try { typeof u === "function" && u(); } catch {} });
  };
}, [auth.currentUser?.uid, messagedUsers, groupChats, selectedChat]);

// for clearing unread when chat is opened
  useEffect(() => {
    if (!selectedChat?.id) return;
    const id = selectedChat.id;
    const now = Date.now();

    // stamp last seen (state + ref) and clear the dot
    setLastSeen((prev) => {
      const next = { ...(prev || {}), [id]: now };
      lastSeenRef.current = next;     // keep ref in sync immediately
      return next;                    // IMPORTANT: return new state
    });

    setUnreadChats((prev) => {
      const next = new Set(prev instanceof Set ? prev : []);
      next.delete(id);
      return next;
    });
  }, [selectedChat]);


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
      }
      setNewMessage("");
    },
    [newMessage, selectedChat]
  );

  const allChats = [
    ...groupChats,
    ...chatList,
    ...messagedUsers.filter(
      (u) => !chatList.some((c) => c.id === u.id || c.name === u.name)
    ),
  ];

  const displayChats =
    searchQuery.trim() === ""
      ? allChats
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
  setLastSeen((prev) => ({ ...(prev || {}), [idToClear]: now }));

  // clear the blue dot
  setUnreadChats((prev) => {
    const next = new Set(prev instanceof Set ? prev : []);
    next.delete(idToClear);
    return next;
  });
};

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
        onClose={() => setSelectedChat(null)}
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