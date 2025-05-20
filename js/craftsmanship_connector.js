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

    const isCraftsmanshipSectionPotentiallyActive = () => {
        return craftsmanshipSection.offsetParent !== null || window.location.hash === '#craftsmanship' || craftsmanshipSection.classList.contains('active');
    };

    const features = [
        {
            labelSelector: '.feature-label.high-res', lineId: 'line-high-res', circleId: 'circle-high-res', labelAnchor: 'right',
            desktop: { x2: 470, y2: 275, cx: 470, cy: 275 },
            // USER: Define your desired mobile SVG coordinates below (example values are placeholders)
            mobile: { x2: 780, y2: 290, cx: 780, cy: 290 }
        },
        {
            labelSelector: '.feature-label.forged-metal', lineId: 'line-forged-metal', circleId: 'circle-forged-metal', labelAnchor: 'right',
            desktop: { x2: 340, y2: 420, cx: 340, cy: 420 },
            // USER: Define your desired mobile SVG coordinates below
            mobile: { x2: 400, y2: 230, cx: 400, cy: 230 }
        },
        {
            labelSelector: '.feature-label.providers', lineId: 'line-providers', circleId: 'circle-providers', labelAnchor: 'right',
            desktop: { x2: 280, y2: 550, cx: 280, cy: 550 },
            // USER: Define your desired mobile SVG coordinates below
            mobile: { x2: 290, y2: 520, cx: 290, cy: 520 }
        },
        {
            labelSelector: '.feature-label.buttons', lineId: 'line-buttons', circleId: 'circle-buttons', labelAnchor: 'left',
            desktop: { x2: 710, y2: 630, cx: 710, cy: 630 },
            // USER: Define your desired mobile SVG coordinates below
            mobile: { x2: 720, y2: 670, cx: 720, cy: 670 }
        }
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

        const isMobileView = window.innerWidth < 768;

        features.forEach(feature => {
            const label = document.querySelector(feature.labelSelector);
            const line = svg.querySelector('#' + feature.lineId);
            const circle = svg.querySelector('#' + feature.circleId);

            if (!label) {
                // console.warn(`Label element with selector "${feature.labelSelector}" not found.`);
                return;
            }
            if (!line) {
                // console.warn(`Line element with ID "${feature.lineId}" not found.`);
                return;
            }
            if (!circle) {
                // console.warn(`Circle element with ID "${feature.circleId}" not found.`);
                return;
            }

            const labelRect = label.getBoundingClientRect();
            let labelEdgeX, labelEdgeY;

            // For mobile view, connect from the bottom middle of the label
            if (isMobileView) {
                labelEdgeX = labelRect.left + (labelRect.width / 2);
                labelEdgeY = labelRect.bottom;
            } else {
                // Desktop view remains the same
                if (feature.labelAnchor === 'right') {
                    labelEdgeX = labelRect.right;
                } else {
                    labelEdgeX = labelRect.left;
                }
                labelEdgeY = labelRect.top + labelRect.height / 2;
            }

            // Transform viewport coordinates to SVG coordinates for line start (x1, y1)
            const svgPoint = svg.createSVGPoint();
            svgPoint.x = labelEdgeX;
            svgPoint.y = labelEdgeY;

            const ctm = svg.getScreenCTM();
            if (!ctm) {
                // console.warn('SVG CTM not available. Retrying...');
                requestAnimationFrame(updateLines);
                return;
            }
            const inverseCtm = ctm.inverse();
            if (!inverseCtm) {
                // console.warn('SVG inverse CTM not available. Retrying...');
                requestAnimationFrame(updateLines);
                return;
            }

            const svgCoordsStart = svgPoint.matrixTransform(inverseCtm);

            line.setAttribute('x1', svgCoordsStart.x);
            line.setAttribute('y1', svgCoordsStart.y);

            // Set line endpoint (x2, y2) and circle center (cx, cy) based on view
            const targetCoords = isMobileView ? feature.mobile : feature.desktop;

            line.setAttribute('x2', targetCoords.x2);
            line.setAttribute('y2', targetCoords.y2);
            circle.setAttribute('cx', targetCoords.cx);
            circle.setAttribute('cy', targetCoords.cy);
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

    // Use IntersectionObserver for the craftsmanship section itself
    if (typeof IntersectionObserver !== 'undefined') {
        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && entry.target === craftsmanshipSection) {
                    // console.log('Craftsmanship section intersected, updating lines.');
                    requestAnimationFrame(updateLines);
                }
            });
        }, { threshold: [0.01, 0.5] });

        sectionObserver.observe(craftsmanshipSection);
    }

    // MutationObserver for dynamic content changes
    if (typeof MutationObserver !== 'undefined') {
        const observer = new MutationObserver(mutationsList => {
            for (let mutation of mutationsList) {
                if (mutation.type === 'attributes' || mutation.type === 'childList' || mutation.type === 'characterData') {
                    requestAnimationFrame(updateLines);
                    return;
                }
            }
        });
        observer.observe(craftsmanshipSection, { attributes: true, childList: true, subtree: true, characterData: true });
    }

    // Initial call and on resize
    updateLines();
    window.addEventListener('resize', updateLines);

    // Intersection Observer for animations
    const animatedElements = svg.querySelectorAll('.animated-line');
});