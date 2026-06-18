// Time Engine — O'quv Vaqti Boshqaruv Tizimi
// Singleton pattern, EventTarget asosida (XP Engine bilan bir xil pattern)

import { state } from '../core/state.js';

// Kunlik o'quv taqsimoti (foizda)
const TRACK_DISTRIBUTION = {
    backend: 0.70,
    english: 0.20,
    ai: 0.10
};

// Kunlik maqsad (daqiqalarda)
const DAILY_TARGET_MINUTES = 140; // 2 soat 20 daqiqa

// Vaqt asosidagi yutuqlar (soatlarda)
const TIME_ACHIEVEMENTS = [
    { id: 'time_1h',   hours: 1,   icon: '⏱️', title: 'Birinchi Soat',       desc: '1 soat o\'qish' },
    { id: 'time_10h',  hours: 10,  icon: '🕐', title: '10 Soat Ustasi',      desc: '10 soat o\'qish' },
    { id: 'time_25h',  hours: 25,  icon: '📚', title: '25 Soat Mutaxassisi', desc: '25 soat o\'qish' },
    { id: 'time_50h',  hours: 50,  icon: '🎯', title: '50 Soat Qahramon',    desc: '50 soat o\'qish' },
    { id: 'time_100h', hours: 100, icon: '🏅', title: '100 Soat Legend',     desc: '100 soat o\'qish' },
    { id: 'time_500h', hours: 500, icon: '👑', title: '500 Soat Grandmaster',desc: '500 soat o\'qish' }
];

class TimeEngine extends EventTarget {
    constructor() {
        super();
        this._timerInterval = null;
        this._restoreActiveTimer();
    }

    // ─── JADVAL (SCHEDULE) ─────────────────────────────

    /**
     * Bugungi kunlik jadval generatsiyasi
     * @param {number} startHour — Boshlanish soati (default: 18)
     * @returns {Array} — [{ track, trackName, start, end, minutes }]
     */
    getDailySchedule(startHour) {
        const hour = startHour || state.getState().settings?.studyStartHour || 18;
        const totalMinutes = DAILY_TARGET_MINUTES;

        const tracks = [
            { track: 'backend', trackName: 'Backend Muhandisligi', minutes: Math.round(totalMinutes * TRACK_DISTRIBUTION.backend) },
            { track: 'english', trackName: 'Ingliz Tili',          minutes: Math.round(totalMinutes * TRACK_DISTRIBUTION.english) },
            { track: 'ai',      trackName: 'Akademik AI',          minutes: Math.round(totalMinutes * TRACK_DISTRIBUTION.ai) }
        ];

        let currentMinutes = hour * 60;
        return tracks.map(t => {
            const startMin = currentMinutes;
            const endMin = startMin + t.minutes;
            currentMinutes = endMin;
            return {
                ...t,
                start: this._formatTime(startMin),
                end: this._formatTime(endMin)
            };
        });
    }

    _formatTime(totalMinutes) {
        const h = Math.floor(totalMinutes / 60);
        const m = totalMinutes % 60;
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    }

    // ─── KUNLIK MAQSAD ────────────────────────────────

    getDailyTargetMinutes() {
        return DAILY_TARGET_MINUTES;
    }

    /**
     * Bugungi o'qilgan daqiqalar
     */
    getTodayStudiedMinutes() {
        const today = new Date().toISOString().split('T')[0];
        const sessions = state.getState().timeSessions || [];
        return sessions
            .filter(s => s.date === today)
            .reduce((sum, s) => sum + (s.duration || 0), 0);
    }

    getTodayProgress() {
        const studied = this.getTodayStudiedMinutes();
        const target = DAILY_TARGET_MINUTES;
        return {
            target,
            studied,
            remaining: Math.max(0, target - studied),
            percent: Math.min(100, Math.round((studied / target) * 100))
        };
    }

    // ─── TAYMER (TIMER) ────────────────────────────────

    /**
     * Faol taymer holatidan tiklash (sahifa yangilanganda)
     */
    _restoreActiveTimer() {
        const activeTimer = state.getState().activeTimer;
        if (activeTimer && !activeTimer.isPaused) {
            // Sahifa qayta yuklangandan beri o'tgan vaqtni hisoblash
            const elapsed = activeTimer.elapsed + (Date.now() - activeTimer.startTime);
            this._startTicking(activeTimer.track, elapsed);
        }
    }

    startTimer(track) {
        // Agar taymer allaqachon ishlayotgan bo'lsa, avval to'xtatish kerak
        if (this._timerInterval) {
            this.stopTimer();
        }

        const now = Date.now();
        state.update('activeTimer', {
            track,
            startTime: now,
            elapsed: 0,
            isPaused: false,
            pausedAt: null
        });

        this._startTicking(track, 0);
    }

    pauseTimer() {
        const timer = state.getState().activeTimer;
        if (!timer || timer.isPaused) return;

        clearInterval(this._timerInterval);
        this._timerInterval = null;

        const elapsed = timer.elapsed + (Date.now() - timer.startTime);
        state.update('activeTimer', {
            ...timer,
            elapsed,
            isPaused: true,
            pausedAt: Date.now()
        });

        this.dispatchEvent(new CustomEvent('timerUpdated', {
            detail: { status: 'paused', track: timer.track, elapsed }
        }));
    }

    resumeTimer() {
        const timer = state.getState().activeTimer;
        if (!timer || !timer.isPaused) return;

        state.update('activeTimer', {
            ...timer,
            startTime: Date.now(),
            isPaused: false,
            pausedAt: null
        });

        this._startTicking(timer.track, timer.elapsed);
    }

    stopTimer() {
        const timer = state.getState().activeTimer;
        if (!timer) return;

        clearInterval(this._timerInterval);
        this._timerInterval = null;

        const elapsed = timer.isPaused
            ? timer.elapsed
            : timer.elapsed + (Date.now() - timer.startTime);

        const durationMinutes = Math.round(elapsed / 60000);

        // Faqat 1 daqiqadan ortiq bo'lsa saqlash
        if (durationMinutes >= 1) {
            this._saveSession(timer.track, durationMinutes);
        }

        state.update('activeTimer', null);

        this.dispatchEvent(new CustomEvent('timerUpdated', {
            detail: { status: 'stopped', track: timer.track, elapsed, durationMinutes }
        }));
    }

    _startTicking(track, initialElapsed) {
        const startTime = Date.now();

        this._timerInterval = setInterval(() => {
            const elapsed = initialElapsed + (Date.now() - startTime);
            this.dispatchEvent(new CustomEvent('timerUpdated', {
                detail: { status: 'running', track, elapsed }
            }));
        }, 1000);
    }

    getActiveTimer() {
        const timer = state.getState().activeTimer;
        if (!timer) return null;

        const elapsed = timer.isPaused
            ? timer.elapsed
            : timer.elapsed + (Date.now() - timer.startTime);

        return { ...timer, elapsed };
    }

    // ─── SESSIYA SAQLASH ──────────────────────────────

    _saveSession(track, durationMinutes) {
        const sessions = state.getState().timeSessions || [];
        const newSession = {
            id: Date.now().toString(),
            track,
            duration: durationMinutes,
            date: new Date().toISOString().split('T')[0],
            startTime: new Date().toISOString()
        };

        state.update('timeSessions', [...sessions, newSession]);

        this.dispatchEvent(new CustomEvent('sessionSaved', {
            detail: newSession
        }));
    }

    // ─── STATISTIKA ───────────────────────────────────

    /**
     * Umumiy soatlar (barcha vaqt uchun)
     */
    getTotalHours() {
        const sessions = state.getState().timeSessions || [];
        const totalMin = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
        return Math.round(totalMin / 6) / 10; // 1 ta kasr
    }

    /**
     * Yo'nalish bo'yicha soatlar
     */
    getTrackHours(track) {
        const sessions = state.getState().timeSessions || [];
        const totalMin = sessions
            .filter(s => s.track === track)
            .reduce((sum, s) => sum + (s.duration || 0), 0);
        return Math.round(totalMin / 6) / 10;
    }

    /**
     * Haftalik soatlar (joriy hafta, Dushanba-Yakshanba)
     */
    getWeeklyHours() {
        const now = new Date();
        const day = now.getDay();
        const mondayOffset = day === 0 ? 6 : day - 1;
        const monday = new Date(now);
        monday.setDate(now.getDate() - mondayOffset);
        monday.setHours(0, 0, 0, 0);

        const sessions = state.getState().timeSessions || [];
        const weekSessions = sessions.filter(s => new Date(s.date) >= monday);

        const result = { backend: 0, english: 0, ai: 0, total: 0 };
        weekSessions.forEach(s => {
            const hours = Math.round((s.duration || 0) / 6) / 10;
            if (result.hasOwnProperty(s.track)) {
                result[s.track] += hours;
            }
            result.total += hours;
        });

        // Yaxlitlash
        Object.keys(result).forEach(k => result[k] = Math.round(result[k] * 10) / 10);
        return result;
    }

    /**
     * Oylik soatlar (joriy oy)
     */
    getMonthlyHours() {
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];

        const sessions = state.getState().timeSessions || [];
        const monthSessions = sessions.filter(s => s.date >= monthStart);

        const totalMin = monthSessions.reduce((sum, s) => sum + (s.duration || 0), 0);
        return Math.round(totalMin / 6) / 10;
    }

    /**
     * Eng ko'p o'rganilgan yo'nalish
     */
    getMostStudiedTrack() {
        const tracks = ['backend', 'english', 'ai'];
        const trackNames = { backend: 'Backend', english: 'Ingliz Tili', ai: 'Akademik AI' };
        let maxHours = 0;
        let maxTrack = 'backend';

        tracks.forEach(t => {
            const h = this.getTrackHours(t);
            if (h > maxHours) {
                maxHours = h;
                maxTrack = t;
            }
        });

        return { track: maxTrack, name: trackNames[maxTrack], hours: maxHours };
    }

    // ─── YUTUQLAR ─────────────────────────────────────

    getTimeAchievements() {
        const totalHours = this.getTotalHours();
        return TIME_ACHIEVEMENTS.map(a => ({
            ...a,
            unlocked: totalHours >= a.hours
        }));
    }

    // ─── YORDAMCHI ────────────────────────────────────

    /**
     * Millisoniyalarni "Xs Yd" formatiga o'girish
     */
    static formatElapsed(ms) {
        const totalSeconds = Math.floor(ms / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        if (hours > 0) {
            return `${hours}s ${String(minutes).padStart(2, '0')}d ${String(seconds).padStart(2, '0')}s`;
        }
        return `${String(minutes).padStart(2, '0')}d ${String(seconds).padStart(2, '0')}s`;
    }

    /**
     * Daqiqalarni "Xs Yd" formatiga o'girish
     */
    static formatMinutes(minutes) {
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        if (h > 0) {
            return `${h}s ${m}d`;
        }
        return `${m}d`;
    }
}

export const timeEngine = new TimeEngine();
