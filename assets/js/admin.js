/**
 * FT JITHIN DESIGNZ — ADMIN COMMAND SUITE CONTROLLER
 * Full management over:
 * 1. Portfolio Projects (CRUD, Media, Tools, Categories, Publish toggle)
 * 2. Creative Services (Edit title, description, active status)
 * 3. Profile & Bio (Brand, Name, Tagline, Bio, Skills)
 * 4. Contact & Socials (Email, Phone, Location, Instagram, YouTube, Behance)
 * 5. SEO & Settings (Title, Meta, Passkey)
 * 6. Customer Dispatches CRM (Filter, Status, Search, CSV Export)
 */

(function () {
  'use strict';

  // -------------------------------------------------------------
  // 1. STATE & CRYPTOGRAPHIC AUTHENTICATION
  // Master Password: Jithin@2007 (SHA-256 Hashed & Cryptographically Encrypted Session)
  // -------------------------------------------------------------
  const DEFAULT_ADMIN_HASH = '59117ad35f5a53f3104239186f18b42b6c782fd81b1ea3937a9f9a57954dbd98'; // SHA-256 hash of Jithin@2007

  // Clean up legacy plaintext PIN if present in storage
  localStorage.removeItem('ft_jithin_admin_pin');

  let currentAdminHash = localStorage.getItem('ft_jithin_admin_hash') || DEFAULT_ADMIN_HASH;
  let isAuthenticated = false;

  async function computeSha256(message) {
    const msgUint8 = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  async function verifySession() {
    const token = sessionStorage.getItem('ft_jithin_auth_token');
    const timeStr = sessionStorage.getItem('ft_jithin_auth_time');
    const nonce = sessionStorage.getItem('ft_jithin_auth_nonce');
    if (!token || !timeStr || !nonce) return false;

    const sessionTime = parseInt(timeStr, 10);
    const SESSION_MAX_AGE_MS = 60 * 60 * 1000; // 1 hour session lifetime
    if (isNaN(sessionTime) || Date.now() - sessionTime > SESSION_MAX_AGE_MS) {
      clearSession();
      return false;
    }

    const expected = await computeSha256(currentAdminHash + ':' + nonce + ':' + timeStr);
    return token === expected;
  }

  function clearSession() {
    isAuthenticated = false;
    sessionStorage.removeItem('ft_jithin_auth_token');
    sessionStorage.removeItem('ft_jithin_auth_time');
    sessionStorage.removeItem('ft_jithin_auth_nonce');
    sessionStorage.removeItem('ft_jithin_auth');
  }

  let allDispatches = [];
  let allProjects = [];
  let allServices = [];
  let allModules = [];
  let siteProfile = null;

  let activeDispatchFilter = 'all';
  let dispatchSearchQuery = '';

  const authGate = document.getElementById('auth-gate');
  const adminSuite = document.getElementById('admin-suite');
  const authForm = document.getElementById('admin-auth-form');
  const pinInput = document.getElementById('admin-pin-input');
  const authError = document.getElementById('auth-error-msg');

  async function initAuth() {
    const sessionValid = await verifySession();
    if (sessionValid) {
      isAuthenticated = true;
      revealSuite();
    } else {
      hideSuite();
    }

    // Toggle password visibility
    const toggleBtn = document.getElementById('toggle-pwd-visibility-btn');
    if (toggleBtn && pinInput) {
      toggleBtn.addEventListener('click', () => {
        if (pinInput.type === 'password') {
          pinInput.type = 'text';
          toggleBtn.textContent = 'Hide';
        } else {
          pinInput.type = 'password';
          toggleBtn.textContent = 'Show';
        }
      });
    }

    if (authForm) {
      authForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Check rate limiting lockout
        const lockoutUntil = parseInt(sessionStorage.getItem('ft_auth_lockout') || '0', 10);
        if (Date.now() < lockoutUntil) {
          const remainingSec = Math.ceil((lockoutUntil - Date.now()) / 1000);
          showAuthError(`Security Lockout: Too many failed attempts. Try again in ${remainingSec}s.`);
          return;
        }

        const enteredPwd = pinInput.value.trim();
        if (!enteredPwd) return;

        const enteredHash = await computeSha256(enteredPwd);

        if (enteredHash === currentAdminHash) {
          // Clear lockout tracking
          sessionStorage.removeItem('ft_auth_failed');
          sessionStorage.removeItem('ft_auth_lockout');

          // Generate cryptographic session token
          const now = Date.now();
          const nonce = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2);
          const token = await computeSha256(currentAdminHash + ':' + nonce + ':' + now);

          sessionStorage.setItem('ft_jithin_auth_token', token);
          sessionStorage.setItem('ft_jithin_auth_time', String(now));
          sessionStorage.setItem('ft_jithin_auth_nonce', nonce);
          sessionStorage.setItem('ft_jithin_auth', 'true');

          isAuthenticated = true;
          revealSuite();
          showToast('Welcome back, Jithin! Encrypted session unlocked.', '✦');
        } else {
          let failed = parseInt(sessionStorage.getItem('ft_auth_failed') || '0', 10) + 1;
          sessionStorage.setItem('ft_auth_failed', String(failed));

          if (failed >= 5) {
            const lockDuration = Date.now() + 180000; // 3 min lockout
            sessionStorage.setItem('ft_auth_lockout', String(lockDuration));
            showAuthError('Security Alert: 5 incorrect attempts. Portal locked for 3 minutes.');
          } else {
            showAuthError(`Invalid master password. Access restricted. (${5 - failed} attempts remaining)`);
          }
        }
      });
    }

    // Lock portal buttons
    document.querySelectorAll('.lock-admin-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        clearSession();
        hideSuite();
        if (pinInput) pinInput.value = '';
        showToast('Admin Studio locked & session cleared.', '🔒');
      });
    });
  }

  function revealSuite() {
    if (authGate) authGate.classList.add('hidden');
    if (adminSuite) adminSuite.classList.remove('hidden');
    loadAllStudioData();
  }

  function hideSuite() {
    if (authGate) authGate.classList.remove('hidden');
    if (adminSuite) adminSuite.classList.add('hidden');
  }

  function showAuthError(msg) {
    if (authError) {
      authError.textContent = msg;
      authError.classList.remove('hidden');
      setTimeout(() => authError.classList.add('hidden'), 3500);
    }
  }

  // -------------------------------------------------------------
  // 2. TAB SWITCHING
  // -------------------------------------------------------------
  function initTabs() {
    const tabs = document.querySelectorAll('.admin-nav-tab');
    const views = document.querySelectorAll('.admin-view');

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => {
          t.classList.remove('active', 'bg-white', 'text-black', 'shadow-sm');
          t.classList.add('text-slate-400');
        });

        tab.classList.add('active', 'bg-white', 'text-black', 'shadow-sm');
        tab.classList.remove('text-slate-400');

        const targetTab = tab.getAttribute('data-tab');
        if (targetTab === 'analytics') {
          views.forEach(view => {
            if (view.id === 'view-overview') {
              view.classList.remove('hidden');
            } else {
              view.classList.add('hidden');
            }
          });
          const analyticsEl = document.getElementById('admin-analytics-dashboard');
          if (analyticsEl) {
            analyticsEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
          return;
        }

        views.forEach(view => {
          if (view.id === `view-${targetTab}`) {
            view.classList.remove('hidden');
          } else {
            view.classList.add('hidden');
          }
        });
      });
    });
  }

  // -------------------------------------------------------------
  // 3. LOAD ALL DATA
  // -------------------------------------------------------------
  async function loadAllStudioData() {
    await Promise.all([
      loadProfileData(),
      loadServicesData(),
      loadProjectsData(),
      loadDispatchesData(),
      loadCourseData(),
      checkDatabaseHealth()
    ]);
    updateOverviewKPIs();
  }

  async function checkDatabaseHealth() {
    const statusEl = document.getElementById('kpi-db-status');
    if (!statusEl || typeof window.checkSupabaseConnection !== 'function') return;

    try {
      const health = await window.checkSupabaseConnection();
      if (health.connected) {
        statusEl.textContent = 'Active';
        statusEl.className = 'text-xs font-mono text-emerald-400 font-bold';
      } else {
        statusEl.textContent = 'Local Mode';
        statusEl.className = 'text-xs font-mono text-amber-400 font-bold';
      }
    } catch (e) {
      statusEl.textContent = 'Offline';
    }
  }

  function updateOverviewKPIs() {
    // Projects KPI
    const projectsKpi = document.getElementById('kpi-total-projects');
    if (projectsKpi) projectsKpi.textContent = allProjects.length;

    // Course Lessons KPI
    const lessonsKpi = document.getElementById('kpi-total-lessons');
    if (lessonsKpi) {
      let count = 0;
      allModules.forEach(m => {
        if (Array.isArray(m.lessons)) count += m.lessons.length;
      });
      lessonsKpi.textContent = count;
    }

    // Services KPI
    const servicesKpi = document.getElementById('kpi-active-services');
    if (servicesKpi) {
      const active = allServices.filter(s => s.is_active !== false).length;
      servicesKpi.textContent = active;
    }

    // Dispatches KPI
    const dispatchesKpi = document.getElementById('kpi-total-dispatches');
    const unreadBadge = document.getElementById('kpi-unread-badge');
    if (dispatchesKpi) dispatchesKpi.textContent = allDispatches.length;

    if (unreadBadge) {
      const unreadCount = allDispatches.filter(d => (d.status || '').toLowerCase() === 'unread').length;
      unreadBadge.textContent = `${unreadCount} New`;
    }

    // Recent dispatches in overview
    renderOverviewDispatches();
  }

  // -------------------------------------------------------------
  // 4. PORTFOLIO PROJECTS CRUD
  // -------------------------------------------------------------
  async function loadProjectsData() {
    if (typeof window.fetchProjects !== 'function') return;
    allProjects = await window.fetchProjects();
    renderAdminProjectsList();
  }

  function renderAdminProjectsList() {
    const container = document.getElementById('admin-projects-list');
    const countBadge = document.getElementById('admin-projects-count');
    if (!container) return;

    if (countBadge) countBadge.textContent = `${allProjects.length} Projects`;

    if (!allProjects.length) {
      container.innerHTML = `
        <div class="text-center py-10 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
          <p class="text-sm text-slate-300 font-medium">No projects added yet.</p>
          <p class="text-xs text-slate-500">Fill the form above to publish your first motion or design work.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = allProjects.map(p => {
      const tools = Array.isArray(p.tools) ? p.tools : [];
      const isPublished = p.is_published !== false;

      return `
        <div class="p-4 rounded-2xl glass-panel border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div class="flex items-start gap-4">
            <div class="w-16 h-16 rounded-xl bg-black/40 border border-white/10 overflow-hidden shrink-0 flex items-center justify-center">
              ${p.thumbnail_url 
                ? `<img src="${escapeHtml(p.thumbnail_url)}" alt="${escapeHtml(p.title)}" class="w-full h-full object-cover" />`
                : `<span class="text-xs font-mono text-purple-400 font-bold">REEL</span>`}
            </div>

            <div class="space-y-1">
              <div class="flex items-center gap-2">
                <span class="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full ${isPublished ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-500/20 text-slate-400'}">
                  ${isPublished ? 'Published' : 'Draft'}
                </span>
                <span class="text-xs font-mono text-purple-300 font-semibold">${escapeHtml(p.category || 'Motion')}</span>
              </div>
              <h4 class="text-base font-bold text-white">${escapeHtml(p.title)}</h4>
              <p class="text-xs text-slate-400 line-clamp-1">${escapeHtml(p.description || '')}</p>
              <div class="flex flex-wrap gap-1 pt-1">
                ${tools.map(t => `<span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 text-slate-300">${escapeHtml(t)}</span>`).join('')}
              </div>
            </div>
          </div>

          <div class="flex items-center gap-2 self-end sm:self-center shrink-0">
            <button class="toggle-publish-btn px-3 py-1.5 rounded-xl text-xs font-semibold border ${isPublished ? 'border-amber-500/30 text-amber-300 hover:bg-amber-500/20' : 'border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20'}" data-id="${p.id}" data-published="${isPublished}">
              ${isPublished ? 'Unpublish' : 'Publish'}
            </button>
            <button class="edit-project-btn px-3 py-1.5 rounded-xl text-xs font-semibold border border-white/10 hover:border-purple-400 text-slate-300 hover:text-white" data-id="${p.id}">
              Edit
            </button>
            <button class="delete-project-btn px-3 py-1.5 rounded-xl text-xs font-semibold border border-rose-500/30 text-rose-400 hover:bg-rose-500/20" data-id="${p.id}">
              Delete
            </button>
          </div>
        </div>
      `;
    }).join('');

    // Attach event listeners
    container.querySelectorAll('.toggle-publish-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        const currentlyPublished = btn.getAttribute('data-published') === 'true';
        allProjects = await window.toggleProjectPublish(id, !currentlyPublished);
        renderAdminProjectsList();
        updateOverviewKPIs();
        showToast(`Project visibility updated!`, '✦');
      });
    });

    container.querySelectorAll('.delete-project-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!confirm('Are you sure you want to delete this project?')) return;
        const id = btn.getAttribute('data-id');
        allProjects = await window.deleteProject(id);
        renderAdminProjectsList();
        updateOverviewKPIs();
        showToast('Project deleted.', '🗑️');
      });
    });

    container.querySelectorAll('.edit-project-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const project = allProjects.find(p => p.id === id);
        if (!project) return;

        document.getElementById('edit-project-id').value = project.id;
        document.getElementById('project-title-input').value = project.title;
        document.getElementById('project-category-input').value = project.category || 'Motion Graphics';
        const thumbInput = document.getElementById('project-thumbnail-input');
        thumbInput.value = project.thumbnail_url || '';
        const previewWrap = document.getElementById('project-thumb-preview-wrap');
        const previewImg = document.getElementById('project-thumb-preview');
        if (project.thumbnail_url && previewWrap && previewImg) {
          previewImg.src = project.thumbnail_url;
          previewWrap.classList.remove('hidden');
        } else if (previewWrap) {
          previewWrap.classList.add('hidden');
        }
        document.getElementById('project-media-input').value = project.media_url || '';
        document.getElementById('project-tools-input').value = Array.isArray(project.tools) ? project.tools.join(', ') : '';
        document.getElementById('project-link-input').value = project.project_link || '';
        document.getElementById('project-desc-input').value = project.description || '';
        document.getElementById('project-published-input').checked = project.is_published !== false;

        document.getElementById('project-form-header').textContent = `Edit Project: ${project.title}`;
        document.getElementById('save-project-btn-text').textContent = 'Update Project';

        // Scroll to form
        document.getElementById('project-form').scrollIntoView({ behavior: 'smooth' });
      });
    });
  }

  function initProjectForm() {
    const form = document.getElementById('project-form');
    const resetBtn = document.getElementById('reset-project-form-btn');
    const thumbFileInput = document.getElementById('project-thumb-file-input');
    const thumbInput = document.getElementById('project-thumbnail-input');
    const previewWrap = document.getElementById('project-thumb-preview-wrap');
    const previewImg = document.getElementById('project-thumb-preview');

    if (thumbFileInput) {
      thumbFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            if (thumbInput) thumbInput.value = event.target.result;
            if (previewImg) previewImg.src = event.target.result;
            if (previewWrap) previewWrap.classList.remove('hidden');
            showToast('Image loaded successfully!', '🖼️');
          };
          reader.readAsDataURL(file);
        }
      });
    }

    if (thumbInput) {
      thumbInput.addEventListener('input', () => {
        const val = thumbInput.value.trim();
        if (val && previewWrap && previewImg) {
          previewImg.src = val;
          previewWrap.classList.remove('hidden');
        } else if (previewWrap) {
          previewWrap.classList.add('hidden');
        }
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        form.reset();
        document.getElementById('edit-project-id').value = '';
        document.getElementById('project-form-header').textContent = '+ Add New Portfolio Project';
        document.getElementById('save-project-btn-text').textContent = 'Save & Publish Project';
        if (previewWrap) previewWrap.classList.add('hidden');
      });
    }

    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const editId = document.getElementById('edit-project-id').value;
        const title = document.getElementById('project-title-input').value.trim();
        const category = document.getElementById('project-category-input').value;
        const thumbnail = document.getElementById('project-thumbnail-input').value.trim();
        const media = document.getElementById('project-media-input').value.trim();
        const toolsRaw = document.getElementById('project-tools-input').value.trim();
        const projectLink = document.getElementById('project-link-input').value.trim();
        const desc = document.getElementById('project-desc-input').value.trim();
        const isPublished = document.getElementById('project-published-input').checked;

        const toolsArray = toolsRaw ? toolsRaw.split(',').map(t => t.trim()).filter(Boolean) : [];

        const projectData = {
          id: editId || 'proj-' + Date.now(),
          title: title,
          category: category,
          thumbnail_url: thumbnail,
          media_url: media,
          media_type: (media.includes('youtube') || media.includes('vimeo') || media.endsWith('.mp4')) ? 'video' : 'image',
          tools: toolsArray,
          project_link: projectLink,
          description: desc,
          is_published: isPublished,
          sort_order: allProjects.length + 1,
          created_at: new Date().toISOString()
        };

        allProjects = await window.saveProject(projectData);
        renderAdminProjectsList();
        updateOverviewKPIs();

        form.reset();
        document.getElementById('edit-project-id').value = '';
        document.getElementById('project-form-header').textContent = '+ Add New Portfolio Project';
        document.getElementById('save-project-btn-text').textContent = 'Save & Publish Project';
        if (previewWrap) previewWrap.classList.add('hidden');

        showToast('Portfolio project saved & published live!', '✦');
      });
    }
  }

  // -------------------------------------------------------------
  // 4.5. COURSE & VIDEO MASTERCLASS STUDIO (Full Admin Control)
  // -------------------------------------------------------------
  const STORAGE_LESSONS_KEY = 'ft-jithin-course-curriculum';

  const defaultCourseModules = [
    {
      id: 'mod-1',
      title: 'Module 1: Foundations of Kinetic Motion & Typographic Pacing',
      lessons: [
        {
          id: 'les-1-1',
          title: '1.1 Kinetic Typography & Storyboard Construction',
          duration: '14:20',
          completed: true,
          isFreePreview: true,
          videoUrl: '',
          description: 'Explore the creative principles behind kinetic text reveals. Learn how letter tracking, blur-to-sharp transitions, and easing curves create impact without sacrificing visual clarity.',
          resources: [
            { name: 'Kinetic Typography Starter Pack (After Effects)', size: '12.4 MB', url: '#' }
          ]
        },
        {
          id: 'les-1-2',
          title: '1.2 Speed Graph Mastery in Adobe After Effects',
          duration: '18:45',
          completed: false,
          isFreePreview: false,
          videoUrl: '',
          description: 'Master the value graph and speed graph in After Effects to replace rigid linear keyframes with organic, spring-like velocity curves.',
          resources: [
            { name: 'Motion Curve Presets (.ffx)', size: '350 KB', url: '#' }
          ]
        },
        {
          id: 'les-1-3',
          title: '1.3 2D/3D Logo Animation & Title Sequences',
          duration: '22:10',
          completed: false,
          isFreePreview: false,
          videoUrl: '',
          description: 'Learn how to deconstruct vector logos from Photoshop and Illustrator into multi-layered 3D space with ambient lighting and specular flares.',
          resources: [
            { name: 'Title Reveal Project Files (.aep)', size: '18.2 MB', url: '#' }
          ]
        }
      ]
    },
    {
      id: 'mod-2',
      title: 'Module 2: Cinematic Video Editing & Storytelling Pacing',
      lessons: [
        {
          id: 'les-2-1',
          title: '2.1 Narrative Rhythms & Match Cuts in Premiere Pro',
          duration: '16:50',
          completed: false,
          isFreePreview: false,
          videoUrl: '',
          description: 'Learn the psychology of scene transitions, J-cuts, L-cuts, and match cutting on action to keep audiences engaged in every sequence.',
          resources: [
            { name: 'Sound FX & Transition Audio Kit (.wav)', size: '42 MB', url: '#' }
          ]
        },
        {
          id: 'les-2-2',
          title: '2.2 Dynamic Audio Sync & Visual Impact Framing',
          duration: '24:15',
          completed: false,
          isFreePreview: false,
          videoUrl: '',
          description: 'Techniques for syncing visual cuts and title hits to music beats, sub-bass drops, and subtle atmospheric sound design.',
          resources: [
            { name: 'Audio Beat Marker Workflow Guide', size: '250 KB', url: '#' }
          ]
        }
      ]
    },
    {
      id: 'mod-3',
      title: 'Module 3: Poster Artwork & Color Science',
      lessons: [
        {
          id: 'les-3-1',
          title: '3.1 Poster Composition & High-Impact Visual Contrast',
          duration: '20:30',
          completed: false,
          isFreePreview: false,
          videoUrl: '',
          description: 'How to combine photographic cutouts, lighting effects, textured overlays, and expressive typography into striking promotional poster art.',
          resources: [
            { name: 'Poster Texture & Brush Pack (.psd)', size: '64 MB', url: '#' }
          ]
        },
        {
          id: 'les-3-2',
          title: '3.2 Node-Based Color Grading in DaVinci Resolve',
          duration: '26:40',
          completed: false,
          isFreePreview: false,
          videoUrl: '',
          description: 'Building custom film looks using primary wheels, parallel nodes, hue vs. sat curves, and highlight rolloff in DaVinci Resolve.',
          resources: [
            { name: 'Cinematic Studio LUTs Pack (.cube)', size: '8.5 MB', url: '#' }
          ]
        }
      ]
    }
  ];

  async function loadCourseData() {
    const saved = localStorage.getItem(STORAGE_LESSONS_KEY);
    if (saved) {
      try {
        allModules = JSON.parse(saved);
      } catch (e) {
        allModules = defaultCourseModules;
      }
    } else {
      allModules = defaultCourseModules;
      saveCourseData();
    }
    renderAdminCurriculum();
    renderStudentEnrollments();
  }

  function saveCourseData() {
    localStorage.setItem(STORAGE_LESSONS_KEY, JSON.stringify(allModules));
    if (typeof window.saveCourseToSupabase === 'function') {
      window.saveCourseToSupabase(allModules).catch(e => console.info('Course cloud sync note:', e));
    }
  }

  function renderAdminCurriculum() {
    const container = document.getElementById('admin-curriculum-container');
    const modulesCountEl = document.getElementById('admin-course-modules-count');
    const lessonsCountEl = document.getElementById('admin-course-lessons-count');
    const datalist = document.getElementById('existing-modules-datalist');

    let totalLessons = 0;
    allModules.forEach(m => {
      if (Array.isArray(m.lessons)) totalLessons += m.lessons.length;
    });

    if (modulesCountEl) modulesCountEl.textContent = allModules.length;
    if (lessonsCountEl) lessonsCountEl.textContent = totalLessons;

    if (datalist) {
      datalist.innerHTML = allModules.map(m => `<option value="${escapeHtml(m.title)}"></option>`).join('');
    }

    if (!container) return;

    if (!allModules.length) {
      container.innerHTML = `
        <div class="text-center py-10 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
          <p class="text-sm text-slate-300 font-medium">No curriculum modules configured.</p>
          <p class="text-xs text-slate-500">Use the form above to add your first module and video lesson.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = allModules.map((mod) => {
      const lessonsHtml = (mod.lessons || []).map(les => {
        const isFree = !!les.isFreePreview;
        const res = (les.resources && les.resources[0]) ? les.resources[0] : null;

        return `
          <div class="p-4 rounded-2xl glass-panel border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div class="flex items-start gap-3">
              <div class="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-sm font-mono font-bold text-purple-300 shrink-0">
                ▶
              </div>
              <div class="space-y-1">
                <div class="flex items-center gap-2">
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${isFree ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'}">
                    ${isFree ? 'Free Preview' : 'Locked ($49)'}
                  </span>
                  <span class="text-xs font-mono text-slate-400 font-bold">${escapeHtml(les.duration || '15:00')}</span>
                  ${les.videoUrl ? `<a href="${escapeHtml(les.videoUrl)}" target="_blank" class="text-[10px] font-mono text-purple-400 hover:underline">Link ↗</a>` : ''}
                </div>
                <h4 class="text-sm font-bold text-white">${escapeHtml(les.title)}</h4>
                <p class="text-xs text-slate-400 line-clamp-1">${escapeHtml(les.description || '')}</p>
                ${res ? `<div class="text-[10px] font-mono text-slate-400">📦 Resource: ${escapeHtml(res.name)} (${res.size || 'Kit'})</div>` : ''}
              </div>
            </div>

            <div class="flex items-center gap-2 self-end md:self-center shrink-0">
              <button class="toggle-free-preview-btn px-3 py-1.5 rounded-xl text-xs font-semibold border ${isFree ? 'border-amber-500/30 text-amber-300 hover:bg-amber-500/20' : 'border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20'}" data-lesson-id="${les.id}">
                ${isFree ? 'Set Locked' : 'Set Free'}
              </button>
              <button class="edit-lesson-btn px-3 py-1.5 rounded-xl text-xs font-semibold border border-white/10 hover:border-purple-400 text-slate-300 hover:text-white" data-lesson-id="${les.id}" data-mod-id="${mod.id}">
                Edit
              </button>
              <button class="delete-lesson-btn px-3 py-1.5 rounded-xl text-xs font-semibold border border-rose-500/30 text-rose-400 hover:bg-rose-500/20" data-lesson-id="${les.id}" data-mod-id="${mod.id}">
                Delete
              </button>
            </div>
          </div>
        `;
      }).join('');

      return `
        <div class="space-y-3 p-5 rounded-3xl bg-white/[0.02] border border-white/10">
          <div class="flex items-center justify-between border-b border-white/5 pb-2.5">
            <div class="space-y-0.5">
              <span class="text-[10px] font-mono font-bold text-purple-400 uppercase">Curriculum Module</span>
              <h4 class="text-base font-extrabold text-white">${escapeHtml(mod.title)}</h4>
            </div>
            <span class="text-xs font-mono font-bold text-slate-400">${(mod.lessons || []).length} Lessons</span>
          </div>
          <div class="space-y-2.5">
            ${lessonsHtml || '<p class="text-xs text-slate-500">No lessons in this module.</p>'}
          </div>
        </div>
      `;
    }).join('');

    // Attach event listeners
    container.querySelectorAll('.toggle-free-preview-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const lesId = btn.getAttribute('data-lesson-id');
        for (const mod of allModules) {
          const les = (mod.lessons || []).find(l => l.id === lesId);
          if (les) {
            les.isFreePreview = !les.isFreePreview;
            saveCourseData();
            renderAdminCurriculum();
            showToast(`Lesson access updated: ${les.isFreePreview ? 'Free Preview' : 'Locked'}`, '✦');
            break;
          }
        }
      });
    });

    container.querySelectorAll('.delete-lesson-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (!confirm('Are you sure you want to remove this video lesson?')) return;
        const lesId = btn.getAttribute('data-lesson-id');
        const modId = btn.getAttribute('data-mod-id');

        const mod = allModules.find(m => m.id === modId);
        if (mod && Array.isArray(mod.lessons)) {
          mod.lessons = mod.lessons.filter(l => l.id !== lesId);
          if (mod.lessons.length === 0) {
            allModules = allModules.filter(m => m.id !== modId);
          }
          saveCourseData();
          renderAdminCurriculum();
          updateOverviewKPIs();
          showToast('Lesson deleted from curriculum.', '🗑️');
        }
      });
    });

    container.querySelectorAll('.edit-lesson-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const lesId = btn.getAttribute('data-lesson-id');
        const modId = btn.getAttribute('data-mod-id');

        const mod = allModules.find(m => m.id === modId);
        if (!mod) return;
        const les = (mod.lessons || []).find(l => l.id === lesId);
        if (!les) return;

        document.getElementById('edit-lesson-id').value = les.id;
        document.getElementById('edit-lesson-mod-id').value = mod.id;
        document.getElementById('lesson-module-input').value = mod.title;
        document.getElementById('lesson-title-input').value = les.title;
        const videoInput = document.getElementById('lesson-video-url-input');
        videoInput.value = les.videoUrl || '';
        
        const videoPreviewWrap = document.getElementById('lesson-video-preview-wrap');
        const videoPreviewEl = document.getElementById('lesson-video-preview-el');
        if (les.videoUrl && videoPreviewWrap && videoPreviewEl && !les.videoUrl.includes('youtube') && !les.videoUrl.includes('vimeo')) {
          videoPreviewEl.src = les.videoUrl;
          videoPreviewWrap.classList.remove('hidden');
        } else if (videoPreviewWrap) {
          videoPreviewWrap.classList.add('hidden');
        }

        document.getElementById('lesson-duration-input').value = les.duration || '15:00';
        document.getElementById('lesson-description-input').value = les.description || '';
        document.getElementById('lesson-free-preview-input').checked = !!les.isFreePreview;

        const res = (les.resources && les.resources[0]) ? les.resources[0] : null;
        if (res) {
          document.getElementById('lesson-resource-name-input').value = res.name || '';
          document.getElementById('lesson-resource-url-input').value = res.url || '';
        }

        document.getElementById('lesson-form-header').textContent = `Edit Lesson: ${les.title}`;
        document.getElementById('save-lesson-btn-text').textContent = 'Update Video Lesson';

        document.getElementById('admin-lesson-form').scrollIntoView({ behavior: 'smooth' });
      });
    });
  }

  function initAdminLessonForm() {
    const form = document.getElementById('admin-lesson-form');
    const resetBtn = document.getElementById('reset-lesson-form-btn');
    const videoFileInput = document.getElementById('lesson-video-file-input');
    const videoUrlInput = document.getElementById('lesson-video-url-input');
    const videoPreviewWrap = document.getElementById('lesson-video-preview-wrap');
    const videoPreviewEl = document.getElementById('lesson-video-preview-el');
    const resFileInput = document.getElementById('lesson-resource-file-input');
    const resNameInput = document.getElementById('lesson-resource-name-input');
    const resUrlInput = document.getElementById('lesson-resource-url-input');

    if (videoFileInput) {
      videoFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            if (videoUrlInput) videoUrlInput.value = event.target.result;
            if (videoPreviewEl) videoPreviewEl.src = event.target.result;
            if (videoPreviewWrap) videoPreviewWrap.classList.remove('hidden');
            showToast('Video file attached successfully!', '🎬');
          };
          reader.readAsDataURL(file);
        }
      });
    }

    if (videoUrlInput) {
      videoUrlInput.addEventListener('input', () => {
        const val = videoUrlInput.value.trim();
        if (val && !val.includes('youtube') && !val.includes('vimeo') && videoPreviewWrap && videoPreviewEl) {
          videoPreviewEl.src = val;
          videoPreviewWrap.classList.remove('hidden');
        } else if (videoPreviewWrap) {
          videoPreviewWrap.classList.add('hidden');
        }
      });
    }

    if (resFileInput) {
      resFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          if (resNameInput && !resNameInput.value) {
            resNameInput.value = file.name;
          }
          const reader = new FileReader();
          reader.onload = (event) => {
            if (resUrlInput) resUrlInput.value = event.target.result;
            showToast(`Resource kit "${file.name}" attached!`, '📦');
          };
          reader.readAsDataURL(file);
        }
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        form.reset();
        document.getElementById('edit-lesson-id').value = '';
        document.getElementById('edit-lesson-mod-id').value = '';
        document.getElementById('lesson-form-header').textContent = '+ Add New Video Lesson';
        document.getElementById('save-lesson-btn-text').textContent = '+ Save & Publish Lesson';
        if (videoPreviewWrap) videoPreviewWrap.classList.add('hidden');
        if (videoPreviewEl) videoPreviewEl.src = '';
      });
    }

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();

        const editId = document.getElementById('edit-lesson-id').value;
        const moduleTitle = document.getElementById('lesson-module-input').value.trim();
        const lessonTitle = document.getElementById('lesson-title-input').value.trim();
        const videoUrl = document.getElementById('lesson-video-url-input').value.trim();
        const duration = document.getElementById('lesson-duration-input').value.trim() || '15:00';
        const description = document.getElementById('lesson-description-input').value.trim();
        const isFreePreview = document.getElementById('lesson-free-preview-input').checked;
        const resName = document.getElementById('lesson-resource-name-input').value.trim();
        const resUrl = document.getElementById('lesson-resource-url-input').value.trim() || '#';

        const resourcesArray = resName ? [{ name: resName, size: 'Studio Kit', url: resUrl }] : [];

        if (editId) {
          for (const mod of allModules) {
            const les = (mod.lessons || []).find(l => l.id === editId);
            if (les) {
              les.title = lessonTitle;
              les.videoUrl = videoUrl;
              les.duration = duration;
              les.description = description;
              les.isFreePreview = isFreePreview;
              if (resName) les.resources = resourcesArray;
              break;
            }
          }
        } else {
          let targetMod = allModules.find(m => m.title.toLowerCase() === moduleTitle.toLowerCase());
          if (!targetMod) {
            targetMod = {
              id: 'mod-' + Date.now(),
              title: moduleTitle,
              lessons: []
            };
            allModules.push(targetMod);
          }

          const newLesson = {
            id: 'les-' + Date.now(),
            title: lessonTitle,
            duration: duration,
            completed: false,
            isFreePreview: isFreePreview,
            videoUrl: videoUrl,
            description: description,
            resources: resourcesArray.length ? resourcesArray : [
              { name: `${lessonTitle} Assets.zip`, size: 'Project Files', url: '#' }
            ]
          };

          targetMod.lessons.push(newLesson);
        }

        saveCourseData();
        renderAdminCurriculum();
        updateOverviewKPIs();

        form.reset();
        document.getElementById('edit-lesson-id').value = '';
        document.getElementById('edit-lesson-mod-id').value = '';
        document.getElementById('lesson-form-header').textContent = '+ Add New Video Lesson';
        document.getElementById('save-lesson-btn-text').textContent = '+ Save & Publish Lesson';
        if (videoPreviewWrap) videoPreviewWrap.classList.add('hidden');
        if (videoPreviewEl) videoPreviewEl.src = '';

        showToast('Video lesson saved to Masterclass curriculum!', '✦');
      });
    }

    const grantBtn = document.getElementById('manual-grant-access-btn');
    if (grantBtn) {
      grantBtn.addEventListener('click', async () => {
        const emailInput = document.getElementById('manual-student-email-input');
        const email = emailInput ? emailInput.value.trim() : '';

        if (!email || !email.includes('@')) {
          showToast('Please enter a valid student email address.', '⚠️');
          return;
        }

        const newReceipt = {
          id: 'pay-' + Date.now(),
          type: 'Course Payment Settled',
          name: email.split('@')[0],
          email: email,
          budget: '$49.00',
          message: 'Direct Admin Access Grant: Full Masterclass Lifetime Access settled by Jithin.',
          status: 'Settled',
          timestamp: new Date().toISOString()
        };

        allDispatches.unshift(newReceipt);
        if (typeof window.syncDispatchToSupabase === 'function') {
          await window.syncDispatchToSupabase(newReceipt);
        }

        emailInput.value = '';
        renderStudentEnrollments();
        updateOverviewKPIs();
        showToast(`Full access granted to ${email}!`, '🎓');
      });
    }
  }

  function renderStudentEnrollments() {
    const countEl = document.getElementById('admin-course-enrollments-count');
    const container = document.getElementById('admin-enrollments-list');

    const enrollments = allDispatches.filter(d => (d.type || '').toLowerCase().includes('course') || (d.type || '').toLowerCase().includes('payment'));

    if (countEl) countEl.textContent = enrollments.length;
    if (!container) return;

    if (!enrollments.length) {
      container.innerHTML = `
        <div class="text-center py-8 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
          <p class="text-sm text-slate-300 font-medium">No student course dispatches yet.</p>
          <p class="text-xs text-slate-500">When students settle the $49 enrollment via checkout, records will appear here.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = enrollments.map(en => {
      return `
        <div class="p-4 rounded-2xl glass-panel border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-sm font-bold text-emerald-400">
              ✓
            </div>
            <div class="space-y-0.5">
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold text-white">${escapeHtml(en.name || 'Student')}</span>
                <span class="px-2 py-0.2 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300">Settled $49</span>
              </div>
              <div class="text-[11px] font-mono text-slate-400">${escapeHtml(en.email)} • ${formatRelativeDate(en.timestamp)}</div>
            </div>
          </div>

          <div class="flex items-center gap-2 self-end sm:self-center">
            <span class="text-xs font-mono font-bold text-emerald-400">Full Access Active</span>
          </div>
        </div>
      `;
    }).join('');
  }

  // -------------------------------------------------------------
  // 4.6. PUBLIC COURSES PAGE VISIBILITY TOGGLE (ADMIN KEYBUTTON)
  // -------------------------------------------------------------
  const STORAGE_COURSES_VISIBLE_KEY = 'ft_jithin_courses_visible';
  let updateVisibilityUI = null;

  function initCoursesVisibilityControl() {
    const toggleBtn = document.getElementById('toggle-courses-visibility-btn');
    const badge = document.getElementById('courses-visibility-badge');
    const iconEl = document.getElementById('toggle-courses-visibility-icon');
    const textEl = document.getElementById('toggle-courses-visibility-text');
    const overviewChip = document.getElementById('overview-courses-visibility-chip');

    updateVisibilityUI = function(isVisible) {
      if (badge) {
        if (isVisible) {
          badge.className = 'px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30';
          badge.textContent = '● Live & Visible on Website';
        } else {
          badge.className = 'px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30';
          badge.textContent = '○ Currently Hidden';
        }
      }

      if (toggleBtn && textEl && iconEl) {
        if (isVisible) {
          toggleBtn.className = 'px-5 py-2.5 text-xs font-bold shrink-0 flex items-center gap-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition-all';
          iconEl.textContent = '🔒';
          textEl.textContent = 'Hide Courses Page';
        } else {
          toggleBtn.className = 'btn-primary px-5 py-2.5 text-xs font-bold shrink-0 flex items-center gap-2 shadow-lg';
          iconEl.textContent = '👁️';
          textEl.textContent = 'Unhide Courses Page';
        }
      }

      if (overviewChip) {
        if (isVisible) {
          overviewChip.className = 'text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 ml-2 font-bold';
          overviewChip.textContent = 'Live';
        } else {
          overviewChip.className = 'text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 ml-2 font-bold';
          overviewChip.textContent = 'Hidden';
        }
      }
    }

    const currentVisible = localStorage.getItem(STORAGE_COURSES_VISIBLE_KEY) === 'true';
    updateVisibilityUI(currentVisible);

    if (toggleBtn) {
      toggleBtn.addEventListener('click', async () => {
        const isNowVisible = localStorage.getItem(STORAGE_COURSES_VISIBLE_KEY) !== 'true';
        localStorage.setItem(STORAGE_COURSES_VISIBLE_KEY, isNowVisible ? 'true' : 'false');
        updateVisibilityUI(isNowVisible);

        if (typeof window.saveSiteProfile === 'function') {
          try {
            await window.saveSiteProfile({ courses_visible: isNowVisible });
          } catch (e) {
            console.warn('Visibility profile sync note:', e);
          }
        }

        if (isNowVisible) {
          showToast('Courses & Masterclass page is now LIVE on website!', '🎓');
        } else {
          showToast('Courses page has been hidden from public visitors.', '🔒');
        }
      });
    }
  }

  // -------------------------------------------------------------
  // 5. CREATIVE SERVICES MANAGER
  // -------------------------------------------------------------
  async function loadServicesData() {
    if (typeof window.fetchServices !== 'function') return;
    allServices = await window.fetchServices();
    renderAdminServicesList();
  }

  function renderAdminServicesList() {
    const container = document.getElementById('admin-services-list');
    if (!container) return;

    container.innerHTML = allServices.map((service, idx) => {
      const isActive = service.is_active !== false;
      const tools = Array.isArray(service.tools) ? service.tools.join(', ') : '';

      return `
        <div class="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
          <div class="flex items-center justify-between">
            <span class="text-2xl">${service.icon || '✦'}</span>
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" class="service-active-toggle w-4 h-4 rounded text-purple-600" data-id="${service.id}" ${isActive ? 'checked' : ''} />
              <span class="text-xs font-mono font-bold ${isActive ? 'text-emerald-400' : 'text-slate-500'}">
                ${isActive ? 'Active' : 'Disabled'}
              </span>
            </label>
          </div>

          <div class="space-y-3">
            <div>
              <label class="block text-[11px] font-mono font-bold text-slate-400 uppercase">Service Title</label>
              <input type="text" class="service-edit-title w-full mt-1 px-3 py-1.5 rounded-xl border border-white/10 bg-white/[0.04] text-white text-sm font-bold" data-id="${service.id}" value="${escapeHtml(service.title)}" />
            </div>

            <div>
              <label class="block text-[11px] font-mono font-bold text-slate-400 uppercase">Description</label>
              <textarea rows="2" class="service-edit-desc w-full mt-1 px-3 py-2 rounded-xl border border-white/10 bg-white/[0.04] text-white text-xs leading-relaxed" data-id="${service.id}">${escapeHtml(service.description)}</textarea>
            </div>

            <div>
              <label class="block text-[11px] font-mono font-bold text-slate-400 uppercase">Tools (Comma-separated)</label>
              <input type="text" class="service-edit-tools w-full mt-1 px-3 py-1.5 rounded-xl border border-white/10 bg-white/[0.04] text-white text-xs font-mono" data-id="${service.id}" value="${escapeHtml(tools)}" />
            </div>
          </div>

          <div class="flex justify-end pt-2 border-t border-white/5">
            <button class="save-single-service-btn px-4 py-1.5 rounded-full text-xs font-bold btn-primary" data-id="${service.id}">
              Update Service
            </button>
          </div>
        </div>
      `;
    }).join('');

    // Attach save handlers for services
    container.querySelectorAll('.save-single-service-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        const title = container.querySelector(`.service-edit-title[data-id="${id}"]`).value.trim();
        const desc = container.querySelector(`.service-edit-desc[data-id="${id}"]`).value.trim();
        const toolsRaw = container.querySelector(`.service-edit-tools[data-id="${id}"]`).value.trim();
        const active = container.querySelector(`.service-active-toggle[data-id="${id}"]`).checked;

        const toolsArray = toolsRaw ? toolsRaw.split(',').map(t => t.trim()).filter(Boolean) : [];

        const updatedService = {
          id,
          title,
          description: desc,
          tools: toolsArray,
          is_active: active
        };

        allServices = await window.saveService(updatedService);
        updateOverviewKPIs();
        showToast(`Updated service: ${title}`, '✦');
      });
    });
  }

  // -------------------------------------------------------------
  // 6. PROFILE, BIO & SKILLS SETTINGS
  // -------------------------------------------------------------
  async function loadProfileData() {
    if (typeof window.fetchSiteProfile !== 'function') return;
    siteProfile = await window.fetchSiteProfile();

    // Populate profile inputs
    const brandInput = document.getElementById('profile-brand-name');
    const nameInput = document.getElementById('profile-name');
    const taglineInput = document.getElementById('profile-tagline');
    const shortBioInput = document.getElementById('profile-short-bio');
    const fullBioInput = document.getElementById('profile-full-bio');
    const skillsInput = document.getElementById('profile-skills');

    if (brandInput) brandInput.value = siteProfile.brand_name || 'FT JITHIN DESIGNZ';
    if (nameInput) nameInput.value = siteProfile.name || 'Jithin';
    if (taglineInput) taglineInput.value = siteProfile.tagline || 'Turning Ideas Into Visual Experiences.';
    if (shortBioInput) shortBioInput.value = siteProfile.short_bio || '';
    if (fullBioInput) fullBioInput.value = siteProfile.full_bio || '';
    if (skillsInput) skillsInput.value = Array.isArray(siteProfile.skills) ? siteProfile.skills.join(', ') : '';

    // Contact info
    const emailInput = document.getElementById('contact-email-input');
    const phoneInput = document.getElementById('contact-phone-input');
    const locationInput = document.getElementById('contact-location-input');

    if (emailInput) emailInput.value = siteProfile.email || 'contact@ftjithindesignz.com';
    if (phoneInput) phoneInput.value = siteProfile.phone || '+1 (555) 000-0000';
    if (locationInput) locationInput.value = siteProfile.location || 'Creative Studio';

    // Socials
    if (siteProfile.social_links) {
      const igInput = document.getElementById('social-instagram-input');
      const ytInput = document.getElementById('social-youtube-input');
      const bhInput = document.getElementById('social-behance-input');

      if (igInput) igInput.value = siteProfile.social_links.instagram || '';
      if (ytInput) ytInput.value = siteProfile.social_links.youtube || '';
      if (bhInput) bhInput.value = siteProfile.social_links.behance || '';
    }

    // SEO
    const seoTitleInput = document.getElementById('seo-title-input');
    const seoDescInput = document.getElementById('seo-desc-input');
    if (seoTitleInput) seoTitleInput.value = siteProfile.seo_title || '';
    if (seoDescInput) seoDescInput.value = siteProfile.seo_description || '';

    // Courses visibility sync
    if (siteProfile.courses_visible !== undefined) {
      localStorage.setItem(STORAGE_COURSES_VISIBLE_KEY, siteProfile.courses_visible ? 'true' : 'false');
      if (typeof updateVisibilityUI === 'function') {
        updateVisibilityUI(siteProfile.courses_visible);
      }
    }
  }

  function initProfileForms() {
    // Profile form
    const profileForm = document.getElementById('profile-settings-form');
    if (profileForm) {
      profileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const brand = document.getElementById('profile-brand-name').value.trim();
        const name = document.getElementById('profile-name').value.trim();
        const tagline = document.getElementById('profile-tagline').value.trim();
        const shortBio = document.getElementById('profile-short-bio').value.trim();
        const fullBio = document.getElementById('profile-full-bio').value.trim();
        const skillsRaw = document.getElementById('profile-skills').value.trim();

        const skillsArray = skillsRaw ? skillsRaw.split(',').map(s => s.trim()).filter(Boolean) : [];

        siteProfile = await window.saveSiteProfile({
          brand_name: brand,
          name: name,
          tagline: tagline,
          short_bio: shortBio,
          full_bio: fullBio,
          skills: skillsArray
        });

        showToast('Profile & Bio updated successfully!', '✦');
      });
    }

    // Contact form
    const contactForm = document.getElementById('contact-settings-form');
    if (contactForm) {
      contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('contact-email-input').value.trim();
        const phone = document.getElementById('contact-phone-input').value.trim();
        const location = document.getElementById('contact-location-input').value.trim();
        const ig = document.getElementById('social-instagram-input').value.trim();
        const yt = document.getElementById('social-youtube-input').value.trim();
        const bh = document.getElementById('social-behance-input').value.trim();

        siteProfile = await window.saveSiteProfile({
          email,
          phone,
          location,
          social_links: {
            instagram: ig,
            youtube: yt,
            behance: bh
          }
        });

        showToast('Contact details & social links saved!', '✦');
      });
    }

    // SEO Form
    const seoForm = document.getElementById('seo-settings-form');
    if (seoForm) {
      seoForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const seoTitle = document.getElementById('seo-title-input').value.trim();
        const seoDesc = document.getElementById('seo-desc-input').value.trim();

        siteProfile = await window.saveSiteProfile({
          seo_title: seoTitle,
          seo_description: seoDesc
        });

        showToast('SEO Metadata updated!', '✦');
      });
    }

    // Master Password Update form
    const changePinForm = document.getElementById('change-pin-form');
    if (changePinForm) {
      changePinForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const currentInput = document.getElementById('current-pin-input').value.trim();
        const newInput = document.getElementById('new-pin-input').value.trim();

        const currentCheckHash = await computeSha256(currentInput);
        if (currentCheckHash !== currentAdminHash) {
          alert('Current master password is incorrect.');
          return;
        }

        if (newInput.length < 6) {
          alert('New password must be at least 6 characters.');
          return;
        }

        const newHash = await computeSha256(newInput);
        currentAdminHash = newHash;
        localStorage.setItem('ft_jithin_admin_hash', newHash);
        localStorage.removeItem('ft_jithin_admin_pin');

        // Re-sign cryptographic session token
        const now = Date.now();
        const nonce = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2);
        const token = await computeSha256(newHash + ':' + nonce + ':' + now);
        sessionStorage.setItem('ft_jithin_auth_token', token);
        sessionStorage.setItem('ft_jithin_auth_time', String(now));
        sessionStorage.setItem('ft_jithin_auth_nonce', nonce);

        changePinForm.reset();
        showToast('Master Password updated and encrypted successfully!', '🔑');
      });
    }
  }

  // -------------------------------------------------------------
  // 7. CUSTOMER DISPATCHES CRM
  // -------------------------------------------------------------
  async function loadDispatchesData() {
    if (typeof window.fetchDispatchesFromSupabase !== 'function') return;
    allDispatches = await window.fetchDispatchesFromSupabase();
    renderDispatchesList();
  }

  function renderOverviewDispatches() {
    const container = document.getElementById('overview-recent-dispatches');
    if (!container) return;

    const recent = allDispatches.slice(0, 4);

    if (!recent.length) {
      container.innerHTML = `
        <div class="text-center py-6 text-xs text-slate-500 font-medium">
          No inbound dispatches yet. New messages from the contact form will appear here.
        </div>
      `;
      return;
    }

    container.innerHTML = recent.map(d => `
      <div class="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <div class="w-2 h-2 rounded-full ${d.status === 'Unread' ? 'bg-purple-400 animate-pulse' : 'bg-slate-600'}"></div>
          <div>
            <div class="text-sm font-bold text-white">${escapeHtml(d.name)}</div>
            <div class="text-xs text-slate-400 font-mono">${escapeHtml(d.email)} • ${escapeHtml(d.budget || '')}</div>
          </div>
        </div>
        <span class="text-[11px] font-mono text-slate-500">${formatRelativeDate(d.timestamp)}</span>
      </div>
    `).join('');
  }

  function renderDispatchesList() {
    const container = document.getElementById('dispatches-list-container');
    const counter = document.getElementById('filtered-dispatches-count');
    if (!container) return;

    let filtered = allDispatches;

    if (activeDispatchFilter === 'inquiries') {
      filtered = filtered.filter(d => (d.type || '').toLowerCase().includes('inquiry'));
    } else if (activeDispatchFilter === 'calls') {
      filtered = filtered.filter(d => (d.type || '').toLowerCase().includes('consultation') || (d.type || '').toLowerCase().includes('call'));
    } else if (activeDispatchFilter === 'unread') {
      filtered = filtered.filter(d => (d.status || '').toLowerCase() === 'unread');
    }

    if (dispatchSearchQuery) {
      const q = dispatchSearchQuery.toLowerCase();
      filtered = filtered.filter(d => 
        (d.name || '').toLowerCase().includes(q) ||
        (d.email || '').toLowerCase().includes(q) ||
        (d.message || '').toLowerCase().includes(q)
      );
    }

    if (counter) counter.textContent = `${filtered.length} Dispatches`;

    if (!filtered.length) {
      container.innerHTML = `
        <div class="text-center py-12 glass-panel rounded-3xl p-8 border border-white/10 space-y-2">
          <span class="text-3xl">📬</span>
          <h4 class="text-base font-bold text-white">No Dispatches Found</h4>
          <p class="text-xs text-slate-400">Try adjusting your search query or filter.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(d => {
      const isUnread = (d.status || '').toLowerCase() === 'unread';

      return `
        <div class="glass-panel p-5 rounded-2xl border ${isUnread ? 'border-purple-500/30 bg-purple-500/[0.02]' : 'border-white/10'} flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div class="space-y-1.5 flex-1">
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full ${isUnread ? 'bg-purple-400 animate-pulse' : 'bg-slate-600'}"></span>
              <span class="text-xs font-mono font-bold text-purple-300">${escapeHtml(d.type || 'Project Inquiry')}</span>
              <span class="text-slate-500">•</span>
              <span class="text-xs font-mono text-slate-400">${formatRelativeDate(d.timestamp)}</span>
            </div>
            <h4 class="text-base font-bold text-white">${escapeHtml(d.name)} <span class="text-xs font-mono text-slate-400 font-normal">(${escapeHtml(d.email)})</span></h4>
            <p class="text-xs text-slate-300 line-clamp-2">${escapeHtml(d.message || 'No additional message provided.')}</p>
            <div class="pt-1">
              <span class="text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-white/5 text-slate-300 border border-white/10">
                Scope: ${escapeHtml(d.budget || 'Not specified')}
              </span>
            </div>
          </div>

          <div class="flex items-center gap-2 self-end md:self-center shrink-0">
            <button class="view-dispatch-btn px-3.5 py-1.5 rounded-xl text-xs font-semibold btn-primary" data-id="${d.id}">
              View Brief
            </button>
            <button class="toggle-status-btn px-3 py-1.5 rounded-xl text-xs font-semibold border border-white/10 hover:border-purple-400 text-slate-300 hover:text-white" data-id="${d.id}" data-status="${d.status}">
              ${d.status === 'Unread' ? 'Mark Read' : 'Mark Unread'}
            </button>
            <button class="delete-dispatch-btn px-3 py-1.5 rounded-xl text-xs font-semibold border border-rose-500/30 text-rose-400 hover:bg-rose-500/20" data-id="${d.id}">
              Delete
            </button>
          </div>
        </div>
      `;
    }).join('');

    // Event listeners
    container.querySelectorAll('.view-dispatch-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        openDispatchModal(id);
      });
    });

    container.querySelectorAll('.toggle-status-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        const current = btn.getAttribute('data-status');
        const newStatus = current === 'Unread' ? 'Replied' : 'Unread';
        allDispatches = await window.updateDispatchStatus(id, newStatus);
        renderDispatchesList();
        updateOverviewKPIs();
        showToast(`Status updated to ${newStatus}`, '✦');
      });
    });

    container.querySelectorAll('.delete-dispatch-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!confirm('Delete this dispatch record?')) return;
        const id = btn.getAttribute('data-id');
        allDispatches = await window.deleteDispatch(id);
        renderDispatchesList();
        updateOverviewKPIs();
        showToast('Dispatch deleted.', '🗑️');
      });
    });
  }

  function initDispatchControls() {
    // Filter pills
    const pills = document.querySelectorAll('.dispatch-filter-pill');
    pills.forEach(pill => {
      pill.addEventListener('click', () => {
        pills.forEach(p => {
          p.classList.remove('bg-white', 'text-black', 'font-bold');
          p.classList.add('text-slate-400');
        });
        pill.classList.add('bg-white', 'text-black', 'font-bold');
        pill.classList.remove('text-slate-400');

        activeDispatchFilter = pill.getAttribute('data-filter') || 'all';
        renderDispatchesList();
      });
    });

    // Search input
    const searchInput = document.getElementById('dispatch-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        dispatchSearchQuery = e.target.value.trim();
        renderDispatchesList();
      });
    }

    // CSV Exporter
    const exportBtn = document.getElementById('export-dispatches-btn');
    if (exportBtn) {
      exportBtn.addEventListener('click', exportDispatchesToCSV);
    }

    // Modal close
    const modalClose = document.getElementById('close-dispatch-detail-modal');
    const modal = document.getElementById('dispatch-detail-modal');
    if (modalClose && modal) {
      modalClose.addEventListener('click', () => {
        modal.classList.remove('active');
      });
    }
  }

  function openDispatchModal(id) {
    const item = allDispatches.find(d => d.id === id);
    if (!item) return;

    const modal = document.getElementById('dispatch-detail-modal');
    if (!modal) return;

    document.getElementById('detail-type-badge').textContent = item.type || 'Project Inquiry';
    document.getElementById('detail-client-name').textContent = item.name || 'Anonymous Client';
    document.getElementById('detail-budget-badge').textContent = item.budget || 'Not specified';
    document.getElementById('detail-timestamp').textContent = new Date(item.timestamp).toLocaleString();
    document.getElementById('detail-client-email').textContent = item.email || '';
    document.getElementById('detail-message-body').textContent = item.message || '';

    const replyBtn = document.getElementById('detail-reply-email-btn');
    if (replyBtn) {
      replyBtn.href = `mailto:${item.email}?subject=Regarding Your Project Inquiry with FT JITHIN DESIGNZ`;
    }

    modal.classList.add('active');
  }

  function exportDispatchesToCSV() {
    if (!allDispatches.length) {
      alert('No dispatches available to export.');
      return;
    }

    const headers = ['ID', 'Type', 'Name', 'Email', 'Budget Bracket', 'Message', 'Status', 'Timestamp'];
    const rows = allDispatches.map(d => [
      d.id,
      `"${(d.type || '').replace(/"/g, '""')}"`,
      `"${(d.name || '').replace(/"/g, '""')}"`,
      `"${(d.email || '').replace(/"/g, '""')}"`,
      `"${(d.budget || '').replace(/"/g, '""')}"`,
      `"${(d.message || '').replace(/"/g, '""')}"`,
      d.status || 'Unread',
      d.timestamp || ''
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ft-jithin-dispatches-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Exported dispatches to CSV!', '📥');
  }

  // -------------------------------------------------------------
  // UTILITIES
  // -------------------------------------------------------------
  function formatRelativeDate(isoStr) {
    if (!isoStr) return 'Recently';
    const date = new Date(isoStr);
    const diffHours = Math.round((Date.now() - date.getTime()) / (1000 * 60 * 60));

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // -------------------------------------------------------------
  // 4.7. LIVE STUDIO ANALYTICS (24-Hour Adaptive Daylight Gradient Engine)
  // -------------------------------------------------------------
  function initAdminLiveAnalytics() {
    const dashboardCard = document.getElementById('admin-analytics-dashboard');
    if (!dashboardCard) return;

    const ambientGlow = document.getElementById('admin-analytics-ambient-glow');
    const clockEl = document.getElementById('daylight-clock-display');
    const phaseIcon = document.getElementById('daylight-phase-icon');
    const phaseName = document.getElementById('daylight-phase-name');
    const gradientLabel = document.getElementById('admin-saas-gradient-label');
    const gradientSub = document.getElementById('admin-saas-gradient-sub');
    const presetBtns = document.querySelectorAll('.daylight-preset-btn');

    const tabs = document.querySelectorAll('.admin-saas-tab-btn');
    const metricTitle = document.getElementById('admin-saas-metric-title');
    const metricVal = document.getElementById('admin-saas-metric-val');
    const badgeStatus = document.getElementById('admin-saas-badge-status');
    const peakWindow = document.getElementById('admin-saas-peak-window');
    const barDetail = document.getElementById('admin-saas-bar-detail');
    const chartBars = document.querySelectorAll('.admin-saas-chart-bar');
    const barValLabels = document.querySelectorAll('.admin-saas-bar-val');
    const dayColumns = document.querySelectorAll('[data-day]');

    let activePreset = 'auto'; // 'auto', 'dawn', 'noon', 'dusk', 'night'
    let currentPhase = 'dusk';

    const daylightPhases = {
      dawn: {
        name: 'Sunrise Dawn',
        icon: '🌅',
        timeWindow: '05:00 - 09:00 IST',
        label: 'Sunrise Dawn (Gold & Peach)',
        next: 'Next: Daylight Radiance (09:00)',
        glowColor: 'rgba(251, 146, 60, 0.45)',
        class: 'daylight-dawn'
      },
      noon: {
        name: 'High Noon',
        icon: '☀️',
        timeWindow: '09:00 - 15:00 IST',
        label: 'Daylight Radiance (Azure Sky)',
        next: 'Next: Golden Hour Dusk (15:00)',
        glowColor: 'rgba(59, 130, 246, 0.45)',
        class: 'daylight-noon'
      },
      dusk: {
        name: 'Golden Hour Dusk',
        icon: '🌇',
        timeWindow: '15:00 - 20:00 IST',
        label: 'Golden Hour (Magenta & Amber)',
        next: 'Next: Cosmic Midnight (20:00)',
        glowColor: 'rgba(236, 72, 153, 0.45)',
        class: 'daylight-dusk'
      },
      night: {
        name: 'Cosmic Midnight',
        icon: '🌌',
        timeWindow: '20:00 - 05:00 IST',
        label: 'Cosmic Midnight (Ultraviolet)',
        next: 'Next: Sunrise Dawn (05:00)',
        glowColor: 'rgba(139, 92, 246, 0.45)',
        class: 'daylight-night'
      }
    };

    function determineAutoPhase() {
      const hour = new Date().getHours();
      if (hour >= 5 && hour < 9) return 'dawn';
      if (hour >= 9 && hour < 15) return 'noon';
      if (hour >= 15 && hour < 20) return 'dusk';
      return 'night';
    }

    function applyDaylightPhase(phaseKey) {
      currentPhase = phaseKey;
      const config = daylightPhases[phaseKey] || daylightPhases.dusk;

      dashboardCard.classList.remove('daylight-dawn', 'daylight-noon', 'daylight-dusk', 'daylight-night');
      dashboardCard.classList.add(config.class);

      if (ambientGlow) {
        ambientGlow.style.backgroundColor = config.glowColor;
      }
      if (phaseIcon) phaseIcon.textContent = config.icon;
      if (phaseName) {
        phaseName.textContent = (activePreset === 'auto' ? 'Auto: ' : '') + config.name;
      }
      if (gradientLabel) gradientLabel.textContent = config.label;
      if (gradientSub) gradientSub.textContent = config.next;

      // Sync public hero card if open in browser
      const publicHeroCard = document.getElementById('hero-saas-card');
      if (publicHeroCard) {
        publicHeroCard.classList.remove('daylight-dawn', 'daylight-noon', 'daylight-dusk', 'daylight-night');
        publicHeroCard.classList.add(config.class);
      }
    }

    function updateDaylightEngine() {
      const now = new Date();
      if (clockEl) {
        clockEl.textContent = now.toLocaleTimeString('en-US', { hour12: false }) + ' IST';
      }

      if (activePreset === 'auto') {
        const autoPhase = determineAutoPhase();
        if (autoPhase !== currentPhase) {
          applyDaylightPhase(autoPhase);
        }
      }
    }

    // Set initial phase
    applyDaylightPhase(determineAutoPhase());
    updateDaylightEngine();
    setInterval(updateDaylightEngine, 1000);

    // Preset button switcher
    presetBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        presetBtns.forEach(b => {
          b.classList.remove('active', 'bg-white/20', 'text-white', 'font-bold');
          b.classList.add('text-slate-300');
        });
        btn.classList.add('active', 'bg-white/20', 'text-white', 'font-bold');
        btn.classList.remove('text-slate-300');

        const chosen = btn.getAttribute('data-phase');
        if (chosen === 'auto') {
          activePreset = 'auto';
          applyDaylightPhase(determineAutoPhase());
          showToast('Daylight Adaptive Engine: Clock Auto-Sync Enabled', '🔄');
        } else if (daylightPhases[chosen]) {
          activePreset = chosen;
          applyDaylightPhase(chosen);
          showToast(`Daylight Phase switched to ${daylightPhases[chosen].name}!`, daylightPhases[chosen].icon);
        }
      });
    });

    // Metric Data Sets
    const dataSets = {
      overview: {
        title: 'Live Creative Output',
        val: '$148,290',
        badge: '+28.4% vs last mo',
        peak: '17:00 - 21:00 IST',
        bars: [45, 62, 55, 78, 90, 84, 98],
        dailyFigures: [
          'Mon: $18,450 (8 projects completed)',
          'Tue: $24,200 (11 projects completed)',
          'Wed: $21,100 (9 projects completed)',
          'Thu: $29,800 (14 projects completed)',
          'Fri: $36,400 (17 projects completed)',
          'Sat: $31,500 (13 projects completed)',
          'Sun: $39,840 (Peak output • 19 projects completed)'
        ]
      },
      analytics: {
        title: 'Global Portfolio Impressions',
        val: '1.42M views',
        badge: '99.98% Engagement',
        peak: '14:00 - 18:00 IST',
        bars: [60, 40, 85, 92, 70, 88, 95],
        dailyFigures: [
          'Mon: 165K views across Behance & Reels',
          'Tue: 110K views across YouTube & Web',
          'Wed: 235K views across Portfolio',
          'Thu: 260K views across Instagram',
          'Fri: 195K views across Creative Net',
          'Sat: 242K views across Client Spotlights',
          'Sun: 275K views (Peak Viral Motion Reach)'
        ]
      },
      retention: {
        title: 'Client Retention & Repeat Rate',
        val: '94.6%',
        badge: '98.5% Client Satisfaction',
        peak: 'Continuous 24h',
        bars: [80, 82, 85, 89, 91, 93, 96],
        dailyFigures: [
          'Mon: 91.2% client satisfaction score',
          'Tue: 92.5% repeat commission rate',
          'Wed: 93.8% milestone signoff rate',
          'Thu: 94.6% contract renewal velocity',
          'Fri: 95.8% five-star rating index',
          'Sat: 96.2% recommendation rate',
          'Sun: 97.4% (Peak Brand Trust Index)'
        ]
      },
      traffic: {
        title: 'Realtime Active Visitors',
        val: '18,420 visits',
        badge: '+42.1% Today',
        peak: 'Now (Evening Rush)',
        bars: [50, 68, 72, 85, 94, 91, 99],
        dailyFigures: [
          'Mon: 2,140 unique visitors',
          'Tue: 2,890 unique visitors',
          'Wed: 3,050 unique visitors',
          'Thu: 3,740 unique visitors',
          'Fri: 4,120 unique visitors',
          'Sat: 3,980 unique visitors',
          'Sun: 4,450 unique visitors (Live Peak)'
        ]
      }
    };

    let currentMode = 'overview';

    function renderMetrics(mode) {
      currentMode = mode;
      const data = dataSets[mode] || dataSets.overview;

      if (metricTitle) metricTitle.textContent = data.title;
      if (metricVal) metricVal.textContent = data.val;
      if (badgeStatus) badgeStatus.textContent = data.badge;
      if (peakWindow) peakWindow.textContent = data.peak;

      chartBars.forEach((bar, idx) => {
        const heightPercent = data.bars[idx] || 50;
        bar.style.height = `${heightPercent}%`;
        if (barValLabels[idx]) {
          barValLabels[idx].textContent = `${heightPercent}%`;
        }
      });

      if (barDetail) {
        barDetail.innerHTML = `Today's Projected Velocity: <span class="text-white font-bold font-mono">${escapeHtml(data.dailyFigures[6])}</span>`;
      }
    }

    // Tab buttons
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => {
          t.classList.remove('active', 'bg-white', 'text-black');
          t.classList.add('text-slate-400');
        });
        tab.classList.add('active', 'bg-white', 'text-black');
        tab.classList.remove('text-slate-400');

        const mode = tab.getAttribute('data-mode') || 'overview';
        renderMetrics(mode);
      });
    });

    // Day bar click interactions
    dayColumns.forEach((col, idx) => {
      col.addEventListener('click', () => {
        const day = col.getAttribute('data-day') || '';
        const data = dataSets[currentMode] || dataSets.overview;
        const figure = data.dailyFigures[idx] || '';

        if (barDetail) {
          barDetail.innerHTML = `<span class="text-amber-300 font-bold">${day} Breakdown:</span> <span class="text-white font-bold font-mono">${escapeHtml(figure)}</span>`;
        }
      });
    });

    // Realtime pulse simulation
    setInterval(() => {
      if (currentMode === 'traffic' && metricVal) {
        const base = 18420 + Math.floor(Math.random() * 30);
        metricVal.textContent = `${base.toLocaleString()} visits`;
      }
    }, 18000);

    renderMetrics('overview');
  }

  // -------------------------------------------------------------
  // INITIALIZATION
  // -------------------------------------------------------------
  function initAll() {
    initAuth();
    initTabs();
    initProjectForm();
    initAdminLessonForm();
    initCoursesVisibilityControl();
    initAdminLiveAnalytics();
    initProfileForms();
    initDispatchControls();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }

})();
