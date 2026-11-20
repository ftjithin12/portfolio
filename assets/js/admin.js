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
  // 1. STATE & AUTHENTICATION (Default PIN: 2026)
  // -------------------------------------------------------------
  let currentPin = localStorage.getItem('ft_jithin_admin_pin') || '2026';
  let isAuthenticated = sessionStorage.getItem('ft_jithin_auth') === 'true';

  let allDispatches = [];
  let allProjects = [];
  let allServices = [];
  let siteProfile = null;

  let activeDispatchFilter = 'all';
  let dispatchSearchQuery = '';

  const authGate = document.getElementById('auth-gate');
  const adminSuite = document.getElementById('admin-suite');
  const authForm = document.getElementById('admin-auth-form');
  const pinInput = document.getElementById('admin-pin-input');
  const authError = document.getElementById('auth-error-msg');

  function initAuth() {
    if (isAuthenticated) {
      revealSuite();
    } else {
      hideSuite();
    }

    if (authForm) {
      authForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const enteredPin = pinInput.value.trim();

        if (enteredPin === currentPin) {
          isAuthenticated = true;
          sessionStorage.setItem('ft_jithin_auth', 'true');
          revealSuite();
          showToast('Welcome back, Jithin! Studio unlocked.', '✦');
        } else {
          showAuthError('Invalid Master Passkey. Access restricted.');
        }
      });
    }

    // Demo / Quick PIN helper
    const demoPinBtn = document.getElementById('demo-pin-btn');
    if (demoPinBtn && pinInput) {
      demoPinBtn.addEventListener('click', () => {
        pinInput.value = currentPin;
        authForm.dispatchEvent(new Event('submit'));
      });
    }

    // Biometric unlock simulation
    const bioBtn = document.getElementById('biometric-unlock-btn');
    if (bioBtn && pinInput) {
      bioBtn.addEventListener('click', () => {
        pinInput.value = currentPin;
        authForm.dispatchEvent(new Event('submit'));
      });
    }

    // Lock portal buttons
    document.querySelectorAll('.lock-admin-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        isAuthenticated = false;
        sessionStorage.removeItem('ft_jithin_auth');
        hideSuite();
        if (pinInput) pinInput.value = '';
        showToast('Admin Studio locked.', '🔒');
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
        document.getElementById('project-thumbnail-input').value = project.thumbnail_url || '';
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

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        form.reset();
        document.getElementById('edit-project-id').value = '';
        document.getElementById('project-form-header').textContent = '+ Add New Portfolio Project';
        document.getElementById('save-project-btn-text').textContent = 'Save & Publish Project';
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

        showToast('Portfolio project saved & published!', '✦');
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

    // Master PIN form
    const changePinForm = document.getElementById('change-pin-form');
    if (changePinForm) {
      changePinForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const currentInput = document.getElementById('current-pin-input').value.trim();
        const newInput = document.getElementById('new-pin-input').value.trim();

        if (currentInput !== currentPin) {
          alert('Current passkey is incorrect.');
          return;
        }

        if (newInput.length < 4) {
          alert('New passkey must be at least 4 characters.');
          return;
        }

        currentPin = newInput;
        localStorage.setItem('ft_jithin_admin_pin', currentPin);
        changePinForm.reset();
        showToast('Master Passkey updated successfully!', '🔑');
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
  // INITIALIZATION
  // -------------------------------------------------------------
  function initAll() {
    initAuth();
    initTabs();
    initProjectForm();
    initProfileForms();
    initDispatchControls();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }

})();
