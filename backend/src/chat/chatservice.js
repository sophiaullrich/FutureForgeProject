const EventEmitter = require('events');

class ChatService extends EventEmitter {
    constructor() {
        super();
        this.messages = [];
    }

    sendMessage(content) {
        const message = {
            id: this.messages.length + 1,
            content,
            timestamp: new Date()
        };
        this.messages.push(message);
        this.emit('message', message);
        return message;
    }

    getMessages(limit = 50) {
        return this.messages.slice(-limit);
    }
}

module.exports = new ChatService();
