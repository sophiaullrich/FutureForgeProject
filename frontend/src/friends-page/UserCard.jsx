import React from "react";

export default function UserCard({ user, onAdd, onAccept, onDecline, onCancel, onUnfriend }) {
  // unpack user info
  const { id, name, avatar, isFriend, pendingIncoming, pendingOutgoing, email } = user;

  let action = null;

  // show friend state buttons
  if (isFriend) {
    action = (
      <div className="actions">
        <span className="tag">friends</span>
        {onUnfriend && (
          <button onClick={() => onUnfriend(id)} className="danger secondary">unfriend</button>
        )}
      </div>
    );
  } else if (pendingIncoming) {
    action = (
      <div className="actions">
        <button onClick={() => onAccept(id)}>accept</button>
        <button onClick={() => onDecline(id)} className="secondary">decline</button>
      </div>
    );
  } else if (pendingOutgoing) {
    action = (
      <button onClick={() => onCancel(id)} className="secondary">
        requested · cancel
      </button>
    );
  } else {
    action = <button onClick={() => onAdd(id)}>add friend</button>;
  }

  // render card
  return (
    <div className="user-card" role="listitem">
      <div className="avatar" aria-hidden>
        {avatar ? <img src={avatar} alt="" /> : (name?.[0] || "?")}
      </div>
      <div className="meta">
        <div className="name">{name}</div>
        {email ? <div className="sub">{email}</div> : null}
      </div>
      <div className="cta">{action}</div>
    </div>
  );
}
