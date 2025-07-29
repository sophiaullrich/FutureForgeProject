import React, { useState, useEffect, useRef } from "react";
import { collection, addDoc, serverTimestamp, onSnapshot, query, orderBy } from "firebase/firestore";
import { FiSend } from "react-icons/fi";
import { db, requestPermission, onMessageListener } from "./firebase";

const Chat = ({ username }) => {
   const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  // Fetch messages in real-time
  useEffect(() => {
    const q = query(collection(db, "messages"), orderBy("timestamp"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => doc.data()));
    });
    return unsubscribe;
  }, []);

  // Send a new message
  const sendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim() === "") return;
    await addDoc(collection(db, "messages"), {
      text: newMessage,
      timestamp: serverTimestamp(),
    });
    setNewMessage("");
  };

  useEffect(() => {
    requestPermission();
    onMessageListener().then((payload) => {
      console.log("New notification:", payload);
      new Notification(payload.notification.title, {
        body: payload.notification.body,
      });
    });
  }, []);  

  return (
    <div className="chat-container">
      <div className="messages">
        {messages.map((msg, i) => (
          <div key={i} className="message">
            <p>{msg.text}</p>
          </div>
        ))}
      </div>
      <form onSubmit={sendMessage}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <button type="submit"><FiSend /></button>
      </form>
    </div>
  );
};

export default Chat;