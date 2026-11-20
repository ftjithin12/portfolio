const { MESSAGES } = require('../config/constants');
const { getBackToMenuKeyboard } = require('../keyboards/mainMenu');

/**
 * Handle /about command
 * Displays FT JITHIN DESIGNZ business overview and values
 */
module.exports = async function aboutCommand(ctx) {
  return ctx.reply(MESSAGES.about, {
    parse_mode: 'HTML',
    ...getBackToMenuKeyboard()
  });
};
