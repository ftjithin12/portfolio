const { MESSAGES } = require('../config/constants');
const { getBackToMenuKeyboard } = require('../keyboards/mainMenu');
const { Markup } = require('telegraf');
const { config } = require('../config/environment');

/**
 * Handle /courses command
 * Displays information about online creative workshops and enrollment
 */
module.exports = async function coursesCommand(ctx) {
  const cleanHandle = (config.ownerHandle || 'ftjithin').replace('@', '');
  const extra = [
    Markup.button.url('📝 Inquire / Enroll with Admin', `https://t.me/${cleanHandle}`)
  ];

  return ctx.reply(MESSAGES.courses, {
    parse_mode: 'HTML',
    ...getBackToMenuKeyboard(extra)
  });
};
