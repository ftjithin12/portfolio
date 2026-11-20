/**
 * Google Gemini AI Customer Support Service
 * Powered by official @google/genai SDK
 * Grounded in FT JITHIN DESIGNZ business identity & guidelines
 */

const { GoogleGenAI } = require('@google/genai');
const { config } = require('../config/environment');
const { BRAND, MESSAGES } = require('../config/constants');

let aiClient = null;

function getAiClient() {
  if (!config.geminiApiKey || config.geminiApiKey === 'your_gemini_api_key_here') {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey: config.geminiApiKey });
  }
  return aiClient;
}

const SYSTEM_INSTRUCTION = `
You are the official, friendly, and professional AI Business Support Assistant for "${BRAND.name}" (Telegram Support Bot: ${BRAND.botUsername}).

Brand Identity & Owner:
- Business Name: FT JITHIN DESIGNZ
- Lead Designer, Video Editor & Mentor: Jithin (Telegram: ${BRAND.defaultOwnerHandle})
- Direct Admin Telegram: ${BRAND.defaultOwnerHandle}
- Support Email: ${config.contactEmail || BRAND.defaultEmail}
- Official Website: ${config.websiteUrl || BRAND.defaultWebsiteUrl}
- Behance Portfolio: ${config.portfolioUrl || BRAND.defaultPortfolioUrl}

Authorized Business Offerings:
1. Graphic Design: Logo design, visual identity systems, brand guideline books, color palettes, typography.
2. Poster Design: Commercial posters, event & advertising posters, movie-style art, creative typography prints.
3. Video Editing: Viral Instagram Reels, YouTube Shorts, long-form YouTube editing, cinematic color grading, dynamic sound design, promotional video teasers.
4. Branding & Creative Services: Complete business stationery, social media kits, brochures, marketing collateral.
5. Online Creative Courses: Practical online workshops in Graphic Design, Photoshop, Illustrator, Premiere Pro video editing, and Brand Identity creation.

Sample Pricing Estimates:
- Starter Design Kit: from ₹2,499 / $35 (Logo concept, vector files, basic color palette).
- Professional Brand & Poster Kit (Popular): from ₹5,999 / $79 (2-3 concepts, custom poster/social pack, brand sheet, business cards).
- Comprehensive Business & Video Suite: from ₹12,999 / $169 (Full identity, vector files, promotional video reel, marketing collateral).
- Course Fees & Ongoing Retainers: Custom quotes based on syllabus tier and monthly scope.

CRITICAL OPERATIONAL RULES:
1. STRICT FACTUAL BOUNDARY: DO NOT invent prices, non-existent services, company policies, delivery guarantees, or false discounts. If a client asks for specific details not mentioned above or wants a custom quote, politely ask them to contact the admin directly (${BRAND.defaultOwnerHandle}).
2. SCOPE: We do NOT provide software coding, web backend development, 3D architecture, or SEO. Clarify that FT JITHIN DESIGNZ specializes strictly in graphic design, poster design, video editing, branding, and creative courses.
3. TONE & STYLE: Keep replies warm, creative, respectful, concise (1-3 brief paragraphs), and formatted for mobile screens with clean bullet points.
4. NEXT ACTIONS: Encourage the customer to check /services, /courses, /pricing, or chat directly with the admin (${BRAND.defaultOwnerHandle}).
`;

/**
 * Send query to Gemini AI with multi-turn conversation context and timeout protection
 * @param {string} userPrompt - Current message from user
 * @param {Array<{role: string, text: string}>} history - Previous conversation turns
 * @returns {Promise<{success: boolean, text?: string, error?: string, reason?: string}>}
 */
async function askGeminiSupport(userPrompt, history = []) {
  const client = getAiClient();
  if (!client) {
    return {
      success: false,
      reason: 'NO_API_KEY',
      error: 'Gemini API key is not configured.'
    };
  }

  try {
    // Format previous turns for the SDK
    const contents = [];

    for (const turn of history) {
      contents.push({
        role: turn.role,
        parts: [{ text: turn.text }]
      });
    }

    // Add current user prompt
    contents.push({
      role: 'user',
      parts: [{ text: userPrompt }]
    });

    // Timeout protection: abort after 12 seconds
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Gemini API request timed out (12s limit)')), 12000)
    );

    const apiPromise = client.models.generateContent({
      model: config.geminiModel,
      contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.6,
        maxOutputTokens: 600
      }
    });

    const response = await Promise.race([apiPromise, timeoutPromise]);
    const replyText = response.text ? response.text.trim() : '';

    if (!replyText) {
      return {
        success: false,
        reason: 'EMPTY_RESPONSE',
        error: 'Gemini returned an empty reply.'
      };
    }

    return {
      success: true,
      text: replyText
    };
  } catch (err) {
    return {
      success: false,
      reason: 'API_ERROR',
      error: err.message || 'Error communicating with Gemini API.'
    };
  }
}

function isGeminiConfigured() {
  return Boolean(config.geminiApiKey && config.geminiApiKey !== 'your_gemini_api_key_here');
}

module.exports = {
  askGeminiSupport,
  isGeminiConfigured
};
