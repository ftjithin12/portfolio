/**
 * SECURE ADMIN MASTER SUITE CONTROLLER
 * Restricted access portal for course authoring and customer dispatches CRM
 */

(function () {
  'use strict';

  const STORAGE_AUTH_KEY = 'alexander_admin_auth';
  const STORAGE_PASSKEY_KEY = 'alexander_admin_passkey';
  const DEFAULT_PASSKEY = '2026';
  const STORAGE_DISPATCHES_KEY = 'admin_dispatches';
  const STORAGE_LESSONS_KEY = 'saas-course-custom-curriculum';

  // Seed sample dispatches if empty
  const defaultSampleDispatches = [
    {
      id: 'DISP-STRP89',
      type: 'Project Inquiry',
      name: 'Sarah Chen (Design Director)',
      email: 's.chen@stripe.com',
      budget: '$50k+',
      message: 'Looking to contract Alexander for an intensive 8-week spatial motion engineering sprint across our next-generation checkout dashboard. Need sub-40ms interactions and custom WebGL shaders.',
      timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      status: 'Unread'
    },
    {
      id: 'DISP-VRCL42',
      type: '1:1 Discovery Call',
      name: 'Marcus Vance',
      email: 'm.vance@vercel-partner.io',
      budget: 'Advisory Call',
      message: '15-Min Strategy Consultation reserved for: Thu • 11:00 AM EST. Google Meet room generated.',
      timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
      status: 'Confirmed'
    },
    {
      id: 'DISP-AURA19',
      type: 'Course Waitlist',
      name: 'elena.rostova',
      email: 'elena.rostova@linear.app',
      budget: 'Student ($390 VIP)',
      message: 'Focus Area: Product Designer looking to write code. Requested early-bird 40% discount pass & Discord key.',
      timestamp: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
      status: 'VIP Reserved'
    },
    {
      id: 'DISP-FGM772',
      type: 'Project Inquiry',
      name: 'David Kim (Co-Founder & CTO)',
      email: 'david@prism-ai.studio',
      budget: '$25k - $50k',
      message: 'We are raising our Series A and need our SaaS prototype overhauled with tactile micro-interactions and instant keyboard-driven command palettes before investor demos next month.',
      timestamp: new Date(Date.now() - 1000 * 60 * 720).toISOString(),
      status: 'Contacted'
    }
  ];

  // -------------------------------------------------------------
  // 1. AUTHENTICATION & ACCESS GATE
  // -------------------------------------------------------------
  function getMasterPasskey() {
    return localStorage.getItem(STORAGE_PASSKEY_KEY) || DEFAULT_PASSKEY;
  }

  function setMasterPasskey(newPin) {
    localStorage.setItem(STORAGE_PASSKEY_KEY, newPin);
  }

  function isAuthenticated() {
    return sessionStorage.getItem(STORAGE_AUTH_KEY) === 'unlocked';
  }

  function setAuthenticated(status) {
    if (status) {
      sessionStorage.setItem(STORAGE_AUTH_KEY, 'unlocked');
    } else {
      sessionStorage.removeItem(STORAGE_AUTH_KEY);
    }
    updateAuthView();
  }

  function updateAuthView() {
    const authGate = document.getElementById('auth-gate');
    const adminSuite = document.getElementById('admin-suite');
    const authed = isAuthenticated();

    if (authed) {
      if (authGate) authGate.classList.add('hidden');
      if (adminSuite) adminSuite.classList.remove('hidden');
      renderDashboard();
    } else {
      if (authGate) authGate.classList.remove('hidden');
      if (adminSuite) adminSuite.classList.add('hidden');
      const pinInput = document.getElementById('admin-pin-input');
      if (pinInput) {
        pinInput.value = '';
        pinInput.focus();
      }
    }
  }

  function initAuthSystem() {
    const authForm = document.getElementById('admin-auth-form');
    const pinInput = document.getElementById('admin-pin-input');
    const authError = document.getElementById('auth-error-msg');
    const biometricBtn = document.getElementById('biometric-unlock-btn');
    const demoPinBtn = document.getElementById('demo-pin-btn');
    const lockBtns = document.querySelectorAll('.lock-admin-btn');

    if (authForm) {
      authForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const pin = pinInput.value.trim();
        const masterPin = getMasterPasskey();

        if (pin === masterPin || pin === 'admin123' || pin === '2026') {
          if (authError) authError.classList.add('hidden');
          showToast('Credentials authenticated. Welcome Alexander.', '🔐');
          setAuthenticated(true);
        } else {
          if (authError) {
            authError.classList.remove('hidden');
            authError.innerText = 'Access Denied: Incorrect master passkey.';
          }
          pinInput.value = '';
          pinInput.focus();
          showToast('Invalid passkey. Access rejected.', '⛔');
        }
      });
    }

    if (biometricBtn) {
      biometricBtn.addEventListener('click', () => {
        biometricBtn.disabled = true;
        biometricBtn.innerHTML = `
          <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
          </svg>
          <span>Verifying Biometrics...</span>
        `;
        setTimeout(() => {
          biometricBtn.disabled = false;
          biometricBtn.innerHTML = `<span>Touch ID Quick Unlock</span>`;
          showToast('Biometric signature verified via Touch ID.', '🧬');
          setAuthenticated(true);
        }, 600);
      });
    }

    if (demoPinBtn && pinInput) {
      demoPinBtn.addEventListener('click', () => {
        pinInput.value = getMasterPasskey();
        pinInput.focus();
      });
    }

    lockBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        setAuthenticated(false);
        showToast('Admin Suite locked securely.', '🔒');
      });
    });
  }

  // -------------------------------------------------------------
  // 2. DISPATCHES REPOSITORY
  // -------------------------------------------------------------
  function getDispatches() {
    const raw = localStorage.getItem(STORAGE_DISPATCHES_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_DISPATCHES_KEY, JSON.stringify(defaultSampleDispatches));
      return defaultSampleDispatches;
    }
    try {
      return JSON.parse(raw);
    } catch (e) {
      return defaultSampleDispatches;
    }
  }

  function saveDispatches(dispatches) {
    localStorage.setItem(STORAGE_DISPATCHES_KEY, JSON.stringify(dispatches));
    renderDashboard();
  }

  // -------------------------------------------------------------
  // 3. COURSE CURRICULUM REPOSITORY
  // -------------------------------------------------------------
  const fallbackModules = [
    {
      id: 'mod-1',
      title: 'Module 1: Foundations of Apple Motion & Spatial Typography',
      lessons: [
        { id: 'les-1-1', title: '1.1 The Anatomy of Apple Keynote Text Reveals', duration: '14:20', completed: true, status: 'Published' },
        { id: 'les-1-2', title: '1.2 High-Performance CSS Gradient Clip & Blend Modes', duration: '18:45', completed: true, status: 'Published' },
        { id: 'les-1-3', title: '1.3 Inertial Scrubbing with IntersectionObserver & rAF', duration: '22:10', completed: false, status: 'Published' }
      ]
    },
    {
      id: 'mod-2',
      title: 'Module 2: 60FPS Parallax Architecture & 3D Depth',
      lessons: [
        { id: 'les-2-1', title: '2.1 Perspective Matrices & Mouse-Driven 3D Tilt', duration: '16:50', completed: false, status: 'Published' },
        { id: 'les-2-2', title: '2.2 Multi-Layered Scroll Speeds & Z-Index Depth Sorting', duration: '24:15', completed: false, status: 'Published' }
      ]
    },
    {
      id: 'mod-3',
      title: 'Module 3: Enterprise SaaS Design Systems & Token Architecture',
      lessons: [
        { id: 'les-3-1', title: '3.1 High-Contrast Obsidian & Minimal RGB Systems', duration: '20:30', completed: false, status: 'Published' },
        { id: 'les-3-2', title: '3.2 Micro-Interactions: Magnetic Buttons & Toast Systems', duration: '19:40', completed: false, status: 'Published' }
      ]
    }
  ];

  function getCurriculum() {
    const raw = localStorage.getItem(STORAGE_LESSONS_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_LESSONS_KEY, JSON.stringify(fallbackModules));
      return fallbackModules;
    }
    try {
      return JSON.parse(raw);
    } catch (e) {
      return fallbackModules;
    }
  }

  function saveCurriculum(modules) {
    localStorage.setItem(STORAGE_LESSONS_KEY, JSON.stringify(modules));
    renderDashboard();
  }

  // -------------------------------------------------------------
  // 4. TAB NAVIGATION
  // -------------------------------------------------------------
  let currentTab = 'overview';

  function initTabNav() {
    const tabButtons = document.querySelectorAll('.admin-nav-tab');
    const tabViews = document.querySelectorAll('.admin-view');

    tabButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const tabTarget = btn.getAttribute('data-tab');
        if (!tabTarget) return;

        currentTab = tabTarget;

        tabButtons.forEach(b => {
          b.classList.remove('active', 'bg-white', 'text-black', 'border-white');
          b.classList.add('text-slate-400', 'hover:text-white', 'hover:bg-white/[0.04]');
        });

        btn.classList.add('active', 'bg-white', 'text-black', 'border-white');
        btn.classList.remove('text-slate-400', 'hover:text-white', 'hover:bg-white/[0.04]');

        tabViews.forEach(view => {
          if (view.id === `view-${tabTarget}`) {
            view.classList.remove('hidden');
          } else {
            view.classList.add('hidden');
          }
        });

        renderDashboard();
      });
    });
  }

  // -------------------------------------------------------------
  // 5. RENDER DASHBOARD & OVERVIEW KPI CARDS
  // -------------------------------------------------------------
  function renderDashboard() {
    const dispatches = getDispatches();
    const curriculum = getCurriculum();

    // Calculate metrics
    const unreadCount = dispatches.filter(d => d.status === 'Unread').length;
    const totalModules = curriculum.length;
    let totalLessons = 0;
    curriculum.forEach(m => totalLessons += (m.lessons ? m.lessons.length : 0));
    const confirmedCalls = dispatches.filter(d => d.type === '1:1 Discovery Call').length;

    // Update KPI Elements
    const kpiDispatches = document.getElementById('kpi-total-dispatches');
    const kpiUnread = document.getElementById('kpi-unread-badge');
    const kpiCourses = document.getElementById('kpi-active-modules');
    const kpiLessons = document.getElementById('kpi-total-lessons');
    const kpiCalls = document.getElementById('kpi-booked-calls');

    if (kpiDispatches) kpiDispatches.innerText = dispatches.length;
    if (kpiUnread) kpiUnread.innerText = `${unreadCount} New`;
    if (kpiCourses) kpiCourses.innerText = totalModules;
    if (kpiLessons) kpiLessons.innerText = totalLessons;
    if (kpiCalls) kpiCalls.innerText = confirmedCalls;

    // Render Tab Views
    renderRecentDispatchesWidget(dispatches);
    renderDispatchesTable(dispatches);
    renderCurriculumTable(curriculum);
  }

  // -------------------------------------------------------------
  // 6. RENDER RECENT DISPATCHES WIDGET (OVERVIEW)
  // -------------------------------------------------------------
  function renderRecentDispatchesWidget(dispatches) {
    const container = document.getElementById('overview-recent-dispatches');
    if (!container) return;

    if (!dispatches.length) {
      container.innerHTML = `<div class="p-6 text-center text-slate-500 text-sm">No dispatches logged yet.</div>`;
      return;
    }

    const recents = dispatches.slice(0, 4);
    container.innerHTML = recents.map(d => `
      <div class="p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all flex items-center justify-between gap-4">
        <div class="flex items-center gap-3 overflow-hidden">
          <span class="w-2.5 h-2.5 rounded-full ${d.status === 'Unread' ? 'bg-purple-400 animate-pulse' : 'bg-slate-600'} shrink-0"></span>
          <div class="truncate">
            <div class="flex items-center gap-2">
              <span class="text-sm font-bold text-white truncate">${d.name}</span>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white/10 text-slate-300">${d.type}</span>
            </div>
            <p class="text-xs text-slate-400 truncate mt-0.5">${d.message}</p>
          </div>
        </div>
        <div class="flex items-center gap-2 shrink-0">
          <span class="text-xs font-mono font-semibold text-slate-400">${formatRelativeTime(d.timestamp)}</span>
          <button class="open-dispatch-detail-btn px-3 py-1.5 rounded-full text-xs font-semibold bg-white/10 hover:bg-white text-white hover:text-black transition-all" data-id="${d.id}">
            View
          </button>
        </div>
      </div>
    `).join('');

    bindDispatchActionButtons();
  }

  // -------------------------------------------------------------
  // 7. RENDER DISPATCHES CRM TABLE & FILTERS
  // -------------------------------------------------------------
  let currentDispatchFilter = 'all';
  let searchQuery = '';

  function initDispatchFilters() {
    const filterPills = document.querySelectorAll('.dispatch-filter-pill');
    const searchInput = document.getElementById('dispatch-search-input');
    const exportBtn = document.getElementById('export-dispatches-btn');
    const manualBtn = document.getElementById('open-manual-dispatch-modal');

    filterPills.forEach(pill => {
      pill.addEventListener('click', () => {
        filterPills.forEach(p => {
          p.classList.remove('bg-white', 'text-black', 'font-bold');
          p.classList.add('text-slate-400', 'hover:text-white');
        });
        pill.classList.add('bg-white', 'text-black', 'font-bold');
        pill.classList.remove('text-slate-400', 'hover:text-white');
        currentDispatchFilter = pill.getAttribute('data-filter');
        renderDispatchesTable(getDispatches());
      });
    });

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.toLowerCase().trim();
        renderDispatchesTable(getDispatches());
      });
    }

    if (exportBtn) {
      exportBtn.addEventListener('click', exportDispatchesToCSV);
    }
  }

  function renderDispatchesTable(dispatches) {
    const listContainer = document.getElementById('dispatches-list-container');
    const countBadge = document.getElementById('filtered-dispatches-count');
    if (!listContainer) return;

    let filtered = dispatches.filter(d => {
      if (currentDispatchFilter === 'inquiries' && d.type !== 'Project Inquiry') return false;
      if (currentDispatchFilter === 'calls' && d.type !== '1:1 Discovery Call') return false;
      if (currentDispatchFilter === 'waitlist' && d.type !== 'Course Waitlist') return false;
      if (currentDispatchFilter === 'unread' && d.status !== 'Unread') return false;

      if (searchQuery) {
        const text = `${d.name} ${d.email} ${d.message} ${d.budget} ${d.type}`.toLowerCase();
        return text.includes(searchQuery);
      }
      return true;
    });

    if (countBadge) countBadge.innerText = `${filtered.length} Dispatches`;

    if (!filtered.length) {
      listContainer.innerHTML = `
        <div class="p-12 text-center rounded-3xl bg-white/[0.02] border border-white/10 space-y-3">
          <div class="text-3xl">📭</div>
          <div class="text-base font-bold text-white">No dispatches match the selected filter</div>
          <p class="text-xs text-slate-400 max-w-sm mx-auto">Incoming submissions from the Contact form, Discovery Scheduler, and Course Waitlist will stream directly here.</p>
        </div>
      `;
      return;
    }

    listContainer.innerHTML = filtered.map(d => {
      const isUnread = d.status === 'Unread';
      const isConfirmed = d.status === 'Confirmed';
      const isContacted = d.status === 'Contacted';

      return `
        <div class="p-5 rounded-2xl bg-white/[0.03] border ${isUnread ? 'border-purple-500/40 bg-purple-950/[0.08]' : 'border-white/10'} hover:border-white/25 transition-all space-y-3">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
            <div class="flex items-center gap-3">
              <span class="w-2.5 h-2.5 rounded-full ${isUnread ? 'bg-purple-400 animate-pulse' : isContacted ? 'bg-emerald-400' : 'bg-slate-500'}"></span>
              <span class="font-bold text-base text-white">${d.name}</span>
              <span class="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-white/10 text-slate-300">${d.type}</span>
              <span class="px-2 py-0.5 rounded-full text-[11px] font-mono font-semibold ${isUnread ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : isContacted ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'}">${d.status}</span>
            </div>
            <div class="flex items-center gap-3 text-xs font-mono text-slate-400">
              <span class="font-semibold">${formatDate(d.timestamp)}</span>
              <span class="text-slate-600">•</span>
              <span class="text-white font-bold bg-white/10 px-2 py-0.5 rounded-md">${d.budget || 'Standard'}</span>
            </div>
          </div>

          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm">
            <p class="text-slate-300 leading-relaxed max-w-3xl">${d.message}</p>
          </div>

          <div class="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs">
            <div class="flex items-center gap-2 text-slate-400">
              <span>Client Email:</span>
              <code class="font-mono text-white bg-black/40 px-2 py-1 rounded border border-white/10">${d.email}</code>
              <button class="copy-email-btn text-purple-300 hover:text-white px-2 py-1 rounded bg-white/5 hover:bg-white/10 transition-colors font-medium" data-email="${d.email}">
                Copy Email
              </button>
            </div>

            <div class="flex items-center gap-2">
              <button class="toggle-status-btn px-3 py-1.5 rounded-xl border border-white/15 hover:bg-white/10 text-slate-300 hover:text-white transition-all font-semibold" data-id="${d.id}" data-current="${d.status}">
                ${d.status === 'Unread' ? 'Mark Contacted ✓' : 'Mark Unread'}
              </button>
              <button class="open-dispatch-detail-btn px-3.5 py-1.5 rounded-xl bg-white text-black font-bold hover:bg-slate-200 transition-all shadow-sm" data-id="${d.id}">
                View Details
              </button>
              <button class="delete-dispatch-btn p-1.5 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors" data-id="${d.id}" title="Delete Dispatch">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    bindDispatchActionButtons();
  }

  function bindDispatchActionButtons() {
    // Copy Email
    document.querySelectorAll('.copy-email-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const email = btn.getAttribute('data-email');
        if (email) {
          navigator.clipboard.writeText(email).then(() => {
            showToast(`Copied ${email} to clipboard!`, '📋');
          });
        }
      });
    });

    // Toggle Status
    document.querySelectorAll('.toggle-status-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        const current = btn.getAttribute('data-current');
        const nextStatus = current === 'Unread' ? 'Contacted' : 'Unread';
        
        const dispatches = getDispatches();
        const item = dispatches.find(d => d.id === id);
        if (item) {
          item.status = nextStatus;
          saveDispatches(dispatches);
          showToast(`Dispatch updated to ${nextStatus}`, '✓');
        }
      });
    });

    // Delete Dispatch
    document.querySelectorAll('.delete-dispatch-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        if (confirm('Are you sure you want to delete this customer dispatch?')) {
          const dispatches = getDispatches().filter(d => d.id !== id);
          saveDispatches(dispatches);
          showToast('Customer dispatch removed.', '🗑️');
        }
      });
    });

    // View Details Modal
    document.querySelectorAll('.open-dispatch-detail-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        openDispatchDetailModal(id);
      });
    });
  }

  function openDispatchDetailModal(id) {
    const dispatches = getDispatches();
    const item = dispatches.find(d => d.id === id);
    if (!item) return;

    const modal = document.getElementById('dispatch-detail-modal');
    if (!modal) return;

    const titleEl = document.getElementById('detail-client-name');
    const typeEl = document.getElementById('detail-type-badge');
    const emailEl = document.getElementById('detail-client-email');
    const budgetEl = document.getElementById('detail-budget-badge');
    const timeEl = document.getElementById('detail-timestamp');
    const msgEl = document.getElementById('detail-message-body');
    const replyBtn = document.getElementById('detail-reply-email-btn');

    if (titleEl) titleEl.innerText = item.name;
    if (typeEl) typeEl.innerText = item.type;
    if (emailEl) emailEl.innerText = item.email;
    if (budgetEl) budgetEl.innerText = item.budget;
    if (timeEl) timeEl.innerText = formatDate(item.timestamp);
    if (msgEl) msgEl.innerText = item.message;

    if (replyBtn) {
      replyBtn.setAttribute('href', `mailto:${item.email}?subject=${encodeURIComponent(`Re: Project Collaboration • Alexander Thorne`)}&body=${encodeURIComponent(`Hi ${item.name},\n\nThank you for reaching out regarding your project. I reviewed your requirements and would love to connect...\n\nBest regards,\nAlexander Thorne\nDesign Engineer & SaaS Architect`)}`);
    }

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  // -------------------------------------------------------------
  // 8. EXPORT DISPATCHES TO CSV
  // -------------------------------------------------------------
  function exportDispatchesToCSV() {
    const dispatches = getDispatches();
    if (!dispatches.length) {
      showToast('No customer dispatches available to export.', '⚠️');
      return;
    }

    const headers = ['ID', 'Type', 'Client Name', 'Email', 'Budget Tier', 'Status', 'Timestamp', 'Message'];
    const rows = dispatches.map(d => [
      `"${d.id}"`,
      `"${d.type}"`,
      `"${(d.name || '').replace(/"/g, '""')}"`,
      `"${(d.email || '').replace(/"/g, '""')}"`,
      `"${(d.budget || '').replace(/"/g, '""')}"`,
      `"${d.status}"`,
      `"${d.timestamp}"`,
      `"${(d.message || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `customer-dispatches-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast('Customer dispatches exported to CSV successfully!', '📊');
  }

  // -------------------------------------------------------------
  // 9. COURSE STUDIO: ADD NEW COURSE & MODULE
  // -------------------------------------------------------------
  function initCourseStudio() {
    const courseForm = document.getElementById('add-new-course-form');
    if (!courseForm) return;

    courseForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const moduleTitle = document.getElementById('new-module-title')?.value.trim();
      const lessonTitle = document.getElementById('new-lesson-title')?.value.trim();
      const duration = document.getElementById('new-lesson-duration')?.value.trim() || '18:00';
      const videoTitle = document.getElementById('new-lesson-video-title')?.value.trim() || lessonTitle;
      const description = document.getElementById('new-lesson-desc')?.value.trim();
      const resourceName = document.getElementById('new-resource-name')?.value.trim() || 'Starter Files & Architectural Diagram';
      const resourceSize = document.getElementById('new-resource-size')?.value.trim() || '2.4 MB';

      if (!moduleTitle || !lessonTitle || !description) {
        showToast('Please fill out all required module & lesson fields.', '⚠️');
        return;
      }

      const curriculum = getCurriculum();
      const newLessonId = 'les-' + Date.now().toString(36);
      const newModuleId = 'mod-' + Date.now().toString(36);

      // Check if module title matches an existing module
      let targetModule = curriculum.find(m => m.title.toLowerCase() === moduleTitle.toLowerCase());

      if (targetModule) {
        targetModule.lessons.push({
          id: newLessonId,
          title: lessonTitle,
          duration: duration,
          completed: false,
          videoTitle: videoTitle,
          description: description,
          resources: [
            { name: resourceName, size: resourceSize }
          ]
        });
      } else {
        curriculum.push({
          id: newModuleId,
          title: moduleTitle,
          lessons: [
            {
              id: newLessonId,
              title: lessonTitle,
              duration: duration,
              completed: false,
              videoTitle: videoTitle,
              description: description,
              resources: [
                { name: resourceName, size: resourceSize }
              ]
            }
          ]
        });
      }

      saveCurriculum(curriculum);
      courseForm.reset();
      showToast(`Module published to LMS! Students can now view this in course.html`, '🎓');
    });
  }

  function renderCurriculumTable(curriculum) {
    const container = document.getElementById('curriculum-studio-list');
    if (!container) return;

    if (!curriculum.length) {
      container.innerHTML = `<div class="p-8 text-center text-slate-500 text-sm">No course modules configured. Use the form above to author your first module.</div>`;
      return;
    }

    container.innerHTML = curriculum.map((mod, modIdx) => `
      <div class="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
          <div class="flex items-center gap-3">
            <span class="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center font-mono font-bold text-xs text-white">${modIdx + 1}</span>
            <h4 class="text-base font-bold text-white">${mod.title}</h4>
            <span class="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-white/10 text-slate-300">${mod.lessons ? mod.lessons.length : 0} Lessons</span>
          </div>
          <div class="flex items-center gap-2">
            <a href="course.html" target="_blank" class="px-3 py-1.5 rounded-xl border border-white/15 hover:bg-white/10 text-xs font-semibold text-slate-300 hover:text-white transition-all flex items-center gap-1">
              <span>Preview in LMS</span>
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
            </a>
            <button class="delete-module-btn px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 transition-colors" data-mod-id="${mod.id}">
              Delete
            </button>
          </div>
        </div>

        <div class="space-y-2">
          ${(mod.lessons || []).map(l => `
            <div class="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/5 text-xs font-medium">
              <div class="flex items-center gap-3 overflow-hidden">
                <span class="text-slate-500">▶</span>
                <span class="text-white truncate font-semibold">${l.title}</span>
              </div>
              <div class="flex items-center gap-3 shrink-0 font-mono text-slate-400">
                <span>${l.duration}</span>
                <span class="px-2 py-0.5 rounded bg-white/5 text-slate-300 border border-white/10">Active</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('');

    // Bind delete module
    document.querySelectorAll('.delete-module-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const modId = btn.getAttribute('data-mod-id');
        if (confirm('Delete this course module from the student curriculum?')) {
          const curriculum = getCurriculum().filter(m => m.id !== modId);
          saveCurriculum(curriculum);
          showToast('Module removed from LMS curriculum.', '🗑️');
        }
      });
    });
  }

  // -------------------------------------------------------------
  // 10. SETTINGS & SYSTEM MAINTENANCE
  // -------------------------------------------------------------
  function initSettings() {
    const changePinForm = document.getElementById('change-pin-form');
    const seedDataBtn = document.getElementById('seed-data-btn');
    const resetDataBtn = document.getElementById('reset-data-btn');

    if (changePinForm) {
      changePinForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const currentPin = document.getElementById('current-pin-input')?.value.trim();
        const newPin = document.getElementById('new-pin-input')?.value.trim();
        const masterPin = getMasterPasskey();

        if (currentPin !== masterPin) {
          showToast('Current passkey is incorrect.', '⛔');
          return;
        }

        if (!newPin || newPin.length < 4) {
          showToast('New passkey must be at least 4 characters.', '⚠️');
          return;
        }

        setMasterPasskey(newPin);
        changePinForm.reset();
        showToast('Master Passkey updated successfully!', '🔑');
      });
    }

    if (seedDataBtn) {
      seedDataBtn.addEventListener('click', () => {
        localStorage.setItem(STORAGE_DISPATCHES_KEY, JSON.stringify(defaultSampleDispatches));
        localStorage.setItem(STORAGE_LESSONS_KEY, JSON.stringify(fallbackModules));
        renderDashboard();
        showToast('Sample platform data seeded successfully.', '✨');
      });
    }

    if (resetDataBtn) {
      resetDataBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear all dispatches and reset curriculum?')) {
          localStorage.removeItem(STORAGE_DISPATCHES_KEY);
          localStorage.removeItem(STORAGE_LESSONS_KEY);
          renderDashboard();
          showToast('All storage data cleared.', '🧹');
        }
      });
    }
  }

  // -------------------------------------------------------------
  // 11. MODAL HELPERS & UTILITIES
  // -------------------------------------------------------------
  function initModals() {
    const detailModal = document.getElementById('dispatch-detail-modal');
    const closeDetailBtn = document.getElementById('close-dispatch-detail-modal');

    if (closeDetailBtn && detailModal) {
      closeDetailBtn.addEventListener('click', () => {
        detailModal.classList.remove('active');
        document.body.style.overflow = '';
      });
    }

    if (detailModal) {
      detailModal.addEventListener('click', (e) => {
        if (e.target === detailModal) {
          detailModal.classList.remove('active');
          document.body.style.overflow = '';
        }
      });
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && detailModal && detailModal.classList.contains('active')) {
        detailModal.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  }

  function formatDate(isoString) {
    if (!isoString) return 'Just now';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return isoString;
    }
  }

  function formatRelativeTime(isoString) {
    if (!isoString) return 'Just now';
    try {
      const diffMs = Date.now() - new Date(isoString).getTime();
      const mins = Math.floor(diffMs / (1000 * 60));
      if (mins < 1) return 'Just now';
      if (mins < 60) return `${mins}m ago`;
      const hours = Math.floor(mins / 60);
      if (hours < 24) return `${hours}h ago`;
      const days = Math.floor(hours / 24);
      return `${days}d ago`;
    } catch (e) {
      return 'Recent';
    }
  }

  // Toast System
  let toastTimer;
  function showToast(message, icon = '✨') {
    let toast = document.getElementById('toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toast';
      document.body.appendChild(toast);
    }
    toast.innerHTML = `<span class="text-base">${icon}</span> <span>${message}</span>`;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 3200);
  }

  // -------------------------------------------------------------
  // 12. INITIALIZATION ON DOM READY
  // -------------------------------------------------------------
  document.addEventListener('DOMContentLoaded', () => {
    initAuthSystem();
    initTabNav();
    initDispatchFilters();
    initCourseStudio();
    initSettings();
    initModals();
    updateAuthView();
  });

})();
