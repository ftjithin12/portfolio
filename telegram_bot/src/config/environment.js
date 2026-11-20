/**
 * Environment configuration and validation
 */

const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from bot directory .env or current working directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

function validateConfig() {
  const token = process.env.BOT_TOKEN;

  // Check if token exists and is not the placeholder text
  if (!token || token.trim() === '' || token === 'your_telegram_bot_token_here') {
    return {
      isValid: false,
      error: 'Missing or placeholder BOT_TOKEN in environment. Please set a valid Telegram bot token in .env.'
    };
  }

  // Telegram bot tokens typically match format: <digits>:<string>
  const tokenFormat = /^\d+:[A-Za-z0-9_-]+$/;
  if (!tokenFormat.test(token.trim())) {
    return {
      isValid: false,
      error: 'BOT_TOKEN format appears invalid. It should look like "123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ".'
    };
  }

  return {
    isValid: true
  };
}

/**
 * Parse comma-separated list of admin Telegram IDs
 */
function parseAdminIds(rawIds) {
  if (!rawIds) return [];
  return rawIds
    .split(',')
    .map(id => id.trim())
    .filter(id => id.length > 0)
    .map(id => isNaN(Number(id)) ? id : Number(id));
}

const config = {
  botToken: process.env.BOT_TOKEN ? process.env.BOT_TOKEN.trim() : '',
  geminiApiKey: process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.trim() : '',
  geminiModel: process.env.GEMINI_MODEL ? process.env.GEMINI_MODEL.trim() : 'gemini-3.5-flash-lite',
  adminUserIds: parseAdminIds(process.env.ADMIN_TELEGRAM_IDS),
  nodeEnv: process.env.NODE_ENV || 'development',
  ownerHandle: process.env.OWNER_TELEGRAM_HANDLE || '@ftjithin',
  contactEmail: process.env.CONTACT_EMAIL || 'contact@ftjithindesignz.com',
  websiteUrl: process.env.WEBSITE_URL || 'https://ftjithindesignz.com',
  portfolioUrl: process.env.PORTFOLIO_URL || 'https://behance.net/ftjithin'
};

module.exports = {
  config,
  validateConfig
};
