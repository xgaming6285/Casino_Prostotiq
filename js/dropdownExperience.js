document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('toggle-logos');
    const logoContainer = document.querySelector('.logo-slider-container');
    
    if (!btn || !logoContainer) {
        console.warn('Toggle button or logo container not found for dropdown');
        return;
    }
    
    btn.addEventListener('click', () => {
        const isOpen = document.body.classList.toggle('logos-open');
        btn.setAttribute('aria-expanded', isOpen);
        btn.setAttribute('aria-label', isOpen ? 'Hide games' : 'Show more games');
        
        if (isOpen) {
            // Ensure the container is rendered before trying to init the first logo
            // A minimal delay helps wait for CSS transitions and layout to settle
            setTimeout(() => {
                if (typeof window.updateSliderFrameForFirstLogo === 'function') {
                    window.updateSliderFrameForFirstLogo();
                } else {
                    console.warn('updateSliderFrameForFirstLogo function not found on window.');
                }
            }, 0); // Adjusted delay to 450ms to exceed CSS transition time
        } 
        // Removed the previous setTimeout block that was here, as the logic is now more targeted
    });
});