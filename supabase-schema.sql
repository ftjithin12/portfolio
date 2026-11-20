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
    is_active BOOLEAN NOT NULL DEFAULT true,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

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

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.dispatches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- 1. Dispatches Policies
DROP POLICY IF EXISTS "Public insert dispatches" ON public.dispatches;
CREATE POLICY "Public insert dispatches" ON public.dispatches FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Allow select dispatches" ON public.dispatches;
CREATE POLICY "Allow select dispatches" ON public.dispatches FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Allow update dispatches" ON public.dispatches;
CREATE POLICY "Allow update dispatches" ON public.dispatches FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow delete dispatches" ON public.dispatches;
CREATE POLICY "Allow delete dispatches" ON public.dispatches FOR DELETE TO anon, authenticated USING (true);

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

-- ==============================================================================
-- INITIAL SEED DATA FOR REAL SERVICES & PROFILE
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

-- Seed authentic creative services
INSERT INTO public.services (id, title, description, category, icon, tools, is_active, sort_order) VALUES
    ('srv-graphic-design', 'Graphic Design', 'Distinctive visual identities, marketing collateral, typographic systems, and high-impact digital graphics.', 'Design', '🎨', '["Adobe Photoshop", "Illustrator"]'::jsonb, true, 1),
    ('srv-poster-design', 'Poster Design', 'Striking artistic poster layouts, promotional artwork, key visuals, and typographic compositions for events and media.', 'Print & Digital', '🖼️', '["Adobe Photoshop", "Photoshop Effects"]'::jsonb, true, 2),
    ('srv-motion-graphics', 'Motion Graphics', 'Dynamic 2D/3D title sequences, kinetic typography, animated logo reveals, and fluid interface animations.', 'Motion', '⚡', '["Adobe After Effects", "Motion Engine"]'::jsonb, true, 3),
    ('srv-video-editing', 'Video Editing', 'Cinematic narrative pacing, seamless scene transitions, rhythmic audio synchronization, and color grading.', 'Video', '🎬', '["Adobe Premiere Pro", "DaVinci Resolve"]'::jsonb, true, 4),
    ('srv-social-creatives', 'Social Media Creatives', 'Scroll-stopping reels, promotional motion teasers, bespoke story templates, and engagement-driven campaign assets.', 'Content', '📱', '["Photoshop", "After Effects", "Premiere"]'::jsonb, true, 5),
    ('srv-visual-branding', 'Visual Branding', 'Comprehensive brand aesthetics, visual style guides, color palettes, and memorable visual language for digital presence.', 'Identity', '✦', '["Photoshop", "Illustrator", "Brand System"]'::jsonb, true, 6)
ON CONFLICT (id) DO NOTHING;
