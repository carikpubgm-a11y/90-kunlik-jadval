import { state } from '../core/state.js';

export class SettingsView {
    constructor() {
        this.title = 'Sozlamalar';
    }

    render() {
        const currentTheme = state.getState().settings?.theme || 'dark';

        return `
            <div class="view-container animate-in">
                <header class="view-header">
                    <h1>Ilova <span class="text-gradient">Sozlamalari</span></h1>
                    <p class="subtitle">Ilovani o'zingizga moslashtiring va ma'lumotlarni boshqaring.</p>
                </header>

                <div class="mission-details-card" style="margin-bottom: 24px;">
                    <h2>Tashqi Ko'rinish</h2>
                    <div style="margin-top: 16px; display: flex; gap: 16px;">
                        <button class="btn ${currentTheme === 'dark' ? 'btn-primary' : ''} theme-btn" data-theme="dark">Tungi Rejim</button>
                        <button class="btn ${currentTheme === 'light' ? 'btn-primary' : ''} theme-btn" data-theme="light">Kunduzgi Rejim</button>
                    </div>
                </div>

                <div class="mission-details-card" style="margin-bottom: 24px;">
                    <h2>Ma'lumotlarni Boshqarish</h2>
                    <p style="opacity: 0.8; margin-bottom: 16px;">O'z yutuqlaringizni fayl sifatida saqlab oling yoki boshqa qurilmaga tiklang.</p>
                    <div style="display: flex; gap: 16px; margin-bottom: 24px;">
                        <button class="btn btn-primary" id="btn-export">Saqlab Olish (JSON)</button>
                        <label class="btn" style="cursor: pointer;">
                            Ma'lumotni Yuklash
                            <input type="file" id="input-import" accept=".json" style="display: none;">
                        </label>
                    </div>

                    <div style="padding-top: 24px; border-top: 1px solid var(--border-color);">
                        <h3 style="color: #ef4444; margin-bottom: 8px;">Xavfli Hudud</h3>
                        <p style="opacity: 0.8; margin-bottom: 16px;">Bu harakatni orqaga qaytarib bo'lmaydi. Barcha yutuqlaringiz o'chib ketadi.</p>
                        <button class="btn" id="btn-reset" style="border: 1px solid #ef4444; color: #ef4444;">Barchasini O'chirish (Reset)</button>
                    </div>
                </div>
            </div>
        `;
    }

    afterRender() {
        // Theme switching
        const themeBtns = document.querySelectorAll('.theme-btn');
        themeBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const newTheme = e.target.getAttribute('data-theme');
                state.updateNested('settings', 'theme', newTheme);
                document.documentElement.setAttribute('data-theme', newTheme);
                
                // Re-render to update active button class
                const container = document.getElementById('app-content');
                if (container) {
                    const scrollPos = container.scrollTop;
                    container.innerHTML = this.render();
                    this.afterRender();
                    container.scrollTop = scrollPos;
                }
            });
        });

        // Export Data
        const exportBtn = document.getElementById('btn-export');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                const data = state.exportData();
                const blob = new Blob([data], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `sardor_mission_90_backup_${new Date().toISOString().split('T')[0]}.json`;
                a.click();
                URL.revokeObjectURL(url);
            });
        }

        // Import Data
        const importInput = document.getElementById('input-import');
        if (importInput) {
            importInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (!file) return;

                const reader = new FileReader();
                reader.onload = (event) => {
                    const content = event.target.result;
                    if (state.importData(content)) {
                        alert('Ma\'lumot muvaffaqiyatli yuklandi!');
                        window.location.reload(); // Reload to refresh all engines safely
                    } else {
                        alert('Xatolik! Fayl buzilgan bo\'lishi mumkin.');
                    }
                };
                reader.readAsText(file);
            });
        }

        // Reset Data
        const resetBtn = document.getElementById('btn-reset');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                if (confirm('Rostdan ham BARCHA ma\'lumotlarni o\'chirib yubormoqchimisiz? Buni orqaga qaytarib bo\'lmaydi.')) {
                    localStorage.removeItem('sm90_state');
                    window.location.reload();
                }
            });
        }
    }

    destroy() {}
}
