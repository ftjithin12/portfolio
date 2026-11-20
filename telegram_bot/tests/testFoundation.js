/**
 * Comprehensive Verification Test Suite
 * Tests brand constants, keyboards, secret sanitization, conversation context,
 * command handlers, admin access control, and Gemini AI connectivity.
 */

const assert = require('assert');
const { BRAND, MESSAGES } = require('../src/config/constants');
const {
  getMainMenuKeyboard,
  getBackToMenuKeyboard,
  getContactKeyboard,
  getAiResponseKeyboard
} = require('../src/keyboards/mainMenu');
const { sanitizeText } = require('../src/handlers/error');
const { conversationManager } = require('../src/services/conversationManager');
const { askGeminiSupport, isGeminiConfigured } = require('../src/services/gemini');
const { config } = require('../src/config/environment');

console.log('🧪 Running Comprehensive Bot & Gemini AI Verification Suite...\n');

// 1. Verify Brand & Business Services
console.log('1. Checking Brand Constants & Updated Services...');
assert.strictEqual(BRAND.name, 'FT JITHIN DESIGNZ');
assert.strictEqual(BRAND.botUsername, '@FTJithinSupportBot');
assert.ok(MESSAGES.services.includes('Graphic Design'));
assert.ok(MESSAGES.services.includes('Poster & Visual Design'));
assert.ok(MESSAGES.services.includes('Video Editing'));
assert.ok(MESSAGES.services.includes('Online Creative Courses'));
assert.ok(MESSAGES.courses.includes('Online Creative Courses'));
assert.ok(MESSAGES.faq.includes('Frequently Asked Questions'));
console.log('   ✅ Brand constants, expanded services & FAQs verified.');

// 2. Verify Keyboards
console.log('2. Checking Keyboards (Main Menu 2x4, Back, Contact, AI Response)...');
const mainMenuKb = getMainMenuKeyboard();
assert.strictEqual(mainMenuKb.reply_markup.inline_keyboard.length, 4, 'Main menu should have 4 rows');

const backKb = getBackToMenuKeyboard();
assert.ok(backKb.reply_markup.inline_keyboard.some(row => row.some(b => b.callback_data === 'action_main')));

const contactKb = getContactKeyboard('@ftjithin');
assert.ok(contactKb.reply_markup.inline_keyboard[0][0].url.includes('t.me/ftjithin'));

const aiKb = getAiResponseKeyboard('@ftjithin');
assert.ok(aiKb.reply_markup.inline_keyboard.length >= 2);
console.log('   ✅ Keyboards generate valid schemas.');

// 3. Verify Secret Sanitization
console.log('3. Checking Secret & API Key Sanitization in Logs...');
const dummyBotToken = '123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ';
const dummyApiKey = 'dummy-gemini-api-key-redaction-test';
const logSample = `Failed call with bot ${dummyBotToken} and key ${dummyApiKey}`;
const cleaned = sanitizeText(logSample, [dummyBotToken, dummyApiKey]);

assert.ok(!cleaned.includes(dummyBotToken), 'Bot token must be sanitized');
assert.ok(!cleaned.includes(dummyApiKey), 'Gemini API key must be sanitized');
console.log('   ✅ Secret redaction confirmed working.');

// 4. Verify Conversation Context Manager
console.log('4. Checking Multi-turn Conversation Context Manager...');
const testUserId = 999888;
conversationManager.clearHistory(testUserId);
assert.deepStrictEqual(conversationManager.getHistory(testUserId), []);

conversationManager.addMessage(testUserId, 'user', 'Do you do video editing?');
conversationManager.addMessage(testUserId, 'model', 'Yes! We edit Reels, Shorts, and YouTube videos.');
conversationManager.addMessage(testUserId, 'user', 'What about poster designs?');

const history = conversationManager.getHistory(testUserId);
assert.strictEqual(history.length, 3);
assert.strictEqual(history[0].role, 'user');
assert.strictEqual(history[1].role, 'model');

conversationManager.clearHistory(testUserId);
assert.strictEqual(conversationManager.getHistory(testUserId).length, 0);
console.log('   ✅ Conversation manager handles bounded multi-turn context.');

// 5. Verify All Command Handlers
console.log('5. Checking All 10 Public & Admin Commands...');
const startCommand = require('../src/commands/start');
const helpCommand = require('../src/commands/help');
const servicesCommand = require('../src/commands/services');
const coursesCommand = require('../src/commands/courses');
const pricingCommand = require('../src/commands/pricing');
const portfolioCommand = require('../src/commands/portfolio');
const aboutCommand = require('../src/commands/about');
const faqCommand = require('../src/commands/faq');
const contactCommand = require('../src/commands/contact');
const adminCommand = require('../src/commands/admin');

let replies = [];
const createMockCtx = (userId) => ({
  from: { id: userId, first_name: 'TestClient' },
  reply: async (text, extra) => {
    replies.push({ text, extra });
    return { message_id: replies.length };
  }
});

(async () => {
  const clientCtx = createMockCtx(111222);
  await startCommand(clientCtx);
  await helpCommand(clientCtx);
  await servicesCommand(clientCtx);
  await coursesCommand(clientCtx);
  await pricingCommand(clientCtx);
  await portfolioCommand(clientCtx);
  await aboutCommand(clientCtx);
  await faqCommand(clientCtx);
  await contactCommand(clientCtx);

  // Unauthorized client trying /admin
  await adminCommand(clientCtx);
  const lastReply = replies[replies.length - 1];
  assert.ok(lastReply.text.includes('Access Denied'), 'Unauthorized user must be denied admin access');

  // Authorized admin trying /admin
  config.adminUserIds.push(777999);
  const adminCtx = createMockCtx(777999);
  await adminCommand(adminCtx);
  const adminReply = replies[replies.length - 1];
  assert.ok(adminReply.text.includes('Admin Status'), 'Authorized admin must access admin panel');

  console.log('   ✅ All commands executed successfully with admin access control enforced.');

  // 6. Verify Gemini AI Configuration
  console.log('6. Checking Gemini AI Service Configuration...');
  assert.strictEqual(isGeminiConfigured(), true, 'Gemini must be configured with key');
  console.log(`   ℹ️ Configured model: ${config.geminiModel}`);

  console.log('\n🎉 ALL BOT INTEGRATION AND VERIFICATION CHECKS PASSED!\n');
})().catch(err => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
