const { Markup } = require('telegraf');
const { MESSAGES } = require('../config/constants');
const { getBackToMenuKeyboard } = require('../keyboards/mainMenu');
const { config } = require('../config/environment');

/**
 * Handle /portfolio command
 * Temporary placeholder message with active portfolio showcase links
 */
module.exports = async function portfolioCommand(ctx) {
  const showcaseButtons = [
    Markup.button.url('🌐 Behance Portfolio', config.portfolioUrl),
    Markup.button.url('🌍 Website Showcase', config.websiteUrl)
  ];

  return ctx.reply(MESSAGES.portfolio, {
    parse_mode: 'HTML',
    disable_web_page_preview: true,
    ...getBackToMenuKeyboard(showcaseButtons)
  });
};
