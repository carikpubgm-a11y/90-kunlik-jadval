import { state } from '../core/state.js';
import { curriculumEngine } from './curriculum.js';
import { xpEngine } from './xp.js';
import { streakEngine } from './streak.js';

class ProgressEngine extends EventTarget {
    constructor() {
        super();
        // Forward state change events related to progress
        state.addEventListener('stateChange', (e) => {
            if (e.detail.key === 'progress') {
                this.dispatchEvent(new CustomEvent('progressUpdated', { detail: e.detail.value }));
            }
        });
    }

    /**
     * Track mission completion
     */
    completeMission(missionId, day, trackName) {
        const mission = curriculumEngine.getMission(day, trackName);
        if (!mission) {
            console.error(`Mission not found: ${trackName} on Day ${day}`);
            return false;
        }

        const progressState = state.getState().progress || {};
        
        if (progressState[missionId]?.status === 'completed') {
            return false; // Already completed
        }

        // Store in LocalStorage via state manager
        state.updateNested('progress', missionId, {
            status: 'completed',
            completedAt: new Date().toISOString(),
            day: day,
            track: trackName
        });
        
        // Update Streak
        streakEngine.updateStreak();

        // Award Mission XP
        xpEngine.awardMissionXP(trackName, missionId);

        // Check Daily Bonus
        if (this.isDayCompleted(day)) {
            xpEngine.awardDailyBonus(day);
        }

        // Check Weekly Bonus
        const weekNumber = Math.ceil(day / 7);
        const weekStats = this.getWeeklyCompletion(weekNumber);
        if (weekStats.isCompleted) {
            xpEngine.awardWeeklyBonus(weekNumber);
        }

        return true;
    }

    /**
     * Track daily completion
     */
    isDayCompleted(day) {
        return curriculumEngine.isDayCompleted(day);
    }
    
    getDailyCompletionStats(day) {
        const tracks = ['backend', 'english', 'ai'];
        let completed = 0;
        tracks.forEach(track => {
            const mission = curriculumEngine.getMission(day, track);
            if (mission && mission.isCompleted) completed++;
        });
        return { completed, total: tracks.length };
    }

    /**
     * Track weekly completion
     */
    getWeeklyCompletion(weekNumber) {
        const startDay = (weekNumber - 1) * 7 + 1;
        const endDay = Math.min(startDay + 6, 90);
        let completedDays = 0;
        let totalDays = endDay - startDay + 1;

        for (let day = startDay; day <= endDay; day++) {
            if (this.isDayCompleted(day)) {
                completedDays++;
            }
        }
        return { completedDays, totalDays, isCompleted: completedDays === totalDays };
    }

    /**
     * Track completed missions count
     */
    getCompletedMissionsCount() {
        const progressState = state.getState().progress || {};
        return Object.keys(progressState).filter(id => progressState[id].status === 'completed').length;
    }

    /**
     * Track total completion %
     */
    getTotalCompletionPercent() {
        const totalMissions = 90 * 3; // 90 days, 3 missions per day
        const completed = this.getCompletedMissionsCount();
        return Math.round((completed / totalMissions) * 100);
    }

    /**
     * Track remaining missions count
     */
    getRemainingMissionsCount() {
        const totalMissions = 90 * 3;
        return totalMissions - this.getCompletedMissionsCount();
    }
}

// Export as a singleton
export const progressEngine = new ProgressEngine();
