# FT JITHIN DESIGNZ - Telegram Support Bot 🎨🤖

Official Telegram support and customer intake bot for **FT JITHIN DESIGNZ**, now powered by **Google Gemini AI**.
- **Bot Username:** [@FTJithinSupportBot](https://t.me/FTJithinSupportBot)
- **Tech Stack:** Node.js, JavaScript, [Telegraf](https://telegraf.js.org/), [@google/genai](https://www.npmjs.com/package/@google/genai), dotenv

---

## 🚀 Features

1. **🤖 Gemini AI Customer Support:**
   - Free-form client queries (e.g. *"Can you design a brand identity for my bakery?", "What are your logo packages?"*) are answered in real-time by Google's `gemini-2.5-flash` model.
   - Grounded specifically in FT JITHIN DESIGNZ business context (services, pricing, brand philosophy, contact).
   - Generates action buttons (`[📞 Chat with Owner]`, `[🛠️ Services]`, `[🏷️ Pricing]`, `[🔙 Main Menu]`).
   - Shows native Telegram typing indicators while generating responses.

2. **🛡️ Graceful Fallback:**
   - If the Gemini API key is missing or the API is unreachable, the bot automatically falls back to standard FAQ menus without throwing errors to clients.

3. **⚡ Core Commands & Interactive Menus:**
   - **`/start`** - Welcome message & interactive dashboard.
   - **`/services`** - Full catalog of design services (Branding, Social Media, UI/UX, Print).
   - **`/pricing`** - Configurable sample pricing packages and estimates.
   - **`/portfolio`** - Showcase placeholder with active Behance & website links.
   - **`/about`** - Brand philosophy and agency background.
   - **`/contact`** - Direct owner contact button (`@ftjithin`), email, and hours.
   - **`/help`** - Full command directory.

4. **🔒 Security & Secret Protection:**
   - All secrets (`BOT_TOKEN`, `GEMINI_API_KEY`) are kept strictly in server-side `.env`.
   - `.env` is safeguarded in `.gitignore`.
   - Built-in logger automatically redacts bot tokens and API keys from logs and error traces.

---

## 📁 Project Structure

```text
FTJithinTelegramBot/
├── src/
│   ├── bot.js                  # Main bot entry point, middleware & lifecycle
│   ├── commands/
│   │   ├── index.js            # Command registry
│   │   ├── start.js            # /start
│   │   ├── help.js             # /help
│   │   ├── about.js            # /about
│   │   ├── portfolio.js        # /portfolio
│   │   ├── services.js         # /services
│   │   ├── pricing.js          # /pricing
│   │   └── contact.js          # /contact
│   ├── handlers/
│   │   ├── callbackQuery.js    # Inline button action handlers
│   │   ├── message.js          # Unknown message fallback & Gemini AI integration
│   │   └── error.js            # Safe logger & secret-redacting error handling
│   ├── keyboards/
│   │   └── mainMenu.js         # Reusable inline keyboard layouts
│   ├── services/
│   │   └── gemini.js           # Google GenAI service with business prompt
│   └── config/
│       ├── constants.js        # Brand information, service details & messages
│       └── environment.js      # Environment variable loader & validator
├── tests/
│   └── testFoundation.js       # Foundation & AI integration verification tests
├── .env                        # Local secret config (ignored in Git)
├── .env.example                # Safe environment template
├── .gitignore                  # Git ignore rules
├── package.json                # Project dependencies & scripts
└── README.md                   # Documentation
```

---

## 🛠️ Local Run Guide

### 1. Configure Environment Variables
Ensure your `.env` contains:
```env
BOT_TOKEN=your_telegram_bot_token_here
GEMINI_API_KEY=your_gemini_api_key_here
```

### 2. Start the Bot
```bash
npm start
```
*(Or `npm run dev` for automatic hot-reloading on code changes).*

### 3. Verify
Run the test suite at any time:
```bash
npm test
```
