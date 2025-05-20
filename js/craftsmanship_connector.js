document.addEventListener('DOMContentLoaded', () => {
    const svg = document.querySelector('.product-svg');
    if (!svg) {
        // console.error('SVG element with class "product-svg" not found.');
        return;
    }

    const craftsmanshipSection = document.getElementById('craftsmanship');
    if (!craftsmanshipSection) {
        // console.error('Craftsmanship section with ID "craftsmanship" not found.');
        return;
    }

    // Only run this script if the craftsmanship section is visible (or active if you have a SPA-like behavior)
    const isCraftsmanshipSectionPotentiallyActive = () => {
        return craftsmanshipSection.offsetParent !== null || window.location.hash === '#craftsmanship' || craftsmanshipSection.classList.contains('active');
    };

    const features = [
        { labelSelector: '.feature-label.high-res', lineId: 'line-high-res', labelAnchor: 'right' },
        { labelSelector: '.feature-label.forged-metal', lineId: 'line-forged-metal', labelAnchor: 'right' },
        { labelSelector: '.feature-label.providers', lineId: 'line-providers', labelAnchor: 'right' },
        { labelSelector: '.feature-label.buttons', lineId: 'line-buttons', labelAnchor: 'left' }
    ];

    function updateLines() {
        if (!isCraftsmanshipSectionPotentiallyActive()) {
            // console.log('Craftsmanship section not active or not in DOM, skipping line update.');
            return;
        }

        const svgRect = svg.getBoundingClientRect();

        if (!svg.viewBox || !svg.viewBox.baseVal || svgRect.width === 0 || svgRect.height === 0) {
            // console.warn('SVG viewBox not available or SVG not rendered properly. Retrying...');
            requestAnimationFrame(updateLines); // Retry on the next frame
            return;
        }

        features.forEach(feature => {
            const label = document.querySelector(feature.labelSelector);
            const line = svg.querySelector('#' + feature.lineId);

            if (!label) {
                // console.warn(`Label element with selector "${feature.labelSelector}" not found.`);
                return;
            }
            if (!line) {
                // console.warn(`Line element with ID "${feature.lineId}" not found.`);
                return;
            }

            const labelRect = label.getBoundingClientRect();
            let cx, cy;

            if (feature.labelAnchor === 'right') { // Labels on the left of the image, line goes to the right
                cx = labelRect.right;
            } else { // Labels on the right of the image, line goes to the left
                cx = labelRect.left;
            }
            cy = labelRect.top + labelRect.height / 2;

            // Transform viewport coordinates to SVG coordinates
            const svgPoint = svg.createSVGPoint();
            svgPoint.x = cx;
            svgPoint.y = cy;

            const ctm = svg.getScreenCTM();
            if (!ctm) {
                // console.warn('SVG CTM not available. Retrying...');
                requestAnimationFrame(updateLines); // Retry if CTM is not ready
                return;
            }
            const inverseCtm = ctm.inverse();
            if (!inverseCtm) {
                // console.warn('SVG inverse CTM not available. Retrying...');
                requestAnimationFrame(updateLines); // Retry if inverse CTM is not ready
                return;
            }


            const svgCoords = svgPoint.matrixTransform(inverseCtm);

            line.setAttribute('x1', svgCoords.x);
            line.setAttribute('y1', svgCoords.y);
        });
    }

    // Initial update: Use rAF and a small timeout to ensure layout stability
    requestAnimationFrame(() => {
        setTimeout(updateLines, 50);
    });


    // Update on resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(updateLines, 50); // Debounce resize
    });

    // Also update if the hash changes (e.g., navigating to #craftsmanship)
    // or if section becomes active via JS (e.g. header.js)
    window.addEventListener('hashchange', () => {
        requestAnimationFrame(updateLines);
    });

    // Listen for a custom event if your header.js dispatches one when a section becomes active
    // document.addEventListener('sectionChanged', (event) => {
    //    if (event.detail.activeSection === 'craftsmanship') {
    //        requestAnimationFrame(updateLines);
    //    }
    // });

    // Use IntersectionObserver for the craftsmanship section itself
    // This ensures lines are updated when the section becomes visible.
    if (typeof IntersectionObserver !== 'undefined') {
        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && entry.target === craftsmanshipSection) {
                    // console.log('Craftsmanship section intersected, updating lines.');
                    requestAnimationFrame(updateLines);
                }
            });
        }, { threshold: [0.01, 0.5] }); // Trigger early and when half visible

        sectionObserver.observe(craftsmanshipSection);
    }


    // If there's a mutation observer API available and you expect dynamic content changes
    // that might affect label positions, you could also use that.
    if (typeof MutationObserver !== 'undefined') {
        const observer = new MutationObserver(mutationsList => {
            for (let mutation of mutationsList) {
                // Check if mutation could affect layout
                if (mutation.type === 'attributes' || mutation.type === 'childList' || mutation.type === 'characterData') {
                    requestAnimationFrame(updateLines);
                    return; // No need to check other mutations in this batch
                }
            }
        });

        // Observe changes that might affect the layout of labels or SVG within the craftsmanship section
        observer.observe(craftsmanshipSection, { attributes: true, childList: true, subtree: true, characterData: true });
    }

});