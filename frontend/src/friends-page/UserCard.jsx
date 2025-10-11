import React from "react";

export default function UserCard({
  user,
  onAdd,
  onAccept,
  onDecline,
  onCancel,
  onUnfriend,
}) {
  // unpack user info
  const {
    id,
    name,
    avatar,
    isFriend,
    pendingIncoming,
    pendingOutgoing,
    email,
  } = user;

  let action = null;

  // show friend state buttons
  if (isFriend) {
    action = (
      <div className="actions">
        <span className="tag">Friends</span>
        {onUnfriend && <button onClick={() => onUnfriend(id)}>Unfriend</button>}
      </div>
    );
  } else if (pendingIncoming) {
    action = (
      <div className="actions">
        <button onClick={() => onAccept(id)} className="accept">
          Accept
        </button>
        <button onClick={() => onDecline(id)} className="danger">
          Decline
        </button>
      </div>
    );
  } else if (pendingOutgoing) {
    action = <button onClick={() => onCancel(id)}>Requested · Cancel</button>;
  } else {
    action = <button onClick={() => onAdd(id)}>Add Friend</button>;
  }

  // render card
  return (
    <div className="user-card" role="listitem">
      <div className="avatar" aria-hidden>
        {avatar ? <img src={avatar} alt="" /> : name?.[0] || "?"}
      </div>
      <div className="meta">
        <div className="name">{name}</div>
        {email ? <div className="sub">{email}</div> : null}
      </div>
      <div className="cta">{action}</div>
    </div>
  );
}
