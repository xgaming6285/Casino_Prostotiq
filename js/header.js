document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const header = document.getElementById('main-header');
    const nav = document.getElementById('main-nav');
    const navLinks = document.querySelectorAll('.nav-link');
    const indicator = document.getElementById('indicator');
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const sections = {};
    
    // State variables
    let activeSection = 'home';
    let isMobile = window.innerWidth < 768;
    let isInitialized = false;
    let lastScrollTop = 0;
    let ticking = false;
    let sectionPositions = {};
    
    // Initialize the header component
    function init() {
      // Calculate section positions
      calculateSectionPositions();
      
      // Set initial active section
      setActiveSection('home');
      
      // Update indicator position immediately
      updateIndicatorPosition('home', true);
      
      // Set initialized flag
      isInitialized = true;
    }
    
    // Calculate and store section positions
    function calculateSectionPositions() {
      // Get all sections
      document.querySelectorAll('section[id], .hero-section[id]').forEach(section => {
        const id = section.id;
        const rect = section.getBoundingClientRect();
        
        sectionPositions[id] = {
          top: rect.top + window.scrollY,
          bottom: rect.bottom + window.scrollY,
          height: rect.height,
          middle: rect.top + window.scrollY + rect.height / 2
        };
        
        // Store section element for quick access
        sections[id] = section;
      });
    }
    
    // Determine active section based on scroll position
    function determineActiveSection() {
      // Use viewport center point for better UX
      const viewportMiddle = window.scrollY + window.innerHeight / 2;
      
      // Find the section that contains the viewport middle point
      let newActiveSection = null;
      let minDistance = Number.POSITIVE_INFINITY;
      
      // First check if we're within any section
      for (const id in sectionPositions) {
        const { top, bottom } = sectionPositions[id];
        
        // Check if we're within this section
        if (viewportMiddle >= top && viewportMiddle <= bottom) {
          newActiveSection = id;
          break;
        }
        
        // Calculate distance to this section's middle
        const distance = Math.abs(viewportMiddle - sectionPositions[id].middle);
        if (distance < minDistance) {
          minDistance = distance;
          newActiveSection = id;
        }
      }
      
      // Fallback to first or last section at page extremes
      if (!newActiveSection) {
        const sectionIds = Object.keys(sectionPositions);
        if (sectionIds.length > 0) {
          // If we're at the very top, use the first section
          if (window.scrollY < 10) {
            newActiveSection = sectionIds[0];
          }
          // If we're at the very bottom, use the last section
          else if (window.scrollY + window.innerHeight >= document.body.scrollHeight - 10) {
            newActiveSection = sectionIds[sectionIds.length - 1];
          }
        }
      }
      
      return newActiveSection || activeSection;
    }
    
    // Update the active section
    function setActiveSection(sectionId) {
      if (sectionId === activeSection) return;
      
      // Update active class on nav links
      navLinks.forEach(link => {
        if (link.getAttribute('data-section') === sectionId) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });
      
      // Update active section state
      activeSection = sectionId;
      
      // Update indicator position
      if (!isMobile) {
        updateIndicatorPosition(sectionId);
      }
    }
    
    // Update indicator position with smooth animation
    function updateIndicatorPosition(sectionId, immediate = false) {
      if (isMobile) return;
      
      // Find the active nav link
      const activeLink = document.querySelector(`.nav-link[data-section="${sectionId}"]`);
      if (!activeLink) return;
      
      // Get positions
      const navRect = nav.getBoundingClientRect();
      const linkRect = activeLink.getBoundingClientRect();
      
      // Calculate position relative to nav
      const leftPosition = linkRect.left - navRect.left;
      
      // Apply styles with appropriate transition
      if (immediate) {
        indicator.style.transition = 'none';
      } else {
        indicator.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.1, 0.25, 1), width 0.4s cubic-bezier(0.25, 0.1, 0.25, 1), opacity 0.4s cubic-bezier(0.25, 0.1, 0.25, 1)';
      }
      
      // Set indicator position and size
      indicator.style.width = `${linkRect.width}px`;
      indicator.style.transform = `translateX(${leftPosition}px)`;
      indicator.style.opacity = '1';
      
      // Force reflow to ensure transition applies if immediate
      if (immediate) {
        indicator.offsetWidth;
        indicator.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.1, 0.25, 1), width 0.4s cubic-bezier(0.25, 0.1, 0.25, 1), opacity 0.4s cubic-bezier(0.25, 0.1, 0.25, 1)';
      }
    }
    
    // Handle scroll events
    function handleScroll() {
      // Store current scroll position
      const currentScrollY = window.scrollY;
      
      // Update last scroll position
      lastScrollTop = currentScrollY;
      
      // Use requestAnimationFrame to throttle processing
      if (!ticking) {
        window.requestAnimationFrame(() => {
          // Determine active section based on scroll position
          const newActiveSection = determineActiveSection();
          
          // Update active section if changed
          if (newActiveSection && newActiveSection !== activeSection) {
            setActiveSection(newActiveSection);
          }
          
          ticking = false;
        });
        
        ticking = true;
      }
    }
    
    // Handle resize events
    function handleResize() {
      const wasMobile = isMobile;
      const newIsMobile = window.innerWidth < 768;
      
      // Update mobile state
      if (wasMobile !== newIsMobile) {
        isMobile = newIsMobile;
        
        // Reset mobile menu if switching to desktop
        if (!isMobile && nav.classList.contains('active')) {
          nav.classList.remove('active');
          mobileMenuToggle.classList.remove('active');
        }
      }
      
      // Recalculate section positions
      calculateSectionPositions();
      
      // Update indicator position immediately without animation
      if (!isMobile) {
        updateIndicatorPosition(activeSection, true);
      }
    }
    
    // Toggle mobile menu
    function toggleMobileMenu() {
      nav.classList.toggle('active');
      mobileMenuToggle.classList.toggle('active');
    }
    
    // Smooth scroll to section
    function scrollToSection(sectionId) {
      const section = sections[sectionId];
      if (!section) return;
      
      // Update active section immediately for better UX
      setActiveSection(sectionId);
      
      // Calculate scroll position
      const offsetPosition = sectionPositions[sectionId].top - header.offsetHeight;
      
      // Smooth scroll
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      
      // Close mobile menu if open
      if (isMobile && nav.classList.contains('active')) {
        toggleMobileMenu();
      }
    }
    
    // Event Listeners
    
    // Scroll event
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Resize event with throttling
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(handleResize, 100);
    });
    
    // Click events for nav links
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const sectionId = link.getAttribute('data-section');
        scrollToSection(sectionId);
      });
    });
    
    // Mobile menu toggle
    mobileMenuToggle.addEventListener('click', toggleMobileMenu);
    
    // Initialize on load
    init();
    
    // Update on load to ensure correct positioning
    window.addEventListener('load', () => {
      calculateSectionPositions();
      updateIndicatorPosition(activeSection, true);
    });
  });