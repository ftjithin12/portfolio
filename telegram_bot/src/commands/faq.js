const { MESSAGES } = require('../config/constants');
const { getBackToMenuKeyboard } = require('../keyboards/mainMenu');

/**
 * Handle /faq command
 * Displays structured frequently asked questions
 */
module.exports = async function faqCommand(ctx) {
  return ctx.reply(MESSAGES.faq, {
    parse_mode: 'HTML',
    ...getBackToMenuKeyboard()
  });
};
