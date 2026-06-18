import { state } from '../core/state.js';
import { progressEngine } from '../engines/progress.js';
import { xpEngine } from '../engines/xp.js';
import { streakEngine } from '../engines/streak.js';
import { levelEngine } from '../engines/level.js';

export class AnalyticsView {
    constructor() {
        this.title = 'Tahlillar';
    }

    generateHeatmap() {
        const progress = state.getState().progress || {};
        const daysMap = {};
        
        // Group completions by date string YYYY-MM-DD
        Object.values(progress).forEach(mission => {
            if (mission.status === 'completed' && mission.completedAt) {
                const date = mission.completedAt.split('T')[0];
                daysMap[date] = (daysMap[date] || 0) + 1;
            }
        });

        // Generate 90 days grid
        const userState = state.getState().user;
        const start = new Date(userState.startDate);
        let heatmapHTML = '';
        
        for (let i = 0; i < 90; i++) {
            const d = new Date(start);
            d.setDate(d.getDate() + i);
            const dateStr = d.toISOString().split('T')[0];
            const completions = daysMap[dateStr] || 0;
            
            let intensity = 'level-0';
            if (completions === 1) intensity = 'level-1';
            if (completions === 2) intensity = 'level-2';
            if (completions >= 3) intensity = 'level-3';
            
            heatmapHTML += `<div class="heatmap-cell ${intensity}" title="${dateStr}: ${completions} missions"></div>`;
        }

        return `
            <div class="heatmap-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(12px, 1fr)); gap: 4px; margin-top: 16px;">
                ${heatmapHTML}
            </div>
            <div class="heatmap-legend" style="display: flex; gap: 8px; margin-top: 12px; font-size: 12px; align-items: center; opacity: 0.8;">
                <span>Kamroq</span>
                <div class="heatmap-cell level-0" style="width: 12px; height: 12px; border-radius: 2px; background: rgba(255,255,255,0.05);"></div>
                <div class="heatmap-cell level-1" style="width: 12px; height: 12px; border-radius: 2px; background: rgba(34, 197, 94, 0.4);"></div>
                <div class="heatmap-cell level-2" style="width: 12px; height: 12px; border-radius: 2px; background: rgba(34, 197, 94, 0.7);"></div>
                <div class="heatmap-cell level-3" style="width: 12px; height: 12px; border-radius: 2px; background: rgba(34, 197, 94, 1);"></div>
                <span>Ko'proq</span>
            </div>
        `;
    }

    render() {
        const totalProgress = progressEngine.getTotalCompletionPercent();
        const totalXp = xpEngine.getTotalXP();
        const level = levelEngine.getCurrentLevel();
        const levelProgress = levelEngine.getLevelProgressPercent();
        const currentStreak = streakEngine.getCurrentStreak();
        const maxStreak = streakEngine.getLongestStreak();
        const completedMissions = progressEngine.getCompletedMissionsCount();
        const totalMissions = 90 * 3;
        const completionRate = ((completedMissions / totalMissions) * 100).toFixed(1);

        return `
            <div class="view-container animate-in">
                <header class="view-header">
                    <h1>Shaxsiy <span class="text-gradient">Tahlillar</span></h1>
                    <p class="subtitle">90 kunlik sayohatingiz haqida batafsil ma'lumot.</p>
                </header>

                <div class="stats-grid" style="margin-bottom: 32px;">
                    <div class="stat-card">
                        <div class="stat-info">
                            <span class="stat-label">Umumiy Bajarilganlar</span>
                            <span class="stat-value">${totalProgress}%</span>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-info">
                            <span class="stat-label">Bajarilish Ko'rsatkichi</span>
                            <span class="stat-value">${completionRate}%</span>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-info">
                            <span class="stat-label">Umumiy Ball</span>
                            <span class="stat-value">${totalXp}</span>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-info">
                            <span class="stat-label">Daraja</span>
                            <span class="stat-value">${level} <span style="font-size: 0.5em; font-weight: normal; opacity: 0.7">(${levelProgress}%)</span></span>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-info">
                            <span class="stat-label">Joriy Davomiylik</span>
                            <span class="stat-value">${currentStreak} 🔥</span>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-info">
                            <span class="stat-label">Eng Uzun Davomiylik</span>
                            <span class="stat-value">${maxStreak} 🏆</span>
                        </div>
                    </div>
                </div>

                <div class="mission-details-card" style="margin-bottom: 32px;">
                    <h2>90-Kunlik Faollik Xaritasi</h2>
                    ${this.generateHeatmap()}
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                    <div class="mission-details-card">
                        <h3>Haftalik Bajarishlar</h3>
                        <p style="margin-top: 12px; opacity: 0.8;">Haftada o'rtacha vazifa: ${Math.round(completedMissions / (90 / 7))}</p>
                    </div>
                    <div class="mission-details-card">
                        <h3>Oylik Bajarishlar</h3>
                        <p style="margin-top: 12px; opacity: 0.8;">Oyiga o'rtacha vazifa: ${Math.round(completedMissions / 3)}</p>
                    </div>
                </div>
            </div>
        `;
    }

    afterRender() {}
    destroy() {}
}
