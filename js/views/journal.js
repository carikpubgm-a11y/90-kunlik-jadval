import { state } from '../core/state.js';

export class JournalView {
    constructor() {
        this.title = 'Kundalik';
    }

    render() {
        const journalEntries = state.getState().journal || [];
        const todayStr = new Date().toISOString().split('T')[0];
        const hasEntryToday = journalEntries.some(e => e.date === todayStr);

        return `
            <div class="view-container animate-in">
                <header class="view-header">
                    <h1>Kunlik <span class="text-gradient">Kundalik</span></h1>
                    <p class="subtitle">O'z ustingizda ishlash va maqsadlar qo'yish.</p>
                </header>

                ${hasEntryToday ? `
                    <div class="success-banner" style="padding: 16px; background: rgba(34, 197, 94, 0.1); border: 1px solid var(--accent-success); border-radius: 12px; margin-bottom: 32px; color: var(--accent-success);">
                        <strong>✓ Bugungi kundalik to'ldirildi!</strong>
                    </div>
                ` : `
                    <form id="journal-form" class="mission-details-card" style="margin-bottom: 32px; display: flex; flex-direction: column; gap: 16px;">
                        <div>
                            <label style="display: block; margin-bottom: 8px; font-weight: bold;">Kunlik Qaydlar</label>
                            <textarea name="notes" rows="3" style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid var(--border-color); background: var(--bg-color); color: var(--text-color);" required placeholder="Bugun nimani o'rgandingiz?"></textarea>
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 8px; font-weight: bold;">Yutuqlar</label>
                            <input type="text" name="wins" style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid var(--border-color); background: var(--bg-color); color: var(--text-color);" required placeholder="Nimalar yaxshi o'tdi?">
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 8px; font-weight: bold;">Muammolar</label>
                            <input type="text" name="problems" style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid var(--border-color); background: var(--bg-color); color: var(--text-color);" placeholder="Qanday qiyinchiliklarga duch keldingiz?">
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 8px; font-weight: bold;">Ertangi Maqsadlar</label>
                            <input type="text" name="goals" style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid var(--border-color); background: var(--bg-color); color: var(--text-color);" required placeholder="Ertaga nimalarga e'tibor qaratasiz?">
                        </div>
                        <button type="submit" class="btn btn-primary btn-large">Saqlash</button>
                    </form>
                `}

                <h2>Oldingi Qaydlar</h2>
                <div style="margin-top: 16px; display: flex; flex-direction: column; gap: 16px;">
                    ${journalEntries.length === 0 ? '<p style="opacity: 0.7;">Hali hech qanday qayd yo\'q. Bugundan boshlang!</p>' : 
                        journalEntries.slice().reverse().map(entry => `
                            <div class="mission-details-card" style="padding: 16px;">
                                <strong style="display: block; margin-bottom: 12px; border-bottom: 1px solid var(--border-color); padding-bottom: 8px;">${entry.date}</strong>
                                <p style="margin-bottom: 8px;"><strong>Qaydlar:</strong> ${entry.notes}</p>
                                <p style="margin-bottom: 8px;"><strong>Yutuqlar:</strong> ${entry.wins}</p>
                                <p style="margin-bottom: 8px;"><strong>Muammolar:</strong> ${entry.problems || 'Yo\'q'}</p>
                                <p><strong>Ertangi Maqsadlar:</strong> ${entry.goals}</p>
                            </div>
                        `).join('')
                    }
                </div>
            </div>
        `;
    }

    afterRender() {
        const form = document.getElementById('journal-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const formData = new FormData(form);
                const newEntry = {
                    id: Date.now().toString(),
                    date: new Date().toISOString().split('T')[0],
                    notes: formData.get('notes'),
                    wins: formData.get('wins'),
                    problems: formData.get('problems'),
                    goals: formData.get('goals')
                };

                const currentJournal = state.getState().journal || [];
                state.update('journal', [...currentJournal, newEntry]);
                
                // Re-render to show success and new entry
                const container = document.getElementById('app-content');
                if (container) {
                    const scrollPos = container.scrollTop;
                    container.innerHTML = this.render();
                    this.afterRender();
                    container.scrollTop = scrollPos;
                }
            });
        }
    }

    destroy() {}
}
