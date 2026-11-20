/**
 * Inline Keyboards for interactive Telegram navigation
 */

const { Markup } = require('telegraf');

/**
 * Main dashboard keyboard (2x4 grid)
 */
function getMainMenuKeyboard() {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback('🛠️ Services', 'action_services'),
      Markup.button.callback('🏷️ Pricing', 'action_pricing')
    ],
    [
      Markup.button.callback('🎓 Courses', 'action_courses'),
      Markup.button.callback('💼 Portfolio', 'action_portfolio')
    ],
    [
      Markup.button.callback('🎨 About Us', 'action_about'),
      Markup.button.callback('❓ FAQ', 'action_faq')
    ],
    [
      Markup.button.callback('📞 Contact Admin', 'action_contact'),
      Markup.button.callback('📋 Commands', 'action_help')
    ]
  ]);
}

/**
 * Reusable Back to Main Menu button keyboard
 */
function getBackToMenuKeyboard(extraButtons = []) {
  const rows = [];

  if (extraButtons.length > 0) {
    rows.push(extraButtons);
  }

  rows.push([
    Markup.button.callback('🔙 Back to Main Menu', 'action_main')
  ]);

  return Markup.inlineKeyboard(rows);
}

/**
 * Contact screen keyboard with direct chat button
 */
function getContactKeyboard(ownerHandle) {
  const cleanHandle = (ownerHandle || 'ftjithin').replace('@', '');
  const directChatUrl = `https://t.me/${cleanHandle}`;

  return Markup.inlineKeyboard([
    [
      Markup.button.url('💬 Chat with Jithin on Telegram', directChatUrl)
    ],
    [
      Markup.button.callback('🛠️ Services', 'action_services'),
      Markup.button.callback('🎓 Courses', 'action_courses')
    ],
    [
      Markup.button.callback('🔙 Back to Main Menu', 'action_main')
    ]
  ]);
}

/**
 * AI Response helper keyboard with relevant quick actions
 */
function getAiResponseKeyboard(ownerHandle) {
  const cleanHandle = (ownerHandle || 'ftjithin').replace('@', '');
  const directChatUrl = `https://t.me/${cleanHandle}`;

  return Markup.inlineKeyboard([
    [
      Markup.button.url('📞 Chat with Admin', directChatUrl),
      Markup.button.callback('🛠️ Services', 'action_services')
    ],
    [
      Markup.button.callback('🎓 Courses', 'action_courses'),
      Markup.button.callback('🔙 Main Menu', 'action_main')
    ]
  ]);
}

module.exports = {
  getMainMenuKeyboard,
  getBackToMenuKeyboard,
  getContactKeyboard,
  getAiResponseKeyboard
};
