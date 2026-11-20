const { Markup } = require('telegraf');
const { getBackToMenuKeyboard } = require('../keyboards/mainMenu');
const { saveTelegramDispatch } = require('../config/supabase');
const { config } = require('../config/environment');

/**
 * Handle /enquiry command
 * Allows Telegram users to submit project inquiries that write directly to Supabase dispatches
 */
module.exports = async function enquiryCommand(ctx) {
  const fromUser = ctx.from;
  const username = fromUser?.username ? `@${fromUser.username}` : (fromUser?.first_name || 'Client');
  const userText = ctx.message?.text?.replace(/^\/enquiry\s*/i, '').trim();

  // If user just typed /enquiry without brief, show instructions
  if (!userText) {
    const guideMessage = `
📬 <b>Submit a Project Enquiry to Jithin</b>
━━━━━━━━━━━━━━━━━━━━━
Send your design or motion project details directly to our studio CRM.

<b>Usage:</b>
Type <code>/enquiry</code> followed by your project details.

<b>Example:</b>
<code>/enquiry Hi Jithin! I need a 30-second kinetic typography promo for my tech product. Budget $1,500 - $3,500. Timeline 2 weeks. Email: client@example.com</code>

👇 <i>Or tap <b>Contact Owner</b> below to message Jithin directly!</i>
`;
    return ctx.reply(guideMessage, {
      parse_mode: 'HTML',
      ...Markup.inlineKeyboard([
        [Markup.button.url('💬 Chat with Owner', `https://t.me/${(config.ownerHandle || 'ftjithin').replace('@', '')}`)],
        [Markup.button.callback('🔙 Back to Main Menu', 'action_main')]
      ])
    });
  }

  // Save enquiry to Supabase public.dispatches
  const dispatchRecord = {
    id: `disp-tg-${Date.now()}`,
    type: 'Telegram Project Enquiry',
    name: `${fromUser?.first_name || ''} ${fromUser?.last_name || ''}`.trim() || username,
    email: username,
    budget: detectBudgetBracket(userText),
    message: `[Telegram User: ${username} (ID: ${fromUser?.id})]\n\n${userText}`,
    status: 'Unread'
  };

  const saved = await saveTelegramDispatch(dispatchRecord);

  // Send instant push notification to Jithin if ADMIN_TELEGRAM_CHAT_ID is set
  if (config.adminChatId) {
    try {
      const alertMsg = `🚨 <b>NEW TELEGRAM ENQUIRY RECEIVED!</b>\n━━━━━━━━━━━━━━━━━━━━━\n<b>From:</b> ${escapeHtml(dispatchRecord.name)} (${username})\n<b>Budget:</b> ${dispatchRecord.budget}\n<b>Brief:</b>\n<i>${escapeHtml(userText)}</i>\n━━━━━━━━━━━━━━━━━━━━━\n<a href="${config.websiteUrl}/admin.html">Open Web Admin CRM ↗</a>`;
      await ctx.telegram.sendMessage(config.adminChatId, alertMsg, { parse_mode: 'HTML' });
    } catch (pushErr) {
      console.warn('Admin push alert notice:', pushErr.message);
    }
  }

  const confirmMsg = `
✅ <b>Project Enquiry Received!</b>
━━━━━━━━━━━━━━━━━━━━━
Thank you, <b>${escapeHtml(fromUser?.first_name || 'Client')}</b>!

Your project brief has been logged into <b>FT JITHIN DESIGNZ</b> Studio CRM. Jithin will review your requirements and reach out to you directly.

📋 <b>Summary Logged:</b>
• <b>Client:</b> ${escapeHtml(username)}
• <b>Estimated Scope:</b> ${dispatchRecord.budget}
• <b>Status:</b> Dispatched to Studio (Unread)

⏱️ <i>Typical response time: Within a few hours.</i>
`;

  return ctx.reply(confirmMsg, {
    parse_mode: 'HTML',
    ...getBackToMenuKeyboard()
  });
};

function detectBudgetBracket(text) {
  const lower = text.toLowerCase();
  if (lower.includes('7500') || lower.includes('7,500') || lower.includes('10k') || lower.includes('large')) {
    return '$7,500+';
  }
  if (lower.includes('3500') || lower.includes('3,500') || lower.includes('5000') || lower.includes('5k')) {
    return '$3,500 - $7,500';
  }
  if (lower.includes('1500') || lower.includes('1,500') || lower.includes('2000') || lower.includes('2k') || lower.includes('3000')) {
    return '$1,500 - $3,500';
  }
  if (lower.includes('500') || lower.includes('1000') || lower.includes('starter') || lower.includes('small')) {
    return '$500 - $1,500';
  }
  return 'Custom Scope';
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
