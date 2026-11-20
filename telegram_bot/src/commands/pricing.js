const { MESSAGES } = require('../config/constants');
const { getBackToMenuKeyboard } = require('../keyboards/mainMenu');

/**
 * Handle /pricing command
 * Displays configurable sample pricing packages and starter estimates
 */
module.exports = async function pricingCommand(ctx) {
  return ctx.reply(MESSAGES.pricing, {
    parse_mode: 'HTML',
    ...getBackToMenuKeyboard()
  });
};
