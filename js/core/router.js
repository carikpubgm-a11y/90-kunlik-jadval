// Hash based router for SPA navigation

export class Router {
    constructor(routes, defaultRoute = '#/dashboard') {
        this.routes = routes;
        this.defaultRoute = defaultRoute;
        this.currentView = null;
        this.contentContainer = document.getElementById('app-content');
        
        window.addEventListener('hashchange', () => this.handleRoute());
    }

    init() {
        if (!window.location.hash) {
            window.location.hash = this.defaultRoute;
        } else {
            this.handleRoute();
        }
    }

    handleRoute() {
        const hash = window.location.hash || this.defaultRoute;
        const viewClass = this.routes[hash] || this.routes[this.defaultRoute];
        
        if (this.currentView && this.currentView.destroy) {
            this.currentView.destroy();
        }

        // Initialize new view
        this.currentView = new viewClass();
        
        // Render
        this.contentContainer.innerHTML = this.currentView.render();
        
        // Post-render bindings
        if (this.currentView.afterRender) {
            this.currentView.afterRender();
        }
        
        // Dispatch route change event for components like Nav to listen to
        window.dispatchEvent(new CustomEvent('routeChange', { detail: { path: hash } }));
    }
    
    static navigate(path) {
        window.location.hash = path;
    }
}
