/**
 * APPLE-GRADE SAAS PORTFOLIO SCRIPT
 * Curated Black & White (Charcoal Obsidian) with Light Minimal RGB Theme
 * Hardware-accelerated kinetic typography, scroll progress, and zero 3D tilt/parallax in hero
 */

(function () {
  'use strict';

  // -------------------------------------------------------------
  // 1. TOAST NOTIFICATION SYSTEM
  // -------------------------------------------------------------
  let toastTimeout;
  function showToast(message, icon = '✨') {
    let toast = document.getElementById('toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toast';
      document.body.appendChild(toast);
    }

    toast.innerHTML = `<span class="text-base">${icon}</span> <span>${message}</span>`;
    toast.classList.add('show');

    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 3200);
  }
  window.showToast = showToast;

  // -------------------------------------------------------------
  // 2. TOP SCROLL PROGRESS BAR (Light Minimal RGB Gradient)
  // -------------------------------------------------------------
  function initScrollProgressBar() {
    let bar = document.getElementById('scroll-progress-bar');
    if (!bar) {
      bar = document.createElement('div');
      bar.id = 'scroll-progress-bar';
      document.body.appendChild(bar);
    }

    function updateProgress() {
      const scrollY = window.pageYOffset || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;
      bar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
    }

    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();
  }

  // -------------------------------------------------------------
  // 3. APPLE-STYLE KINETIC TEXT ROTATOR (Hero Section)
  // -------------------------------------------------------------
  function initKineticTextRotator() {
    const rotator = document.getElementById('kinetic-text-rotator');
    if (!rotator) return;

    const phrases = [
      'fluid motion',
      'kinetic interfaces',
      'micro-interactions',
      'SaaS architectures',
      'tactile engineering'
    ];
    let currentIndex = 0;

    setInterval(() => {
      rotator.style.transition = 'opacity 0.28s ease, transform 0.28s cubic-bezier(0.16, 1, 0.3, 1)';
      rotator.style.opacity = '0';
      rotator.style.transform = 'translateY(-14px) scale(0.96)';

      setTimeout(() => {
        currentIndex = (currentIndex + 1) % phrases.length;
        rotator.textContent = phrases[currentIndex];
        rotator.style.transition = 'none';
        rotator.style.transform = 'translateY(14px) scale(0.96)';

        requestAnimationFrame(() => {
          rotator.style.transition = 'opacity 0.35s ease, transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)';
          rotator.style.opacity = '1';
          rotator.style.transform = 'translateY(0) scale(1)';
        });
      }, 300);
    }, 2600);
  }

  // -------------------------------------------------------------
  // 4. SCROLL-TRIGGERED REVEAL ANIMATIONS (IntersectionObserver)
  // -------------------------------------------------------------
  function initScrollReveals() {
    const revealElements = document.querySelectorAll('.reveal-on-scroll');
    if (!revealElements.length) return;

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            obs.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px'
      }
    );

    revealElements.forEach(el => observer.observe(el));
  }

  // -------------------------------------------------------------
  // 5. APPLE-STYLE SCROLL-SCRUBBED TEXT ANIMATION
  // -------------------------------------------------------------
  function initAppleScrollText() {
    const scrubContainers = document.querySelectorAll('.apple-scrub-text');

    scrubContainers.forEach(container => {
      if (!container.dataset.prepared) {
        const rawText = container.innerText.trim();
        const words = rawText.split(/\s+/);
        container.innerHTML = words
          .map((word, i) => {
            const isHighlight = container.dataset.highlightWords && container.dataset.highlightWords.includes(word);
            return `<span class="apple-word ${isHighlight ? 'highlight' : ''}" data-index="${i}">${word}</span> `;
          })
          .join('');
        container.dataset.prepared = 'true';
      }
    });

    function updateScrub() {
      const viewportHeight = window.innerHeight;

      scrubContainers.forEach(container => {
        const rect = container.getBoundingClientRect();
        const words = container.querySelectorAll('.apple-word');
        if (!words.length) return;

        // Active range
        const startPoint = viewportHeight * 0.85;
        const endPoint = viewportHeight * 0.2;
        const totalDistance = startPoint - endPoint;
        const currentPos = startPoint - rect.top;
        const progress = Math.max(0, Math.min(1, currentPos / totalDistance));

        const wordsToLight = Math.floor(progress * words.length);

        words.forEach((w, idx) => {
          if (idx <= wordsToLight) {
            w.classList.add('active');
          } else {
            w.classList.remove('active');
          }
        });

        // Update progress pill if present
        const pill = container.parentElement.querySelector('.scrub-progress-pill');
        if (pill) {
          pill.innerText = `${Math.round(progress * 100)}% scrubbed`;
        }
      });
    }

    window.addEventListener('scroll', updateScrub, { passive: true });
    updateScrub();
  }

  // -------------------------------------------------------------
  // 6. INTERACTIVE SAAS DASHBOARD DEMO WIDGET (Hero Section, Stable & Rock-Solid)
  // -------------------------------------------------------------
  function initSaaSDemoWidget() {
    const tabs = document.querySelectorAll('.saas-tab-btn');
    const valueDisplay = document.getElementById('saas-metric-val');
    const chartBars = document.querySelectorAll('.saas-chart-bar');
    const badgeStatus = document.getElementById('saas-badge-status');

    if (!tabs.length || !chartBars.length) return;

    const dataSets = {
      overview: {
        val: '$148,290',
        badge: '+28.4% vs last mo',
        bars: [45, 62, 55, 78, 90, 84, 98]
      },
      analytics: {
        val: '1.42M req',
        badge: '99.98% SLA',
        bars: [60, 40, 85, 92, 70, 88, 95]
      },
      retention: {
        val: '94.6%',
        badge: '<0.8% churn',
        bars: [80, 82, 85, 89, 91, 93, 96]
      }
    };

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => {
          t.classList.remove('bg-white', 'text-black', 'shadow-sm');
          t.classList.add('text-theme-muted');
        });
        tab.classList.add('bg-white', 'text-black', 'shadow-sm');
        tab.classList.remove('text-theme-muted');

        const mode = tab.getAttribute('data-mode') || 'overview';
        const data = dataSets[mode] || dataSets.overview;

        if (valueDisplay) valueDisplay.innerText = data.val;
        if (badgeStatus) badgeStatus.innerText = data.badge;

        chartBars.forEach((bar, idx) => {
          const heightPercent = data.bars[idx] || 50;
          bar.style.height = `${heightPercent}%`;
        });
      });
    });
  }

  // -------------------------------------------------------------
  // 7. PORTFOLIO FILTER & QUICK-VIEW CASE STUDY MODAL
  // -------------------------------------------------------------
  const projectDatabase = {
    'zenith-saas': {
      title: 'Zenith OS - Cloud Infrastructure Orchestrator',
      client: 'Zenith Systems • Series B Enterprise',
      role: 'Principal Product Architect & Motion Lead',
      timeline: '6 Months (2025)',
      description: 'Engineered an ultra-fast distributed cluster management interface handling over 250,000 live microservices. Designed a proprietary design system with Apple-inspired ergonomics, sub-50ms interaction latencies, and real-time telemetry visualizers.',
      metrics: [
        { label: 'Latency Reduction', val: '-64%' },
        { label: 'MAU Growth', val: '3.8x' },
        { label: 'Task Completion', val: '2.4x faster' }
      ],
      stack: ['Next.js 15', 'TypeScript', 'Web Workers', 'Tailwind', 'Canvas WebGL', 'Framer Motion'],
      highlights: [
        'Multi-region cluster telemetry with WebSockets streaming at 60 FPS.',
        'Accessible keyboard-first command palette with zero runtime dependencies.',
        'Custom WebGL topology graph capable of rendering 10,000+ nodes smoothly.'
      ]
    },
    'prism-motion': {
      title: 'Prism AI - Intelligent Workflow Canvas',
      client: 'Prism Technologies • Seed Round',
      role: 'Founding Design Engineer',
      timeline: '4 Months (2025)',
      description: 'Created a spatial infinite-canvas SaaS app empowering teams to build autonomous agent workflows visually. Integrated hardware-accelerated pan/zoom, collaborative cursors, and predictive layout nodes.',
      metrics: [
        { label: 'User Retention', val: '88%' },
        { label: 'Funding Raised', val: '$8.2M' },
        { label: 'CSAT Score', val: '4.9/5' }
      ],
      stack: ['React', 'Zustand', 'PixiJS', 'Tailwind CSS', 'FastAPI', 'WebRTC'],
      highlights: [
        'Infinite canvas coordinate matrix with butter-smooth GPU rendering.',
        'Real-time multi-user multiplayer presence with conflict-free CRDT resolution.',
        'Integrated natural language workflow generator.'
      ]
    },
    'aura-design-system': {
      title: 'Aura - Multi-Platform Design System',
      client: 'Global FinTech Corp',
      role: 'Staff Design Systems Architect',
      timeline: '8 Months (2024-2025)',
      description: 'Unified 14 web and mobile consumer banking products into a single coherent, tokenized design engine. Authored 95+ accessible headless components, an automated Figma-to-code pipeline, and strict WCAG AAA guidelines.',
      metrics: [
        { label: 'Design Velocity', val: '+45%' },
        { label: 'Codebase Deduplication', val: '-38%' },
        { label: 'WCAG AAA Compliance', val: '100%' }
      ],
      stack: ['Radix UI', 'React', 'Tailwind', 'Storybook', 'Tokens Studio', 'TypeScript'],
      highlights: [
        'Multi-theme token engine supporting high-contrast, OLED, and custom brand skins.',
        'Automated regression testing of component visual states across 4 viewport breakpoints.',
        'Interactive component playground with real-time prop tweaking and code export.'
      ]
    },
    'hyperion-lms': {
      title: 'Hyperion - Next-Gen Learning Interface',
      client: 'Self-Initiated Flagship Product',
      role: 'Creator & Lead Architect',
      timeline: 'Continuous Evolution',
      description: 'A revolutionary educational interface purpose-built for visual software engineering. Features simulated zero-latency video playback, in-situ note taking, dynamic curriculum builders, and interactive code exercises.',
      metrics: [
        { label: 'Completion Rate', val: '72%' },
        { label: 'Active Students', val: '1,240+' },
        { label: 'Avg Rating', val: '4.98/5' }
      ],
      stack: ['HTML5 Video API', 'Vanilla ES6+', 'Tailwind CSS', 'IndexedDB', 'LocalStorage'],
      highlights: [
        'Fully localized browser persistence for learner notes, progress, and lesson bookmarks.',
        'Modular course creator allowing instructors to append curricula dynamically on the fly.',
        'Keyboard-driven playback shortcuts mirroring professional video editors.'
      ]
    }
  };

  function initWorksFilter() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    if (!filterButtons.length || !projectCards.length) return;

    filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        filterButtons.forEach(b => {
          b.classList.remove('bg-white', 'text-black', 'border-white');
          b.classList.add('text-theme-muted', 'border-transparent');
        });
        btn.classList.add('bg-white', 'text-black', 'border-white');
        btn.classList.remove('text-theme-muted', 'border-transparent');

        const filter = btn.getAttribute('data-filter');

        projectCards.forEach(card => {
          const category = card.getAttribute('data-category');
          if (filter === 'all' || category === filter) {
            card.style.display = 'block';
            setTimeout(() => {
              card.style.opacity = '1';
              card.style.transform = 'translateY(0)';
            }, 30);
          } else {
            card.style.opacity = '0';
            card.style.transform = 'translateY(16px)';
            setTimeout(() => {
              card.style.display = 'none';
            }, 250);
          }
        });
      });
    });
  }

  function initCaseStudyModal() {
    const modal = document.getElementById('case-study-modal');
    const closeBtn = document.getElementById('close-case-study-modal') || document.getElementById('modal-close-btn');
    const triggerButtons = document.querySelectorAll('.open-case-study-btn, .view-case-study-btn');

    if (!modal) return;

    function openModal(projectId) {
      const data = projectDatabase[projectId] || projectDatabase['zenith-saas'];
      
      const titleEl = document.getElementById('modal-project-title');
      const clientEl = document.getElementById('modal-project-client');
      const descEl = document.getElementById('modal-project-desc');
      const metricsEl = document.getElementById('modal-project-metrics');
      const stackEl = document.getElementById('modal-project-stack');
      const highlightsEl = document.getElementById('modal-project-highlights');

      if (titleEl) titleEl.innerText = data.title;
      if (clientEl) clientEl.innerText = `${data.client} • ${data.role} (${data.timeline})`;
      if (descEl) descEl.innerText = data.description;

      if (metricsEl) {
        metricsEl.innerHTML = data.metrics.map(m => `
          <div class="p-3 rounded-2xl bg-white/[0.04] border border-white/10 text-center">
            <div class="text-2xl font-extrabold text-white font-mono">${m.val}</div>
            <div class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">${m.label}</div>
          </div>
        `).join('');
      }

      if (stackEl) {
        stackEl.innerHTML = data.stack.map(s => `
          <span class="px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-white/[0.05] border border-white/10 text-slate-300">${s}</span>
        `).join('');
      }

      if (highlightsEl) {
        highlightsEl.innerHTML = data.highlights.map(h => `
          <li class="flex items-start gap-2.5 text-sm text-slate-300">
            <span class="text-purple-400 mt-0.5 font-bold">✦</span>
            <span>${h}</span>
          </li>
        `).join('');
      }

      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    function closeModal() {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }

    triggerButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const projectId = btn.getAttribute('data-project-id');
        openModal(projectId);
      });
    });

    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('active')) {
        closeModal();
      }
    });
  }

  // -------------------------------------------------------------
  // 8. COURSE WAITLIST / ENROLLMENT MODAL
  // -------------------------------------------------------------
  function initCourseWaitlistModal() {
    const modal = document.getElementById('waitlist-modal') || document.getElementById('course-enroll-modal');
    const closeBtn = document.getElementById('close-waitlist-modal') || document.getElementById('course-modal-close');
    const triggers = document.querySelectorAll('.open-waitlist-btn, .open-course-modal-btn');
    const form = document.getElementById('waitlist-form') || document.getElementById('course-waitlist-form');

    if (!modal) return;

    function openModal() {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    function closeModal() {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }

    triggers.forEach(btn => btn.addEventListener('click', openModal));
    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    // Centralized Customer Dispatch Saver for Admin Dashboard
    function saveAdminDispatch(dispatch) {
      try {
        const key = 'admin_dispatches';
        const existing = JSON.parse(localStorage.getItem(key) || '[]');
        existing.unshift({
          id: 'DISP-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
          timestamp: new Date().toISOString(),
          status: 'Unread',
          ...dispatch
        });
        localStorage.setItem(key, JSON.stringify(existing));
      } catch (err) {
        console.warn('Dispatch save note:', err);
      }
    }

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const emailInput = form.querySelector('input[type="email"]');
        const focusSelect = form.querySelector('select');
        if (!emailInput || !emailInput.value.trim()) {
          showToast('Please provide a valid email address.', '⚠️');
          return;
        }

        const email = emailInput.value.trim();
        const focus = focusSelect ? focusSelect.value : 'Frontend Engineer transitioning to Motion/SaaS';

        saveAdminDispatch({
          type: 'Course Waitlist',
          name: email.split('@')[0],
          email: email,
          budget: 'Student ($390 VIP)',
          message: `Focus Area: ${focus}. Requested early-bird 40% discount pass & Discord key.`
        });

        const submitBtn = form.querySelector('button[type="submit"]');
        const origText = submitBtn.innerText;
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span>Adding to VIP Cohort...</span>`;

        setTimeout(() => {
          submitBtn.disabled = false;
          submitBtn.innerText = origText;
          emailInput.value = '';
          closeModal();
          showToast('You are on the VIP waitlist! Early access link sent.', '🎓');
        }, 800);
      });
    }
  }

  // -------------------------------------------------------------
  // 9. CONTACT FORM INTERACTION & BUDGET SELECTOR
  // -------------------------------------------------------------
  function initContactForm() {
    const form = document.getElementById('portfolio-contact-form') || document.getElementById('contact-form');
    const budgetChips = document.querySelectorAll('.budget-chip');
    let selectedBudget = '<$10k';

    function saveAdminDispatch(dispatch) {
      try {
        const key = 'admin_dispatches';
        const existing = JSON.parse(localStorage.getItem(key) || '[]');
        existing.unshift({
          id: 'DISP-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
          timestamp: new Date().toISOString(),
          status: 'Unread',
          ...dispatch
        });
        localStorage.setItem(key, JSON.stringify(existing));
      } catch (err) {
        console.warn('Dispatch save note:', err);
      }
    }

    budgetChips.forEach(chip => {
      chip.addEventListener('click', () => {
        budgetChips.forEach(c => {
          c.classList.remove('bg-white', 'text-black', 'border-white');
          c.classList.add('bg-white/[0.04]', 'text-slate-300', 'border-white/10');
        });
        chip.classList.add('bg-white', 'text-black', 'border-white');
        chip.classList.remove('bg-white/[0.04]', 'text-slate-300', 'border-white/10');
        selectedBudget = chip.getAttribute('data-budget');
      });
    });

    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = form.querySelector('#contact-name')?.value.trim() || form.querySelector('input[type="text"]')?.value.trim();
      const email = form.querySelector('#contact-email')?.value.trim() || form.querySelector('input[type="email"]')?.value.trim();
      const message = form.querySelector('#contact-message')?.value.trim() || form.querySelector('textarea')?.value.trim();

      if (!name || !email || !message) {
        showToast('Please fill out all required fields.', '⚠️');
        return;
      }

      saveAdminDispatch({
        type: 'Project Inquiry',
        name: name,
        email: email,
        budget: selectedBudget,
        message: message
      });

      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-black inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
        </svg>
        <span>Securing connection...</span>
      `;

      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
        form.reset();
        showToast(`Inquiry dispatched successfully! Budget bracket: ${selectedBudget}. Expect a response within 12 hours.`, '🚀');
      }, 950);
    });
  }

  // -------------------------------------------------------------
  // 10. DISCOVERY CALL CALENDAR SCHEDULER MODAL
  // -------------------------------------------------------------
  function initScheduleModal() {
    const modal = document.getElementById('schedule-modal') || document.getElementById('schedule-meeting-modal');
    const closeBtn = document.getElementById('close-schedule-modal') || document.getElementById('schedule-modal-close');
    const openButtons = document.querySelectorAll('.open-schedule-btn, .open-meeting-modal-btn');
    const timeSlots = document.querySelectorAll('.schedule-slot-btn, .time-slot-btn');
    const confirmBtn = document.getElementById('confirm-schedule-btn') || document.getElementById('schedule-confirm-btn');

    let selectedSlot = null;

    function saveAdminDispatch(dispatch) {
      try {
        const key = 'admin_dispatches';
        const existing = JSON.parse(localStorage.getItem(key) || '[]');
        existing.unshift({
          id: 'DISP-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
          timestamp: new Date().toISOString(),
          status: 'Confirmed',
          ...dispatch
        });
        localStorage.setItem(key, JSON.stringify(existing));
      } catch (err) {
        console.warn('Dispatch save note:', err);
      }
    }

    if (!modal) return;

    function openScheduleModal() {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    function closeScheduleModal() {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }

    openButtons.forEach(btn => btn.addEventListener('click', openScheduleModal));
    if (closeBtn) closeBtn.addEventListener('click', closeScheduleModal);

    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeScheduleModal();
    });

    timeSlots.forEach(slot => {
      slot.addEventListener('click', () => {
        timeSlots.forEach(s => {
          s.classList.remove('bg-white', 'text-black', 'border-white');
          s.classList.add('bg-white/[0.04]', 'text-slate-300', 'border-white/10');
        });
        slot.classList.add('bg-white', 'text-black', 'border-white');
        slot.classList.remove('bg-white/[0.04]', 'text-slate-300', 'border-white/10');
        selectedSlot = slot.getAttribute('data-slot') || slot.innerText.trim();
      });
    });

    if (confirmBtn) {
      confirmBtn.addEventListener('click', () => {
        if (!selectedSlot) {
          showToast('Please pick an available time slot first.', '⏱️');
          return;
        }

        saveAdminDispatch({
          type: '1:1 Discovery Call',
          name: 'Consultation Booker',
          email: 'client-pending-confirmation@meeting.app',
          budget: 'Advisory Call',
          message: `15-Min Strategy Consultation reserved for: ${selectedSlot}. Google Meet room generated.`
        });

        closeScheduleModal();
        showToast(`Discovery session confirmed for ${selectedSlot}! Calendar invite dispatched.`, '📅');
      });
    }
  }

  // -------------------------------------------------------------
  // 11. LIVE FOOTER CLOCK
  // -------------------------------------------------------------
  function initLiveClock() {
    const clockEl = document.getElementById('live-clock');
    if (!clockEl) return;

    function update() {
      const now = new Date();
      clockEl.innerText = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }
    update();
    setInterval(update, 1000);
  }

  // -------------------------------------------------------------
  // 12. MOBILE NAVIGATION DRAWER
  // -------------------------------------------------------------
  function initMobileMenu() {
    const menuBtn = document.getElementById('mobile-menu-btn');
    const mobileDrawer = document.getElementById('mobile-drawer');
    const mobileLinks = document.querySelectorAll('.mobile-nav-link');

    if (!menuBtn || !mobileDrawer) return;

    menuBtn.addEventListener('click', () => {
      const isOpen = mobileDrawer.classList.contains('active');
      if (isOpen) {
        mobileDrawer.classList.remove('active');
        document.body.style.overflow = '';
      } else {
        mobileDrawer.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    });

    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileDrawer.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }

  // -------------------------------------------------------------
  // 13. INITIALIZATION ON DOM READY
  // -------------------------------------------------------------
  document.addEventListener('DOMContentLoaded', () => {
    initScrollProgressBar();
    initKineticTextRotator();
    initScrollReveals();
    initAppleScrollText();
    initSaaSDemoWidget();
    initWorksFilter();
    initCaseStudyModal();
    initCourseWaitlistModal();
    initContactForm();
    initScheduleModal();
    initLiveClock();
    initMobileMenu();

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#' || targetId === '') return;
        const target = document.querySelector(targetId);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });
  });

})();
