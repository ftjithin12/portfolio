const { MESSAGES } = require('../config/constants');
const { getBackToMenuKeyboard } = require('../keyboards/mainMenu');

/**
 * Handle /services command
 * Displays the comprehensive catalog of design services
 */
module.exports = async function servicesCommand(ctx) {
  return ctx.reply(MESSAGES.services, {
    parse_mode: 'HTML',
    ...getBackToMenuKeyboard()
  });
};
