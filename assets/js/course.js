/**
 * FT JITHIN DESIGNZ — CREATIVE MOTION & VISUAL STORYTELLING STUDIO
 * Features:
 * - Dynamic Curriculum (Modules & Lessons)
 * - Paywall Lock Mechanism (Free Preview Lesson vs Locked Lessons)
 * - Multi-Channel Payment Settlement Modal (Card, UPI / QR, PayPal, Passkey)
 * - Supabase + LocalStorage receipt dispatch & unlock synchronization
 * - Video playback simulation, speed controls, scrubber, progress calculation
 * - Test mode toggle for instant lock/unlock verification
 */

(function () {
  'use strict';

  const STORAGE_LESSONS_KEY = 'ft-jithin-course-curriculum';
  const STORAGE_UNLOCKED_KEY = 'ft_jithin_course_unlocked';
  const MASTER_STUDENT_PASSKEY = 'JITHIN2026';

  const defaultModules = [
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
          videoTitle: 'Deconstructing Dynamic Text Reveals & Animation Timing',
          description: 'Explore the creative principles behind kinetic text reveals. Learn how letter tracking, blur-to-sharp transitions, and easing curves create impact without sacrificing visual clarity.',
          resources: [
            { name: 'Kinetic Typography Starter Pack (After Effects)', size: '12.4 MB', url: '#' },
            { name: 'Storyboard Grid Template (.pdf)', size: '1.2 MB', url: '#' }
          ]
        },
        {
          id: 'les-1-2',
          title: '1.2 Speed Graph Mastery in Adobe After Effects',
          duration: '18:45',
          completed: false,
          isFreePreview: false,
          videoTitle: 'Crafting Natural Acceleration & Deceleration Physics',
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
          videoTitle: 'Transforming Vector Identity into Fluid Kinetic Reveals',
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
          videoTitle: 'Pacing the Narrative: The Invisible Cut Technique',
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
          videoTitle: 'Syncing Visual Motion with Sonic Transients',
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
          videoTitle: 'Poster Design Hierarchy in Adobe Photoshop',
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
          videoTitle: 'Crafting Cinematic Color Palettes and Contrast Curves',
          description: 'Building custom film looks using primary wheels, parallel nodes, hue vs. sat curves, and highlight rolloff in DaVinci Resolve.',
          resources: [
            { name: 'Cinematic Studio LUTs Pack (.cube)', size: '8.5 MB', url: '#' }
          ]
        }
      ]
    }
  ];

  let modules = [];
  let currentLesson = null;
  let isCourseUnlocked = false;
  let isPlaying = false;
  let playProgress = 0.15;
  let playInterval = null;
  let activePayMethod = 'card';

  // -------------------------------------------------------------
  // INITIALIZATION
  // -------------------------------------------------------------
  function initCoursePlatform() {
    loadUnlockState();
    loadModules();
    loadCloudModules();
    renderAccessStatus();
    selectDefaultLesson();
    initVideoPlayer();
    initPaymentModal();
    initTestAccessToggle();
    updateProgressKPIs();

    // Check URL parameters for direct checkout modal open
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('checkout') === 'open' && !isCourseUnlocked) {
      openPaymentModal();
    }
    const reqLesson = urlParams.get('lesson');
    if (reqLesson) {
      selectLesson(reqLesson);
    }
  }

  function loadUnlockState() {
    isCourseUnlocked = localStorage.getItem(STORAGE_UNLOCKED_KEY) === 'true';
  }

  function saveUnlockState(unlocked) {
    isCourseUnlocked = !!unlocked;
    localStorage.setItem(STORAGE_UNLOCKED_KEY, isCourseUnlocked ? 'true' : 'false');
  }

  function loadModules() {
    const saved = localStorage.getItem(STORAGE_LESSONS_KEY);
    if (saved) {
      try {
        modules = JSON.parse(saved);
      } catch (e) {
        modules = defaultModules;
      }
    } else {
      modules = defaultModules;
      saveModules();
    }
  }

  async function loadCloudModules() {
    if (typeof window.fetchCoursesFromSupabase === 'function') {
      try {
        const cloud = await window.fetchCoursesFromSupabase();
        if (cloud && Array.isArray(cloud) && cloud.length > 0) {
          modules = cloud;
          localStorage.setItem(STORAGE_LESSONS_KEY, JSON.stringify(modules));
          renderCurriculum();
          updateProgressKPIs();
        }
      } catch (e) {}
    }
  }

  function saveModules() {
    localStorage.setItem(STORAGE_LESSONS_KEY, JSON.stringify(modules));
    if (typeof window.saveCourseToSupabase === 'function') {
      window.saveCourseToSupabase(modules).catch(e => console.info('Course cloud sync note:', e));
    }
  }

  // -------------------------------------------------------------
  // ACCESS STATE & UI STATUS
  // -------------------------------------------------------------
  function renderAccessStatus() {
    const badge = document.getElementById('course-access-status-badge');
    const headerUnlockBtn = document.getElementById('header-unlock-btn');
    const unsettledBanner = document.getElementById('unsettled-paywall-banner');
    const settledBanner = document.getElementById('settled-welcome-banner');
    const toggleBtn = document.getElementById('test-access-toggle-btn');

    if (isCourseUnlocked) {
      if (badge) {
        badge.className = 'px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5';
        badge.innerHTML = `<span class="w-2 h-2 rounded-full bg-emerald-400"></span><span>Full Access Active ✦</span>`;
      }
      if (headerUnlockBtn) headerUnlockBtn.classList.add('hidden');
      if (unsettledBanner) unsettledBanner.classList.add('hidden');
      if (settledBanner) settledBanner.classList.remove('hidden');
      if (toggleBtn) toggleBtn.innerHTML = '<span>🔓 Access: Active</span>';
    } else {
      if (badge) {
        badge.className = 'px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1.5';
        badge.innerHTML = `<span class="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span><span>Free Preview (Lesson 1.1)</span>`;
      }
      if (headerUnlockBtn) headerUnlockBtn.classList.remove('hidden');
      if (unsettledBanner) unsettledBanner.classList.remove('hidden');
      if (settledBanner) settledBanner.classList.add('hidden');
      if (toggleBtn) toggleBtn.innerHTML = '<span>🔒 Access: Locked</span>';
    }

    renderCurriculum();
  }

  function isLessonAccessible(les) {
    if (isCourseUnlocked) return true;
    return !!les.isFreePreview;
  }

  // -------------------------------------------------------------
  // CURRICULUM RENDERING
  // -------------------------------------------------------------
  function renderCurriculum() {
    const container = document.getElementById('curriculum-modules-list');
    if (!container) return;

    container.innerHTML = modules.map((mod) => {
      const lessonsHtml = mod.lessons.map(les => {
        const isActive = currentLesson && currentLesson.id === les.id;
        const isCompleted = les.completed;
        const accessible = isLessonAccessible(les);

        return `
          <div class="lesson-item p-3 rounded-2xl flex items-center justify-between gap-3 cursor-pointer transition-all ${
            isActive 
              ? 'bg-purple-500/20 border border-purple-400 text-white' 
              : 'bg-white/[0.02] border border-white/5 hover:border-white/15 text-slate-300'
          } ${!accessible ? 'opacity-75 hover:opacity-100' : ''}" data-lesson-id="${les.id}">
            <div class="flex items-center gap-3">
              <span class="w-2.5 h-2.5 rounded-full ${accessible ? (isCompleted ? 'bg-emerald-400' : 'bg-purple-400') : 'bg-slate-600'} shrink-0"></span>
              <div class="space-y-0.5">
                <div class="text-xs font-bold leading-tight line-clamp-1 flex items-center gap-1.5">
                  <span>${escapeHtml(les.title)}</span>
                  ${les.isFreePreview ? `<span class="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Free</span>` : ''}
                </div>
                <div class="text-[10px] font-mono text-slate-400 font-semibold">${les.duration} • ${accessible ? 'Unlocked' : 'Locked 🔒'}</div>
              </div>
            </div>
            <span class="text-xs font-mono font-bold ${accessible ? 'text-purple-300' : 'text-slate-500'}">
              ${accessible ? (isCompleted ? '✓' : '▶') : '🔒'}
            </span>
          </div>
        `;
      }).join('');

      return `
        <div class="space-y-2">
          <div class="text-xs font-mono font-bold text-purple-300 uppercase tracking-wider">${escapeHtml(mod.title)}</div>
          <div class="space-y-1.5">
            ${lessonsHtml}
          </div>
        </div>
      `;
    }).join('');

    // Attach click listeners
    container.querySelectorAll('.lesson-item').forEach(el => {
      el.addEventListener('click', () => {
        const id = el.getAttribute('data-lesson-id');
        selectLesson(id);
      });
    });
  }

  function selectDefaultLesson() {
    if (modules.length && modules[0].lessons.length) {
      selectLesson(modules[0].lessons[0].id);
    }
  }

  function selectLesson(lessonId) {
    for (const mod of modules) {
      const found = mod.lessons.find(l => l.id === lessonId);
      if (found) {
        currentLesson = found;
        break;
      }
    }

    if (!currentLesson) return;

    const accessible = isLessonAccessible(currentLesson);

    // Update UI Elements
    const activeTitle = document.getElementById('active-lesson-title');
    const headerTitle = document.getElementById('lesson-header-title');
    const lessonDesc = document.getElementById('lesson-description');
    const lessonBadge = document.getElementById('active-lesson-badge');
    const completeBtn = document.getElementById('mark-lesson-complete-btn');
    const accessPill = document.getElementById('lesson-access-pill');
    const lockedOverlay = document.getElementById('video-locked-overlay');
    const overlayPlay = document.getElementById('video-overlay-play');
    const videoControls = document.getElementById('video-controls-bar');
    const downloadsList = document.getElementById('lesson-downloads-list');

    if (activeTitle) activeTitle.textContent = currentLesson.title;
    if (headerTitle) headerTitle.textContent = currentLesson.title;
    if (lessonDesc) lessonDesc.textContent = currentLesson.description || 'Core creative technique walkthrough.';
    if (lessonBadge) lessonBadge.textContent = `Duration: ${currentLesson.duration || '15:00'} • HD 1080p`;

    if (accessPill) {
      if (accessible) {
        accessPill.className = 'px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300';
        accessPill.textContent = currentLesson.isFreePreview ? 'Free Preview Lesson' : 'Unlocked Video';
      } else {
        accessPill.className = 'px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300';
        accessPill.textContent = '🔒 Locked (Enrollment Required)';
      }
    }

    if (completeBtn) {
      completeBtn.innerHTML = `
        <span class="w-2 h-2 rounded-full ${currentLesson.completed ? 'bg-emerald-400' : 'bg-slate-500'}"></span>
        <span>${currentLesson.completed ? 'Completed ✓' : 'Mark as Completed'}</span>
      `;
    }

    // Video Player & Controls Display based on accessibility
    const activeVideoEmbed = document.getElementById('active-video-embed');

    if (accessible) {
      if (lockedOverlay) lockedOverlay.classList.add('hidden');

      if (currentLesson.videoUrl && currentLesson.videoUrl.trim()) {
        const url = currentLesson.videoUrl.trim();
        let embedUrl = url;
        const isMp4 = url.toLowerCase().endsWith('.mp4') || url.startsWith('data:video/');

        if (url.includes('youtube.com/watch?v=')) {
          const vid = url.split('v=')[1]?.split('&')[0];
          embedUrl = vid ? `https://www.youtube.com/embed/${vid}?autoplay=1&enablejsapi=1` : url;
        } else if (url.includes('youtu.be/')) {
          const vid = url.split('youtu.be/')[1]?.split('?')[0];
          embedUrl = vid ? `https://www.youtube.com/embed/${vid}?autoplay=1&enablejsapi=1` : url;
        } else if (url.includes('vimeo.com/')) {
          const vid = url.split('vimeo.com/')[1]?.split('?')[0];
          embedUrl = vid ? `https://player.vimeo.com/video/${vid}?autoplay=1` : url;
        }

        if (activeVideoEmbed) {
          if (isMp4) {
            activeVideoEmbed.innerHTML = `
              <video id="active-lesson-video-tag" src="${escapeHtml(url)}" controls autoplay class="w-full h-full object-contain"></video>
            `;
          } else {
            activeVideoEmbed.innerHTML = `
              <iframe src="${escapeHtml(embedUrl)}" class="w-full h-full" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
            `;
          }
          activeVideoEmbed.classList.remove('hidden');
        }
        if (overlayPlay) overlayPlay.style.display = 'none';
        if (videoControls) videoControls.classList.add('hidden');
      } else {
        if (activeVideoEmbed) {
          activeVideoEmbed.innerHTML = '';
          activeVideoEmbed.classList.add('hidden');
        }
        if (overlayPlay) overlayPlay.style.display = isPlaying ? 'none' : 'flex';
        if (videoControls) videoControls.classList.remove('opacity-30', 'pointer-events-none', 'hidden');
      }
    } else {
      // Pause playback if running
      pauseVideo();
      if (activeVideoEmbed) {
        activeVideoEmbed.innerHTML = '';
        activeVideoEmbed.classList.add('hidden');
      }
      if (lockedOverlay) lockedOverlay.classList.remove('hidden');
      if (overlayPlay) overlayPlay.style.display = 'none';
      if (videoControls) videoControls.classList.add('opacity-30', 'pointer-events-none');
    }

    // Render downloadable assets
    if (downloadsList) {
      const resources = currentLesson.resources || [
        { name: 'Project-Source-Kit.zip', size: '18.4 MB', url: '#' }
      ];

      downloadsList.innerHTML = resources.map(res => {
        if (accessible) {
          return `
            <a href="${res.url || '#'}" download class="p-3.5 rounded-2xl bg-theme-card border border-theme hover:border-purple-400/50 flex items-center justify-between transition-colors group">
              <div class="flex items-center gap-3">
                <span class="text-lg">📦</span>
                <div>
                  <div class="text-xs font-bold text-white group-hover:text-purple-300 transition-colors">${escapeHtml(res.name)}</div>
                  <div class="text-[10px] text-slate-400 font-mono">${escapeHtml(res.size || 'Downloadable Asset')} • Ready for download</div>
                </div>
              </div>
              <span class="text-xs font-mono font-bold text-purple-400 group-hover:text-white transition-colors">Download ↓</span>
            </a>
          `;
        } else {
          return `
            <div class="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between opacity-70">
              <div class="flex items-center gap-3">
                <span class="text-lg">🔒</span>
                <div>
                  <div class="text-xs font-bold text-slate-400">${escapeHtml(res.name)}</div>
                  <div class="text-[10px] text-slate-500 font-mono">Locked for enrolled students (${res.size || 'Asset'})</div>
                </div>
              </div>
              <button type="button" class="open-checkout-trigger text-xs font-mono font-bold text-amber-400 hover:text-white transition-colors">Unlock $49</button>
            </div>
          `;
        }
      }).join('');

      // Attach unlock triggers to locked download rows
      downloadsList.querySelectorAll('.open-checkout-trigger').forEach(btn => {
        btn.addEventListener('click', openPaymentModal);
      });
    }

    // Reset video scrubber
    playProgress = 0;
    updateScrubber();
    renderCurriculum();
  }

  // -------------------------------------------------------------
  // VIDEO PLAYER SIMULATION
  // -------------------------------------------------------------
  function initVideoPlayer() {
    const playBtn = document.getElementById('video-play-btn');
    const overlayPlay = document.getElementById('video-overlay-play');
    const completeBtn = document.getElementById('mark-lesson-complete-btn');
    const scrubber = document.getElementById('video-scrubber');
    const speedBtn = document.getElementById('video-speed-btn');

    function togglePlay() {
      if (!currentLesson || !isLessonAccessible(currentLesson)) {
        openPaymentModal();
        return;
      }

      isPlaying = !isPlaying;
      if (playBtn) playBtn.textContent = isPlaying ? '⏸' : '▶';
      if (overlayPlay) overlayPlay.style.display = isPlaying ? 'none' : 'flex';

      if (isPlaying) {
        playInterval = setInterval(() => {
          playProgress += 0.005;
          if (playProgress >= 1) {
            playProgress = 1;
            pauseVideo();
            if (currentLesson) {
              currentLesson.completed = true;
              saveModules();
              updateProgressKPIs();
              renderCurriculum();
              showToast('Lesson completed! Awesome progress.', '✦');
            }
          }
          updateScrubber();
        }, 150);
      } else {
        clearInterval(playInterval);
      }
    }

    if (playBtn) playBtn.addEventListener('click', togglePlay);
    if (overlayPlay) overlayPlay.addEventListener('click', togglePlay);

    if (scrubber) {
      scrubber.addEventListener('click', (e) => {
        if (!currentLesson || !isLessonAccessible(currentLesson)) {
          openPaymentModal();
          return;
        }
        const rect = scrubber.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        playProgress = Math.max(0, Math.min(1, pos));
        updateScrubber();
      });
    }

    if (speedBtn) {
      const speeds = ['1.0x', '1.25x', '1.5x', '2.0x'];
      let speedIdx = 0;
      speedBtn.addEventListener('click', () => {
        speedIdx = (speedIdx + 1) % speeds.length;
        speedBtn.textContent = speeds[speedIdx];
      });
    }

    if (completeBtn) {
      completeBtn.addEventListener('click', () => {
        if (!currentLesson) return;
        currentLesson.completed = !currentLesson.completed;
        saveModules();
        selectLesson(currentLesson.id);
        updateProgressKPIs();
        showToast(currentLesson.completed ? 'Lesson marked complete! 🎉' : 'Lesson reset to in-progress.', '✓');
      });
    }
  }

  function pauseVideo() {
    isPlaying = false;
    clearInterval(playInterval);
    const playBtn = document.getElementById('video-play-btn');
    const overlayPlay = document.getElementById('video-overlay-play');
    if (playBtn) playBtn.textContent = '▶';
    if (overlayPlay && currentLesson && isLessonAccessible(currentLesson)) {
      overlayPlay.style.display = 'flex';
    }
  }

  function updateScrubber() {
    const fill = document.getElementById('video-scrubber-fill');
    const handle = document.getElementById('video-scrubber-handle');
    const timeDisplay = document.getElementById('video-time-display');

    const percent = Math.min(100, Math.max(0, playProgress * 100));
    if (fill) fill.style.width = `${percent}%`;
    if (handle) handle.style.left = `${percent}%`;

    if (timeDisplay && currentLesson) {
      const parts = (currentLesson.duration || '15:00').split(':');
      const totalSeconds = (parseInt(parts[0], 10) || 15) * 60 + (parseInt(parts[1], 10) || 0);
      const currentSeconds = Math.floor(playProgress * totalSeconds);

      const m = String(Math.floor(currentSeconds / 60)).padStart(2, '0');
      const s = String(currentSeconds % 60).padStart(2, '0');
      timeDisplay.textContent = `${m}:${s} / ${currentLesson.duration || '15:00'}`;
    }
  }

  function updateProgressKPIs() {
    let total = 0;
    let completed = 0;

    modules.forEach(m => {
      m.lessons.forEach(l => {
        total++;
        if (l.completed) completed++;
      });
    });

    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

    const percentEl = document.getElementById('course-progress-percent');
    const fractionEl = document.getElementById('course-progress-fraction');
    const fillEl = document.getElementById('course-progress-fill');

    if (percentEl) percentEl.textContent = `${percent}%`;
    if (fractionEl) fractionEl.textContent = `${completed} of ${total} completed`;
    if (fillEl) fillEl.style.width = `${percent}%`;
  }

  // -------------------------------------------------------------
  // PAYMENT SETTLEMENT MODAL & GATEWAY
  // -------------------------------------------------------------
  function initPaymentModal() {
    const modal = document.getElementById('payment-modal');
    const openBtns = [
      document.getElementById('header-unlock-btn'),
      document.getElementById('banner-settle-payment-btn'),
      document.getElementById('locked-overlay-settle-btn')
    ];
    const closeBtn = document.getElementById('close-payment-modal-btn');
    const form = document.getElementById('payment-checkout-form');
    const tabs = document.querySelectorAll('.pay-method-tab');
    const panels = document.querySelectorAll('.pay-panel');
    const demoCodeBtn = document.getElementById('use-default-passcode-btn');

    openBtns.forEach(btn => {
      if (btn) btn.addEventListener('click', openPaymentModal);
    });

    if (closeBtn && modal) {
      closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
        document.body.style.overflow = '';
      });
    }

    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.remove('active');
          document.body.style.overflow = '';
        }
      });
    }

    // Payment method tabs
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => {
          t.classList.remove('active', 'bg-white', 'text-black', 'font-bold');
          t.classList.add('bg-white/[0.04]', 'text-slate-300');
        });
        tab.classList.add('active', 'bg-white', 'text-black', 'font-bold');
        tab.classList.remove('bg-white/[0.04]', 'text-slate-300');

        activePayMethod = tab.getAttribute('data-method');
        panels.forEach(p => {
          if (p.id === `tab-panel-${activePayMethod}`) {
            p.classList.remove('hidden');
          } else {
            p.classList.add('hidden');
          }
        });
      });
    });

    // Passcode quick fill
    if (demoCodeBtn) {
      demoCodeBtn.addEventListener('click', () => {
        const passInput = document.getElementById('passkey-voucher-input');
        if (passInput) passInput.value = MASTER_STUDENT_PASSKEY;
      });
    }

    // Form submission & payment settlement
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const studentName = document.getElementById('pay-student-name').value.trim();
        const studentEmail = document.getElementById('pay-student-email').value.trim();
        const spinner = document.getElementById('settle-btn-spinner');
        const btnText = document.getElementById('settle-btn-text');
        const submitBtn = document.getElementById('submit-settle-payment-btn');

        // Passcode validation if on voucher tab
        if (activePayMethod === 'voucher') {
          const pass = (document.getElementById('passkey-voucher-input').value || '').trim().toUpperCase();
          if (pass !== MASTER_STUDENT_PASSKEY && pass !== 'FT2026' && pass !== 'JITHIN') {
            showToast('Invalid passkey voucher code.', '⚠️');
            return;
          }
        }

        // Show settlement loading state
        if (spinner) spinner.classList.remove('hidden');
        if (btnText) btnText.textContent = 'Settling Transaction with Processor...';
        if (submitBtn) submitBtn.disabled = true;

        setTimeout(async () => {
          // 1. Mark as unlocked locally
          saveUnlockState(true);

          // 2. Dispatch receipt to Supabase CRM (dispatches table)
          const receiptDispatch = {
            id: 'pay-' + Date.now(),
            type: 'Course Payment Settled',
            name: studentName,
            email: studentEmail,
            budget: '$49.00',
            message: `Student enrolled in Motion & Visual Storytelling Masterclass. Method: ${activePayMethod.toUpperCase()}. Access settled and lifetime studio key granted.`,
            status: 'Settled',
            timestamp: new Date().toISOString()
          };

          if (typeof window.syncDispatchToSupabase === 'function') {
            try {
              await window.syncDispatchToSupabase(receiptDispatch);
            } catch (err) {
              console.warn('Dispatch sync error:', err);
            }
          }

          // 3. Reset button and close modal
          if (spinner) spinner.classList.add('hidden');
          if (btnText) btnText.textContent = 'Settle Payment & Unlock Masterclass ($49.00) →';
          if (submitBtn) submitBtn.disabled = false;

          if (modal) modal.classList.remove('active');
          document.body.style.overflow = '';

          // 4. Update UI & re-select current lesson to unlock player
          renderAccessStatus();
          if (currentLesson) selectLesson(currentLesson.id);

          showToast('Payment settled! Welcome to the Masterclass 🎉', '✦');
        }, 1200);
      });
    }
  }

  function openPaymentModal() {
    const modal = document.getElementById('payment-modal');
    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  // -------------------------------------------------------------
  // TEST ACCESS SWITCHER TOGGLE
  // -------------------------------------------------------------
  function initTestAccessToggle() {
    const toggleBtn = document.getElementById('test-access-toggle-btn');
    if (!toggleBtn) return;

    toggleBtn.addEventListener('click', () => {
      saveUnlockState(!isCourseUnlocked);
      renderAccessStatus();
      if (currentLesson) selectLesson(currentLesson.id);
      showToast(isCourseUnlocked ? 'Test Mode: Course Unlocked ✦' : 'Test Mode: Course Locked 🔒', '⚡');
    });
  }

  // -------------------------------------------------------------
  // HELPERS & TOAST
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

  function showToast(msg, icon) {
    const toast = document.getElementById('toast');
    if (!toast) return;

    toast.innerHTML = `
      <div class="glass-panel px-4 py-2.5 rounded-2xl border border-white/20 shadow-2xl flex items-center gap-2.5 text-xs font-semibold text-white">
        <span class="text-sm font-bold text-purple-400">${icon || '✦'}</span>
        <span>${escapeHtml(msg)}</span>
      </div>
    `;
    toast.className = 'fixed bottom-6 right-6 z-50 transition-all duration-300 opacity-100 translate-y-0';

    setTimeout(() => {
      toast.className = 'fixed bottom-6 right-6 z-50 transition-all duration-300 opacity-0 translate-y-4 pointer-events-none';
    }, 3800);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCoursePlatform);
  } else {
    initCoursePlatform();
  }

})();
