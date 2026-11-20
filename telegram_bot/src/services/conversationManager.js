/**
 * In-Memory Conversation History Manager
 * Maintains bounded multi-turn conversation context per Telegram user
 * with automatic TTL cleanup to prevent memory leaks.
 */

const MAX_TURNS = 6; // Keep up to 6 recent messages (3 user + 3 assistant)
const TTL_MS = 30 * 60 * 1000; // 30 minutes of inactivity

class ConversationManager {
  constructor() {
    this.sessions = new Map();
  }

  /**
   * Get formatted conversation history for Gemini API
   * @param {number|string} userId
   * @returns {Array<{role: string, text: string}>}
   */
  getHistory(userId) {
    const session = this.sessions.get(String(userId));
    if (!session) return [];

    // Check if session has expired
    if (Date.now() - session.lastActive > TTL_MS) {
      this.sessions.delete(String(userId));
      return [];
    }

    return session.history;
  }

  /**
   * Add a message turn to the user's conversation history
   * @param {number|string} userId
   * @param {'user'|'model'} role
   * @param {string} text
   */
  addMessage(userId, role, text) {
    const key = String(userId);
    let session = this.sessions.get(key);

    if (!session || Date.now() - session.lastActive > TTL_MS) {
      session = { history: [], lastActive: Date.now() };
    }

    session.history.push({ role, text: String(text).trim() });

    // Keep history within turn bounds
    if (session.history.length > MAX_TURNS) {
      session.history = session.history.slice(session.history.length - MAX_TURNS);
    }

    session.lastActive = Date.now();
    this.sessions.set(key, session);
  }

  /**
   * Reset / clear history for a specific user
   * @param {number|string} userId
   */
  clearHistory(userId) {
    this.sessions.delete(String(userId));
  }
}

// Singleton instance
const conversationManager = new ConversationManager();

module.exports = {
  conversationManager
};
