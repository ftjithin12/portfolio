/**
 * DEDICATED COURSE LMS INTERFACE CONTROLLER
 * Supports video mockup controls, interactive curriculum switcher,
 * live progress calculator, local notes saving, and "Add Module/Lesson" builder.
 * Theme-aware (Light Blue & Purple Cyber SaaS / Crisp Porcelain Light)
 */

(function () {
  'use strict';

  const STORAGE_LESSONS_KEY = 'saas-course-custom-curriculum';
  const STORAGE_NOTES_KEY = 'saas-course-user-notes';
  const STORAGE_COMPLETED_KEY = 'saas-course-completed-lessons';

  const defaultModules = [
    {
      id: 'mod-1',
      title: 'Module 1: Foundations of Apple Motion & Spatial Typography',
      lessons: [
        {
          id: 'les-1-1',
          title: '1.1 The Anatomy of Apple Keynote Text Reveals',
          duration: '14:20',
          completed: true,
          videoTitle: 'Deconstructing Apple’s Dynamic Text Shimmer & Contrast Scrub',
          description: 'Explore the perceptual physics behind Apple’s text reveal transitions. Learn how font tracking, blur-to-sharp transitions, and scrubbed gradient masks create that signature luminous aesthetic without sacrificing legibility or 60FPS performance.',
          resources: [
            { name: 'Apple Typography Token System (Figma)', size: '2.4 MB' },
            { name: 'Kinetic Text Shimmer Starter Code (.zip)', size: '480 KB' }
          ]
        },
        {
          id: 'les-1-2',
          title: '1.2 High-Performance CSS Gradient Clip & Blend Modes',
          duration: '18:45',
          completed: true,
          videoTitle: 'Mastering Background-Clip & Composition Pipelines',
          description: 'A deep dive into GPU-accelerated gradient clipping across Safari, Chrome, and Firefox. Prevent repaints and composite layers with will-change and transform isolation.',
          resources: [
            { name: 'GPU Acceleration Cheat Sheet (PDF)', size: '1.1 MB' }
          ]
        },
        {
          id: 'les-1-3',
          title: '1.3 Inertial Scrubbing with IntersectionObserver & rAF',
          duration: '22:10',
          completed: false,
          videoTitle: 'Building Zero-Dependency Scroll Scrubbers',
          description: 'Replace heavy third-party scroll libraries with a lightweight 80-line IntersectionObserver + requestAnimationFrame engine that runs buttery smooth on both desktop and mobile devices.',
          resources: [
            { name: 'Zero-Dep Scroll Engine Snippet (.js)', size: '12 KB' }
          ]
        }
      ]
    },
    {
      id: 'mod-2',
      title: 'Module 2: 60FPS Parallax Architecture & 3D Tilt',
      lessons: [
        {
          id: 'les-2-1',
          title: '2.1 Perspective Matrices & Mouse-Driven 3D Tilt',
          duration: '16:50',
          completed: false,
          videoTitle: 'Simulating Physical Depth with CSS 3D Transforms',
          description: 'Calculate mouse coordinates relative to card centers and apply dynamic rotateX/rotateY transforms with realistic specular spotlight reflections.',
          resources: [
            { name: '3D Card Tilt Component (.tsx / .html)', size: '34 KB' },
            { name: 'Specular Lighting Shader Notes', size: '150 KB' }
          ]
        },
        {
          id: 'les-2-2',
          title: '2.2 Multi-Layered Scroll Speeds & Z-Index Depth Sorting',
          duration: '24:15',
          completed: false,
          videoTitle: 'Layering Background Orbs and Foreground Glass Panes',
          description: 'Coordinate multiple speed multipliers across ambient glows, grid backdrops, and interactive UI preview cards without layout thrashing.',
          resources: [
            { name: 'Parallax Layer Template', size: '85 KB' }
          ]
        }
      ]
    },
    {
      id: 'mod-3',
      title: 'Module 3: Enterprise SaaS Design Systems & Token Architecture',
      lessons: [
        {
          id: 'les-3-1',
          title: '3.1 High-Contrast Obsidian & Minimal RGB Systems',
          duration: '20:30',
          completed: false,
          videoTitle: 'Structuring High-Contrast Kinetic Theme Architecture',
          description: 'How to structure color tokens, contrast ratios, and glassmorphism blurs that look phenomenal with obsidian charcoal backdrops and subtle minimal RGB prism accents.',
          resources: [
            { name: 'SaaS Design Tokens JSON Schema', size: '18 KB' }
          ]
        },
        {
          id: 'les-3-2',
          title: '3.2 Micro-Interactions: Magnetic Buttons & Toast Systems',
          duration: '19:40',
          completed: false,
          videoTitle: 'Tactile Feedback & Polish for SaaS Web Apps',
          description: 'Adding life to forms, submit buttons, clipboard copies, and tab switchers to elevate user retention and perceived quality.',
          resources: [
            { name: 'Micro-Interaction Sound Pack (.mp3)', size: '3.2 MB' }
          ]
        }
      ]
    }
  ];

  let courseData = [];
  let currentLesson = null;
  let isPlaying = false;
  let playInterval = null;
  let playheadSeconds = 142;
  let totalLessonDuration = 860;

  function loadCourseData() {
    const customData = localStorage.getItem(STORAGE_LESSONS_KEY);
    if (customData) {
      try {
        courseData = JSON.parse(customData);
      } catch (e) {
        courseData = JSON.parse(JSON.stringify(defaultModules));
      }
    } else {
      courseData = JSON.parse(JSON.stringify(defaultModules));
    }

    const completedSet = new Set(JSON.parse(localStorage.getItem(STORAGE_COMPLETED_KEY) || '[]'));
    courseData.forEach(mod => {
      mod.lessons.forEach(l => {
        if (completedSet.has(l.id)) {
          l.completed = true;
        }
      });
    });

    if (!currentLesson && courseData[0] && courseData[0].lessons[0]) {
      currentLesson = courseData[0].lessons[0];
    }
  }

  function saveCompletedLessons() {
    const completedIds = [];
    courseData.forEach(mod => {
      mod.lessons.forEach(l => {
        if (l.completed) completedIds.push(l.id);
      });
    });
    localStorage.setItem(STORAGE_COMPLETED_KEY, JSON.stringify(completedIds));
    updateOverallProgress();
  }

  function renderCurriculum() {
    const container = document.getElementById('curriculum-accordion');
    if (!container) return;

    container.innerHTML = courseData
      .map((mod, modIdx) => {
        const completedCount = mod.lessons.filter(l => l.completed).length;
        const totalCount = mod.lessons.length;

        const lessonsHtml = mod.lessons
          .map(lesson => {
            const isActive = currentLesson && currentLesson.id === lesson.id;
            return `
            <div class="lesson-item flex items-center justify-between p-3 rounded-xl transition-all cursor-pointer ${
              isActive ? 'bg-sky-500/15 border border-sky-400/50 text-sky-400 font-bold' : 'hover:bg-theme-card-hover text-theme-secondary font-medium'
            }" data-lesson-id="${lesson.id}">
              <div class="flex items-center gap-3 overflow-hidden">
                <input type="checkbox" class="lesson-checkbox h-4 w-4 rounded border-theme bg-transparent text-sky-500 focus:ring-0 cursor-pointer" 
                  data-lesson-id="${lesson.id}" ${lesson.completed ? 'checked' : ''} />
                <div class="truncate text-sm ${lesson.completed ? 'line-through opacity-50' : ''}">
                  ${lesson.title}
                </div>
              </div>
              <span class="text-xs font-mono font-semibold text-theme-muted shrink-0 ml-2">${lesson.duration}</span>
            </div>
          `;
          })
          .join('');

        return `
        <div class="module-group border border-theme rounded-2xl overflow-hidden bg-theme-card mb-3 shadow-sm">
          <button class="module-toggle-btn w-full p-4 flex items-center justify-between text-left hover:bg-theme-card-hover transition-colors" data-mod-idx="${modIdx}">
            <div>
              <div class="text-xs font-bold uppercase tracking-wider text-sky-400">Section ${modIdx + 1}</div>
              <h4 class="text-sm font-bold text-theme-primary mt-0.5">${mod.title}</h4>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-theme-nav text-theme-secondary border border-theme">${completedCount}/${totalCount}</span>
              <svg class="w-4 h-4 text-theme-muted transform transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </button>
          <div class="module-lessons p-2 space-y-1 bg-theme-nav border-t border-theme">
            ${lessonsHtml}
          </div>
        </div>
      `;
      })
      .join('');

    container.querySelectorAll('.lesson-item').forEach(el => {
      el.addEventListener('click', e => {
        if (e.target.classList.contains('lesson-checkbox')) return;
        const lessonId = el.getAttribute('data-lesson-id');
        selectLesson(lessonId);
      });
    });

    container.querySelectorAll('.lesson-checkbox').forEach(box => {
      box.addEventListener('change', () => {
        const lessonId = box.getAttribute('data-lesson-id');
        toggleLessonCompletion(lessonId, box.checked);
      });
    });

    updateOverallProgress();
  }

  function selectLesson(lessonId) {
    let found = null;
    for (const mod of courseData) {
      for (const les of mod.lessons) {
        if (les.id === lessonId) {
          found = les;
          break;
        }
      }
      if (found) break;
    }

    if (!found) return;
    currentLesson = found;

    pauseVideo();
    playheadSeconds = 0;
    updatePlayerTime();

    const titleEl = document.getElementById('active-lesson-title');
    const badgeEl = document.getElementById('active-lesson-badge');
    const descEl = document.getElementById('active-lesson-desc');
    const resourcesContainer = document.getElementById('active-lesson-resources');

    if (titleEl) titleEl.innerText = found.videoTitle || found.title;
    if (badgeEl) badgeEl.innerText = `Duration: ${found.duration} • HD 1080p`;
    if (descEl) descEl.innerText = found.description || 'Hands-on architectural walkthrough and implementation.';

    if (resourcesContainer && found.resources) {
      resourcesContainer.innerHTML = found.resources
        .map(
          r => `
          <div class="flex items-center justify-between p-3.5 rounded-xl border border-theme bg-theme-card hover:border-sky-400 transition-colors shadow-sm">
            <div class="flex items-center gap-3">
              <span class="text-sky-400 text-lg">📦</span>
              <div>
                <div class="text-sm font-bold text-theme-primary">${r.name}</div>
                <div class="text-xs text-theme-muted font-mono font-medium">${r.size}</div>
              </div>
            </div>
            <button class="download-resource-btn px-3 py-1.5 rounded-lg text-xs font-semibold btn-primary">
              Download
            </button>
          </div>
        `
        )
        .join('');

      resourcesContainer.querySelectorAll('.download-resource-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          if (window.showToast) window.showToast('Resource asset downloaded to mock bundle!', '📥');
        });
      });
    }

    renderCurriculum();
  }

  function toggleLessonCompletion(lessonId, isCompleted) {
    for (const mod of courseData) {
      for (const les of mod.lessons) {
        if (les.id === lessonId) {
          les.completed = isCompleted;
          break;
        }
      }
    }
    saveCompletedLessons();
    renderCurriculum();
    if (window.showToast) {
      window.showToast(isCompleted ? 'Lesson marked complete! Keep going.' : 'Lesson marked incomplete.', '✅');
    }
  }

  function updateOverallProgress() {
    let total = 0;
    let completed = 0;

    courseData.forEach(mod => {
      mod.lessons.forEach(l => {
        total++;
        if (l.completed) completed++;
      });
    });

    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

    const progressFill = document.getElementById('course-progress-fill');
    const progressText = document.getElementById('course-progress-percent');
    const lessonCountText = document.getElementById('course-progress-fraction');

    if (progressFill) progressFill.style.width = `${percent}%`;
    if (progressText) progressText.innerText = `${percent}%`;
    if (lessonCountText) lessonCountText.innerText = `${completed} of ${total} lessons completed`;
  }

  function initVideoPlayer() {
    const playPauseBtn = document.getElementById('video-play-btn');
    const overlayPlay = document.getElementById('video-overlay-play');
    const scrubberTrack = document.getElementById('video-scrubber');
    const speedBtn = document.getElementById('video-speed-btn');
    const muteBtn = document.getElementById('video-mute-btn');
    const theaterBtn = document.getElementById('video-theater-btn');
    const videoContainer = document.getElementById('video-frame-container');

    const speeds = ['1.0x', '1.25x', '1.5x', '2.0x'];
    let speedIdx = 0;

    function togglePlay() {
      if (isPlaying) {
        pauseVideo();
      } else {
        startVideo();
      }
    }

    function startVideo() {
      isPlaying = true;
      if (playPauseBtn) playPauseBtn.innerHTML = '⏸';
      if (overlayPlay) overlayPlay.style.opacity = '0';

      clearInterval(playInterval);
      playInterval = setInterval(() => {
        playheadSeconds += 1;
        if (playheadSeconds >= totalLessonDuration) {
          playheadSeconds = totalLessonDuration;
          pauseVideo();
          if (currentLesson) {
            toggleLessonCompletion(currentLesson.id, true);
          }
        }
        updatePlayerTime();
      }, 1000 / parseFloat(speeds[speedIdx]));
    }

    function pauseVideo() {
      isPlaying = false;
      clearInterval(playInterval);
      if (playPauseBtn) playPauseBtn.innerHTML = '▶';
      if (overlayPlay) overlayPlay.style.opacity = '1';
    }

    if (playPauseBtn) playPauseBtn.addEventListener('click', togglePlay);
    if (overlayPlay) overlayPlay.addEventListener('click', togglePlay);

    if (speedBtn) {
      speedBtn.addEventListener('click', () => {
        speedIdx = (speedIdx + 1) % speeds.length;
        speedBtn.innerText = speeds[speedIdx];
        if (isPlaying) {
          pauseVideo();
          startVideo();
        }
      });
    }

    if (muteBtn) {
      let isMuted = false;
      muteBtn.addEventListener('click', () => {
        isMuted = !isMuted;
        muteBtn.innerText = isMuted ? '🔇' : '🔊';
        if (window.showToast) window.showToast(isMuted ? 'Audio muted' : 'Audio unmuted', '🔈');
      });
    }

    if (theaterBtn && videoContainer) {
      theaterBtn.addEventListener('click', () => {
        videoContainer.classList.toggle('max-w-none');
        theaterBtn.classList.toggle('text-sky-400');
      });
    }

    if (scrubberTrack) {
      scrubberTrack.addEventListener('click', e => {
        const rect = scrubberTrack.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const ratio = Math.max(0, Math.min(1, clickX / rect.width));
        playheadSeconds = Math.floor(ratio * totalLessonDuration);
        updatePlayerTime();
      });
    }

    updatePlayerTime();
  }

  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  function updatePlayerTime() {
    const timeDisplay = document.getElementById('video-time-display');
    const scrubberFill = document.getElementById('video-scrubber-fill');
    const scrubberHandle = document.getElementById('video-scrubber-handle');

    const ratio = totalLessonDuration > 0 ? (playheadSeconds / totalLessonDuration) * 100 : 0;

    if (timeDisplay) {
      timeDisplay.innerText = `${formatTime(playheadSeconds)} / ${formatTime(totalLessonDuration)}`;
    }
    if (scrubberFill) scrubberFill.style.width = `${ratio}%`;
    if (scrubberHandle) scrubberHandle.style.left = `${ratio}%`;
  }

  function initStudentNotes() {
    const notesArea = document.getElementById('student-notes-input');
    const saveBtn = document.getElementById('save-notes-btn');

    if (!notesArea) return;

    const savedNotes = localStorage.getItem(STORAGE_NOTES_KEY);
    if (savedNotes) {
      notesArea.value = savedNotes;
    }

    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        localStorage.setItem(STORAGE_NOTES_KEY, notesArea.value);
        if (window.showToast) window.showToast('Student lecture notes saved safely!', '💾');
      });
    }

    notesArea.addEventListener('blur', () => {
      localStorage.setItem(STORAGE_NOTES_KEY, notesArea.value);
    });
  }

  function initCurriculumBuilder() {
    const modal = document.getElementById('add-lesson-modal');
    const openBtn = document.getElementById('open-add-lesson-modal');
    const closeBtn = document.getElementById('add-lesson-modal-close');
    const form = document.getElementById('add-lesson-form');
    const targetModuleSelect = document.getElementById('new-lesson-module-select');

    if (!modal || !form) return;

    function populateModuleSelect() {
      if (!targetModuleSelect) return;
      targetModuleSelect.innerHTML = courseData
        .map(mod => `<option value="${mod.id}">${mod.title}</option>`)
        .join('');
      targetModuleSelect.innerHTML += `<option value="NEW_MODULE">+ Create New Module Section</option>`;
    }

    if (openBtn) {
      openBtn.addEventListener('click', () => {
        populateModuleSelect();
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
      });
    }

    function closeModal() {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', e => {
      if (e.target === modal) closeModal();
    });

    form.addEventListener('submit', e => {
      e.preventDefault();
      const modId = targetModuleSelect.value;
      const lessonTitle = document.getElementById('new-lesson-title').value.trim();
      const duration = document.getElementById('new-lesson-duration').value.trim() || '15:00';
      const desc = document.getElementById('new-lesson-desc').value.trim();

      if (!lessonTitle) {
        if (window.showToast) window.showToast('Please enter a lesson title.', '⚠️');
        return;
      }

      const newLessonObj = {
        id: `custom-les-${Date.now()}`,
        title: lessonTitle,
        duration: duration,
        completed: false,
        videoTitle: lessonTitle,
        description: desc || 'Custom module created via Curriculum Builder.',
        resources: [{ name: 'Starter Kit & Reference Code', size: '1.2 MB' }]
      };

      if (modId === 'NEW_MODULE') {
        const newMod = {
          id: `custom-mod-${Date.now()}`,
          title: `Module ${courseData.length + 1}: Custom Curriculum`,
          lessons: [newLessonObj]
        };
        courseData.push(newMod);
      } else {
        const targetMod = courseData.find(m => m.id === modId);
        if (targetMod) {
          targetMod.lessons.push(newLessonObj);
        }
      }

      localStorage.setItem(STORAGE_LESSONS_KEY, JSON.stringify(courseData));

      form.reset();
      closeModal();
      renderCurriculum();
      selectLesson(newLessonObj.id);

      if (window.showToast) {
        window.showToast(`Lesson "${lessonTitle}" added to curriculum!`, '🚀');
      }
    });
  }

  function initCourseTabs() {
    const tabButtons = document.querySelectorAll('.course-tab-btn');
    const tabPanels = document.querySelectorAll('.course-tab-panel');

    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        tabButtons.forEach(b => {
          b.classList.remove('active', 'border-sky-400', 'text-sky-400');
          b.classList.add('border-transparent', 'text-theme-muted');
        });
        btn.classList.add('active', 'border-sky-400', 'text-sky-400');
        btn.classList.remove('border-transparent', 'text-theme-muted');

        const targetId = btn.getAttribute('data-target-tab');
        tabPanels.forEach(panel => {
          if (panel.id === targetId) {
            panel.classList.remove('hidden');
          } else {
            panel.classList.add('hidden');
          }
        });
      });
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    loadCourseData();
    renderCurriculum();
    if (currentLesson) {
      selectLesson(currentLesson.id);
    }
    initVideoPlayer();
    initStudentNotes();
    initCurriculumBuilder();
    initCourseTabs();
  });

})();
