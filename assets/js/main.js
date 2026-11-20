/**
 * FT JITHIN DESIGNZ — FLAGSHIP PORTFOLIO ENGINE
 * Brand: FT JITHIN DESIGNZ | Creative: Jithin
 * Identity: Motion Designer • Graphic Designer • Video Editor • Visual Storyteller • Creative Digital Artist
 * Tagline: "Turning Ideas Into Visual Experiences."
 */

(function () {
  'use strict';

  // -------------------------------------------------------------
  // 1. TOAST NOTIFICATION SYSTEM
  // -------------------------------------------------------------
  let toastTimeout;
  function showToast(message, icon = '✦') {
    let toast = document.getElementById('toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toast';
      document.body.appendChild(toast);
    }

    toast.innerHTML = `<span class="text-base text-purple-400">${icon}</span> <span>${message}</span>`;
    toast.classList.add('show');

    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 3200);
  }
  window.showToast = showToast;

  // -------------------------------------------------------------
  // 2. TOP SCROLL PROGRESS BAR (Minimal Light RGB Spectrum)
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
      'Visual Experiences',
      'Motion Graphics',
      'Visual Storytelling',
      'Graphic Design',
      'Cinematic Edits',
      'Poster Artwork'
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
    }, 2800);
  }

  // -------------------------------------------------------------
  // 4. SCROLL-TRIGGERED REVEAL ANIMATIONS
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
      { rootMargin: '0px 0px -60px 0px', threshold: 0.1 }
    );

    revealElements.forEach(el => observer.observe(el));
  }

  // -------------------------------------------------------------
  // 5. APPLE-STYLE SCROLL-SCRUBBED TYPOGRAPHY
  // -------------------------------------------------------------
  function initAppleScrollScrub() {
    const scrubContainers = document.querySelectorAll('.apple-scrub-text');
    if (!scrubContainers.length) return;

    scrubContainers.forEach(container => {
      const originalText = container.textContent.trim();
      const highlightWords = (container.getAttribute('data-highlight-words') || '').split(' ').map(w => w.trim().toLowerCase());
      const words = originalText.split(/\s+/);

      container.innerHTML = '';
      const wordSpans = [];

      words.forEach((word) => {
        const span = document.createElement('span');
        span.className = 'scrub-word';
        span.textContent = word + ' ';

        const cleanWord = word.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
        if (highlightWords.includes(cleanWord)) {
          span.classList.add('accent-scrub-word');
        }

        container.appendChild(span);
        wordSpans.push(span);
      });

      function onScroll() {
        const rect = container.getBoundingClientRect();
        const windowHeight = window.innerHeight;

        const startY = windowHeight * 0.85;
        const endY = windowHeight * 0.20;

        let rawProgress = (startY - rect.top) / (startY - endY);
        let progress = Math.max(0, Math.min(1, rawProgress));

        const wordsToLight = Math.floor(progress * wordSpans.length);

        wordSpans.forEach((span, idx) => {
          if (idx <= wordsToLight) {
            span.classList.add('active');
          } else {
            span.classList.remove('active');
          }
        });
      }

      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    });
  }

  // -------------------------------------------------------------
  // 6. DYNAMIC PROFILE & BRANDING LOADER
  // -------------------------------------------------------------
  async function loadSiteProfile() {
    if (typeof window.fetchSiteProfile !== 'function') return;
    try {
      const profile = await window.fetchSiteProfile();

      // Brand Title Elements
      document.querySelectorAll('.brand-name-display').forEach(el => {
        el.textContent = profile.brand_name || 'FT JITHIN DESIGNZ';
      });

      document.querySelectorAll('.designer-name-display').forEach(el => {
        el.textContent = profile.name || 'Jithin';
      });

      document.querySelectorAll('.tagline-display').forEach(el => {
        el.textContent = profile.tagline || 'Turning Ideas Into Visual Experiences.';
      });

      // Bio text if element exists
      const bioEl = document.getElementById('about-bio-display');
      if (bioEl && profile.full_bio) {
        bioEl.textContent = profile.full_bio;
      }

      // Contact info elements
      const emailEl = document.getElementById('contact-email-display');
      if (emailEl && profile.email) {
        emailEl.textContent = profile.email;
        emailEl.href = `mailto:${profile.email}`;
      }

      const copyEmailBtn = document.querySelector('.copy-email-btn');
      if (copyEmailBtn && profile.email) {
        copyEmailBtn.setAttribute('data-email', profile.email);
      }

      // Social Links
      if (profile.social_links) {
        const igLink = document.getElementById('social-link-instagram');
        if (igLink && profile.social_links.instagram) igLink.href = profile.social_links.instagram;

        const ytLink = document.getElementById('social-link-youtube');
        if (ytLink && profile.social_links.youtube) ytLink.href = profile.social_links.youtube;

        const bhLink = document.getElementById('social-link-behance');
        if (bhLink && profile.social_links.behance) bhLink.href = profile.social_links.behance;

        const inLink = document.getElementById('social-link-linkedin');
        if (inLink && profile.social_links.linkedin) inLink.href = profile.social_links.linkedin;
      }
    } catch (err) {
      console.warn('Profile loader note:', err);
    }
  }

  // -------------------------------------------------------------
  // 7. DYNAMIC CREATIVE SERVICES LOADER
  // -------------------------------------------------------------
  async function loadServices() {
    const container = document.getElementById('services-grid-container');
    if (!container || typeof window.fetchServices !== 'function') return;

    try {
      const services = await window.fetchServices();
      const activeServices = services.filter(s => s.is_active !== false);

      if (!activeServices.length) {
        container.innerHTML = `
          <div class="col-span-full text-center py-12 glass-panel rounded-3xl p-8 border border-theme">
            <p class="text-sm text-theme-secondary font-medium">Services are currently being updated in the studio.</p>
          </div>
        `;
        return;
      }

      container.innerHTML = activeServices.map((service, index) => {
        const toolsList = Array.isArray(service.tools) ? service.tools : [];
        const toolsHtml = toolsList.map(t => `
          <span class="px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold bg-white/[0.04] text-slate-300 border border-white/10">
            ${escapeHtml(t)}
          </span>
        `).join('');

        return `
          <div class="glass-panel spotlight-card p-6 sm:p-8 rounded-3xl border border-theme flex flex-col justify-between space-y-5 transition-all duration-300 hover:border-purple-400/40 group">
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-2xl">${service.icon || '✦'}</span>
                <span class="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider">0${index + 1} / ${escapeHtml(service.category || 'Service')}</span>
              </div>
              <h3 class="text-xl font-bold text-white tracking-tight group-hover:text-purple-300 transition-colors">
                ${escapeHtml(service.title)}
              </h3>
              <p class="text-sm text-theme-secondary leading-relaxed font-medium">
                ${escapeHtml(service.description)}
              </p>
            </div>

            <div class="space-y-4 pt-3 border-t border-white/5">
              <div class="flex flex-wrap gap-1.5">
                ${toolsHtml}
              </div>
              <a href="#contact" class="inline-flex items-center gap-1.5 text-xs font-bold text-sky-400 hover:text-white transition-colors">
                <span>Inquire About ${escapeHtml(service.title)}</span>
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
              </a>
            </div>
          </div>
        `;
      }).join('');
    } catch (err) {
      console.warn('Services render note:', err);
    }
  }

  // -------------------------------------------------------------
  // 8. DYNAMIC PORTFOLIO PROJECTS LOADER & EMPTY STATE
  // -------------------------------------------------------------
  let currentProjects = [];
  let activeFilter = 'all';

  async function loadPortfolioProjects() {
    const container = document.getElementById('portfolio-projects-grid');
    if (!container || typeof window.fetchProjects !== 'function') return;

    try {
      const allProjects = await window.fetchProjects();
      currentProjects = allProjects.filter(p => p.is_published !== false);

      renderProjects();
      initFilterControls();
    } catch (err) {
      console.warn('Projects render note:', err);
    }
  }

  function renderProjects() {
    const container = document.getElementById('portfolio-projects-grid');
    if (!container) return;

    let filtered = currentProjects;
    if (activeFilter !== 'all') {
      filtered = currentProjects.filter(p => (p.category || '').toLowerCase() === activeFilter.toLowerCase());
    }

    // EMPTY STATE: If no projects yet, show clean creative empty state!
    if (!filtered.length) {
      container.innerHTML = `
        <div class="col-span-full glass-panel rounded-3xl p-10 sm:p-14 border border-theme text-center space-y-5 max-w-2xl mx-auto my-6">
          <div class="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-400/20 via-purple-500/20 to-pink-500/20 border border-white/10 flex items-center justify-center mx-auto text-3xl">
            🎬
          </div>
          <div class="space-y-2">
            <h3 class="text-xl sm:text-2xl font-bold text-white tracking-tight">Creative Vault Updating</h3>
            <p class="text-sm text-theme-secondary leading-relaxed font-medium">
              Projects, motion showreels, and graphic designs are currently being curated into this portfolio gallery. 
              You can connect with Jithin directly to request private work reels or commission custom creative projects.
            </p>
          </div>
          <div class="pt-2 flex flex-wrap items-center justify-center gap-3">
            <a href="#contact" class="btn-primary text-xs py-2.5 px-5 font-bold">
              <span>Request Work Reel / Inquire</span>
            </a>
            <a href="admin.html" class="btn-secondary text-xs py-2.5 px-4 font-bold inline-flex items-center gap-1.5 text-slate-400 hover:text-white">
              <span>Admin: Add Projects</span>
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
            </a>
          </div>
        </div>
      `;
      return;
    }

    // Render Real Projects
    container.innerHTML = filtered.map(p => {
      const tools = Array.isArray(p.tools) ? p.tools : [];
      const toolsPills = tools.map(t => `
        <span class="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-white/10 text-slate-300 border border-white/10">
          ${escapeHtml(t)}
        </span>
      `).join('');

      const mediaPreview = p.thumbnail_url 
        ? `<img src="${escapeHtml(p.thumbnail_url)}" alt="${escapeHtml(p.title)}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />`
        : `<div class="w-full h-full bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex flex-col items-center justify-center p-6 text-center">
            <span class="text-3xl mb-2">✦</span>
            <span class="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest">${escapeHtml(p.category || 'Creative Project')}</span>
           </div>`;

      return `
        <div class="project-card glass-panel spotlight-card rounded-3xl overflow-hidden group transition-all duration-300 border border-theme flex flex-col justify-between" data-category="${escapeHtml((p.category || '').toLowerCase())}">
          <div class="relative h-60 sm:h-64 overflow-hidden bg-black/60 border-b border-theme">
            ${mediaPreview}
            <div class="absolute top-4 left-4 z-10">
              <span class="px-3 py-1 rounded-full text-xs font-mono font-bold bg-black/70 backdrop-blur-md text-white border border-white/20">
                ${escapeHtml(p.category || 'Motion Design')}
              </span>
            </div>
          </div>

          <div class="p-6 sm:p-7 space-y-4 flex-1 flex flex-col justify-between">
            <div class="space-y-2">
              <h3 class="text-xl font-bold text-white group-hover:text-purple-300 transition-colors">
                ${escapeHtml(p.title)}
              </h3>
              <p class="text-sm text-theme-secondary line-clamp-3 leading-relaxed font-medium">
                ${escapeHtml(p.description || '')}
              </p>
            </div>

            <div class="space-y-4 pt-3 border-t border-white/5">
              <div class="flex flex-wrap gap-1.5">
                ${toolsPills}
              </div>

              <div class="flex items-center justify-between pt-1">
                <button class="open-project-modal-btn text-xs font-semibold px-4 py-2 rounded-full bg-sky-500/10 hover:bg-sky-500 text-sky-400 hover:text-white border border-sky-400/30 transition-all flex items-center gap-1.5" data-project-id="${escapeHtml(p.id)}">
                  <span>View Details</span>
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                </button>

                ${p.project_link ? `
                  <a href="${escapeHtml(p.project_link)}" target="_blank" rel="noopener noreferrer" class="text-xs font-mono font-bold text-slate-400 hover:text-white transition-colors flex items-center gap-1">
                    <span>Live Media</span>
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                  </a>
                ` : ''}
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Attach click handlers to project cards
    container.querySelectorAll('.open-project-modal-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-project-id');
        openProjectDetailModal(id);
      });
    });
  }

  function initFilterControls() {
    const filterButtons = document.querySelectorAll('.portfolio-filter-btn');
    if (!filterButtons.length) return;

    filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        filterButtons.forEach(b => {
          b.classList.remove('bg-white', 'text-black', 'border-white', 'shadow-sm');
          b.classList.add('text-theme-muted', 'border-transparent');
        });
        btn.classList.add('bg-white', 'text-black', 'border-white', 'shadow-sm');
        btn.classList.remove('text-theme-muted', 'border-transparent');

        activeFilter = btn.getAttribute('data-filter') || 'all';
        renderProjects();
      });
    });
  }

  function openProjectDetailModal(projectId) {
    const project = currentProjects.find(p => p.id === projectId);
    if (!project) return;

    const modal = document.getElementById('project-detail-modal');
    if (!modal) return;

    const titleEl = document.getElementById('modal-detail-title');
    const categoryEl = document.getElementById('modal-detail-category');
    const descEl = document.getElementById('modal-detail-desc');
    const toolsContainer = document.getElementById('modal-detail-tools');
    const mediaContainer = document.getElementById('modal-detail-media');
    const linkBtn = document.getElementById('modal-detail-link');

    if (titleEl) titleEl.textContent = project.title;
    if (categoryEl) categoryEl.textContent = project.category || 'Creative Project';
    if (descEl) descEl.textContent = project.description || '';

    if (toolsContainer) {
      const tools = Array.isArray(project.tools) ? project.tools : [];
      toolsContainer.innerHTML = tools.map(t => `
        <span class="px-3 py-1 rounded-full text-xs font-mono font-bold bg-white/10 text-white border border-white/20">
          ${escapeHtml(t)}
        </span>
      `).join('');
    }

    if (mediaContainer) {
      if (project.media_url) {
        if (project.media_type === 'video' || project.media_url.includes('youtube') || project.media_url.includes('vimeo') || project.media_url.endsWith('.mp4')) {
          mediaContainer.innerHTML = `
            <div class="aspect-video w-full rounded-2xl overflow-hidden bg-black border border-white/10">
              <iframe src="${escapeHtml(project.media_url)}" class="w-full h-full" frameborder="0" allowfullscreen></iframe>
            </div>
          `;
        } else {
          mediaContainer.innerHTML = `
            <img src="${escapeHtml(project.media_url)}" alt="${escapeHtml(project.title)}" class="w-full rounded-2xl max-h-[450px] object-contain border border-white/10 bg-black/50" />
          `;
        }
      } else if (project.thumbnail_url) {
        mediaContainer.innerHTML = `
          <img src="${escapeHtml(project.thumbnail_url)}" alt="${escapeHtml(project.title)}" class="w-full rounded-2xl max-h-[450px] object-cover border border-white/10" />
        `;
      } else {
        mediaContainer.innerHTML = '';
      }
    }

    if (linkBtn) {
      if (project.project_link) {
        linkBtn.href = project.project_link;
        linkBtn.classList.remove('hidden');
      } else {
        linkBtn.classList.add('hidden');
      }
    }

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  // -------------------------------------------------------------
  // 9. CONTACT FORM DISPATCH & MODALS
  // -------------------------------------------------------------
  function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    let selectedBudget = '$1,500 - $3,500';

    const budgetPills = form.querySelectorAll('.budget-pill');
    budgetPills.forEach(pill => {
      pill.addEventListener('click', () => {
        budgetPills.forEach(p => {
          p.classList.remove('border-purple-400', 'bg-purple-500/20', 'text-purple-300');
          p.classList.add('border-theme', 'bg-theme-card', 'text-theme-secondary');
        });
        pill.classList.add('border-purple-400', 'bg-purple-500/20', 'text-purple-300');
        pill.classList.remove('border-theme', 'bg-theme-card', 'text-theme-secondary');
        selectedBudget = pill.textContent.trim();
      });
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const nameInput = document.getElementById('contact-name');
      const emailInput = document.getElementById('contact-email');
      const messageInput = document.getElementById('contact-message');

      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn ? submitBtn.innerHTML : 'Send Inquiry';

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span>Dispatching...</span>`;
      }

      const dispatch = {
        id: 'disp-' + Date.now(),
        type: 'Project Inquiry',
        name: nameInput ? nameInput.value.trim() : 'Anonymous',
        email: emailInput ? emailInput.value.trim() : 'no-email',
        budget: selectedBudget,
        message: messageInput ? messageInput.value.trim() : '',
        status: 'Unread',
        timestamp: new Date().toISOString()
      };

      try {
        if (typeof window.syncDispatchToSupabase === 'function') {
          await window.syncDispatchToSupabase(dispatch);
        } else {
          const local = JSON.parse(localStorage.getItem('ft_jithin_dispatches') || '[]');
          local.unshift(dispatch);
          localStorage.setItem('ft_jithin_dispatches', JSON.stringify(local));
        }

        showToast('Inquiry dispatched successfully! Jithin will respond promptly.', '✦');
        form.reset();
      } catch (err) {
        showToast('Inquiry recorded locally. Thank you!', '✓');
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
        }
      }
    });

    // Copy Email handler
    const copyBtns = document.querySelectorAll('.copy-email-btn');
    copyBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const email = btn.getAttribute('data-email') || 'contact@ftjithindesignz.com';
        navigator.clipboard.writeText(email).then(() => {
          showToast(`Copied ${email} to clipboard!`, '📋');
        }).catch(() => {
          showToast(`Email: ${email}`, '📧');
        });
      });
    });
  }

  // -------------------------------------------------------------
  // 10. MODALS HANDLING (Project, Discovery Call, Mobile Menu)
  // -------------------------------------------------------------
  function initModals() {
    // Project detail modal
    const projectModal = document.getElementById('project-detail-modal');
    const closeProjectModalBtn = document.getElementById('close-project-modal-btn');
    if (closeProjectModalBtn && projectModal) {
      closeProjectModalBtn.addEventListener('click', () => {
        projectModal.classList.remove('active');
        document.body.style.overflow = '';
      });
    }

    // Discovery call modal
    const scheduleModal = document.getElementById('schedule-meeting-modal');
    const openScheduleBtns = document.querySelectorAll('.open-schedule-btn');
    const closeScheduleBtn = document.getElementById('schedule-modal-close');
    const confirmBookingBtn = document.getElementById('confirm-booking-btn');

    openScheduleBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        if (scheduleModal) {
          scheduleModal.classList.add('active');
          document.body.style.overflow = 'hidden';
        }
      });
    });

    if (closeScheduleBtn && scheduleModal) {
      closeScheduleBtn.addEventListener('click', () => {
        scheduleModal.classList.remove('active');
        document.body.style.overflow = '';
      });
    }

    if (confirmBookingBtn) {
      confirmBookingBtn.addEventListener('click', async () => {
        const activeSlot = document.querySelector('.time-slot-btn.selected');
        const slotText = activeSlot ? activeSlot.textContent.trim() : 'Project Consultation Call';

        const dispatch = {
          id: 'call-' + Date.now(),
          type: 'Consultation Booking',
          name: 'Consultation Request',
          email: 'Pending Confirmation',
          budget: 'Briefing Session',
          message: `Scheduled Slot: ${slotText}`,
          status: 'Unread',
          timestamp: new Date().toISOString()
        };

        if (typeof window.syncDispatchToSupabase === 'function') {
          await window.syncDispatchToSupabase(dispatch);
        }

        if (scheduleModal) scheduleModal.classList.remove('active');
        document.body.style.overflow = '';
        showToast(`Consultation slot requested: ${slotText}`, '📅');
      });
    }

    // Time slot selection
    const timeSlotBtns = document.querySelectorAll('.time-slot-btn');
    timeSlotBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        timeSlotBtns.forEach(b => {
          b.classList.remove('selected', 'border-purple-400', 'bg-purple-500/20', 'text-white');
          b.classList.add('border-theme', 'bg-theme-card', 'text-theme-secondary');
        });
        btn.classList.add('selected', 'border-purple-400', 'bg-purple-500/20', 'text-white');
        btn.classList.remove('border-theme', 'bg-theme-card', 'text-theme-secondary');
      });
    });

    // Close on overlay click
    document.querySelectorAll('.modal-overlay').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.remove('active');
          document.body.style.overflow = '';
        }
      });
    });

    // Mobile Hamburger
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileDrawer = document.getElementById('mobile-drawer');
    const mobileLinks = document.querySelectorAll('.mobile-nav-link');

    if (mobileMenuBtn && mobileDrawer) {
      mobileMenuBtn.addEventListener('click', () => {
        mobileDrawer.classList.toggle('active');
      });

      mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
          mobileDrawer.classList.remove('active');
        });
      });
    }

    // Live Clock in footer
    const clock = document.getElementById('live-clock');
    if (clock) {
      const updateClock = () => {
        const now = new Date();
        clock.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      };
      updateClock();
      setInterval(updateClock, 1000);
    }
  }

  // -------------------------------------------------------------
  // UTILITY HELPERS
  // -------------------------------------------------------------
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
  // INITIALIZATION ON DOM READY
  // -------------------------------------------------------------
  function initAll() {
    initScrollProgressBar();
    initKineticTextRotator();
    initScrollReveals();
    initAppleScrollScrub();
    loadSiteProfile();
    loadServices();
    loadPortfolioProjects();
    initContactForm();
    initModals();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }

})();
