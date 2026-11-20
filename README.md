# Modern Apple-Grade SaaS Portfolio, Course LMS & Admin Suite

A minimal, ultra-modern portfolio website engineered with Apple-inspired kinetic typography, SaaS interactive animations, a dedicated Course LMS interface, and a secure Admin Command Center with Supabase integration.

---

## ✦ Key Features

1. **Apple-Style Text Animation & Kinetic Typography**
   - Live kinetic rotator cycling through core competencies with smooth Apple-style ease.
   - Luminous scroll-scrubbed text reveal that dynamically illuminates words as the user scrolls.

2. **Refined Black & White Aesthetic with Light Minimal RGB**
   - Modern charcoal obsidian zinc backdrop (`#0c0e14`, avoiding harsh `#000000`).
   - High-contrast pure white and cool silver typography.
   - Light minimal RGB spectrum accents on the top scroll progress bar, status pill, and interactive buttons.

3. **SaaS Dashboard Interactive Showcase (Hero Section)**
   - Grounded, rock-solid telemetry showcase (zero 3D tilt/wobble for maximum elegance).
   - Live interactive metric tabs (*Overview*, *Analytics*, *Retention*).
   - Dynamic bar chart simulation responding to user interaction.

4. **Dedicated Course LMS Interface (`course.html`)**
   - Video player with play/pause, timeline scrubber, and speed controls.
   - Interactive curriculum checklist with completion progress calculations.
   - Persistent student notepad saved locally.
   - Real-time synchronization with the Admin Studio.

5. **Restricted Admin Command Suite (`admin.html`)**
   - Protected by passkey authentication gate (Default PIN: `2026`) and Touch ID simulation.
   - **Course Studio**: Author new courses and lessons that publish directly to the student LMS.
   - **Customer Dispatches CRM**: Real-time inbox capturing all project inquiries, 1:1 discovery calls, and course waitlist signups.
   - 1-click **Export to CSV** for customer leads.

6. **Full Supabase Integration**
   - Complete Next.js server/client/middleware helpers in `utils/supabase/`.
   - Client-side connector in `assets/js/supabase.js`.
   - Environment configuration in `.env.local`.

---

## ✦ How to Run & View

You can open the website in any browser directly without needing build tools:

- Open `index.html` to view the flagship portfolio.
- Open `course.html` to view the Course LMS.
- Open `admin.html` to access the Admin Command Suite (PIN: `2026`).

---

## ✦ File Structure

```
├── index.html          # Main Apple-style portfolio
├── about.html          # Dedicated About page
├── works.html          # Dedicated Works gallery
├── course.html         # Dedicated Course LMS Learning Interface
├── contact.html        # Dedicated Contact page
├── admin.html          # Secure Admin Command Suite
├── page.tsx            # Supabase Server Component
├── .env.local          # Supabase environment variables
├── utils/supabase/     # Server, client, and middleware helpers
├── assets/
│   ├── css/
│   │   └── style.css   # Kinetic typography, obsidian theme, progress bar
│   └── js/
│       ├── main.js     # Kinetic rotator, modals, scroll tracking
│       ├── course.js   # LMS player, curriculum accordion
│       ├── admin.js    # Passkey auth, course builder, dispatches CRM
│       └── supabase.js # Supabase database connector
└── README.md           # Documentation
```
