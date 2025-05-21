document.addEventListener('DOMContentLoaded', () => {
    const sliderContainer = document.querySelector('.logo-slider-container'); // Взимаме контейнера на плъзгача
    const track = document.querySelector('.logo-slider-track');
    const logos = Array.from(track.querySelectorAll('img.provider-logo'));
    // const toggleBtn = document.getElementById('toggle-logos'); // No longer need to listen to click here

    if (!sliderContainer || !track || logos.length === 0) {
        console.warn('Logo slider container, track, or logos not found.');
        return;
    }

    let scrollEndTimeout;

    function updateCenteredLogoAndFrame() {
        const trackScrollportCenter = track.scrollLeft + (track.clientWidth / 2);
        let centeredLogoElement = null;
        let minDistanceToCenter = Infinity;

        logos.forEach(logo => {
            // Ensure logo has a valid offsetParent, meaning it's part of the layout and visible
            if (logo.offsetParent !== null && logo.offsetWidth > 0 && logo.offsetHeight > 0) {
                const logoCenter = logo.offsetLeft + (logo.offsetWidth / 2);
                const distance = Math.abs(logoCenter - trackScrollportCenter);

                if (distance < minDistanceToCenter) {
                    minDistanceToCenter = distance;
                    centeredLogoElement = logo;
                }
            }
        });

        logos.forEach(logo => {
            logo.classList.remove('is-centered-logo');
        });

        if (centeredLogoElement) {
            centeredLogoElement.classList.add('is-centered-logo');

            const logoWidth = centeredLogoElement.offsetWidth;
            const logoHeight = centeredLogoElement.offsetHeight;

            const framePadding = 16; // New: 8px padding on all sides (total 16px added to dimensions)

            const newFrameWidth = logoWidth + framePadding;
            const newFrameHeight = logoHeight + framePadding;

            sliderContainer.style.setProperty('--frame-width', newFrameWidth + 'px');
            sliderContainer.style.setProperty('--frame-height', newFrameHeight + 'px');
        } else {
            // Fallback if no centered logo is found (e.g., if all logos are hidden or have no dimensions)
            // Or, if sliderContainer itself is not visible, perhaps reset to CSS defaults by removing the properties
            if (sliderContainer.offsetHeight > 0) { // Only set defaults if container is somewhat visible
                 sliderContainer.style.setProperty('--frame-width', '150px'); // Default from CSS
                 sliderContainer.style.setProperty('--frame-height', '100px'); // Default from CSS
            }
        }
    }

    function initialSetup() {
        const imageLoadPromises = logos.map(img => {
            return new Promise(resolve => {
                if (img.complete) {
                    resolve();
                } else {
                    img.onload = resolve;
                    img.onerror = resolve; 
                }
            });
        });

        Promise.all(imageLoadPromises).then(() => {
            // DO NOT call updateCenteredLogoAndFrame() here.
            // Frame will be set when slider is opened, using CSS defaults initially.
            // We can, however, determine the first logo to be marked as centered if needed,
            // but styling should only apply when visible.
            // For now, relying on the open action to correctly style the first visible logo.
        });
    }

    // Expose a function to be called when the slider is opened to prime the first logo
    window.updateSliderFrameForFirstLogo = () => {
        if (document.body.classList.contains('logos-open') && logos.length > 0 && track.offsetParent !== null) {
            // Ensure the first logo is scrolled into view immediately
            logos[0].scrollIntoView({ behavior: 'auto', block: 'nearest', inline: 'center' });
            // Then update the frame. A micro-delay can help ensure scroll has settled.
            setTimeout(updateCenteredLogoAndFrame, 20); 
        }
    };

    if (document.readyState === 'complete') {
        initialSetup();
    } else {
        window.addEventListener('load', initialSetup);
    }

    // Слушаме за събитието 'scroll' на трака
    if ('onscrollend' in track) {
        track.addEventListener('scrollend', updateCenteredLogoAndFrame);
    } else {
        track.addEventListener('scroll', () => {
            clearTimeout(scrollEndTimeout);
            scrollEndTimeout = setTimeout(updateCenteredLogoAndFrame, 66);
        }, { passive: true });
    }
    
    // The toggleBtn click listener that was here has been removed.
    // Its functionality for initializing the first logo is now handled by 
    // the exposed window.updateSliderFrameForFirstLogo function,
    // which will be called by dropdownExperience.js

    // Add snap scroll from Craftsmanship to Experience
    const craftsmanshipTrigger = document.getElementById('trigger-snap-to-experience');
    const experienceSection = document.getElementById('experience');
    let lastScrollY = window.scrollY;
    let isSnappingToExperience = false;
    let canSnapToExperience = true;

    if (!craftsmanshipTrigger || !experienceSection) {
        console.warn('Snap scrolling to Experience: Trigger or section not found.');
        return;
    }

    const triggerObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            const currentScrollY = window.scrollY;
            const scrollingDown = currentScrollY > lastScrollY;

            if (scrollingDown && entry.isIntersecting && canSnapToExperience && !isSnappingToExperience) {
                const experienceRect = experienceSection.getBoundingClientRect();
                if (experienceRect.top > (window.innerHeight * 0.1)) {
                    isSnappingToExperience = true;
                    canSnapToExperience = false;
                    experienceSection.scrollIntoView({ behavior: 'smooth' });

                    setTimeout(() => {
                        isSnappingToExperience = false;
                        setTimeout(() => canSnapToExperience = true, 500);
                    }, 1200);
                }
            } else if (!scrollingDown && !entry.isIntersecting && entry.boundingClientRect.top > 0) {
                canSnapToExperience = true;
            }
            lastScrollY = currentScrollY;
        });
    }, {
        threshold: 0.1
    });

    triggerObserver.observe(craftsmanshipTrigger);
});