const { MESSAGES } = require('../config/constants');
const { getMainMenuKeyboard } = require('../keyboards/mainMenu');

/**
 * Handle /help command
 * Displays available bot commands and navigation guide
 */
module.exports = async function helpCommand(ctx) {
  return ctx.reply(MESSAGES.help, {
    parse_mode: 'HTML',
    ...getMainMenuKeyboard()
  });
};
