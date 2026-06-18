import { xpEngine } from './xp.js';

const LEVEL_TABLE = [
    { level: 1, xp: 0 },
    { level: 2, xp: 100 },
    { level: 3, xp: 250 },
    { level: 4, xp: 450 },
    { level: 5, xp: 700 },
    { level: 6, xp: 1000 },
    { level: 7, xp: 1350 },
    { level: 8, xp: 1750 },
    { level: 9, xp: 2200 },
    { level: 10, xp: 2700 }
];

class LevelEngine extends EventTarget {
    constructor() {
        super();
        this.currentLevel = this.calculateLevel(xpEngine.getTotalXP());
        
        // Listen to XP updates to detect level ups
        xpEngine.addEventListener('xpUpdated', (e) => {
            const newTotalXP = e.detail.total;
            this.checkLevelUp(newTotalXP);
        });
    }

    calculateLevel(totalXP) {
        let currentLevel = 1;
        for (let i = 0; i < LEVEL_TABLE.length; i++) {
            if (totalXP >= LEVEL_TABLE[i].xp) {
                currentLevel = LEVEL_TABLE[i].level;
            } else {
                break;
            }
        }
        return currentLevel;
    }

    checkLevelUp(totalXP) {
        const newLevel = this.calculateLevel(totalXP);
        if (newLevel > this.currentLevel) {
            const oldLevel = this.currentLevel;
            this.currentLevel = newLevel;
            this.dispatchEvent(new CustomEvent('levelUp', {
                detail: { level: newLevel, oldLevel: oldLevel }
            }));
            console.log(`Level Up! Reached Level ${newLevel}`);
        }
    }

    getCurrentLevel() {
        return this.calculateLevel(xpEngine.getTotalXP());
    }

    getNextLevel() {
        const currentLevel = this.getCurrentLevel();
        if (currentLevel >= 10) return null; // Max level
        
        return LEVEL_TABLE.find(l => l.level === currentLevel + 1);
    }

    getXPToNextLevel() {
        const totalXP = xpEngine.getTotalXP();
        const nextLevelInfo = this.getNextLevel();
        
        if (!nextLevelInfo) return 0; // Max level reached
        
        return nextLevelInfo.xp - totalXP;
    }

    getLevelProgressPercent() {
        const totalXP = xpEngine.getTotalXP();
        const currentLevelInfo = LEVEL_TABLE.find(l => l.level === this.getCurrentLevel());
        const nextLevelInfo = this.getNextLevel();

        if (!nextLevelInfo) return 100;

        const xpInCurrentLevel = totalXP - currentLevelInfo.xp;
        const xpRequiredForNext = nextLevelInfo.xp - currentLevelInfo.xp;
        
        const percent = (xpInCurrentLevel / xpRequiredForNext) * 100;
        return Math.min(Math.max(Math.round(percent), 0), 100);
    }
}

export const levelEngine = new LevelEngine();
