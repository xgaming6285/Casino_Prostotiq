document.addEventListener('DOMContentLoaded', () => {
    const svg = document.querySelector('.product-svg');
    if (!svg) {
        return;
    }
    const craftsmanshipSection = document.getElementById('craftsmanship');
    if (!craftsmanshipSection) {
        return;
    }
    const isCraftsmanshipSectionPotentiallyActive = () => {
        return craftsmanshipSection.offsetParent !== null || window.location.hash === '#craftsmanship' || craftsmanshipSection.classList.contains('active');
    };
    const features = [{
        labelSelector: '.feature-label.high-res',
        lineId: 'line-high-res',
        circleId: 'circle-high-res',
        labelAnchor: 'right',
        desktop: {
            x2: 470,
            y2: 275,
            cx: 470,
            cy: 275
        },
        mobile: {
            x2: 780,
            y2: 290,
            cx: 780,
            cy: 290
        }
    }, {
        labelSelector: '.feature-label.forged-metal',
        lineId: 'line-forged-metal',
        circleId: 'circle-forged-metal',
        labelAnchor: 'right',
        desktop: {
            x2: 340,
            y2: 420,
            cx: 340,
            cy: 420
        },
        mobile: {
            x2: 400,
            y2: 230,
            cx: 400,
            cy: 230
        }
    }, {
        labelSelector: '.feature-label.providers',
        lineId: 'line-providers',
        circleId: 'circle-providers',
        labelAnchor: 'right',
        desktop: {
            x2: 280,
            y2: 550,
            cx: 280,
            cy: 550
        },
        mobile: {
            x2: 290,
            y2: 580,
            cx: 290,
            cy: 580
        }
    }, {
        labelSelector: '.feature-label.buttons',
        lineId: 'line-buttons',
        circleId: 'circle-buttons',
        labelAnchor: 'left',
        desktop: {
            x2: 710,
            y2: 630,
            cx: 710,
            cy: 630
        },
        mobile: {
            x2: 720,
            y2: 670,
            cx: 720,
            cy: 670
        }
    }];

    function updateLines() {
        if (!isCraftsmanshipSectionPotentiallyActive()) {
            return;
        }
        const svgRect = svg.getBoundingClientRect();
        if (!svg.viewBox || !svg.viewBox.baseVal || svgRect.width === 0 || svgRect.height === 0) {
            requestAnimationFrame(updateLines);
            return;
        }
        const isMobileView = window.innerWidth < 768;
        features.forEach(feature => {
            const label = document.querySelector(feature.labelSelector);
            const line = svg.querySelector('#' + feature.lineId);
            const circle = svg.querySelector('#' + feature.circleId);
            if (!label || !line || !circle) {
                return;
            }
            const labelRect = label.getBoundingClientRect();
            let labelEdgeX, labelEdgeY;

            if (isMobileView) {
                // For mobile, connect from the center top of labels
                labelEdgeX = labelRect.left + (labelRect.width / 2);
                labelEdgeY = labelRect.top;
            } else {
                // For desktop, keep existing behavior
                if (feature.labelAnchor === 'right') {
                    labelEdgeX = labelRect.right;
                } else {
                    labelEdgeX = labelRect.left;
                }
                labelEdgeY = labelRect.top + labelRect.height / 2;
            }

            const svgPoint = svg.createSVGPoint();
            svgPoint.x = labelEdgeX;
            svgPoint.y = labelEdgeY;

            const ctm = svg.getScreenCTM();
            if (!ctm) {
                requestAnimationFrame(updateLines);
                return;
            }

            const inverseCtm = ctm.inverse();
            if (!inverseCtm) {
                requestAnimationFrame(updateLines);
                return;
            }

            const svgCoordsStart = svgPoint.matrixTransform(inverseCtm);
            line.setAttribute('x1', svgCoordsStart.x);
            line.setAttribute('y1', svgCoordsStart.y);

            // Use mobile or desktop coordinates based on viewport width
            const targetCoords = isMobileView ? feature.mobile : feature.desktop;
            line.setAttribute('x2', targetCoords.x2);
            line.setAttribute('y2', targetCoords.y2);
            circle.setAttribute('cx', targetCoords.cx);
            circle.setAttribute('cy', targetCoords.cy);
        });
    }

    // Initial update with a small delay to ensure layout is complete
    requestAnimationFrame(() => {
        setTimeout(updateLines, 50);
    });

    // Update on resize with debounce
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(updateLines, 50);
    });

    // Update on hash change
    window.addEventListener('hashchange', () => {
        requestAnimationFrame(updateLines);
    });

    // Use IntersectionObserver to update lines when section becomes visible
    if (typeof IntersectionObserver !== 'undefined') {
        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && entry.target === craftsmanshipSection) {
                    requestAnimationFrame(updateLines);
                }
            });
        }, {
            threshold: [0.01, 0.5]
        });
        sectionObserver.observe(craftsmanshipSection);
    }

    // Use MutationObserver to handle dynamic content changes
    if (typeof MutationObserver !== 'undefined') {
        const observer = new MutationObserver(() => {
            requestAnimationFrame(updateLines);
        });
        observer.observe(craftsmanshipSection, {
            attributes: true,
            childList: true,
            subtree: true,
            characterData: true
        });
    }

    // Initial update and resize handler
    updateLines();
    window.addEventListener('resize', updateLines);
});