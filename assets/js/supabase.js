/**
 * SUPABASE CONNECTOR & REPOSITORY LAYER
 * Brand: FT JITHIN DESIGNZ (Jithin)
 * Handles dual-persistence (Supabase Postgres + LocalStorage fallback)
 * Covers: Site Profile, Creative Services, Portfolio Projects, Inbound Dispatches CRM
 */

(function () {
  'use strict';

  const SUPABASE_URL = 'https://pbgwnzutcypnkjdcmkes.supabase.co';
  const SUPABASE_ANON_KEY = 'sb_publishable_arTjuNun5_jMdRo8XeBi_g_iESk4g6u';

  let client = null;

  function init() {
    if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
      try {
        client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      } catch (err) {
        console.warn('Supabase client initialization notice:', err);
      }
    }
  }

  // =========================================================================
  // 1. SITE PROFILE & METADATA
  // =========================================================================
  const DEFAULT_PROFILE = {
    id: 'ft_jithin_profile',
    brand_name: 'FT JITHIN DESIGNZ',
    name: 'Jithin',
    tagline: 'Turning Ideas Into Visual Experiences.',
    short_bio: 'Creative designer specialized in motion graphics, graphic design, visual storytelling, and digital experiences.',
    full_bio: 'I am a creative designer interested in motion graphics, graphic design, visual storytelling, and digital experiences. Working extensively with Adobe Photoshop, Adobe After Effects, Adobe Premiere Pro, and DaVinci Resolve, I bridge artistic imagination and polished technical execution to bring stories to life.',
    profile_image: '',
    email: 'contact@ftjithindesignz.com',
    phone: '+1 (555) 000-0000',
    location: 'Creative Studio',
    skills: [
      'Adobe Photoshop',
      'Adobe After Effects',
      'Adobe Premiere Pro',
      'DaVinci Resolve',
      'Motion Design',
      'Visual Storytelling',
      'Poster Artwork',
      'Color Grading'
    ],
    social_links: {
      instagram: 'https://instagram.com',
      youtube: 'https://youtube.com',
      behance: 'https://behance.net',
      linkedin: 'https://linkedin.com'
    },
    seo_title: 'FT JITHIN DESIGNZ • Motion Designer & Visual Storyteller',
    seo_description: 'Personal creative portfolio of Jithin. Motion Designer, Graphic Designer, Video Editor, Visual Storyteller, and Creative Digital Artist.'
  };

  window.fetchSiteProfile = async function () {
    const local = localStorage.getItem('ft_jithin_profile');
    let profile = local ? JSON.parse(local) : DEFAULT_PROFILE;

    if (!client) init();
    if (client) {
      try {
        const { data, error } = await client
          .from('site_profile')
          .select('*')
          .eq('id', 'ft_jithin_profile')
          .single();

        if (!error && data) {
          profile = { ...profile, ...data };
          localStorage.setItem('ft_jithin_profile', JSON.stringify(profile));
        }
      } catch (err) {
        // Fallback to local
      }
    }
    return profile;
  };

  window.saveSiteProfile = async function (updatedFields) {
    const current = await window.fetchSiteProfile();
    const merged = { ...current, ...updatedFields, updated_at: new Date().toISOString() };
    localStorage.setItem('ft_jithin_profile', JSON.stringify(merged));

    if (!client) init();
    if (client) {
      try {
        await client
          .from('site_profile')
          .upsert([merged]);
      } catch (e) {
        console.warn('Supabase profile sync fallback:', e);
      }
    }
    return merged;
  };

  // =========================================================================
  // 2. CREATIVE SERVICES
  // =========================================================================
  const DEFAULT_SERVICES = [
    {
      id: 'srv-graphic-design',
      title: 'Graphic Design',
      description: 'Distinctive visual identities, marketing collateral, typographic systems, and high-impact digital graphics.',
      category: 'Design',
      icon: '🎨',
      tools: ['Adobe Photoshop', 'Illustrator'],
      is_active: true,
      sort_order: 1
    },
    {
      id: 'srv-poster-design',
      title: 'Poster Design',
      description: 'Striking artistic poster layouts, promotional artwork, key visuals, and typographic compositions for events and media.',
      category: 'Print & Digital',
      icon: '🖼️',
      tools: ['Adobe Photoshop', 'Photoshop Effects'],
      is_active: true,
      sort_order: 2
    },
    {
      id: 'srv-motion-graphics',
      title: 'Motion Graphics',
      description: 'Dynamic 2D/3D title sequences, kinetic typography, animated logo reveals, and fluid interface animations.',
      category: 'Motion',
      icon: '⚡',
      tools: ['Adobe After Effects', 'Motion Engine'],
      is_active: true,
      sort_order: 3
    },
    {
      id: 'srv-video-editing',
      title: 'Video Editing',
      description: 'Cinematic narrative pacing, seamless scene transitions, rhythmic audio synchronization, and color grading.',
      category: 'Video',
      icon: '🎬',
      tools: ['Adobe Premiere Pro', 'DaVinci Resolve'],
      is_active: true,
      sort_order: 4
    },
    {
      id: 'srv-social-creatives',
      title: 'Social Media Creatives',
      description: 'Scroll-stopping reels, promotional motion teasers, bespoke story templates, and engagement-driven campaign assets.',
      category: 'Content',
      icon: '📱',
      tools: ['Photoshop', 'After Effects', 'Premiere'],
      is_active: true,
      sort_order: 5
    },
    {
      id: 'srv-visual-branding',
      title: 'Visual Branding',
      description: 'Comprehensive brand aesthetics, visual style guides, color palettes, and memorable visual language for digital presence.',
      category: 'Identity',
      icon: '✦',
      tools: ['Photoshop', 'Illustrator', 'Brand System'],
      is_active: true,
      sort_order: 6
    }
  ];

  window.fetchServices = async function () {
    const local = localStorage.getItem('ft_jithin_services');
    let services = local ? JSON.parse(local) : DEFAULT_SERVICES;

    if (!client) init();
    if (client) {
      try {
        const { data, error } = await client
          .from('services')
          .select('*')
          .order('sort_order', { ascending: true });

        if (!error && data && data.length > 0) {
          services = data;
          localStorage.setItem('ft_jithin_services', JSON.stringify(services));
        }
      } catch (err) {
        // Fallback to local
      }
    }
    return services;
  };

  window.saveService = async function (service) {
    let services = await window.fetchServices();
    const existingIndex = services.findIndex(s => s.id === service.id);

    if (existingIndex >= 0) {
      services[existingIndex] = { ...services[existingIndex], ...service };
    } else {
      services.push(service);
    }
    localStorage.setItem('ft_jithin_services', JSON.stringify(services));

    if (!client) init();
    if (client) {
      try {
        await client.from('services').upsert([service]);
      } catch (e) {
        console.warn('Supabase service sync fallback:', e);
      }
    }
    return services;
  };

  window.deleteService = async function (id) {
    let services = await window.fetchServices();
    services = services.filter(s => s.id !== id);
    localStorage.setItem('ft_jithin_services', JSON.stringify(services));

    if (!client) init();
    if (client) {
      try {
        await client.from('services').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase service delete fallback:', e);
      }
    }
    return services;
  };

  // =========================================================================
  // 3. PORTFOLIO PROJECTS (CRUD & Filter)
  // =========================================================================
  // Start with clean empty state when no actual projects are uploaded yet!
  const DEFAULT_PROJECTS = [];

  window.fetchProjects = async function () {
    const local = localStorage.getItem('ft_jithin_projects');
    let projects = local ? JSON.parse(local) : DEFAULT_PROJECTS;

    if (!client) init();
    if (client) {
      try {
        const { data, error } = await client
          .from('projects')
          .select('*')
          .order('sort_order', { ascending: true })
          .order('created_at', { ascending: false });

        if (!error && data) {
          projects = data;
          localStorage.setItem('ft_jithin_projects', JSON.stringify(projects));
        }
      } catch (err) {
        // Fallback to local
      }
    }
    return projects;
  };

  window.saveProject = async function (project) {
    let projects = await window.fetchProjects();
    const existingIndex = projects.findIndex(p => p.id === project.id);

    if (existingIndex >= 0) {
      projects[existingIndex] = { ...projects[existingIndex], ...project };
    } else {
      projects.unshift(project);
    }
    localStorage.setItem('ft_jithin_projects', JSON.stringify(projects));

    if (!client) init();
    if (client) {
      try {
        await client.from('projects').upsert([project]);
      } catch (e) {
        console.warn('Supabase project sync fallback:', e);
      }
    }
    return projects;
  };

  window.deleteProject = async function (id) {
    let projects = await window.fetchProjects();
    projects = projects.filter(p => p.id !== id);
    localStorage.setItem('ft_jithin_projects', JSON.stringify(projects));

    if (!client) init();
    if (client) {
      try {
        await client.from('projects').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase project delete fallback:', e);
      }
    }
    return projects;
  };

  window.toggleProjectPublish = async function (id, isPublished) {
    let projects = await window.fetchProjects();
    const item = projects.find(p => p.id === id);
    if (item) {
      item.is_published = isPublished;
      localStorage.setItem('ft_jithin_projects', JSON.stringify(projects));

      if (!client) init();
      if (client) {
        try {
          await client.from('projects').update({ is_published: isPublished }).eq('id', id);
        } catch (e) {
          console.warn('Supabase toggle fallback:', e);
        }
      }
    }
    return projects;
  };

  // =========================================================================
  // 4. CUSTOMER DISPATCHES CRM
  // =========================================================================
  window.syncDispatchToSupabase = async function (dispatch) {
    // 1. LocalStorage immediate write
    const local = localStorage.getItem('ft_jithin_dispatches');
    const dispatches = local ? JSON.parse(local) : [];
    dispatches.unshift(dispatch);
    localStorage.setItem('ft_jithin_dispatches', JSON.stringify(dispatches));

    // 2. Supabase Cloud Sync
    if (!client) init();
    if (!client) return null;
    try {
      const { data, error } = await client
        .from('dispatches')
        .insert([{
          id: dispatch.id,
          type: dispatch.type || 'Project Inquiry',
          name: dispatch.name,
          email: dispatch.email,
          budget: dispatch.budget || 'Not specified',
          message: dispatch.message,
          status: dispatch.status || 'Unread',
          timestamp: dispatch.timestamp || new Date().toISOString()
        }])
        .select();

      if (error) {
        console.info('Supabase dispatches note:', error.message);
        return null;
      }
      return data;
    } catch (e) {
      return null;
    }
  };

  window.fetchDispatchesFromSupabase = async function () {
    const local = localStorage.getItem('ft_jithin_dispatches');
    let list = local ? JSON.parse(local) : [];

    if (!client) init();
    if (client) {
      try {
        const { data, error } = await client
          .from('dispatches')
          .select('*')
          .order('timestamp', { ascending: false });

        if (!error && data && data.length > 0) {
          list = data;
          localStorage.setItem('ft_jithin_dispatches', JSON.stringify(list));
        }
      } catch (e) {
        // Fallback to local
      }
    }
    return list;
  };

  window.updateDispatchStatus = async function (id, status) {
    const local = localStorage.getItem('ft_jithin_dispatches');
    let list = local ? JSON.parse(local) : [];
    const item = list.find(d => d.id === id);
    if (item) {
      item.status = status;
      localStorage.setItem('ft_jithin_dispatches', JSON.stringify(list));
    }

    if (!client) init();
    if (client) {
      try {
        await client.from('dispatches').update({ status }).eq('id', id);
      } catch (e) {}
    }
    return list;
  };

  window.deleteDispatch = async function (id) {
    const local = localStorage.getItem('ft_jithin_dispatches');
    let list = local ? JSON.parse(local) : [];
    list = list.filter(d => d.id !== id);
    localStorage.setItem('ft_jithin_dispatches', JSON.stringify(list));

    if (!client) init();
    if (client) {
      try {
        await client.from('dispatches').delete().eq('id', id);
      } catch (e) {}
    }
    return list;
  };

  // Connection check
  window.checkSupabaseConnection = async function () {
    if (!client) init();
    if (!client) return { connected: false, message: 'Supabase client unavailable' };
    try {
      const { data, error } = await client.from('dispatches').select('id').limit(1);
      if (error && error.code === '42P01') {
        return { connected: true, tablesReady: false, message: 'Connected to Supabase. Tables pending creation.' };
      }
      if (error) {
        return { connected: true, tablesReady: false, message: error.message };
      }
      return { connected: true, tablesReady: true, message: 'Supabase Database Operational' };
    } catch (e) {
      return { connected: false, message: e.message };
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
