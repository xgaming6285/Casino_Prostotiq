document.addEventListener('DOMContentLoaded', () => {
    const svg = document.querySelector('.product-svg');
    if (!svg) {
        console.error('SVG element with class "product-svg" not found.');
        return;
    }

    const craftsmanshipSection = document.getElementById('craftsmanship');
    if (!craftsmanshipSection) {
        console.error('Craftsmanship section with ID "craftsmanship" not found.');
        return;
    }

    // Only run this script if the craftsmanship section is visible (or active if you have a SPA-like behavior)
    // This is a simple check, might need to be more sophisticated based on your navigation logic
    const isCraftsmanshipSectionActive = () => {
        // Assuming it's active if it's not display:none or similar
        // Or if you have an 'active' class on the section or its nav link
        return craftsmanshipSection.offsetParent !== null || window.location.hash === '#craftsmanship';
    };

    const features = [
        { labelSelector: '.feature-label.high-res', lineId: 'line-high-res', labelAnchor: 'right' },
        { labelSelector: '.feature-label.forged-metal', lineId: 'line-forged-metal', labelAnchor: 'right' },
        { labelSelector: '.feature-label.providers', lineId: 'line-providers', labelAnchor: 'right' },
        { labelSelector: '.feature-label.buttons', lineId: 'line-buttons', labelAnchor: 'left' }
    ];

    function updateLines() {
        if (!isCraftsmanshipSectionActive()) {
            // console.log('Craftsmanship section not active, skipping line update.');
            return;
        }

        const svgRect = svg.getBoundingClientRect();
        const viewBox = svg.viewBox.baseVal;

        if (!viewBox || svgRect.width === 0 || svgRect.height === 0) {
            // console.error('SVG viewBox not available or SVG not rendered.');
            // Request animation frame to try again if the SVG is not yet rendered
            requestAnimationFrame(updateLines);
            return;
        }

        features.forEach(feature => {
            const label = document.querySelector(feature.labelSelector);
            const line = svg.querySelector('#' + feature.lineId);

            if (!label) {
                console.warn(`Label element with selector "${feature.labelSelector}" not found.`);
                return;
            }
            if (!line) {
                console.warn(`Line element with ID "${feature.lineId}" not found.`);
                return;
            }

            const labelRect = label.getBoundingClientRect();
            let cx, cy;

            // Determine connection point based on labelAnchor
            // This is the horizontal center and vertical center of the label.
            // For labels on the left, we want the line to start from their right edge's vertical center.
            // For labels on the right, we want the line to start from their left edge's vertical center.

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

            const svgCoords = svgPoint.matrixTransform(svg.getScreenCTM().inverse());

            line.setAttribute('x1', svgCoords.x);
            line.setAttribute('y1', svgCoords.y);
        });
    }

    // Initial update
    // Use a small timeout or rAF to ensure layout is stable
    requestAnimationFrame(() => {
        updateLines();
    });


    // Update on resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(updateLines, 50); // Debounce resize
    });

    // Also update if the hash changes (e.g., navigating to #craftsmanship)
    window.addEventListener('hashchange', () => {
        requestAnimationFrame(updateLines);
    });

    // If there's a mutation observer API available and you expect dynamic content changes
    // that might affect label positions, you could also use that.
    // For example, if the text in labels changes, or they are added/removed dynamically.
    if (typeof MutationObserver !== 'undefined') {
        const observer = new MutationObserver(mutationsList => {
            for (let mutation of mutationsList) {
                if (mutation.type === 'attributes' || mutation.type === 'childList' || mutation.type === 'characterData') {
                    // More specific checks can be added here if needed
                    requestAnimationFrame(updateLines);
                    break;
                }
            }
        });

        // Observe changes that might affect the layout of labels within the craftsmanship section
        observer.observe(craftsmanshipSection, { attributes: true, childList: true, subtree: true, characterData: true });
    }

}); 