/**
 * Centralized Error Handler and Safe Logging
 * Ensures bot tokens, API keys, and sensitive data are NEVER leaked into logs
 */

function sanitizeText(text, secrets = []) {
  if (!text) return '';
  let str = String(text);

  const secretList = Array.isArray(secrets) ? secrets : [secrets];
  for (const secret of secretList) {
    if (secret && typeof secret === 'string' && secret.length > 5) {
      str = str.split(secret).join('[REDACTED_SECRET]');
    }
  }

  // Mask Telegram bot token pattern: digits:alphanumeric
  str = str.replace(/\b\d{8,11}:[A-Za-z0-9_-]{30,40}\b/g, '[REDACTED_BOT_TOKEN]');

  // Mask generic API key patterns (Google AI Studio, Vertex, etc.)
  str = str.replace(/\bAIzaSy[A-Za-z0-9_-]{33}\b/g, '[REDACTED_API_KEY]');
  str = str.replace(/\bAQ\.[A-Za-z0-9_-]{30,60}\b/g, '[REDACTED_API_KEY]');

  return str;
}

function createLogger(secrets = []) {
  return {
    info: (msg, ...args) => {
      const sanitized = sanitizeText(msg, secrets);
      console.log(`[INFO] [${new Date().toISOString()}] ${sanitized}`, ...args);
    },
    warn: (msg, ...args) => {
      const sanitized = sanitizeText(msg, secrets);
      console.warn(`[WARN] [${new Date().toISOString()}] ${sanitized}`, ...args);
    },
    error: (msg, err) => {
      const sanitizedMsg = sanitizeText(msg, secrets);
      const sanitizedErr = err ? sanitizeText(err.stack || err.message || err, secrets) : '';
      console.error(`[ERROR] [${new Date().toISOString()}] ${sanitizedMsg}`, sanitizedErr);
    }
  };
}

function registerErrorHandler(bot, logger) {
  bot.catch(async (err, ctx) => {
    logger.error(`Unhandled error during update [type: ${ctx.updateType}]`, err);

    try {
      if (ctx.reply) {
        await ctx.reply(
          '⚠️ <i>An unexpected issue occurred while processing your request. Please try again or use /start.</i>',
          { parse_mode: 'HTML' }
        );
      }
    } catch (replyErr) {
      logger.error('Failed to send error notification to user', replyErr);
    }
  });
}

module.exports = {
  createLogger,
  registerErrorHandler,
  sanitizeText
};
