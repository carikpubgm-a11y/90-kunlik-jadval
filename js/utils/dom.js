export const renderNav = (navContainer, currentPath) => {
    import('../components/nav.js').then(({ NavComponent }) => {
        navContainer.innerHTML = NavComponent(currentPath);
    });
};

// Add desktop-only utility class handling
export const setupWindowResizeHandling = () => {
    const handleResize = () => {
        if (window.innerWidth < 768) {
            document.querySelectorAll('.desktop-only').forEach(el => el.style.display = 'none');
        } else {
            document.querySelectorAll('.desktop-only').forEach(el => el.style.display = '');
        }
    };
    window.addEventListener('resize', handleResize);
    handleResize(); // trigger initially
};
