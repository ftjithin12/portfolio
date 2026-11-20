/**
 * Message and AI Support Handler
 * Manages conversation context per Telegram user and interfaces with Gemini AI.
 * Gracefully falls back to existing FAQ responses if Gemini is unavailable.
 */

const { MESSAGES } = require('../config/constants');
const { getMainMenuKeyboard, getAiResponseKeyboard } = require('../keyboards/mainMenu');
const { askGeminiSupport } = require('../services/gemini');
const { conversationManager } = require('../services/conversationManager');
const { config } = require('../config/environment');

function registerMessageHandler(bot, logger) {
  bot.on('message', async (ctx) => {
    const text = ctx.message?.text;
    const userId = ctx.from?.id;

    // 1. Handle unknown or unhandled slash commands (/foo, etc.)
    if (text && text.startsWith('/')) {
      const commandName = text.split(' ')[0].toLowerCase();

      // Helper to clear conversation history if requested
      if (commandName === '/clear') {
        if (userId) conversationManager.clearHistory(userId);
        return ctx.reply('🧹 <i>Conversation memory has been cleared. How can I help you today?</i>', {
          parse_mode: 'HTML',
          ...getMainMenuKeyboard()
        });
      }

      const escapedCmd = text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
      return ctx.reply(
        `⚠️ Unknown command <code>${escapedCmd}</code>.\n\nPlease check the available commands below:`,
        {
          parse_mode: 'HTML',
          ...getMainMenuKeyboard()
        }
      );
    }

    // 2. Handle non-text incoming messages (photos, stickers, audio, documents)
    if (!text || text.trim().length === 0) {
      return ctx.reply(
        '👋 We received your media. To discuss custom poster artwork, video editing, or branding projects, please tap <b>Contact Admin</b> below to speak directly with Jithin!',
        {
          parse_mode: 'HTML',
          ...getMainMenuKeyboard()
        }
      );
    }

    // 3. Process natural language query through Gemini AI
    try {
      // Send Telegram typing indicator
      await ctx.sendChatAction('typing');

      // Retrieve recent conversation context for this user
      const userHistory = userId ? conversationManager.getHistory(userId) : [];

      // Query Gemini AI
      const aiResult = await askGeminiSupport(text, userHistory);

      if (aiResult.success && aiResult.text) {
        // Record both turns in conversation context for multi-turn coherence
        if (userId) {
          conversationManager.addMessage(userId, 'user', text);
          conversationManager.addMessage(userId, 'model', aiResult.text);
        }

        const aiKeyboard = getAiResponseKeyboard(config.ownerHandle);

        // Attempt sending with Markdown formatting; fallback to plain text if syntax issues occur
        try {
          return await ctx.reply(aiResult.text, {
            parse_mode: 'Markdown',
            ...aiKeyboard
          });
        } catch (formatErr) {
          return await ctx.reply(aiResult.text, aiKeyboard);
        }
      }

      // If Gemini returned an error or is unconfigured, log safely and trigger fallback
      if (logger && aiResult.error) {
        logger.warn(`Gemini AI consultation failed (${aiResult.reason}): ${aiResult.error}`);
      }
    } catch (consultErr) {
      if (logger) {
        logger.error('Unexpected error during AI customer consultation', consultErr);
      }
    }

    // 4. Fallback response if AI is unavailable (rate limits, timeouts, offline)
    return ctx.reply(MESSAGES.unknownFallback, {
      parse_mode: 'HTML',
      ...getMainMenuKeyboard()
    });
  });
}

module.exports = {
  registerMessageHandler
};
