const { MESSAGES } = require('../config/constants');
const { getContactKeyboard } = require('../keyboards/mainMenu');
const { config } = require('../config/environment');

/**
 * Handle /contact command
 * Explains how clients can connect directly with the owner
 */
module.exports = async function contactCommand(ctx) {
  return ctx.reply(
    MESSAGES.contact(config.ownerHandle, config.contactEmail),
    {
      parse_mode: 'HTML',
      ...getContactKeyboard(config.ownerHandle)
    }
  );
};
