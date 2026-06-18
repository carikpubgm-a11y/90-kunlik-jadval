import { state } from '../core/state.js';
import { curriculumEngine } from '../engines/curriculum.js';
import { progressEngine } from '../engines/progress.js';
import { xpEngine } from '../engines/xp.js';

export class DashboardView {
    constructor() {
        this.title = 'Asosiy Sahifa';
        this.progressListener = null;
        this.xpListener = null;
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
    }
}
