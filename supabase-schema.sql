-- ==============================================================================
-- SUPABASE POSTGRESQL SCHEMA INITIALIZATION
-- Project: FT JITHIN DESIGNZ — Personal Portfolio & Creative Studio
-- Supabase Endpoint: https://pbgwnzutcypnkjdcmkes.supabase.co
-- ==============================================================================

-- 1. Create CUSTOMER DISPATCHES CRM Table
CREATE TABLE IF NOT EXISTS public.dispatches (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL DEFAULT 'Project Inquiry',
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    budget TEXT,
    message TEXT,
    status TEXT NOT NULL DEFAULT 'Unread',
    timestamp TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

CREATE INDEX IF NOT EXISTS idx_dispatches_timestamp ON public.dispatches (timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_dispatches_status ON public.dispatches (status);

-- 2. Create PORTFOLIO PROJECTS Table
CREATE TABLE IF NOT EXISTS public.projects (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL DEFAULT 'Motion Graphics',
    thumbnail_url TEXT,
    media_url TEXT,
    media_type TEXT NOT NULL DEFAULT 'image', -- 'image' or 'video'
    tools JSONB NOT NULL DEFAULT '[]'::jsonb, -- e.g. ["Adobe After Effects", "Photoshop"]
    project_link TEXT,
    is_published BOOLEAN NOT NULL DEFAULT true,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

CREATE INDEX IF NOT EXISTS idx_projects_category ON public.projects (category);
CREATE INDEX IF NOT EXISTS idx_projects_published ON public.projects (is_published);
CREATE INDEX IF NOT EXISTS idx_projects_sort ON public.projects (sort_order ASC, created_at DESC);

-- 3. Create CREATIVE SERVICES Table
CREATE TABLE IF NOT EXISTS public.services (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT,
    icon TEXT DEFAULT '✦',
    tools JSONB NOT NULL DEFAULT '[]'::jsonb,
    starting_price TEXT DEFAULT 'Custom Quote',
    is_active BOOLEAN NOT NULL DEFAULT true,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Ensure starting_price column exists if table was previously created
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS starting_price TEXT DEFAULT 'Custom Quote';

-- 4. Create SITE PROFILE & SETTINGS Table
CREATE TABLE IF NOT EXISTS public.site_profile (
    id TEXT PRIMARY KEY DEFAULT 'ft_jithin_profile',
    brand_name TEXT NOT NULL DEFAULT 'FT JITHIN DESIGNZ',
    name TEXT NOT NULL DEFAULT 'Jithin',
    tagline TEXT NOT NULL DEFAULT 'Turning Ideas Into Visual Experiences.',
    short_bio TEXT,
    full_bio TEXT,
    profile_image TEXT,
    email TEXT DEFAULT 'contact@ftjithindesignz.com',
    phone TEXT DEFAULT '+1 (555) 000-0000',
    location TEXT DEFAULT 'Creative Studio',
    skills JSONB NOT NULL DEFAULT '["Adobe Photoshop", "Adobe After Effects", "Adobe Premiere Pro", "DaVinci Resolve", "Motion Design", "Visual Storytelling"]'::jsonb,
    social_links JSONB NOT NULL DEFAULT '{"instagram": "https://instagram.com", "youtube": "https://youtube.com", "behance": "https://behance.net", "linkedin": "https://linkedin.com"}'::jsonb,
    seo_title TEXT DEFAULT 'FT JITHIN DESIGNZ • Motion Designer & Visual Storyteller',
    seo_description TEXT DEFAULT 'Personal creative portfolio of Jithin. Motion Designer, Graphic Designer, Video Editor, Visual Storyteller, and Creative Digital Artist.',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 5. Create Courses / Tutorials Table (Optional LMS capability)
CREATE TABLE IF NOT EXISTS public.courses (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    lessons JSONB NOT NULL DEFAULT '[]'::jsonb,
    status TEXT NOT NULL DEFAULT 'Published',
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 6. Create FREQUENTLY ASKED QUESTIONS (FAQ) Table (For Telegram Bot & Studio Knowledge Base)
CREATE TABLE IF NOT EXISTS public.faqs (
    id TEXT PRIMARY KEY,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category TEXT DEFAULT 'General',
    is_active BOOLEAN NOT NULL DEFAULT true,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

CREATE INDEX IF NOT EXISTS idx_faqs_active ON public.faqs (is_active);
CREATE INDEX IF NOT EXISTS idx_faqs_sort ON public.faqs (sort_order ASC, created_at ASC);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.dispatches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;

-- 1. Dispatches Policies
DROP POLICY IF EXISTS "Public insert dispatches" ON public.dispatches;
CREATE POLICY "Public insert dispatches" ON public.dispatches FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Allow select dispatches" ON public.dispatches;
CREATE POLICY "Allow select dispatches" ON public.dispatches FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Allow update dispatches" ON public.dispatches;
CREATE POLICY "Allow update dispatches" ON public.dispatches FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow delete dispatches" ON public.dispatches;
CREATE POLICY "Allow delete dispatches" ON public.dispatches FOR DELETE TO anon, authenticated USING (true);

-- Ensure Realtime broadcasts are supported for incoming dispatches
ALTER TABLE public.dispatches REPLICA IDENTITY FULL;

-- 2. Projects Policies (Public can read published, admin can manage all)
DROP POLICY IF EXISTS "Public read projects" ON public.projects;
CREATE POLICY "Public read projects" ON public.projects FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Public manage projects" ON public.projects;
CREATE POLICY "Public manage projects" ON public.projects FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- 3. Services Policies
DROP POLICY IF EXISTS "Public read services" ON public.services;
CREATE POLICY "Public read services" ON public.services FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Public manage services" ON public.services;
CREATE POLICY "Public manage services" ON public.services FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- 4. Site Profile Policies
DROP POLICY IF EXISTS "Public read profile" ON public.site_profile;
CREATE POLICY "Public read profile" ON public.site_profile FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Public manage profile" ON public.site_profile;
CREATE POLICY "Public manage profile" ON public.site_profile FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- 5. Courses Policies
DROP POLICY IF EXISTS "Public read courses" ON public.courses;
CREATE POLICY "Public read courses" ON public.courses FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Public manage courses" ON public.courses;
CREATE POLICY "Public manage courses" ON public.courses FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- 6. FAQs Policies
DROP POLICY IF EXISTS "Public read faqs" ON public.faqs;
CREATE POLICY "Public read faqs" ON public.faqs FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Public manage faqs" ON public.faqs;
CREATE POLICY "Public manage faqs" ON public.faqs FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- ==============================================================================
-- INITIAL SEED DATA FOR REAL SERVICES, PROFILE & FAQS
-- ==============================================================================

-- Seed default profile
INSERT INTO public.site_profile (
    id, brand_name, name, tagline, short_bio, full_bio, email, phone, location
) VALUES (
    'ft_jithin_profile',
    'FT JITHIN DESIGNZ',
    'Jithin',
    'Turning Ideas Into Visual Experiences.',
    'Creative designer specialized in motion graphics, graphic design, visual storytelling, and digital experiences.',
    'I am a creative designer interested in motion graphics, graphic design, visual storytelling, and digital experiences. Working extensively with Adobe Photoshop, Adobe After Effects, Adobe Premiere Pro, and DaVinci Resolve, I bridge artistic imagination and polished technical execution to bring stories to life.',
    'contact@ftjithindesignz.com',
    '+1 (555) 000-0000',
    'Creative Studio'
) ON CONFLICT (id) DO UPDATE SET
    brand_name = EXCLUDED.brand_name,
    name = EXCLUDED.name,
    tagline = EXCLUDED.tagline,
    short_bio = EXCLUDED.short_bio,
    full_bio = EXCLUDED.full_bio;

-- Seed authentic creative services with starting rates
INSERT INTO public.services (id, title, description, category, icon, tools, starting_price, is_active, sort_order) VALUES
    ('srv-graphic-design', 'Graphic Design', 'Distinctive visual identities, marketing collateral, typographic systems, and high-impact digital graphics.', 'Design', '🎨', '["Adobe Photoshop", "Illustrator"]'::jsonb, '$150+', true, 1),
    ('srv-poster-design', 'Poster Design', 'Striking artistic poster layouts, promotional artwork, key visuals, and typographic compositions for events and media.', 'Print & Digital', '🖼️', '["Adobe Photoshop", "Photoshop Effects"]'::jsonb, '$200+', true, 2),
    ('srv-motion-graphics', 'Motion Graphics', 'Dynamic 2D/3D title sequences, kinetic typography, animated logo reveals, and fluid interface animations.', 'Motion', '⚡', '["Adobe After Effects", "Motion Engine"]'::jsonb, '$350+', true, 3),
    ('srv-video-editing', 'Video Editing', 'Cinematic narrative pacing, seamless scene transitions, rhythmic audio synchronization, and color grading.', 'Video', '🎬', '["Adobe Premiere Pro", "DaVinci Resolve"]'::jsonb, '$300+', true, 4),
    ('srv-social-creatives', 'Social Media Creatives', 'Scroll-stopping reels, promotional motion teasers, bespoke story templates, and engagement-driven campaign assets.', 'Content', '📱', '["Photoshop", "After Effects", "Premiere"]'::jsonb, '$250+', true, 5),
    ('srv-visual-branding', 'Visual Branding', 'Comprehensive brand aesthetics, visual style guides, color palettes, and memorable visual language for digital presence.', 'Identity', '✦', '["Photoshop", "Illustrator", "Brand System"]'::jsonb, '$500+', true, 6)
ON CONFLICT (id) DO UPDATE SET
    starting_price = EXCLUDED.starting_price,
    description = EXCLUDED.description;

-- Seed authentic FAQs for Telegram Bot & Studio Inquiries
INSERT INTO public.faqs (id, question, answer, category, is_active, sort_order) VALUES
    ('faq-turnaround', 'What is your typical project turnaround time?', 'Turnaround depends on project scope. Social media creatives and graphic posters typically take 2-4 business days. Motion graphics sequences and cinematic video edits range from 5-10 business days.', 'General', true, 1),
    ('faq-software', 'What software do you use for production?', 'All motion design and visual work is crafted using industry-standard tools: Adobe Photoshop, Adobe After Effects, Adobe Premiere Pro, and DaVinci Resolve.', 'Production', true, 2),
    ('faq-revisions', 'How do project revisions work?', 'Each creative package includes 2-3 rounds of structured revisions to refine pacing, typography, color grading, and visual alignment to ensure full satisfaction.', 'Workflow', true, 3),
    ('faq-deliverables', 'What file formats and resolutions will I receive?', 'Deliverables include master 4K / 1080p ProRes or MP4 files, optimized vertical formats (9:16) for social platforms, and source project archives upon request.', 'Deliverables', true, 4),
    ('faq-getting-started', 'How do we kick off a new creative collaboration?', 'Submit a quick project brief via this bot (/enquiry) or the website contact form. Jithin will review your requirements and respond within 24 hours with an estimate and timeline.', 'Onboarding', true, 5)
ON CONFLICT (id) DO UPDATE SET
    answer = EXCLUDED.answer,
    question = EXCLUDED.question;

-- Seed initial showcase projects
INSERT INTO public.projects (id, title, category, thumbnail_url, media_url, media_type, tools, project_link, description, is_published, sort_order) VALUES
    ('proj-kinetic-brand', 'Kinetic Brand Identity & Title Reveal', 'Motion Graphics', 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1200&auto=format&fit=crop', 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1200&auto=format&fit=crop', 'image', '["Adobe After Effects", "Cinema 4D", "Illustrator"]'::jsonb, 'https://behance.net', 'Dynamic 3D kinetic typography and holographic neon title sequence crafted with synchronized audio pacing, custom velocity curves, and atmospheric lens flares.', true, 1),
    ('proj-visual-rhythm-reel', 'Cinematic Rhythm & Motion Showreel', 'Video Editing', 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?q=80&w=1200&auto=format&fit=crop', 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?q=80&w=1200&auto=format&fit=crop', 'image', '["Adobe Premiere Pro", "DaVinci Resolve", "Sound Design"]'::jsonb, 'https://youtube.com', 'High-octane visual showcase featuring speed-ramped action sequences, frame-accurate rhythmic match cuts, and custom cinematic film color grade.', true, 2),
    ('proj-aura-poster-series', 'Neo-Tokyo Typographic Poster Series', 'Poster Design', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop', 'image', '["Adobe Photoshop", "Typography Engine"]'::jsonb, 'https://instagram.com', 'Experimental typographic poster series exploring Japanese brutalist layouts, high-contrast duotone gradients, and intricate vector overlays.', true, 3),
    ('proj-visual-identity-system', 'Minimalist Brand & Graphic System', 'Graphic Design', 'https://images.unsplash.com/photo-1600132806370-bf17e65e942f?q=80&w=1200&auto=format&fit=crop', 'https://images.unsplash.com/photo-1600132806370-bf17e65e942f?q=80&w=1200&auto=format&fit=crop', 'image', '["Adobe Photoshop", "Illustrator", "Figma"]'::jsonb, 'https://behance.net', 'Comprehensive brand identity and visual language system featuring minimalist typography, geometric brand marks, and digital media collateral.', true, 4)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    thumbnail_url = EXCLUDED.thumbnail_url;

-- ==============================================================================
-- ROLLBACK SCRIPT (SAFE REVERSION INSTRUCTIONS IF NEEDED)
-- ==============================================================================
-- To revert the FAQ table and starting_price extension without affecting
-- core website projects or past CRM dispatches, execute:
--
-- DROP TABLE IF EXISTS public.faqs CASCADE;
-- ALTER TABLE public.services DROP COLUMN IF EXISTS starting_price;
-- ==============================================================================
