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
      
      // Make labels clickable to show more information
      label.addEventListener('click', function() {
        const labelText = this.querySelector('.label-text').textContent;
        showFeatureInfo(labelText);
      });
    });
    
    // Function to show feature information
    function showFeatureInfo(feature) {
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
      
      alert(info);
    }
    
    // Add the animation keyframes to the document
    const style = document.createElement('style');
    style.textContent = `
      @keyframes drawLine {
        to {
          stroke-dashoffset: 0;
        }
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