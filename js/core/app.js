import { state } from './state.js';
import { Router } from './router.js';
import { renderNav, setupWindowResizeHandling } from '../utils/dom.js';

// Import Views
import { DashboardView } from '../views/dashboard.js';
import { BackendView } from '../views/backend.js';
import { EnglishView } from '../views/english.js';
import { AIView } from '../views/ai.js';
import { AnalyticsView } from '../views/analytics.js';
import { PortfolioView } from '../views/portfolio.js';
import { JournalView } from '../views/journal.js';
import { SettingsView } from '../views/settings.js';
import { curriculumEngine } from '../engines/curriculum.js';

class App {
    constructor() {
        this.navContainer = document.getElementById('main-nav');
        this.router = null;
    }

    async init() {
        console.log('App initialization started...');
        
        // Setup initial theme based on state
        const settings = state.getState().settings;
        document.documentElement.setAttribute('data-theme', settings.theme || 'dark');

        // Initialize Curriculum Engine
        await curriculumEngine.init();

        // Setup routing
        const routes = {
            '#/dashboard': DashboardView,
            '#/backend': BackendView,
            '#/english': EnglishView,
            '#/ai': AIView,
            '#/analytics': AnalyticsView,
            '#/portfolio': PortfolioView,
            '#/journal': JournalView,
            '#/settings': SettingsView,
        };
        
        this.router = new Router(routes, '#/dashboard');
        
        // Listen to route changes to update navigation active state
        window.addEventListener('routeChange', (e) => {
            renderNav(this.navContainer, e.detail.path);
        });

        // Initial renders
        this.router.init();
        setupWindowResizeHandling();
    }
}

// Bootstrap application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    app.init();
});
