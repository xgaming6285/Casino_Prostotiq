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
    const isCraftsmanshipSectionActive = () => {
        return craftsmanshipSection.offsetParent !== null || window.location.hash === '#craftsmanship';
    };
    const features = [{
        labelSelector: '.feature-label.high-res',
        lineId: 'line-high-res',
        labelAnchor: 'right'
    }, {
        labelSelector: '.feature-label.forged-metal',
        lineId: 'line-forged-metal',
        labelAnchor: 'right'
    }, {
        labelSelector: '.feature-label.providers',
        lineId: 'line-providers',
        labelAnchor: 'right'
    }, {
        labelSelector: '.feature-label.buttons',
        lineId: 'line-buttons',
        labelAnchor: 'left'
    }];

    function updateLines() {
        if (!isCraftsmanshipSectionActive()) {
            return;
        }
        const svgRect = svg.getBoundingClientRect();
        const viewBox = svg.viewBox.baseVal;
        if (!viewBox || svgRect.width === 0 || svgRect.height === 0) {
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
            if (feature.labelAnchor === 'right') {
                cx = labelRect.right;
            } else {
                cx = labelRect.left;
            }
            cy = labelRect.top + labelRect.height / 2;
            const svgPoint = svg.createSVGPoint();
            svgPoint.x = cx;
            svgPoint.y = cy;
            const svgCoords = svgPoint.matrixTransform(svg.getScreenCTM().inverse());
            line.setAttribute('x1', svgCoords.x);
            line.setAttribute('y1', svgCoords.y);
        });
    }
    requestAnimationFrame(() => {
        updateLines();
    });
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(updateLines, 50);
    });
    window.addEventListener('hashchange', () => {
        requestAnimationFrame(updateLines);
    });
    if (typeof MutationObserver !== 'undefined') {
        const observer = new MutationObserver(mutationsList => {
            for (let mutation of mutationsList) {
                if (mutation.type === 'attributes' || mutation.type === 'childList' || mutation.type === 'characterData') {
                    requestAnimationFrame(updateLines);
                    break;
                }
            }
        });
        observer.observe(craftsmanshipSection, {
            attributes: true,
            childList: true,
            subtree: true,
            characterData: true
        });
    }
});