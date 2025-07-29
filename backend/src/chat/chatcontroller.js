const ChatService = require('./chatservice.js');

class ChatController {
    // Send a message
    async sendMessage(req, res) {
        try {
            const { content } = req.body;
            const message = await ChatService.sendMessage(content);
            res.status(201).json(message);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Get messages between two users
    async getMessages(req, res) {
        try {
            const { userId, otherUserId } = req.params;
            const messages = await ChatService.getMessages(userId, otherUserId);
            res.status(200).json(messages);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // For live messaging, you might use websockets, but here's a placeholder for REST polling
    async getLatestMessages(req, res) {
        try {
            const { userId, otherUserId, since } = req.query;
            const db = require('firebase-admin').firestore();

            // Query messages between userId and otherUserId sent after 'since'
            const messagesRef = db.collection('messages')
                .where('participants', 'array-contains', [userId, otherUserId])
                .where('timestamp', '>', since)
                .orderBy('timestamp', 'asc');

            const snapshot = await messagesRef.get();
            const messages = snapshot.docs.map(doc => doc.data());

            res.status(200).json(messages);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new ChatController();