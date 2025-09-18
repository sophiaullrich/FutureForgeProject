import React, { useEffect } from "react";

export default function Toast({ message, onClose, kind = "info" }) {
  useEffect(() => {
    if (!message) return;
    const id = setTimeout(onClose, 2200);
    return () => clearTimeout(id);
  }, [message, onClose]);

  if (!message) return null;
  return (
    <div className={`toast ${kind}`} role="status" aria-live="polite">
      {message}
    </div>
  );
}
