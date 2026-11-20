/**
 * Application Constants and Brand Content
 * FT JITHIN DESIGNZ (@FTJithinSupportBot)
 */

const BRAND = {
  name: 'FT JITHIN DESIGNZ',
  tagline: 'Crafting Iconic Visuals, Posters, Videos & Creative Education',
  botUsername: '@FTJithinSupportBot',
  defaultOwnerHandle: '@ftjithin',
  defaultEmail: 'contact@ftjithindesignz.com',
  defaultPortfolioUrl: 'https://behance.net/ftjithin',
  defaultWebsiteUrl: 'https://ftjithindesignz.com'
};

const MESSAGES = {
  welcome: (firstName) => `
👋 <b>Welcome${firstName ? `, ${firstName}` : ''}!</b>

I am the official AI-powered support bot for <b>${BRAND.name}</b>.

✨ <i>${BRAND.tagline}</i>

We craft distinctive, modern visual designs, commercial posters, engaging video edits, and conduct hands-on online creative courses.

Ask me any question in natural language, or use the interactive menu below:
`,

  about: `
🎨 <b>About ${BRAND.name}</b>
━━━━━━━━━━━━━━━━━━━━━
Led by creative designer & editor <b>Jithin</b>, FT JITHIN DESIGNZ is an independent creative studio dedicated to elevating brands and creators.

<b>What we specialize in:</b>
• 🎯 <b>Graphic & Brand Design:</b> Meaningful visual identities that command attention.
• 🎬 <b>Cinematic Poster & Video Editing:</b> High-impact commercial posters & dynamic video edits.
• 🎓 <b>Creative Education:</b> Practical online courses designed for aspiring designers.
• ⚡ <b>Fast, Reliable Workflow:</b> Collaborative communication from draft to final render.

<i>"Good design doesn't just look great; it speaks to your audience and drives results."</i>
`,

  services: `
🛠️ <b>Our Creative Services</b>
━━━━━━━━━━━━━━━━━━━━━
1. 🏷️ <b>Graphic Design & Branding</b>
   • Logo design, brand marks & icons
   • Color palettes, typography systems & style guidelines
   • Social media templates & marketing kits

2. 🖼️ <b>Poster & Visual Design</b>
   • Commercial & advertising posters
   • Event, music & movie poster concepts
   • Typography posters & digital display graphics

3. 🎬 <b>Video Editing & Motion</b>
   • Viral Instagram Reels, YouTube Shorts & TikTok cuts
   • YouTube long-form video editing & color grading
   • Promotional video teasers & motion titles

4. 📦 <b>Print & Marketing Collateral</b>
   • Business cards, flyers, brochures & banners
   • Packaging & product mockups

5. 🎓 <b>Online Creative Courses</b>
   • Practical, project-based courses for beginner & intermediate creators
   • <i>Type /courses or tap below to explore current batches!</i>

💡 <i>Looking for a tailored quote? Tap <b>Contact Admin</b> below to chat with Jithin!</i>
`,

  courses: `
🎓 <b>Online Creative Courses by FT JITHIN DESIGNZ</b>
━━━━━━━━━━━━━━━━━━━━━
Learn industry-grade creative skills through hands-on, live mentoring sessions:

1. 🎨 <b>Graphic Design & Branding Masterclass</b>
   • Tools: Adobe Photoshop & Illustrator
   • Curriculum: Logo creation, typography, color harmony, visual hierarchy & portfolio building

2. 🎬 <b>Video Editing & Reel Creation Bootcamp</b>
   • Tools: Adobe Premiere Pro / Mobile editing workflows
   • Curriculum: Pacing, smooth transitions, audio mixing, color correction & viral hooks

3. 🖼️ <b>Poster Design & Visual Art Workshop</b>
   • Focused on composition, lighting, photo manipulation & creative poster art

📌 <b>Course Details & Enrollment:</b>
• Format: Live online sessions + recorded lifetime access + direct feedback
• For batch schedules, syllabus PDFs, and enrollment fees, tap <b>Contact Admin</b> below!
`,

  pricing: `
🏷️ <b>Sample Pricing & Packages</b>
━━━━━━━━━━━━━━━━━━━━━
<i>* All rates are starting estimates. Accurate quotes depend on project complexity and turnaround requirements.</i>

🥉 <b>Starter Design Kit</b>
• Logo concept + high-resolution PNG, SVG & vector files
• Color palette & typography pairings
• <i>Estimated: Starting from ₹2,499 / $35</i>

🥈 <b>Professional Brand & Poster Kit</b> (Most Popular ⭐)
• 2-3 Unique logo concepts + revision rounds
• Custom commercial poster or social media starter pack (5 designs)
• Full brand guideline sheet & print-ready business cards
• <i>Estimated: Starting from ₹5,999 / $79</i>

🥇 <b>Comprehensive Business & Video Suite</b>
• Complete visual identity + vector master files
• Social media design pack + promotional video reel edit
• Marketing collateral (flyer, brochure, business card)
• <i>Estimated: Starting from ₹12,999 / $169</i>

🎓 <b>Creative Courses Tuition:</b>
• Dependent on course tier (Weekend workshop vs Full multi-week bootcamp).
• Inquire directly via /contact for active batch discounts.
`,

  portfolio: `
💼 <b>Portfolio & Showcase</b>
━━━━━━━━━━━━━━━━━━━━━
Explore selected works, past commercial posters, and branding transformations:

🔗 <b>Online Showcases:</b>
• <b>Behance Portfolio:</b> <a href="${BRAND.defaultPortfolioUrl}">behance.net/ftjithin</a>
• <b>Official Website:</b> <a href="${BRAND.defaultWebsiteUrl}">ftjithindesignz.com</a>

💡 <i>Want samples tailored to your industry? Chat directly with the admin via /contact!</i>
`,

  contact: (ownerHandle, email) => `
📞 <b>Contact FT JITHIN DESIGNZ</b>
━━━━━━━━━━━━━━━━━━━━━
Have a project in mind, need a custom quote, or want to enroll in an upcoming course?

👤 <b>Admin / Lead Designer:</b> ${ownerHandle || BRAND.defaultOwnerHandle}
📧 <b>Email:</b> ${email || BRAND.defaultEmail}
🤖 <b>Support Bot:</b> ${BRAND.botUsername}

⏱️ <b>Working Hours:</b>
Monday – Saturday: 9:00 AM – 7:00 PM IST
<i>(We typically respond within a few hours)</i>

👇 <i>Click the button below to message the admin directly on Telegram!</i>
`,

  faq: `
❓ <b>Frequently Asked Questions (FAQ)</b>
━━━━━━━━━━━━━━━━━━━━━
<b>Q: How long does a logo or branding project take?</b>
A: Initial concepts are typically delivered in 3 to 5 business days, with revisions finalized collaboratively.

<b>Q: Do you provide editable vector source files?</b>
A: Yes! All standard design packages include industry-standard vector files (AI, EPS, SVG, and high-res print PDFs).

<b>Q: What video editing software do you use?</b>
A: We edit primarily with Adobe Premiere Pro and After Effects for cinematic cuts, smooth motion graphics, and crisp audio.

<b>Q: Are the online courses live or pre-recorded?</b>
A: Our courses feature live interactive sessions paired with recorded replays, resource packs, and 1-on-1 portfolio reviews.

<b>Q: Can I get a customized quote for my project?</b>
A: Absolutely! Message our admin directly via /contact with your brief.

💡 <i>You can also just type your question here, and our AI assistant will answer instantly!</i>
`,

  help: `
📋 <b>Command Directory & Quick Guide</b>
━━━━━━━━━━━━━━━━━━━━━
/start - 🚀 Welcome message & interactive dashboard
/services - 🛠️ Explore design, poster, video & course services
/courses - 🎓 Online creative courses & enrollment details
/pricing - 🏷️ Sample pricing packages & estimates
/portfolio - 💼 View portfolio & recent design works
/about - 🎨 About FT JITHIN DESIGNZ & creative vision
/faq - ❓ Frequently asked questions
/contact - 📞 Contact admin directly
/help - 📋 Show this guide

💬 <b>AI Customer Support:</b>
Simply type any question (e.g. <i>"Can you design posters for an event?", "How much for a logo?", "What video editing services do you offer?"</i>) and our AI will assist you instantly!
`,

  unknownFallback: `
👋 I couldn't reach the AI assistant right now, but I am here to help!

Please choose a category from the menu below or tap <b>Contact Admin</b> to reach out directly:
`
};

module.exports = {
  BRAND,
  MESSAGES
};
