/**
 * FT JITHIN DESIGNZ - Telegram Support Bot
 * Bot Username: @FTJithinSupportBot
 *
 * Professional AI-powered business customer support bot for
 * FT JITHIN DESIGNZ: Graphic design, Poster design, Video editing,
 * Branding, and Online Creative Courses.
 */

const { Telegraf } = require('telegraf');
const { config, validateConfig } = require('./config/environment');
const { BRAND } = require('./config/constants');
const { createLogger, registerErrorHandler } = require('./handlers/error');
const { registerCommands } = require('./commands');
const { registerCallbackHandlers } = require('./handlers/callbackQuery');
const { registerMessageHandler } = require('./handlers/message');
const { isGeminiConfigured } = require('./services/gemini');

// Initialize safe logger (automatically scrubs bot token and API keys from logs)
const logger = createLogger([config.botToken, config.geminiApiKey]);

async function startBot() {
  logger.info(`Initializing ${BRAND.name} Support Bot (${BRAND.botUsername})...`);

  // Validate configuration before starting
  const validation = validateConfig();
  if (!validation.isValid) {
    logger.error(`Startup blocked: ${validation.error}`);
    console.error(`\n-------------------------------------------------------------`);
    console.error(`❌ CONFIGURATION ERROR:`);
    console.error(`   ${validation.error}`);
    console.error(`\n👉 NEXT STEPS:`);
    console.error(`   1. Open .env in your project folder`);
    console.error(`   2. Replace "your_telegram_bot_token_here" with your token from @BotFather`);
    console.error(`   3. Save and re-run: npm start`);
    console.error(`-------------------------------------------------------------\n`);
    process.exit(1);
  }

  // Instantiate Telegraf bot
  const bot = new Telegraf(config.botToken);

  // 1. Centralized error handling
  registerErrorHandler(bot, logger);

  // 2. Logging middleware for incoming interactions
  bot.use(async (ctx, next) => {
    const fromUser = ctx.from
      ? `@${ctx.from.username || ctx.from.first_name || 'unknown'} (ID: ${ctx.from.id})`
      : 'anonymous';
    const actionDesc = ctx.message?.text || ctx.callbackQuery?.data || ctx.updateType;
    logger.info(`Received [${ctx.updateType}] from ${fromUser}: ${actionDesc}`);
    return next();
  });

  // 3. Register Slash Commands
  registerCommands(bot);

  // 4. Register Inline Keyboard Callback Handlers
  registerCallbackHandlers(bot);

  // 5. Register Message Fallback & Gemini AI Handler
  registerMessageHandler(bot, logger);

  // Check Gemini status
  if (isGeminiConfigured()) {
    logger.info(`🤖 Gemini AI Support: ENABLED (Model: ${config.geminiModel})`);
  } else {
    logger.warn('⚠️ Gemini AI Support: DISABLED (GEMINI_API_KEY missing - using static FAQ fallback)');
  }

  // Set Telegram command suggestions menu
  try {
    await bot.telegram.setMyCommands([
      { command: 'start', description: '🚀 Welcome message & main dashboard' },
      { command: 'services', description: '🛠️ Graphic, poster & video services' },
      { command: 'courses', description: '🎓 Online creative courses' },
      { command: 'pricing', description: '🏷️ Sample pricing packages' },
      { command: 'portfolio', description: '💼 View portfolio & works' },
      { command: 'about', description: '🎨 About FT JITHIN DESIGNZ' },
      { command: 'faq', description: '❓ Frequently asked questions' },
      { command: 'contact', description: '📞 Contact admin directly' },
      { command: 'help', description: '📋 Help and command directory' }
    ]);
    logger.info('Telegram menu commands registered successfully.');
  } catch (cmdErr) {
    logger.warn('Could not sync setMyCommands with Telegram API (will retry on next launch).');
  }

  // Launch polling
  logger.info(`Starting Telegram bot long-polling in [${config.nodeEnv}] mode...`);
  await bot.launch();
  logger.info(`✅ ${BRAND.name} Support Bot is now LIVE and listening for messages!`);

  // Graceful shutdown handling
  const stop = (signal) => {
    logger.info(`Received ${signal}. Gracefully stopping bot...`);
    bot.stop(signal);
    process.exit(0);
  };

  process.once('SIGINT', () => stop('SIGINT'));
  process.once('SIGTERM', () => stop('SIGTERM'));
}

// Start bot if run directly
if (require.main === module) {
  startBot().catch((err) => {
    logger.error('Fatal crash on startup', err);
    process.exit(1);
  });
}

module.exports = {
  startBot
};
