# FT JITHIN DESIGNZ — AI-Powered Telegram Support Bot Deployment Blueprint

**Bot Username:** [@FTJithinSupportBot](https://t.me/FTJithinSupportBot)  
**Integrated With:** Google Gemini AI (`@google/genai`), FT JITHIN DESIGNZ Studio & Supabase Cloud Backend  
**Architecture:** Node.js 18+ (Telegraf) + Official `@google/genai` SDK + Bounded Context Memory + Realtime Alerts

---

## ⚡ Architecture & Customer Flow

```text
                               ┌────────────────────────────────────────────────────────┐
                               │           Customer on Telegram (@FTJithinSupportBot)   │
                               └───────────────────────────┬────────────────────────────┘
                                                           │
                      ┌────────────────────────────────────┴────────────────────────────────────┐
                      ▼                                                                         ▼
           [ Slash Commands & Menus ]                                                [ Natural Language Question ]
    /start, /services, /courses, /pricing,                                                      │
    /portfolio, /about, /faq, /contact                                                          ▼
                      │                                                              [ Google Gemini AI Engine ]
                      │                                                               Model: gemini-3.5-flash-lite
                      │                                                               Grounded in studio services,
                      │                                                               rules & out-of-scope boundaries
                      │                                                                         │
                      ▼                                                                         ▼
     Instant Interactive Responses                                                   Natural AI Answer + Action Buttons
```

---

## 🔑 Environment Variables Reference

Create or update `.env` in `telegram_bot/`:

| Variable | Required | Description | Example |
| :--- | :---: | :--- | :--- |
| `BOT_TOKEN` | **YES** | Telegram Bot API token from [@BotFather](https://t.me/BotFather) | `905612...:AA...` |
| `GEMINI_API_KEY` | **YES** | Google Gemini API Key from [Google AI Studio](https://aistudio.google.com/) | `AIzaSyYourGeminiApiKeyHere` |
| `GEMINI_MODEL` | No | Selected Gemini model (default: `gemini-3.5-flash-lite`) | `gemini-3.5-flash-lite` |
| `ADMIN_TELEGRAM_IDS` | No | Authorized Admin Telegram IDs (comma-separated, e.g. `123456789`) | `123456789` |
| `OWNER_TELEGRAM_HANDLE` | No | Jithin's personal Telegram handle for escalations | `@ftjithin` |
| `CONTACT_EMAIL` | No | Studio email address | `contact@ftjithindesignz.com` |
| `WEBSITE_URL` | No | Live Portfolio URL | `https://ftjithindesignz.com` |
| `PORTFOLIO_URL` | No | External Behance / Portfolio showcase | `https://behance.net/ftjithin` |
| `NODE_ENV` | No | Environment mode (`development` or `production`) | `production` |

---

## 🚀 Option 1: Deploy Free 24/7 on Render.com (Recommended)

Render offers free Background Worker / Web Service hosting that keeps your bot running 24/7.

### Steps:
1. Push your repository to your private GitHub repo (once you are ready).
2. Go to [Render Dashboard](https://dashboard.render.com/) and click **New +** ➔ **Background Worker** (or **Web Service**).
3. Connect your GitHub repository.
4. Fill in the build settings:
   - **Name:** `ft-jithin-telegram-bot`
   - **Root Directory:** `telegram_bot`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. In the **Environment Variables** tab, add:
   - `BOT_TOKEN` = `your_token_from_botfather`
   - `ADMIN_TELEGRAM_CHAT_ID` = `your_chat_id`
   - `SUPABASE_URL` = `https://pbgwnzutcypnkjdcmkes.supabase.co`
   - `SUPABASE_ANON_KEY` = `your_anon_key`
   - `SUPABASE_SERVICE_ROLE_KEY` = `your_service_role_key`
   - `NODE_ENV` = `production`
6. Click **Deploy**. Your bot will connect to Telegram Long Polling and Supabase Realtime in seconds!

---

## 🚆 Option 2: Deploy on Railway.app

1. Go to [Railway.app](https://railway.app/) and create a **New Project**.
2. Select **Deploy from GitHub repo**.
3. In settings, set **Root Directory** to `/telegram_bot`.
4. Under **Variables**, add all keys from the table above.
5. Railway will automatically detect Node.js, run `npm install`, and launch `npm start`.

---

## 💻 Option 3: Local Testing / Running on Your Machine

```bash
# 1. Navigate to the bot directory
cd telegram_bot

# 2. Copy the sample environment file
cp .env.example .env
# (On Windows PowerShell: Copy-Item .env.example .env)

# 3. Open .env in your editor and enter your BOT_TOKEN & ADMIN_TELEGRAM_CHAT_ID

# 4. Install dependencies
npm install

# 5. Launch the bot
npm start
```

Expected terminal output:
```text
[INFO] FT JITHIN DESIGNZ Telegram Bot initialized successfully.
[INFO] Supabase connection established: https://pbgwnzutcypnkjdcmkes.supabase.co
[INFO] Realtime subscription active for table: public.dispatches
[INFO] Bot is running in polling mode.
```

---

## 🛠️ Verification & Diagnostics

Once running, send these commands to `@FTJithinSupportBot`:

1. `/start` — Should display the branded studio greeting with inline action buttons.
2. `/portfolio` — Should display live projects fetched from Supabase `public.projects`.
3. `/services` — Should list Graphic Design, Motion Graphics, Video Editing, etc., with current rates.
4. `/faq` — Should display the answers to common questions fetched from `public.faqs`.
5. `/enquiry` — Walk through the interactive brief intake. Confirm that the inquiry is saved to Supabase `dispatches` and an instant alert is pushed to your private Telegram chat.
6. `/admin` — (Only works when sent from `ADMIN_TELEGRAM_CHAT_ID`): Displays current unread inquiries and studio statistics.
