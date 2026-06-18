import { state } from '../core/state.js';

class StreakEngine extends EventTarget {
    constructor() {
        super();
        this._ensureState();
    }

    _ensureState() {
        if (!state.getState().streak) {
            state.update('streak', {
                current: 0,
                longest: 0,
                lastCompletionDate: null,
                missedDays: 0,
                freezes: 0
            });
        }
    }

    _getMidnight(dateStr) {
        if (!dateStr) return null;
        const d = new Date(dateStr);
        d.setHours(0, 0, 0, 0);
        return d;
    }

    updateStreak() {
        this._ensureState();
        const streakState = state.getState().streak;
        const today = new Date();
        const todayMidnight = this._getMidnight(today.toISOString());
        
        if (!streakState.lastCompletionDate) {
            // First time completing a mission
            this._saveStreakState({
                ...streakState,
                current: 1,
                longest: 1,
                lastCompletionDate: today.toISOString()
            });
            this.dispatchEvent(new CustomEvent('streakUpdated', { detail: { current: 1 } }));
            this.dispatchEvent(new CustomEvent('newRecord', { detail: { longest: 1 } }));
            return;
        }

        const lastDate = this._getMidnight(streakState.lastCompletionDate);
        const diffTime = todayMidnight - lastDate;
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            // Already completed a mission today
            return;
        }

        let newCurrent = streakState.current;
        let newLongest = streakState.longest;
        let newFreezes = streakState.freezes;
        let newMissedDays = streakState.missedDays;
        
        let streakBroken = false;
        let newRecord = false;

        if (diffDays === 1) {
            // Consecutive day
            newCurrent += 1;
        } else if (diffDays > 1) {
            // Missed days
            const daysMissed = diffDays - 1;
            newMissedDays += daysMissed;
            
            if (newFreezes >= daysMissed) {
                // Have enough freezes
                newFreezes -= daysMissed;
                newCurrent += 1; // Increment for today
            } else {
                // Not enough freezes, streak broken
                streakBroken = true;
                newCurrent = 1;
            }
        }

        if (newCurrent > newLongest) {
            newLongest = newCurrent;
            newRecord = true;
        }

        // Add freeze for every 14 days of streak (optional rule based on architecture docs)
        if (newCurrent % 14 === 0 && !streakBroken) {
            newFreezes += 1;
        }

        this._saveStreakState({
            current: newCurrent,
            longest: newLongest,
            lastCompletionDate: today.toISOString(),
            missedDays: newMissedDays,
            freezes: newFreezes
        });

        this.dispatchEvent(new CustomEvent('streakUpdated', { detail: { current: newCurrent } }));
        
        if (streakBroken) {
            this.dispatchEvent(new CustomEvent('streakBroken'));
        }
        
        if (newRecord) {
            this.dispatchEvent(new CustomEvent('newRecord', { detail: { longest: newLongest } }));
        }
    }

    _saveStreakState(newState) {
        state.update('streak', newState);
        
        // Backwards compatibility for dashboard
        const userState = state.getState().user;
        state.update('user', {
            ...userState,
            currentStreak: newState.current,
            maxStreak: newState.longest
        });
    }

    getCurrentStreak() {
        return state.getState().streak?.current || 0;
    }

    getLongestStreak() {
        return state.getState().streak?.longest || 0;
    }

    hasFreeze() {
        return (state.getState().streak?.freezes || 0) > 0;
    }

    useFreeze() {
        const streakState = state.getState().streak;
        if (streakState && streakState.freezes > 0) {
            this._saveStreakState({
                ...streakState,
                freezes: streakState.freezes - 1
            });
            return true;
        }
        return false;
    }
}

export const streakEngine = new StreakEngine();
