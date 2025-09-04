// Frontend-only mock service. Swap methods with real API later.

const _state = {
  me: { id: "me", name: "Sophia Ullrich", email: "sophia@example.com" },
  users: [
    { id: "u1", name: "Rory",  email: "rory@example.com" },
    { id: "u2", name: "Holly", email: "holly@example.com" },
    { id: "u3", name: "Diya",  email: "diya@example.com" },
  ],
  friends: [],
  incoming: [], // { id, from:{id,name}, createdAt }
  outgoing: [], // { id, to:{id,name},   createdAt }
};

const listeners = new Set(); // event bus

function emit(evt) {
  listeners.forEach((cb) => cb(evt));
}
function delay(ms) { return new Promise((res) => setTimeout(res, ms)); }

const FriendsService = {
  onIncomingRequest(cb) {
    listeners.add(cb);
    return () => listeners.delete(cb);
  },

  async search(query) {
    await delay(150);
    const q = (query || "").trim().toLowerCase();
    const list = _state.users
      .filter((u) => u.id !== _state.me.id)
      .filter((u) => !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));

    return list.map((u) => ({
      ...u,
      isFriend: _state.friends.includes(u.id),
      pendingOutgoing: _state.outgoing.some((r) => r.to.id === u.id),
      pendingIncoming: _state.incoming.some((r) => r.from.id === u.id),
    }));
  },

  async listFriends()  { await delay(100); return _state.users.filter((u) => _state.friends.includes(u.id)); },
  async listIncoming() { await delay(100); return _state.incoming.map((r) => ({ id: r.id, from: r.from })); }
  ,
  async listOutgoing() { await delay(100); return _state.outgoing.map((r) => ({ id: r.id, to: r.to })); },

  async sendRequest(userId) {
    await delay(120);
    if (_state.friends.includes(userId)) throw new Error("Already friends");
    if (_state.outgoing.some((r) => r.to.id === userId)) throw new Error("Request already pending");
    if (_state.incoming.some((r) => r.from.id === userId)) throw new Error("They already requested you");

    const target = _state.users.find((u) => u.id === userId);
    if (!target) throw new Error("User not found");

    _state.outgoing.push({
      id: `req_${Date.now()}`,
      to: { id: target.id, name: target.name },
      createdAt: Date.now(),
    });

    // demo event
    emit({ type: "outgoing-request", to: { id: target.id, name: target.name } });
    return { ok: true };
  },

  async accept(requestId) {
    await delay(120);
    const i = _state.incoming.findIndex((r) => r.id === requestId);
    if (i < 0) throw new Error("Request not found");
    const fromId = _state.incoming[i].from.id;
    _state.incoming.splice(i, 1);
    if (!_state.friends.includes(fromId)) _state.friends.push(fromId);
    return { ok: true };
  },

  async decline(requestId) {
    await delay(120);
    _state.incoming = _state.incoming.filter((r) => r.id !== requestId);
    return { ok: true };
  },

  async cancel(requestId) {
    await delay(120);
    _state.outgoing = _state.outgoing.filter((r) => r.id !== requestId);
    return { ok: true };
  },

  // helper to simulate someone requesting YOU (for demo/testing)
  __simulateIncoming(fromId) {
    const from = _state.users.find((u) => u.id === fromId);
    if (!from) return;
    const req = {
      id: `inc_${Date.now()}`,
      from: { id: from.id, name: from.name },
      createdAt: Date.now(),
    };
    _state.incoming.push(req);
    emit({ type: "incoming-request", from: req.from });
  },
};

export default FriendsService;
