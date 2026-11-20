const { MESSAGES } = require('../config/constants');
const { getMainMenuKeyboard } = require('../keyboards/mainMenu');
const { conversationManager } = require('../services/conversationManager');

/**
 * Handle /start command
 * Displays welcome message, main dashboard menu, and resets conversation context
 */
module.exports = async function startCommand(ctx) {
  if (ctx.from?.id) {
    conversationManager.clearHistory(ctx.from.id);
  }
  const firstName = ctx.from?.first_name || '';
  return ctx.reply(MESSAGES.welcome(firstName), {
    parse_mode: 'HTML',
    ...getMainMenuKeyboard()
  });
};
