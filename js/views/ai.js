import { state } from '../core/state.js';
import { curriculumEngine } from '../engines/curriculum.js';
import { progressEngine } from '../engines/progress.js';

export class AIView {
    constructor() {
        this.title = 'Sun\'iy Intellekt Yo\'nalishi';
        this.progressListener = null;
    }

    getCurrentDay() {
        const userState = state.getState().user;
        const start = new Date(userState.startDate);
        const now = new Date();
        const diffDays = Math.floor(Math.abs(now - start) / (1000 * 60 * 60 * 24)) + 1;
        return Math.min(diffDays, 90);
    }

    render() {
        const currentDay = this.getCurrentDay();
        const mission = curriculumEngine.getMission(currentDay, 'ai');

        if (!mission) {
            return `
                <div class="view-container">
                    <h1>Akademik AI</h1>
                    <p>${currentDay}-kun uchun vazifa topilmadi.</p>
                </div>
            `;
        }

        const isDone = mission.isCompleted;

        return `
            <div class="view-container animate-in">
                <header class="view-header">
                    <h1>Akademik AI <span class="text-gradient">${currentDay}-Kun</span></h1>
                    <p class="subtitle">AI vositalari, Ilmiy maqolalar va Texnik dasturlar</p>
                </header>

                <div class="mission-details-card">
                    <div class="mission-header" style="border-bottom: 1px solid var(--border-color); padding-bottom: 16px; margin-bottom: 16px;">
                        <h2>${mission.title}</h2>
                        <span class="badge badge-xp">+${mission.xpReward} Ball</span>
                    </div>
                    
                    <div class="mission-content" style="margin-bottom: 24px; line-height: 1.6;">
                        <h3>Vazifa Tafsiloti</h3>
                        <p>${mission.description || 'Bugungi AI vazifasini yakunlang.'}</p>
                    </div>

                    ${isDone ? `
                        <div class="success-banner" style="padding: 16px; background: rgba(34, 197, 94, 0.1); border: 1px solid var(--accent-success); border-radius: 12px; text-align: center; color: var(--accent-success);">
                            <strong>✓ Vazifa Bajarildi</strong>
                            <p style="margin-top: 8px; font-size: 0.9em; opacity: 0.8;">Bajarilgan vaqt: ${new Date(mission.completedAt).toLocaleString()}</p>
                        </div>
                    ` : `
                        <button class="btn btn-primary btn-large complete-btn" style="width: 100%" data-mission-id="${mission.id}" data-day="${currentDay}" data-track="ai">
                            Bajarildi deb belgilash
                        </button>
                    `}
                </div>

                <!-- Academic AI Roadmap -->
                <div class="roadmap-preview" style="margin-top: 32px;">
                    <h3>AI Yo'l xaritasi</h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px; margin-top: 16px;">
                        <div style="padding: 12px; background: var(--card-bg); border-radius: 8px; border-left: 4px solid var(--accent-warning);">1-15 kunlar: SEO</div>
                        <div style="padding: 12px; background: var(--card-bg); border-radius: 8px; border-left: 4px solid var(--accent-warning);">16-30 kunlar: Kontent Yaratish</div>
                        <div style="padding: 12px; background: var(--card-bg); border-radius: 8px; border-left: 4px solid var(--accent-warning);">31-45 kunlar: Marketing</div>
                        <div style="padding: 12px; background: var(--card-bg); border-radius: 8px; border-left: 4px solid var(--accent-warning);">46-60 kunlar: Analitika</div>
                        <div style="padding: 12px; background: var(--card-bg); border-radius: 8px; border-left: 4px solid var(--accent-warning);">61-75 kunlar: Monetizatsiya</div>
                        <div style="padding: 12px; background: var(--card-bg); border-radius: 8px; border-left: 4px solid var(--accent-warning);">76-90 kunlar: Qo'shimcha Imkoniyatlar</div>
                    </div>
                </div>
            </div>
        `;
    }

    afterRender() {
        const completeBtn = document.querySelector('.complete-btn');
        if (completeBtn) {
            completeBtn.addEventListener('click', (e) => {
                const missionId = e.currentTarget.getAttribute('data-mission-id');
                const day = parseInt(e.currentTarget.getAttribute('data-day'), 10);
                const trackId = e.currentTarget.getAttribute('data-track');
                
                progressEngine.completeMission(missionId, day, trackId);
            });
        }

        if (!this.progressListener) {
            this.progressListener = () => {
                const container = document.getElementById('app-content');
                if (container) {
                    const scrollPos = container.scrollTop;
                    container.innerHTML = this.render();
                    this.afterRender();
                    container.scrollTop = scrollPos;
                }
            };
            progressEngine.addEventListener('progressUpdated', this.progressListener);
        }
    }

    destroy() {
        if (this.progressListener) {
            progressEngine.removeEventListener('progressUpdated', this.progressListener);
            this.progressListener = null;
        }
    }
}
