const { config } = require('../config/environment');

/**
 * Handle /admin command
 * Security check: Restricts privileged admin commands to authorized Telegram user IDs
 */
module.exports = async function adminCommand(ctx) {
  const userId = ctx.from?.id;

  // Verify against authorized admin user IDs
  const isAuthorized = config.adminUserIds.length > 0 && config.adminUserIds.includes(userId);

  if (!isAuthorized) {
    return ctx.reply(
      '⛔ <b>Access Denied</b>\n\nThis command is restricted to authorized administrators only.',
      { parse_mode: 'HTML' }
    );
  }

  // Admin Dashboard info
  const uptimeHours = (process.uptime() / 3600).toFixed(2);
  const memoryUsageMB = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);

  return ctx.reply(
    `🔐 <b>FT JITHIN DESIGNZ - Admin Status</b>\n━━━━━━━━━━━━━━━━━━━━━\n` +
    `• <b>Admin ID:</b> <code>${userId}</code>\n` +
    `• <b>Bot Mode:</b> ${config.nodeEnv}\n` +
    `• <b>Gemini Model:</b> ${config.geminiModel}\n` +
    `• <b>Process Uptime:</b> ${uptimeHours} hours\n` +
    `• <b>Heap Memory:</b> ${memoryUsageMB} MB\n\n` +
    `<i>All systems operational. AI operations strictly segregated from admin privileges.</i>`,
    { parse_mode: 'HTML' }
  );
};
