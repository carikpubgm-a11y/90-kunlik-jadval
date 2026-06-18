import { progressEngine } from '../engines/progress.js';
import { xpEngine } from '../engines/xp.js';
import { streakEngine } from '../engines/streak.js';
import { levelEngine } from '../engines/level.js';
import { state } from '../core/state.js';

export class PortfolioView {
    constructor() {
        this.title = 'Yutuqlar';
    }

    getTrackProgress(trackName) {
        const progress = state.getState().progress || {};
        const completed = Object.values(progress).filter(m => m.track === trackName && m.status === 'completed').length;
        const total = 90;
        return { completed, total, percent: Math.round((completed / total) * 100) };
    }

    render() {
        const totalProgress = progressEngine.getTotalCompletionPercent();
        const backendProgress = this.getTrackProgress('backend');
        const englishProgress = this.getTrackProgress('english');
        const aiProgress = this.getTrackProgress('ai');

        return `
            <div class="view-container animate-in">
                <header class="view-header" style="text-align: center; padding-top: 32px;">
                    <div style="width: 100px; height: 100px; border-radius: 50%; background: var(--gradient-primary); margin: 0 auto 16px; display: flex; align-items: center; justify-content: center; font-size: 32px; color: white;">
                        ${state.getState().user.name.charAt(0)}
                    </div>
                    <h1>${state.getState().user.name}ning <span class="text-gradient">Yutuqlari</span></h1>
                    <p class="subtitle">${levelEngine.getCurrentLevel()}-Darajali Backend Muhandisi</p>
                </header>

                <div class="stats-grid" style="margin-bottom: 32px;">
                    <div class="stat-card" style="text-align: center;">
                        <span style="font-size: 24px; font-weight: 700; color: var(--accent-primary);">${xpEngine.getTotalXP()}</span>
                        <span style="display: block; font-size: 12px; opacity: 0.7;">Umumiy Ball</span>
                    </div>
                    <div class="stat-card" style="text-align: center;">
                        <span style="font-size: 24px; font-weight: 700; color: var(--accent-warning);">${streakEngine.getLongestStreak()}</span>
                        <span style="display: block; font-size: 12px; opacity: 0.7;">Eng Uzun Davomiylik</span>
                    </div>
                    <div class="stat-card" style="text-align: center;">
                        <span style="font-size: 24px; font-weight: 700; color: var(--accent-success);">${totalProgress}%</span>
                        <span style="display: block; font-size: 12px; opacity: 0.7;">Bajarilish</span>
                    </div>
                </div>

                <div class="mission-details-card" style="margin-bottom: 32px;">
                    <h2>Qobiliyatlar Darajasi</h2>
                    
                    <div style="margin-top: 24px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                            <span>Backend Muhandisligi</span>
                            <span>${backendProgress.percent}%</span>
                        </div>
                        <div class="progress-bar-bg" style="height: 8px;">
                            <div class="progress-bar-fill" style="width: ${backendProgress.percent}%; background: var(--accent-primary);"></div>
                        </div>
                    </div>

                    <div style="margin-top: 24px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                            <span>Ingliz Tili Ustaligi</span>
                            <span>${englishProgress.percent}%</span>
                        </div>
                        <div class="progress-bar-bg" style="height: 8px;">
                            <div class="progress-bar-fill" style="width: ${englishProgress.percent}%; background: var(--accent-success);"></div>
                        </div>
                    </div>

                    <div style="margin-top: 24px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                            <span>Akademik Sun'iy Intellekt</span>
                            <span>${aiProgress.percent}%</span>
                        </div>
                        <div class="progress-bar-bg" style="height: 8px;">
                            <div class="progress-bar-fill" style="width: ${aiProgress.percent}%; background: var(--accent-warning);"></div>
                        </div>
                    </div>
                </div>

                <div class="mission-details-card">
                    <h2>Maxsus Yutuqlar</h2>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 16px;">
                        <div style="padding: 16px; background: var(--card-bg); border-radius: 12px; text-align: center; border: 1px solid ${levelEngine.getCurrentLevel() >= 5 ? 'var(--accent-warning)' : 'transparent'}; opacity: ${levelEngine.getCurrentLevel() >= 5 ? '1' : '0.5'};">
                            <div style="font-size: 32px; margin-bottom: 8px;">🌟</div>
                            <strong>Yarim Yo'l Ustasi</strong>
                            <p style="font-size: 12px; opacity: 0.8;">5-Darajaga erishing</p>
                        </div>
                        <div style="padding: 16px; background: var(--card-bg); border-radius: 12px; text-align: center; border: 1px solid ${streakEngine.getLongestStreak() >= 30 ? 'var(--accent-primary)' : 'transparent'}; opacity: ${streakEngine.getLongestStreak() >= 30 ? '1' : '0.5'};">
                            <div style="font-size: 32px; margin-bottom: 8px;">🔥</div>
                            <strong>To'xtatib Bo'lmas</strong>
                            <p style="font-size: 12px; opacity: 0.8;">30 Kunlik Davomiylik</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    afterRender() {}
    destroy() {}
}
