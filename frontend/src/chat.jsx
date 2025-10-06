import React, { useState, useEffect, useRef, useCallback } from "react";
import { FiSearch, FiArrowUp } from "react-icons/fi";
import { IoIosArrowForward } from "react-icons/io";
import "./chat.css";
import { db, auth } from "./Firebase";
import { collection, getDocs, limit, orderBy, query, where, doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

const BACKEND_URL = "http://localhost:5000/api/chat/messages";
const USER_SEARCH_URL = "http://localhost:5000/api/chat/messagedUsers";

const avatarColors = [
  "linear-gradient(135deg, #4e54c8, #8f94fb)",
  "linear-gradient(135deg, #ff5858, #f09819)",
  "linear-gradient(135deg, #43cea2, #185a9d)",
  "linear-gradient(135deg, #56ab2f, #a8e063)",
  "linear-gradient(135deg, #ff512f, #dd2476)",
];

function sanitizeChatKey(name) {
  return name.replace(/[.#$[\]]/g, "_");
}

const MessageModal = React.memo(({
  open,
  onClose,
  chat,
  messages,
  newMessage,
  setNewMessage,
  sendMessage,
  setMessages 
}) => {
  const messagesEndRef = useRef(null);
  const [localMessages, setLocalMessages] = useState([]); 

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [localMessages]);

  useEffect(() => {
    let cancelled = false;
    // Only fetch when modal is open and we have a valid chat id and user.
    if (!open || !chat?.id || !auth.currentUser) return;
    (async () => {
      try {
        const myId = auth.currentUser.uid;
        const otherId = chat.id;
        const chatKey = getChatKey(myId, otherId);
        const res = await fetch(`${BACKEND_URL}/${encodeURIComponent(chatKey)}`);
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;
        const loadedMessages = data ? Object.values(data) : [];
        setLocalMessages(loadedMessages);
        setMessages?.(loadedMessages);
      } catch (err) {
      }
    })();
    return () => { cancelled = true; };
  }, [open, chat?.id, setMessages]);

  // keep localMessages in sync with external messages prop 
  useEffect(() => {
    if (!open) return;
    // Only sync into localMessages if parent provided non-empty messages.
    if (messages && messages.length > 0) {
      setLocalMessages(messages);
    }
  }, [messages, open]);

  if (!open) return null;

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "pm" : "am";
    hours = hours % 12 || 12;
    return `${hours}:${minutes}${ampm}`;
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content chat-modal-large">
        <button className="modal-close" onClick={onClose}>
          ×
        </button>
        <h2 className="chat-modal-title">{chat.name}</h2>
        <div className="messages-display chat-messages-bg">
          {localMessages.map((msg, idx) => {
            const myId = String(auth.currentUser?.uid ?? "");
            const fromId = String(msg?.from ?? "");
            const isMe = myId.length > 0 && fromId.length > 0 && myId === fromId;

            const showTime =
              idx === 0 ||
              (localMessages[idx].timestamp &&
                Math.abs(localMessages[idx].timestamp - localMessages[idx - 1]?.timestamp) >
                  1000 * 60 * 30);

            return (
              <React.Fragment key={idx}>
                {showTime && msg.timestamp && (
                  <div className="chat-timestamp">{formatTime(msg.timestamp)}</div>
                )}
                <div className={`message ${isMe ? "sent" : "received"}`}>
                  <div
                    className="chat-avatar-bubble"
                    style={{ background: isMe ? avatarColors[1] : avatarColors[0] }}
                    aria-hidden="true"
                  />
                  <div className={`bubble ${isMe ? "sent" : "received"}`}>{msg.text}</div>
                </div>
              </React.Fragment>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
        <div className="chat-input-row">
          <form id="chat-send-form" onSubmit={sendMessage} className="messaging-form chat-input-bar" autoComplete="off">
            <input
              type="text"
              placeholder="Message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="messaging-input chat-input"
            />
            <button type="submit" className="chat-send-inside" aria-label="Send">
              <FiArrowUp size={18} />
            </button>
          </form>
         </div>
      </div>
    </div>
  );
});

function getChatKey(userId1, userId2) {
  // Always sort IDs so the key is the same for both users
  return [userId1, userId2].sort().join("_");
}

const Chat = () => {
	const [messages, setMessages] = useState([]);
	const [newMessage, setNewMessage] = useState("");
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedChat, setSelectedChat] = useState(null);
	const [userResults, setUserResults] = useState([]);
	const [loadingUsers, setLoadingUsers] = useState(false);
	const [messagedUsers, setMessagedUsers] = useState([]);

	useEffect(() => {
		const unsub = onAuthStateChanged(auth, (user) => {
			if (user) {
				const key = `messagedUsers_${user.uid}`;
				const raw = localStorage.getItem(key);
				if (raw) {
					try { setMessagedUsers(JSON.parse(raw)); } catch { setMessagedUsers([]); }
				}
				(async () => {
					try {
						const last = localStorage.getItem(`lastSelectedChat_${user.uid}`);
						if (!last) return;
						const parsed = JSON.parse(last);
						if (!parsed || !parsed.id) return;

						// If we already have that chat in messagedUsers, use it
						const inList = (raw ? JSON.parse(raw) : []).find((u) => u.id === parsed.id);
						if (inList) {
							setSelectedChat(inList);
							return;
						}

						try {
							const snap = await getDoc(doc(db, "profiles", parsed.id));
							const p = snap.data() || {};
							setSelectedChat({ id: parsed.id, name: p.displayName ? 
								p.displayName.split(" ")[0] : (p.email ? p.email.split("@")[0] : parsed.id),
  								email: p.email || "" });
						} catch {
							setSelectedChat({ id: parsed.id, name: parsed.name || parsed.id, email: parsed.email || "" });
						}
					} catch {
					}
				})();
			} else {
				setMessagedUsers([]);
			}
		});
		return () => unsub();
 	}, []);
	useEffect(() => {
		const unsub = onAuthStateChanged(auth, async (user) => {
			if (user) {
				try {
					const res = await fetch(`${BACKEND_URL.replace("/messages", "")}/messagedUsers/${user.uid}`);
					if (res.ok) {
						const users = await res.json();
						setMessagedUsers(users);
					}
				} catch {
					setMessagedUsers([]);
				}
			} else {
				setMessagedUsers([]);
			}
		});
		return () => unsub();
	}, []);

	function normalizeUser(u) {
		if (!u) return null;
		return {
			id: u.id || u.uid || (typeof u === "string" ? u : undefined),
			name: u.name || u.displayName || u.email || (typeof u === "string" ? u : ""),
			email: u.email || ""
		};
	}

	function persistMessagedUsers(list) {
		try {
			const uid = auth.currentUser?.uid;
			if (!uid) return;
			localStorage.setItem(`messagedUsers_${uid}`, JSON.stringify(list || []));
		} catch {}
	}

	async function addAndPersistUser(user) {
		const norm = normalizeUser(user);
		if (!norm || !norm.id) return;
		setMessagedUsers((prev = []) => {
			if (prev.find((x) => x.id === norm.id)) return prev;
			const next = [...prev, norm];
			// Save to backend
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

	useEffect(() => {
		const user = auth.currentUser;
		if (!user) return;
		try {
			localStorage.setItem(`messagedUsers_${user.uid}`, JSON.stringify(messagedUsers));
		} catch {}
	}, [messagedUsers]);

	useEffect(() => {
		const uid = auth.currentUser?.uid;
		try {
			if (!uid) return;
			if (!selectedChat) {
				localStorage.removeItem(`lastSelectedChat_${uid}`);
			} else {
				localStorage.setItem(`lastSelectedChat_${uid}`, JSON.stringify(selectedChat));
			}
		} catch {}
	}, [selectedChat]);

	const chatList = [
		{ name: "Sophia", preview: "Hey what..." },
		{ name: "Developer Forum", preview: "Yes" },
		{ name: "Team Marketing", preview: "No it's..." },
		{ name: "William", preview: "Whats up?" },
		{ name: "Willie", preview: "hii" },
	];

	const filteredChats = chatList.filter(
		(chat) =>
			chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			chat.preview.toLowerCase().includes(searchQuery.toLowerCase())
	);

	// Fetch messages from backend
	useEffect(() => {
		fetch(BACKEND_URL)
			.then((res) => res.json())
			.then(async (data) => {
				const loadedMessages = data ? Object.values(data) : [];
				setMessages(loadedMessages);

				// If a user is logged in, derive contact IDs from messages
				const uid = auth.currentUser?.uid;
				if (!uid) return;

				// gather contact IDs from loaded messages
				const contactIds = new Set();
				for (const m of loadedMessages) {
					if (!m || (!m.from && !m.to)) continue;
					if (m.from === uid && m.to && m.to !== uid) contactIds.add(m.to);
					if (m.to === uid && m.from && m.from !== uid) contactIds.add(m.from);
				}
				if (contactIds.size === 0) return;

				// determine which contacts are already saved (check localStorage first then state)
				let existingIds = new Set();
				try {
					const raw = localStorage.getItem(`messagedUsers_${uid}`);
					if (raw) {
						const parsed = JSON.parse(raw);
						for (const p of parsed || []) existingIds.add(p.id);
					} else {
						for (const u of (messagedUsers || [])) existingIds.add(u.id);
					}
				} catch {
					for (const u of (messagedUsers || [])) existingIds.add(u.id);
				}

				const missing = [...contactIds].filter((id) => !existingIds.has(id));
				if (missing.length === 0) return;

				// fetch profiles for missing IDs and add them to messagedUsers
				try {
					const profiles = await Promise.all(
						missing.map(async (id) => {
							try {
								const snap = await getDoc(doc(db, "profiles", id));
								const p = snap.data() || {};
								return normalizeUser({ id, name: p.displayName ? p.displayName.split(" ")[0] : (p.email ? p.email.split("@")[0] : id),
									email: p.email || "" });
							} catch {
								return normalizeUser({ id, name: id, email: "" });
							}
						})
					);
					setMessagedUsers((prev = []) => {
						const map = new Map(prev.map((u) => [u.id, u]));
						for (const pr of profiles) if (pr && pr.id) map.set(pr.id, pr);
						const next = [...map.values()];
						persistMessagedUsers(next);
						return next;
					});
				} catch {
				}
			});
	}, []);

	// Fetch messages for selected chat
	useEffect(() => {
		// Only fetch when a user chat with a real id is selected.
		if (!selectedChat?.id || !auth.currentUser) return;
		const myId = auth.currentUser.uid;
		const otherId = selectedChat.id;
		const chatKey = getChatKey(myId, otherId);

		fetch(`${BACKEND_URL}/${encodeURIComponent(chatKey)}`)
			.then((res) => res.json())
			.then((data) => {
				let loadedMessages = data ? Object.values(data) : [];
				// Only show messages between the two users
				loadedMessages = loadedMessages.filter(
					(msg) =>
						(msg.from === myId && msg.to === otherId) ||
						(msg.from === otherId && msg.to === myId)
				);
				setMessages(loadedMessages);
			});
	}, [selectedChat]);

	// Fetch users from Firestore for searching user to message
	useEffect(() => {
		let ignore = false;
		async function searchUsers(qstr) {
			if (!qstr || qstr.trim() === "") return [];
			const q = (qstr || "").trim().toLowerCase();
			const gte = q;
			const lt = q + "\uf8ff";

			try {
				// Try prefix queries on both emailLower and displayNameLower
				const qEmail = query(
					collection(db, "profiles"),
					where("emailLower", ">=", gte),
					where("emailLower", "<=", lt),
					limit(50)
				);
				const qName = query(
					collection(db, "profiles"),
					where("displayNameLower", ">=", gte),
					where("displayNameLower", "<=", lt),
					limit(50)
				);

				const [sEmail, sName] = await Promise.all([
					getDocs(qEmail).catch(() => ({ docs: [] })),
					getDocs(qName).catch(() => ({ docs: [] }))
				]);

				const map = new Map();
				for (const d of [...(sEmail.docs || []), ...(sName.docs || [])]) {
					if (d.id === auth.currentUser?.uid) continue;
					const p = d.data() || {};
					map.set(d.id, {
						id: d.id,
						name: p.displayName ? p.displayName.split(" ")[0] : (p.email ? p.email.split("@")[0] : d.id),
						email: p.email || ""
					});
				}

				if (map.size > 0) {
					return [...map.values()];
				}

				const snapAll = await getDocs(collection(db, "profiles"));
				const results = [];
				for (const d of snapAll.docs) {
					if (d.id === auth.currentUser?.uid) continue;
					const p = d.data() || {};
					const nameLower = (p.displayName || "").toLowerCase();
					const emailLower = (p.email || "").toLowerCase();
					if (nameLower.includes(q) || emailLower.includes(q)) {
						results.push({ id: d.id, name: p.displayName || p.email || d.id, email: p.email || "" });
					}
				}
				return results;
			} catch (err) {
				return [];
			}
		}

		let cancelled = false;
		(async () => {
			// If query is empty, fetch a suggestion page of profiles so the UI
			// shows available users to message with.
			if (searchQuery.trim() === "") {
				setLoadingUsers(true);
				try {
					const snap = await getDocs(query(collection(db, "profiles"), orderBy("emailLower"), limit(100)));
					const results = snap.docs
						.filter(d => d.id !== auth.currentUser?.uid)
						.map(d => ({ id: d.id, name: (d.data()?.displayName) || d.data()?.email || d.id, email: d.data()?.email || "" }));
					if (!cancelled && !ignore) setUserResults(results);
				} catch (err) {
					console.warn("Failed to load profile suggestions:", err.message);
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

		return () => { cancelled = true; ignore = true; };
	}, [searchQuery]);

	// Send message to backend for selected chat
	const sendMessage = useCallback(async (e) => {
		e.preventDefault();
		if (newMessage.trim() === "" || !selectedChat || !auth.currentUser) return;
		const myId = auth.currentUser.uid;
		const otherId = selectedChat.id;
		const chatKey = getChatKey(myId, otherId);

		await fetch(`${BACKEND_URL}/${chatKey}`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ text: newMessage, from: myId, to: otherId }),
		});
		setNewMessage("");

		addAndPersistUser(selectedChat);

		// Refetch messages after sending
		fetch(`${BACKEND_URL}/${chatKey}`)
			.then(async (res) => {
				if (!res.ok) {
					const text = await res.text();
					throw new Error(`Server error: ${res.status} - ${text}`);
				}
				return res.json();
			})
			.then((data) => {
				const loadedMessages = data ? Object.values(data) : [];
				setMessages(loadedMessages);
			})
			.catch((err) => {
				console.error("Failed to fetch messages:", err.message);
			});
	}, [newMessage, selectedChat]);

	const allChats = [
		...chatList,
		...messagedUsers.filter(
			(u) => !chatList.some((c) => c.id === u.id || c.name === u.name)
		),
	];

	// Use userResults if searching, otherwise show chatList
	const displayChats =
		searchQuery.trim() === ""
			? allChats
			: userResults.map((user) => ({
					name: user.name,
					preview: user.email || "",
					id: user.id,
					isFriend: user.isFriend
				}));

	return (
		<div className="chat-app">
			<div className="chat-sidebar">
				<div className="sidebar-title-bar">
					<h1 className="sidebar-title">Find Forums</h1>
					<IoIosArrowForward className="sidebar-arrow" />
				</div>
				<div className="search-box elevated">
					<FiSearch className="search-icon" />
					<input
						type="text"
						placeholder="Search for people, chats and forums..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
					/>
				</div>
				<div className="chat-list">
					{loadingUsers && <div>Loading users...</div>}
					{displayChats.map((chat, index) => (
						<div
							key={chat.id || index}
							className="chat-item"
							onClick={() => {
								if (!selectedChat || selectedChat.name !== chat.name) {
									setSelectedChat(chat);
								}
							}}
							style={{ cursor: "pointer" }}
						>
							<div
								className="chat-avatar"
								style={{
									background: avatarColors[index % avatarColors.length],
								}}
							/>
							<div className="chat-info">
								<h3 className="chat-name">{chat.name}</h3>
								<p className="chat-preview">{chat.preview}</p>
							</div>
						</div>
					))}
				</div>
			</div>
			<MessageModal
				open={!!selectedChat}
				onClose={() => setSelectedChat(null)}
				chat={selectedChat}
				messages={messages}
				newMessage={newMessage}
				setNewMessage={setNewMessage}
				sendMessage={sendMessage}
				setMessages={setMessages}
			/>
		</div>
	);
};

export default Chat;