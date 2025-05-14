// This script can be used to add interactivity to the feature labels
document.addEventListener('DOMContentLoaded', function() {
    // Get all feature labels
    const featureLabels = document.querySelectorAll('.feature-label');
    
    // Add hover effect to feature labels
    featureLabels.forEach(label => {
      label.addEventListener('mouseenter', function() {
        this.style.transform = 'scale(1.05)';
        this.style.transition = 'transform 0.3s ease';
      });
      
      label.addEventListener('mouseleave', function() {
        this.style.transform = 'scale(1)';
      });
      
      // Make labels clickable to show/hide dropdowns
      label.addEventListener('click', function(e) {
        e.stopPropagation(); // Prevent event bubbling
        
        const labelText = this.querySelector('.label-text').textContent;
        const labelIndex = Array.from(featureLabels).indexOf(this);
        
        // Check if this label has an open dropdown
        const hasOpenDropdown = this.dataset.hasDropdown === 'true';
        
        // Close all existing dropdowns
        document.querySelectorAll('.feature-dropdown').forEach(dropdown => {
          dropdown.remove();
        });
        
        // Clear all hasDropdown flags
        featureLabels.forEach(l => {
          l.dataset.hasDropdown = 'false';
        });
        
        // If this label didn't have an open dropdown, create one
        if (!hasOpenDropdown) {
          createFeatureDropdown(this, labelText);
        }
      });
    });
    
    // Close dropdowns when clicking anywhere else
    document.addEventListener('click', function() {
      document.querySelectorAll('.feature-dropdown').forEach(dropdown => {
        dropdown.remove();
      });
      
      // Clear all hasDropdown flags
      featureLabels.forEach(l => {
        l.dataset.hasDropdown = 'false';
      });
    });
    
    // Function to create and append feature dropdown
    function createFeatureDropdown(labelElement, feature) {
      let info = '';
      
      switch(feature) {
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
      
      // Create dropdown element
      const dropdown = document.createElement('div');
      dropdown.className = 'feature-dropdown show-dropdown';
      dropdown.textContent = info;
      dropdown.style.zIndex = '9999'; // Extremely high z-index
      
      // Instead of appending directly to the label element, append to body for absolute positioning
      document.body.appendChild(dropdown);
      
      // Calculate position relative to the label
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
      
      // Store reference to the dropdown to identify which label it belongs to
      labelElement.dataset.hasDropdown = 'true';
      dropdown.dataset.forLabel = Array.from(document.querySelectorAll('.feature-label')).indexOf(labelElement);
      
      // Animate in
      setTimeout(() => {
        dropdown.classList.add('show-dropdown');
      }, 10);
    }
    
    // Add the animation keyframes to the document
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
    
    // Set up Intersection Observer to trigger animations when scrolled into view
    const craftSection = document.getElementById('craftsmanship');
    
    if (craftSection) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            // When the craftsmanship section comes into view, animate the lines
            const lines = document.querySelectorAll('.connecting-line line');
            const circles = document.querySelectorAll('.connecting-line circle');
            
            lines.forEach(line => {
              const length = line.getTotalLength ? line.getTotalLength() : 500; // Fallback value if getTotalLength is not available
              
              // Set up the starting position
              line.style.strokeDasharray = length;
              line.style.strokeDashoffset = length;
              
              // Define the animation
              line.style.animation = 'drawLine 1.5s ease-out forwards';
            });
            
            // Fade in the circles with a delay
            setTimeout(() => {
              circles.forEach(circle => {
                circle.style.opacity = '1';
              });
            }, 300); // Delay the circles slightly after the line animation starts
            
            // Unobserve after triggering the animation
            observer.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.2 // Trigger when 20% of the section is visible
      });
      
      // Start observing the craftsmanship section
      observer.observe(craftSection);
    }
  });