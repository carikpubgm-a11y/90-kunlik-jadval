// Core Application State Management
// Singleton pattern wrapping LocalStorage

const STORE_KEY = 'sm90_state';

const defaultState = {
    user: {
        name: 'Sardor',
        startDate: new Date().toISOString(),
        totalXp: 0,
        level: 1,
        currentStreak: 0,
        maxStreak: 0
    },
    settings: {
        theme: 'dark'
    },
    progress: {}, // Stores completed missions: { 'b_1': { status: 'completed', completedAt: '...' } }
    xp: {
        total: 0,
        history: []
    },
    streak: {
        current: 0,
        longest: 0,
        lastCompletionDate: null,
        missedDays: 0,
        freezes: 0
    },
    journal: []
};

class StateManager extends EventTarget {
    constructor() {
        super();
        this.state = this._loadState();
    }

    _loadState() {
        try {
            const saved = localStorage.getItem(STORE_KEY);
            return saved ? { ...defaultState, ...JSON.parse(saved) } : defaultState;
        } catch (e) {
            console.error("Failed to load state from LocalStorage", e);
            return defaultState;
        }
    }

    _saveState() {
        try {
            localStorage.setItem(STORE_KEY, JSON.stringify(this.state));
        } catch (e) {
            console.error("Failed to save state to LocalStorage", e);
        }
    }

    getState() {
        return this.state;
    }

    update(key, value) {
        this.state = {
            ...this.state,
            [key]: value
        };
        this._saveState();
        this.dispatchEvent(new CustomEvent('stateChange', { detail: { key, value } }));
    }
    
    updateNested(parentKey, childKey, value) {
        this.state[parentKey] = {
            ...this.state[parentKey],
            [childKey]: value
        };
        this._saveState();
        this.dispatchEvent(new CustomEvent('stateChange', { detail: { key: parentKey, value: this.state[parentKey] } }));
    }

    exportData() {
        return JSON.stringify(this.state);
    }

    importData(jsonData) {
        try {
            const parsed = JSON.parse(jsonData);
            if (!parsed || typeof parsed !== 'object') throw new Error('Invalid data format');
            
            // Basic validation to prevent corruption
            if (parsed.user && parsed.progress && parsed.xp) {
                this.state = { ...defaultState, ...parsed };
                this._saveState();
                this.dispatchEvent(new CustomEvent('stateChange', { detail: { key: 'all', value: this.state } }));
                return true;
            } else {
                throw new Error('Missing critical state properties');
            }
        } catch (e) {
            console.error('Data import failed:', e);
            return false;
        }
    }
}

export const state = new StateManager();
