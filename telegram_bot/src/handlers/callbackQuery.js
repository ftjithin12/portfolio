/**
 * Callback Query Handler
 * Handles inline keyboard button clicks for fast, frictionless navigation
 */

const { Markup } = require('telegraf');
const { MESSAGES } = require('../config/constants');
const {
  getMainMenuKeyboard,
  getBackToMenuKeyboard,
  getContactKeyboard
} = require('../keyboards/mainMenu');
const { config } = require('../config/environment');

/**
 * Helper to update message in-place or reply fresh if unchanged/expired
 */
async function renderScreen(ctx, text, extra = {}) {
  try {
    await ctx.editMessageText(text, {
      parse_mode: 'HTML',
      ...extra
    });
  } catch (err) {
    if (!err.message?.includes('message is not modified')) {
      await ctx.reply(text, {
        parse_mode: 'HTML',
        ...extra
      });
    }
  }
}

function registerCallbackHandlers(bot) {
  // Main Menu / Back
  bot.action('action_main', async (ctx) => {
    await ctx.answerCbQuery();
    const firstName = ctx.from?.first_name || '';
    return renderScreen(ctx, MESSAGES.welcome(firstName), getMainMenuKeyboard());
  });

  // Services
  bot.action('action_services', async (ctx) => {
    await ctx.answerCbQuery();
    return renderScreen(ctx, MESSAGES.services, getBackToMenuKeyboard());
  });

  // Pricing
  bot.action('action_pricing', async (ctx) => {
    await ctx.answerCbQuery();
    return renderScreen(ctx, MESSAGES.pricing, getBackToMenuKeyboard());
  });

  // Courses
  bot.action('action_courses', async (ctx) => {
    await ctx.answerCbQuery();
    const cleanHandle = (config.ownerHandle || 'ftjithin').replace('@', '');
    const extra = [
      Markup.button.url('📝 Inquire / Enroll with Admin', `https://t.me/${cleanHandle}`)
    ];
    return renderScreen(ctx, MESSAGES.courses, getBackToMenuKeyboard(extra));
  });

  // Portfolio
  bot.action('action_portfolio', async (ctx) => {
    await ctx.answerCbQuery();
    const showcaseButtons = [
      Markup.button.url('🌐 Behance Portfolio', config.portfolioUrl),
      Markup.button.url('🌍 Website Showcase', config.websiteUrl)
    ];
    return renderScreen(ctx, MESSAGES.portfolio, {
      disable_web_page_preview: true,
      ...getBackToMenuKeyboard(showcaseButtons)
    });
  });

  // About
  bot.action('action_about', async (ctx) => {
    await ctx.answerCbQuery();
    return renderScreen(ctx, MESSAGES.about, getBackToMenuKeyboard());
  });

  // FAQ
  bot.action('action_faq', async (ctx) => {
    await ctx.answerCbQuery();
    return renderScreen(ctx, MESSAGES.faq, getBackToMenuKeyboard());
  });

  // Contact
  bot.action('action_contact', async (ctx) => {
    await ctx.answerCbQuery();
    return renderScreen(
      ctx,
      MESSAGES.contact(config.ownerHandle, config.contactEmail),
      getContactKeyboard(config.ownerHandle)
    );
  });

  // Help
  bot.action('action_help', async (ctx) => {
    await ctx.answerCbQuery();
    return renderScreen(ctx, MESSAGES.help, getMainMenuKeyboard());
  });
}

module.exports = {
  registerCallbackHandlers
};
