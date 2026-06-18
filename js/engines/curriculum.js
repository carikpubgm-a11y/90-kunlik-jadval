import { state } from '../core/state.js';

class CurriculumEngine {
    constructor() {
        this.curriculumData = null;
        this.isLoaded = false;
        this.totalDays = 90;
    }

    /**
     * Initializes the engine by fetching the curriculum JSON.
     * Uses cache-busting in development, but relies on Service Worker in production.
     */
    async init() {
        if (this.isLoaded) return;
        
        try {
            const response = await fetch('./data/curriculum.json');
            if (!response.ok) throw new Error('Failed to load curriculum');
            
            this.curriculumData = await response.json();
            this.isLoaded = true;
            console.log('Curriculum Engine initialized.');
        } catch (error) {
            console.error('CurriculumEngine Error:', error);
            // Fallback empty curriculum to prevent UI crashes
            this.curriculumData = {};
        }
    }

    /**
     * Retrieves all tasks for a specific day.
     * @param {number} day - The day number (1-90)
     * @returns {Object|null} The day's tracks or null if not found
     */
    getDayData(day) {
        if (!this.isLoaded) {
            console.warn('CurriculumEngine: Data not loaded yet. Call init() first.');
            return null;
        }
        return this.curriculumData[day] || null;
    }

    /**
     * Returns a specific mission's details and injects its completion status.
     * @param {number} day 
     * @param {string} trackName - 'backend', 'english', or 'ai'
     */
    getMission(day, trackName) {
        const dayData = this.getDayData(day);
        if (!dayData || !dayData.tracks[trackName]) return null;

        const mission = dayData.tracks[trackName];
        const progressState = state.getState().progress || {};
        
        return {
            ...mission,
            isCompleted: progressState[mission.id]?.status === 'completed',
            completedAt: progressState[mission.id]?.completedAt || null
        };
    }

    /**
     * Marks a mission as completed in the global state (LocalStorage).
     * @param {string} missionId 
     * @param {number} xpReward 
     */
    markMissionCompleted(missionId, xpReward) {
        const progressState = state.getState().progress || {};
        
        // Prevent duplicate completions
        if (progressState[missionId]?.status === 'completed') {
            return false;
        }

        // Update progress state
        state.updateNested('progress', missionId, {
            status: 'completed',
            completedAt: new Date().toISOString()
        });

        // The XP addition will be handled by the XP Engine later, 
        // but the curriculum engine reliably sets the completion flag.
        
        return true;
    }

    /**
     * Checks if all missions for a specific day are completed.
     * @param {number} day 
     * @returns {boolean}
     */
    isDayCompleted(day) {
        const dayData = this.getDayData(day);
        if (!dayData) return false;

        const tracks = ['backend', 'english', 'ai'];
        return tracks.every(track => {
            const mission = this.getMission(day, track);
            return mission && mission.isCompleted;
        });
    }
}

// Export as a singleton
export const curriculumEngine = new CurriculumEngine();
