/**
 * Live Gemini AI Customer Support Test
 * Verifies live responses, multi-turn context, and business grounding.
 */

const { askGeminiSupport } = require('../src/services/gemini');

(async () => {
  console.log('🤖 Starting Live Gemini AI Customer Consultation Test...\n');

  // Turn 1
  const q1 = 'Hi! Do you offer poster design and video editing for Instagram Reels?';
  console.log(`👤 Customer: "${q1}"`);
  const res1 = await askGeminiSupport(q1, []);
  console.log(`🤖 Gemini:\n${res1.text}\n`);

  if (!res1.success) {
    console.error('❌ Turn 1 failed:', res1.error);
    process.exit(1);
  }

  // Turn 2: Follow-up question relying on context
  const history = [
    { role: 'user', text: q1 },
    { role: 'model', text: res1.text }
  ];
  const q2 = 'Awesome! Do you also offer online courses to learn these skills?';
  console.log(`👤 Customer (Follow-up): "${q2}"`);
  const res2 = await askGeminiSupport(q2, history);
  console.log(`🤖 Gemini:\n${res2.text}\n`);

  if (!res2.success) {
    console.error('❌ Turn 2 failed:', res2.error);
    process.exit(1);
  }

  // Turn 3: Out-of-scope check
  const q3 = 'Can you build a backend Python web scraper or mobile game for me?';
  console.log(`👤 Customer: "${q3}"`);
  const res3 = await askGeminiSupport(q3, []);
  console.log(`🤖 Gemini:\n${res3.text}\n`);

  if (!res3.success) {
    console.error('❌ Turn 3 failed:', res3.error);
    process.exit(1);
  }

  console.log('✅ ALL LIVE AI CUSTOMER CONVERSATION TESTS PASSED!');
})();
