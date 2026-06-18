import { state } from '../core/state.js';
import { curriculumEngine } from '../engines/curriculum.js';
import { progressEngine } from '../engines/progress.js';
import { xpEngine } from '../engines/xp.js';
import { timeEngine } from '../engines/time.js';

export class DashboardView {
    constructor() {
        this.title = 'Asosiy Sahifa';
        this.progressListener = null;
        this.xpListener = null;
        this.timerListener = null;
        this._timerDisplayInterval = null;
    }

    // Helper to calculate current day
    getCurrentDay() {
        const userState = state.getState().user;
        const start = new Date(userState.startDate);
        const now = new Date();
        const diffTime = Math.abs(now - start);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
        return Math.min(diffDays, 90);
    }

    render() {
        const userState = state.getState().user;
        const currentDay = this.getCurrentDay();
        const daysRemaining = 90 - currentDay;
        
        // Progress Engine Integration
        const progressPercent = progressEngine.getTotalCompletionPercent();
        const totalCompleted = progressEngine.getCompletedMissionsCount();
        const remainingMissions = progressEngine.getRemainingMissionsCount();

        // Fetch exactly from Curriculum Engine
        const backendMission = curriculumEngine.getMission(currentDay, 'backend') || { title: 'Dam olish kuni', xpReward: 0, isCompleted: false };
        const englishMission = curriculumEngine.getMission(currentDay, 'english') || { title: 'Dam olish kuni', xpReward: 0, isCompleted: false };
        const aiMission = curriculumEngine.getMission(currentDay, 'ai') || { title: 'Dam olish kuni', xpReward: 0, isCompleted: false };

        const dailyXpAvailable = (backendMission.xpReward || 0) + (englishMission.xpReward || 0) + (aiMission.xpReward || 0);

        const isBackendDone = backendMission.isCompleted;
        const isEnglishDone = englishMission.isCompleted;
        const isAiDone = aiMission.isCompleted;
        const isDayDone = isBackendDone && isEnglishDone && isAiDone;

        // Dynamic Motivation
        const motivations = [
            "Sizning 90 kunlik sayohatingiz kutmoqda. Bardavom bo'ling.",
            "Intizom - bu erkinlikdir.",
            "Har bir bajarilgan vazifa ustalik sari bir qadamdir.",
            "Qahramon rejimi faollashdi. Keling, bugungi kunni zabt etamiz.",
            "Har kungi kichik qadamlar 90 kundan so'ng ulkan yutuqlarga olib keladi."
        ];
        const motivation = motivations[(currentDay - 1) % motivations.length] || motivations[0];

        return `
            <div class="dashboard-container animate-in">
                <!-- Header Section -->
                <header class="dashboard-header">
                    <div class="header-content">
                        <h1>Xush kelibsiz, <span class="text-gradient">${userState.name}</span>.</h1>
                        <p class="subtitle">${motivation}</p>
                    </div>
                    <div class="header-stats">
                        <div class="stat-badge">
                            <span class="stat-label">Kun</span>
                            <span class="stat-value">${currentDay} <span class="stat-sub">/ 90</span></span>
                        </div>
                        <div class="stat-badge">
                            <span class="stat-label">Qoldi</span>
                            <span class="stat-value">${daysRemaining} kun</span>
                        </div>
                    </div>
                </header>

                <!-- Top Stats Grid -->
                <div class="stats-grid">
                    <div class="stat-card xp-card">
                        <div class="stat-icon">✨</div>
                        <div class="stat-info">
                            <span class="stat-label">Umumiy Ball</span>
                            <span class="stat-value">${xpEngine.getTotalXP()}</span>
                        </div>
                    </div>
                    <div class="stat-card level-card">
                        <div class="stat-icon">⭐</div>
                        <div class="stat-info">
                            <span class="stat-label">Daraja</span>
                            <span class="stat-value">${userState.level}</span>
                        </div>
                    </div>
                    <div class="stat-card streak-card">
                        <div class="stat-icon">🔥</div>
                        <div class="stat-info">
                            <span class="stat-label">Davomiylik</span>
                            <span class="stat-value">${userState.currentStreak} Kun</span>
                        </div>
                    </div>
                </div>

                <!-- Overall Progress -->
                <div class="progress-section">
                    <div class="progress-header">
                        <h3>Umumiy Safar</h3>
                        <span>${progressPercent}% (${totalCompleted} ta tugatildi, ${remainingMissions} ta qoldi)</span>
                    </div>
                    <div class="progress-bar-bg">
                        <div class="progress-bar-fill" style="width: ${progressPercent}%"></div>
                    </div>
                </div>

                <!-- Today's Missions -->
                <section class="missions-section">
                    <div class="section-header">
                        <h2>Bugungi Vazifalar</h2>
                        <span class="daily-xp-badge">+${dailyXpAvailable} ball mavjud</span>
                    </div>

                    <div class="missions-list">
                        ${this.renderMissionCard('backend', 'Backend Muhandisligi', backendMission, '💻', 'accent-primary', currentDay)}
                        ${this.renderMissionCard('english', 'Ingliz Tili Ustaligi', englishMission, '🌍', 'accent-success', currentDay)}
                        ${this.renderMissionCard('ai', 'Akademik Sun\'iy Intellekt', aiMission, '🤖', 'accent-warning', currentDay)}
                    </div>
                </section>

                <!-- Actions -->
                <div class="dashboard-actions">
                    <button class="btn btn-primary btn-large" ${isDayDone ? 'disabled' : ''}>
                        ${isDayDone ? 'Barcha Vazifalar Bajarildi' : 'O\'rganishni Davom Ettirish'}
                    </button>
                    ${isDayDone ? `
                        <button class="btn btn-success btn-large animate-pulse">
                            Kunlik Mukofot (Bonus)
                        </button>
                    ` : ''}
                </div>

                <!-- ═══ VAQT TIZIMI ═══ -->

                <!-- Bugungi Jadval -->
                <section class="time-section">
                    <div class="section-header">
                        <h2>📅 Bugungi Jadval</h2>
                    </div>
                    <div class="schedule-grid">
                        ${this.renderSchedule()}
                    </div>
                </section>

                <!-- Bugungi Maqsad -->
                ${this.renderDailyTarget()}

                <!-- O'quv Taymeri -->
                ${this.renderTimer()}

            </div>
        `;
    }

    renderMissionCard(trackId, trackName, mission, icon, colorVar, currentDay) {
        const isDone = mission.isCompleted;
        return `
            <div class="mission-card ${isDone ? 'completed' : ''}" 
                 data-mission-id="${mission.id || ''}" 
                 data-track="${trackId}" 
                 data-day="${currentDay}">
                <div class="mission-icon" style="color: var(--${colorVar})">
                    ${icon}
                </div>
                <div class="mission-details">
                    <span class="mission-track" style="color: var(--${colorVar})">${trackName}</span>
                    <h3 class="mission-title">${mission.title}</h3>
                </div>
                <div class="mission-meta">
                    ${isDone 
                        ? `<span class="badge badge-success">Bajarildi</span>`
                        : `<span class="badge badge-xp">+${mission.xpReward} Ball</span>`
                    }
                </div>
            </div>
        `;
    }

    afterRender() {
        // Handle mission clicks to complete them via Progress Engine
        const cards = document.querySelectorAll('.mission-card');
        cards.forEach(card => {
            card.addEventListener('click', (e) => {
                const trackId = e.currentTarget.getAttribute('data-track');
                if (trackId) {
                    window.location.hash = `#/${trackId}`;
                }
            });
        });

        // ─── Timer Controls ───
        this._setupTimerControls();
        this._startTimerDisplay();

        // Setup reactive re-rendering when progress updates
        if (!this.progressListener) {
            this.progressListener = () => {
                const contentContainer = document.getElementById('app-content');
                if (contentContainer) {
                    // Save scroll position
                    const scrollPos = contentContainer.scrollTop;
                    contentContainer.innerHTML = this.render();
                    this.afterRender();
                    contentContainer.scrollTop = scrollPos;
                }
            };
            progressEngine.addEventListener('progressUpdated', this.progressListener);
        }

        // Setup reactive re-rendering when XP updates
        if (!this.xpListener) {
            this.xpListener = (e) => {
                const xpValueEl = document.querySelector('.xp-card .stat-value');
                if (xpValueEl) {
                    xpValueEl.textContent = e.detail.total;
                }
            };
            xpEngine.addEventListener('xpUpdated', this.xpListener);
        }
    }

    destroy() {
        if (this.progressListener) {
            progressEngine.removeEventListener('progressUpdated', this.progressListener);
            this.progressListener = null;
        }
        if (this.xpListener) {
            xpEngine.removeEventListener('xpUpdated', this.xpListener);
            this.xpListener = null;
        }
        if (this._timerDisplayInterval) {
            clearInterval(this._timerDisplayInterval);
            this._timerDisplayInterval = null;
        }
    }

    // ─── SCHEDULE RENDER ───────────────────────────

    renderSchedule() {
        const schedule = timeEngine.getDailySchedule();
        const trackIcons = { backend: '💻', english: '🌍', ai: '🤖' };
        const trackColors = { backend: 'accent-primary', english: 'accent-success', ai: 'accent-warning' };

        return schedule.map(s => `
            <div class="schedule-item" style="border-left: 4px solid var(--${trackColors[s.track]}); padding: 12px 16px; background: var(--bg-surface-elevated); border-radius: 0 var(--border-radius-md) var(--border-radius-md) 0; display: flex; align-items: center; gap: 12px;">
                <span style="font-size: 20px;">${trackIcons[s.track]}</span>
                <div style="flex: 1;">
                    <strong style="display: block; font-size: 15px;">${s.trackName}</strong>
                    <span style="font-size: 13px; opacity: 0.7;">${s.minutes} daqiqa</span>
                </div>
                <span style="font-size: 14px; font-weight: 600; color: var(--text-secondary);">${s.start} — ${s.end}</span>
            </div>
        `).join('');
    }

    // ─── DAILY TARGET RENDER ───────────────────────

    renderDailyTarget() {
        const tp = timeEngine.getTodayProgress();
        return `
            <div class="progress-section" style="margin-top: 0;">
                <div class="progress-header">
                    <h3>🎯 Bugungi Maqsad</h3>
                    <span>${timeEngine.constructor.formatMinutes(tp.studied)} / ${timeEngine.constructor.formatMinutes(tp.target)}</span>
                </div>
                <div class="progress-bar-bg">
                    <div class="progress-bar-fill" style="width: ${tp.percent}%; background: var(--gradient-success);"></div>
                </div>
                <div style="display: flex; justify-content: space-between; margin-top: 8px; font-size: 13px; opacity: 0.7;">
                    <span>Bajarildi: ${tp.percent}%</span>
                    <span>Qoldi: ${timeEngine.constructor.formatMinutes(tp.remaining)}</span>
                </div>
            </div>
        `;
    }

    // ─── TIMER RENDER ──────────────────────────────

    renderTimer() {
        const timer = timeEngine.getActiveTimer();
        const isRunning = timer && !timer.isPaused;
        const isPaused = timer && timer.isPaused;
        const elapsed = timer ? timer.elapsed : 0;
        const trackNames = { backend: 'Backend', english: 'Ingliz Tili', ai: 'Akademik AI' };

        return `
            <div class="mission-details-card" id="timer-widget">
                <div class="section-header" style="margin-bottom: 16px;">
                    <h2>⏱️ O'quv Taymeri</h2>
                </div>

                <div style="text-align: center; margin-bottom: 20px;">
                    <div id="timer-display" style="font-size: 48px; font-weight: 800; font-variant-numeric: tabular-nums; letter-spacing: 2px; color: ${isRunning ? 'var(--accent-success)' : isPaused ? 'var(--accent-warning)' : 'var(--text-primary)'}; transition: color 0.3s;">
                        ${timeEngine.constructor.formatElapsed(elapsed)}
                    </div>
                    ${timer ? `<p style="margin-top: 8px; font-size: 14px; opacity: 0.7;">${trackNames[timer.track] || timer.track} — ${isPaused ? 'To\'xtatildi' : 'Ishlayapti'}</p>` : '<p style="margin-top: 8px; font-size: 14px; opacity: 0.7;">Yo\'nalishni tanlang va boshlang</p>'}
                </div>

                ${!timer ? `
                    <div style="display: flex; gap: 8px; justify-content: center; flex-wrap: wrap;">
                        <button class="btn btn-primary timer-start-btn" data-track="backend" style="padding: 10px 20px;">💻 Backend</button>
                        <button class="btn btn-primary timer-start-btn" data-track="english" style="padding: 10px 20px; background: var(--gradient-success); box-shadow: 0 4px 15px rgba(35, 160, 107, 0.4);">🌍 Ingliz Tili</button>
                        <button class="btn btn-primary timer-start-btn" data-track="ai" style="padding: 10px 20px; background: linear-gradient(135deg, #E2B714 0%, #f0c93a 100%); box-shadow: 0 4px 15px rgba(226,183,20,0.4); color: #000;">🤖 AI</button>
                    </div>
                ` : `
                    <div style="display: flex; gap: 12px; justify-content: center;">
                        ${isPaused ? `
                            <button class="btn btn-primary" id="timer-resume-btn" style="padding: 12px 32px;">▶️ Davom Ettirish</button>
                        ` : `
                            <button class="btn" id="timer-pause-btn" style="padding: 12px 32px; border: 1px solid var(--accent-warning); color: var(--accent-warning);">⏸️ To'xtatish</button>
                        `}
                        <button class="btn" id="timer-stop-btn" style="padding: 12px 32px; border: 1px solid var(--accent-danger); color: var(--accent-danger);">⏹️ Yakunlash</button>
                    </div>
                `}
            </div>
        `;
    }

    // ─── TIMER CONTROLS ───────────────────────────

    _setupTimerControls() {
        // Start buttons
        document.querySelectorAll('.timer-start-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const track = e.currentTarget.getAttribute('data-track');
                timeEngine.startTimer(track);
                this._reRenderTimerSection();
            });
        });

        // Pause
        const pauseBtn = document.getElementById('timer-pause-btn');
        if (pauseBtn) {
            pauseBtn.addEventListener('click', () => {
                timeEngine.pauseTimer();
                this._reRenderTimerSection();
            });
        }

        // Resume
        const resumeBtn = document.getElementById('timer-resume-btn');
        if (resumeBtn) {
            resumeBtn.addEventListener('click', () => {
                timeEngine.resumeTimer();
                this._reRenderTimerSection();
            });
        }

        // Stop
        const stopBtn = document.getElementById('timer-stop-btn');
        if (stopBtn) {
            stopBtn.addEventListener('click', () => {
                timeEngine.stopTimer();
                this._reRenderTimerSection();
                // Maqsad progressni ham yangilash
                const targetSection = document.querySelector('.progress-section:last-of-type');
                // Full re-render for simplicity after stop
                const container = document.getElementById('app-content');
                if (container) {
                    const scrollPos = container.scrollTop;
                    container.innerHTML = this.render();
                    this.afterRender();
                    container.scrollTop = scrollPos;
                }
            });
        }
    }

    _reRenderTimerSection() {
        const widget = document.getElementById('timer-widget');
        if (widget) {
            widget.outerHTML = this.renderTimer();
            this._setupTimerControls();
            this._startTimerDisplay();
        }
    }

    _startTimerDisplay() {
        if (this._timerDisplayInterval) {
            clearInterval(this._timerDisplayInterval);
        }

        const timer = timeEngine.getActiveTimer();
        if (timer && !timer.isPaused) {
            this._timerDisplayInterval = setInterval(() => {
                const current = timeEngine.getActiveTimer();
                if (!current) {
                    clearInterval(this._timerDisplayInterval);
                    return;
                }
                const display = document.getElementById('timer-display');
                if (display) {
                    display.textContent = timeEngine.constructor.formatElapsed(current.elapsed);
                }
            }, 1000);
        }
    }
}
