// Navigation Component Definition
export const NavComponent = (currentPath) => {
    const navItems = [
        { path: '#/dashboard', icon: '🏠', label: 'Asosiy' },
        { path: '#/analytics', icon: '📊', label: 'Tahlil' },
        { path: '#/portfolio', icon: '📁', label: 'Yutuqlar' },
        { path: '#/journal', icon: '📓', label: 'Kundalik' },
        { path: '#/settings', icon: '⚙️', label: 'Sozlamalar' }
    ];

    const isCurrent = (path) => currentPath === path;

    return `
        <!-- Desktop App Logo Area -->
        <div class="desktop-only" style="padding: 0 16px 32px 16px; font-weight: 800; font-size: 18px; letter-spacing: -0.5px; display: flex; align-items: center; gap: 8px;">
            <div style="width: 24px; height: 24px; border-radius: 6px; background: var(--gradient-primary); display: flex; align-items: center; justify-content: center; color: white; font-size: 12px;">90</div>
            Mission 90
        </div>
        
        ${navItems.map(item => `
            <a href="${item.path}" class="nav-item ${isCurrent(item.path) ? 'active' : ''}">
                ${item.icon}
                <span>${item.label}</span>
            </a>
        `).join('')}
    `;
};
