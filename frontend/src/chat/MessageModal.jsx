import React, { useRef, useEffect, useState } from "react";
import { FiArrowUp } from "react-icons/fi";
import { auth } from "../Firebase";
import { onSnapshot, query as fsQuery, collection as fsCollection, orderBy as fsOrderBy } from "firebase/firestore";
import "./chat.css";

const avatarColors = [
  "linear-gradient(135deg, #4e54c8, #8f94fb)",
  "linear-gradient(135deg, #ff5858, #f09819)",
];

function getChatKey(userId1, userId2) {
  return [userId1, userId2].sort().join("_");
}

const MessageModal = React.memo(({
  open,
  onClose,
  chat,
  messages,
  newMessage,
  setNewMessage,
  sendMessage,
  setMessages,
  db
}) => {
  const messagesEndRef = useRef(null);
  const [localMessages, setLocalMessages] = useState([]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [localMessages]);

  useEffect(() => {
    if (!open || !chat?.id || !auth.currentUser) return;
    const myId = auth.currentUser.uid;
    let unsub;
    if (chat.isGroup) {
      const q = fsQuery(
        fsCollection(db, "groupMessages", chat.id, "items"),
        fsOrderBy("timestamp")
      );
      unsub = onSnapshot(q, (snap) => {
        const loadedMessages = snap.docs.map(doc => doc.data());
        setLocalMessages(loadedMessages);
        setMessages?.(loadedMessages);
      });
    } else {
      const otherId = chat.id;
      const chatKey = getChatKey(myId, otherId);
      const q = fsQuery(
        fsCollection(db, "messages", chatKey, "items"),
        fsOrderBy("timestamp")
      );
      unsub = onSnapshot(q, (snap) => {
        let loadedMessages = snap.docs.map(doc => doc.data());
        loadedMessages = loadedMessages.filter(
          (msg) =>
            (msg.from === myId && msg.to === otherId) ||
            (msg.from === otherId && msg.to === myId)
        );
        setLocalMessages(loadedMessages);
        setMessages?.(loadedMessages);
      });
    }
    return () => unsub && unsub();
  }, [open, chat?.id, chat?.isGroup, setMessages, db]);

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
        <button className="modal-close" onClick={onClose}>×</button>
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

export default MessageModal;