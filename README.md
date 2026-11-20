# FT JITHIN DESIGNZ — Personal Portfolio & Creative Studio

The official personal portfolio of **Jithin** (**FT JITHIN DESIGNZ**) — Motion Designer, Graphic Designer, Video Editor, Visual Storyteller, and Creative Digital Artist.

> **Main Tagline**: *"Turning Ideas Into Visual Experiences."*

---

## ✦ Creative Core & Identity

- **Designer**: Jithin
- **Brand**: FT JITHIN DESIGNZ
- **Disciplines**:
  - **Motion Graphics**: Kinetic typography, title sequences, 2D/3D animated identities.
  - **Graphic Design**: Typographic systems, visual identities, key visual compositions.
  - **Video Editing**: Narrative pacing, scene transitions, and audio sync.
  - **Poster Design**: Artistic print & digital poster art, expressive layout typography.
  - **Social Media Creatives**: High-impact reels, motion teasers, and campaign assets.
  - **Visual Branding**: Cohesive brand identity systems and design language.
- **Production Toolkit**:
  - Adobe Photoshop
  - Adobe After Effects
  - Adobe Premiere Pro
  - DaVinci Resolve

---

## ✦ Key Architectural Features

1. **Dynamic Portfolio Engine Connected to Supabase**
   - Public Works gallery rendered dynamically from Supabase / LocalStorage.
   - Filter by discipline (*Motion Graphics*, *Graphic Design*, *Video Editing*, *Poster Design*, etc.).
   - Clean, elegant empty state when no projects are published yet (zero invented fake projects).
   - High-fidelity project detail modal supporting image showcases, video embeds, software tags, and live external links.

2. **Apple-Style Kinetic Typography & Scroll-Scrubbed Text**
   - Live hardware-accelerated kinetic rotator cycling through Jithin's creative disciplines.
   - Scroll-scrubbed contrast reveal illuminating Jithin's creative manifesto.

3. **Premium Dark Obsidian Aesthetic with Minimal Light RGB**
   - Modern charcoal obsidian zinc backdrop (`#0c0e14`, avoiding pitch black).
   - Subtle RGB spectrum borders and ambient glows.
   - 100% accessible typography with modern typography stack (`Plus Jakarta Sans` & `JetBrains Mono`).

4. **Comprehensive Admin Command Suite (`admin.html`)**
   - Master Passkey Protection (Default PIN: `2026`) with Touch ID simulation.
   - **Portfolio Projects Manager**: Add, edit, delete, publish/unpublish projects with thumbnails, video/image media, and tools used.
   - **Creative Services Manager**: Edit titles, descriptions, tools, and toggle active status for the 6 creative disciplines.
   - **Profile & Bio Manager**: Manage Brand Name, Tagline, Short Bio, Full Biography, and Skills.
   - **Contact & Socials Settings**: Editable contact email, phone, location placeholders, and social links (Instagram, YouTube, Behance).
   - **SEO Metadata**: Manage page title and meta description.
   - **Customer Dispatches CRM**: Filter, review, mark replied, and export client inquiries as timestamped CSV files.

5. **Dual-Layer Persistence**
   - Writes immediately to `localStorage` and asynchronously syncs to Supabase Postgres cloud tables.
   - Operates seamlessly both online and offline.

---

## ✦ Supabase Database Schema

Run `supabase-schema.sql` in your [Supabase SQL Editor](https://supabase.com/dashboard/project/pbgwnzutcypnkjdcmkes/sql) to provision:
- `public.dispatches`: Client inquiries and consultation bookings.
- `public.projects`: Dynamic portfolio projects with tools and media.
- `public.services`: Core creative disciplines with active toggle.
- `public.site_profile`: Brand profile, bio, contact details, and SEO.
- `public.courses`: Studio learning modules and video lessons.

---

## ✦ Quick Start

Open in any modern web browser:
- `index.html`: Flagship portfolio for FT JITHIN DESIGNZ.
- `about.html`: Authentic biography, creative tenets, and software toolkit.
- `works.html`: Dedicated portfolio archive and category filters.
- `contact.html`: Project inquiry channel and consultation booking.
- `admin.html`: Admin Command Suite (Master PIN: `2026`).
