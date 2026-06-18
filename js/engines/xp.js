import { state } from '../core/state.js';

const XP_REWARDS = {
    backend: 20,
    english: 10,
    ai: 15
};

const DAILY_BONUS_XP = 25;
const WEEKLY_BONUS_XP = 100;

class XPEngine extends EventTarget {
    constructor() {
        super();
        
        // Ensure state has xp initialized just in case it's an old save
        const currentState = state.getState();
        if (!currentState.xp) {
            state.update('xp', { total: 0, history: [] });
        }
    }

    /**
     * Internal method to add XP and record it in history
     */
    _addXP(amount, source, type) {
        const currentXpState = state.getState().xp || { total: 0, history: [] };
        
        const newHistoryEntry = {
            amount,
            source,
            type,
            timestamp: new Date().toISOString()
        };

        const newTotal = currentXpState.total + amount;
        const newHistory = [...currentXpState.history, newHistoryEntry];

        state.update('xp', {
            total: newTotal,
            history: newHistory
        });

        // Optional: keep user.totalXp in sync for backwards compatibility
        const currentUserState = state.getState().user;
        state.update('user', {
            ...currentUserState,
            totalXp: newTotal
        });

        this.dispatchEvent(new CustomEvent('xpUpdated', { 
            detail: { total: newTotal, added: amount, source, type } 
        }));
        
        console.log(`XP Awarded: +${amount} for ${source} (${type})`);
        return newTotal;
    }

    /**
     * Award XP for completing a mission
     */
    awardMissionXP(trackName, missionId) {
        const amount = XP_REWARDS[trackName];
        if (!amount) {
            console.error(`Unknown track name: ${trackName}`);
            return false;
        }

        // Check if this mission XP has already been awarded
        const history = state.getState().xp?.history || [];
        const alreadyAwarded = history.some(entry => 
            entry.type === 'mission' && entry.source === missionId
        );

        if (alreadyAwarded) {
            return false;
        }

        this._addXP(amount, missionId, 'mission');
        return true;
    }

    /**
     * Award daily bonus for completing all missions in a day
     */
    awardDailyBonus(day) {
        const source = `day-${day}`;
        
        // Check if already awarded
        const history = state.getState().xp?.history || [];
        const alreadyAwarded = history.some(entry => 
            entry.type === 'daily_bonus' && entry.source === source
        );

        if (alreadyAwarded) {
            return false;
        }

        this._addXP(DAILY_BONUS_XP, source, 'daily_bonus');
        return true;
    }

    /**
     * Award weekly bonus for completing a full week (7 consecutive days)
     */
    awardWeeklyBonus(weekNumber) {
        const source = `week-${weekNumber}`;
        
        // Check if already awarded
        const history = state.getState().xp?.history || [];
        const alreadyAwarded = history.some(entry => 
            entry.type === 'weekly_bonus' && entry.source === source
        );

        if (alreadyAwarded) {
            return false;
        }

        this._addXP(WEEKLY_BONUS_XP, source, 'weekly_bonus');
        return true;
    }

    /**
     * Get current total XP
     */
    getTotalXP() {
        return state.getState().xp?.total || 0;
    }
}

export const xpEngine = new XPEngine();
