document.addEventListener('DOMContentLoaded', function() {
    const featureLabels = document.querySelectorAll('.feature-label');
    featureLabels.forEach(label => {
        label.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.05)';
            this.style.transition = 'transform 0.3s ease';
        });
        label.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
        label.addEventListener('click', function(e) {
            e.stopPropagation();
            const labelText = this.querySelector('.label-text').textContent;
            const labelIndex = Array.from(featureLabels).indexOf(this);
            const hasOpenDropdown = this.dataset.hasDropdown === 'true';
            document.querySelectorAll('.feature-dropdown').forEach(dropdown => {
                dropdown.remove();
            });
            featureLabels.forEach(l => {
                l.dataset.hasDropdown = 'false';
            });
            if (!hasOpenDropdown) {
                createFeatureDropdown(this, labelText);
            }
        });
    });
    document.addEventListener('click', function() {
        document.querySelectorAll('.feature-dropdown').forEach(dropdown => {
            dropdown.remove();
        });
        featureLabels.forEach(l => {
            l.dataset.hasDropdown = 'false';
        });
    });

    function createFeatureDropdown(labelElement, feature) {
        let info = '';
        switch (feature) {
            case 'HIGH-RES DISPLAY':
                info = 'Ultra-high resolution display with vibrant colors and crystal-clear graphics.';
                break;
            case 'FORGED IN METAL':
                info = 'Premium metal construction for durability and a luxurious feel.';
                break;
            case '30 DIFFERENT PROVIDERS':
                info = 'Access to games from 30 different providers for endless entertainment options.';
                break;
            case 'PREMIUM BUTTONS':
                info = 'Responsive, high-quality buttons for precise control and enhanced gameplay.';
                break;
            default:
                info = 'Feature information not available.';
        }
        const dropdown = document.createElement('div');
        dropdown.className = 'feature-dropdown show-dropdown';
        dropdown.textContent = info;
        dropdown.style.zIndex = '9999';
        document.body.appendChild(dropdown);
        const rect = labelElement.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
        if (labelElement.classList.contains('right-label')) {
            dropdown.style.position = 'absolute';
            dropdown.style.top = (rect.bottom + scrollTop - 1) + 'px';
            dropdown.style.right = (document.body.clientWidth - rect.right + scrollLeft - 20) + 'px';
        } else {
            dropdown.style.position = 'absolute';
            dropdown.style.top = (rect.bottom + scrollTop - 1) + 'px';
            dropdown.style.left = (rect.left + scrollLeft) + 'px';
        }
        labelElement.dataset.hasDropdown = 'true';
        dropdown.dataset.forLabel = Array.from(document.querySelectorAll('.feature-label')).indexOf(labelElement);
        setTimeout(() => {
            dropdown.classList.add('show-dropdown');
        }, 10);
    }
    const style = document.createElement('style');
    style.textContent = `
      @keyframes drawLine {
        to {
          stroke-dashoffset: 0;
        }
      }
      .feature-dropdown {
        position: absolute;
        background-color: rgba(0, 0, 0, 1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 8px;
        padding: 12px;
        color: white;
        font-size: 14px;
        max-width: 250px;
        z-index: 9999;
        opacity: 0;
        transform: translateY(-5px);
        transition: opacity 0.3s ease, transform 0.3s ease;
        pointer-events: auto;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 1);
        text-align: center;
      }
      .feature-dropdown.show-dropdown {
        opacity: 1;
        transform: translateY(0);
      }
      .left-label .feature-dropdown {
        left: 25px;
        top: 100%;
      }
      .right-label .feature-dropdown {
        right: 0;
        top: 100%;
      }
    `;
    document.head.appendChild(style);
    const craftSection = document.getElementById('craftsmanship');
    if (craftSection) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const svgLines = document.querySelectorAll('.product-svg .animated-line');
                    svgLines.forEach(line => {
                        const length = line.getTotalLength ? line.getTotalLength() : 500;
                        line.style.strokeDasharray = length;
                        line.style.strokeDashoffset = length;
                        line.style.animation = 'drawLine 1.5s ease-out forwards';
                    });
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.2
        });
        observer.observe(craftSection);
    }
});