/**
 * FT JITHIN DESIGNZ — CREATIVE MOTION & VISUAL STORYTELLING STUDIO
 * Video mockup controls, interactive curriculum switcher,
 * live progress calculator, and "Add Module/Lesson" builder.
 */

(function () {
  'use strict';

  const STORAGE_LESSONS_KEY = 'ft-jithin-course-curriculum';
  const STORAGE_COMPLETED_KEY = 'ft-jithin-course-completed-lessons';

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
          videoTitle: 'Deconstructing Dynamic Text Reveals & Animation Timing',
          description: 'Explore the creative principles behind kinetic text reveals. Learn how letter tracking, blur-to-sharp transitions, and easing curves create impact without sacrificing visual clarity.',
          resources: [
            { name: 'Kinetic Typography Starter Pack (After Effects)', size: '12.4 MB' },
            { name: 'Storyboard Grid Template (.pdf)', size: '1.2 MB' }
          ]
        },
        {
          id: 'les-1-2',
          title: '1.2 Speed Graph Mastery in Adobe After Effects',
          duration: '18:45',
          completed: true,
          videoTitle: 'Crafting Natural Acceleration & Deceleration Physics',
          description: 'Master the value graph and speed graph in After Effects to replace rigid linear keyframes with organic, spring-like velocity curves.',
          resources: [
            { name: 'Motion Curve Presets (.ffx)', size: '350 KB' }
          ]
        },
        {
          id: 'les-1-3',
          title: '1.3 2D/3D Logo Animation & Title Sequences',
          duration: '22:10',
          completed: false,
          videoTitle: 'Transforming Vector Identity into Fluid Kinetic Reveals',
          description: 'Learn how to deconstruct vector logos from Photoshop and Illustrator into multi-layered 3D space with ambient lighting and specular flares.',
          resources: [
            { name: 'Title Reveal Project Files (.aep)', size: '18.2 MB' }
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
          videoTitle: 'Pacing the Narrative: The Invisible Cut Technique',
          description: 'Learn the psychology of scene transitions, J-cuts, L-cuts, and match cutting on action to keep audiences engaged in every sequence.',
          resources: [
            { name: 'Sound FX & Transition Audio Kit (.wav)', size: '42 MB' }
          ]
        },
        {
          id: 'les-2-2',
          title: '2.2 Dynamic Audio Sync & Visual Impact Framing',
          duration: '24:15',
          completed: false,
          videoTitle: 'Syncing Visual Motion with Sonic Transients',
          description: 'Techniques for syncing visual cuts and title hits to music beats, sub-bass drops, and subtle atmospheric sound design.',
          resources: [
            { name: 'Audio Beat Marker Workflow Guide', size: '250 KB' }
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
          videoTitle: 'Poster Design Hierarchy in Adobe Photoshop',
          description: 'How to combine photographic cutouts, lighting effects, textured overlays, and expressive typography into striking promotional poster art.',
          resources: [
            { name: 'Poster Texture & Brush Pack (.psd)', size: '64 MB' }
          ]
        },
        {
          id: 'les-3-2',
          title: '3.2 Node-Based Color Grading in DaVinci Resolve',
          duration: '26:40',
          completed: false,
          videoTitle: 'Crafting Cinematic Color Palettes and Contrast Curves',
          description: 'Building custom film looks using primary wheels, parallel nodes, hue vs. sat curves, and highlight rolloff in DaVinci Resolve.',
          resources: [
            { name: 'Cinematic Studio LUTs Pack (.cube)', size: '8.5 MB' }
          ]
        }
      ]
    }
  ];

  let modules = [];
  let currentLesson = null;
  let isPlaying = false;
  let playProgress = 0.22;
  let playInterval = null;

  // -------------------------------------------------------------
  // INITIALIZATION
  // -------------------------------------------------------------
  function initCoursePlatform() {
    loadModules();
    renderCurriculum();
    selectDefaultLesson();
    initVideoPlayer();
    initCurriculumBuilderModal();
    updateProgressKPIs();
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
    }
  }

  function saveModules() {
    localStorage.setItem(STORAGE_LESSONS_KEY, JSON.stringify(modules));
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

        return `
          <div class="lesson-item p-3 rounded-2xl flex items-center justify-between gap-3 cursor-pointer transition-all ${
            isActive ? 'bg-purple-500/20 border border-purple-400 text-white' : 'bg-white/[0.02] border border-white/5 hover:border-white/15 text-slate-300'
          }" data-lesson-id="${les.id}">
            <div class="flex items-center gap-3">
              <span class="w-2.5 h-2.5 rounded-full ${isCompleted ? 'bg-emerald-400' : 'bg-slate-600'} shrink-0"></span>
              <div class="space-y-0.5">
                <div class="text-xs font-bold leading-tight line-clamp-1">${escapeHtml(les.title)}</div>
                <div class="text-[10px] font-mono text-slate-400 font-semibold">${les.duration} • Video</div>
              </div>
            </div>
            <span class="text-xs font-mono font-bold text-slate-400">${isCompleted ? '✓' : '▶'}</span>
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

    // Update UI Elements
    const activeTitle = document.getElementById('active-lesson-title');
    const headerTitle = document.getElementById('lesson-header-title');
    const lessonDesc = document.getElementById('lesson-description');
    const lessonBadge = document.getElementById('active-lesson-badge');
    const completeBtn = document.getElementById('mark-lesson-complete-btn');

    if (activeTitle) activeTitle.textContent = currentLesson.title;
    if (headerTitle) headerTitle.textContent = currentLesson.title;
    if (lessonDesc) lessonDesc.textContent = currentLesson.description || 'Core creative technique walkthrough.';
    if (lessonBadge) lessonBadge.textContent = `Duration: ${currentLesson.duration || '15:00'} • HD 1080p`;

    if (completeBtn) {
      completeBtn.innerHTML = `
        <span class="w-2 h-2 rounded-full ${currentLesson.completed ? 'bg-emerald-400' : 'bg-slate-500'}"></span>
        <span>${currentLesson.completed ? 'Completed ✓' : 'Mark as Completed'}</span>
      `;
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

    function togglePlay() {
      isPlaying = !isPlaying;
      if (playBtn) playBtn.textContent = isPlaying ? '⏸' : '▶';
      if (overlayPlay) overlayPlay.style.display = isPlaying ? 'none' : 'flex';

      if (isPlaying) {
        playInterval = setInterval(() => {
          playProgress += 0.005;
          if (playProgress >= 1) {
            playProgress = 1;
            isPlaying = false;
            clearInterval(playInterval);
            if (playBtn) playBtn.textContent = '▶';
            if (overlayPlay) overlayPlay.style.display = 'flex';
          }
          updateScrubber();
        }, 150);
      } else {
        clearInterval(playInterval);
      }
    }

    if (playBtn) playBtn.addEventListener('click', togglePlay);
    if (overlayPlay) overlayPlay.addEventListener('click', togglePlay);

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
  // BUILDER MODAL
  // -------------------------------------------------------------
  function initCurriculumBuilderModal() {
    const modal = document.getElementById('add-lesson-modal');
    const openBtn = document.getElementById('open-add-lesson-modal');
    const closeBtn = document.getElementById('close-add-lesson-modal');
    const form = document.getElementById('add-lesson-form');

    if (openBtn && modal) {
      openBtn.addEventListener('click', () => {
        modal.classList.add('active');
      });
    }

    if (closeBtn && modal) {
      closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
      });
    }

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const modTitle = document.getElementById('input-module-title').value.trim();
        const lesTitle = document.getElementById('input-lesson-title').value.trim();
        const duration = document.getElementById('input-lesson-duration').value.trim() || '15:00';

        let targetMod = modules.find(m => m.title.toLowerCase() === modTitle.toLowerCase());
        if (!targetMod) {
          targetMod = {
            id: 'mod-' + Date.now(),
            title: modTitle,
            lessons: []
          };
          modules.push(targetMod);
        }

        const newLesson = {
          id: 'les-' + Date.now(),
          title: lesTitle,
          duration: duration,
          completed: false,
          description: `Practical walkthrough: ${lesTitle}. Covering creative production workflows in FT JITHIN DESIGNZ Studio.`
        };

        targetMod.lessons.push(newLesson);
        saveModules();
        renderCurriculum();
        selectLesson(newLesson.id);
        updateProgressKPIs();

        form.reset();
        if (modal) modal.classList.remove('active');
        showToast('New module lesson added to studio curriculum!', '✦');
      });
    }
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

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCoursePlatform);
  } else {
    initCoursePlatform();
  }

})();
