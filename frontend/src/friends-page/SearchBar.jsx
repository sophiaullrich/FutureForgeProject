import React, { useState } from "react";

export default function SearchBar({ onSearch, loading }) {
  // store search input
  const [q, setQ] = useState("");

  // render search form
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault(); // stop page reload
        onSearch(q); // run search
      }}
      className="friends-search"
    >
      <input
        placeholder="Search by name or email"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      <button type="submit" disabled={loading}>
        {loading ? "Searching…" : "Search"}
      </button>
    </form>
  );
}
