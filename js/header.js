document.addEventListener('DOMContentLoaded', () => {
    const header = document.getElementById('main-header');
    const nav = document.getElementById('main-nav');
    const navLinks = document.querySelectorAll('.nav-link');
    const indicator = document.getElementById('indicator');
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const logoText = document.querySelector('.logo-text');
    const sections = {};
    let activeSection = 'home';
    let isMobile = window.innerWidth < 768;
    let isInitialized = false;
    let lastScrollTop = 0;
    let ticking = false;
    let sectionPositions = {};
    let isProgrammaticScroll = false;
    let programmaticScrollTimeout;
    const isMainPage = window.location.pathname === '/' ||
        window.location.pathname === '/index.html' ||
        window.location.pathname.endsWith('/index.html');

    function init() {
        calculateSectionPositions();
        if (isMainPage) {
            setActiveSection('home');
            updateIndicatorPosition('home', true);
        } else {
            snapIndicatorToLogo(true);
        }
        isInitialized = true;
    }

    function calculateSectionPositions() {
        if (!isMainPage) return;
        document.querySelectorAll('section[id], .hero-section[id]').forEach(section => {
            const id = section.id;
            const rect = section.getBoundingClientRect();
            sectionPositions[id] = {
                top: rect.top + window.scrollY,
                bottom: rect.bottom + window.scrollY,
                height: rect.height,
                middle: rect.top + window.scrollY + rect.height / 2
            };
            sections[id] = section;
        });
    }

    function determineActiveSection() {
        if (!isMainPage) return null;
        const viewportMiddle = window.scrollY + window.innerHeight / 2;
        let newActiveSection = null;
        let minDistance = Number.POSITIVE_INFINITY;
        for (const id in sectionPositions) {
            const {
                top,
                bottom
            } = sectionPositions[id];
            if (viewportMiddle >= top && viewportMiddle <= bottom) {
                newActiveSection = id;
                break;
            }
            const distance = Math.abs(viewportMiddle - sectionPositions[id].middle);
            if (distance < minDistance) {
                minDistance = distance;
                newActiveSection = id;
            }
        }
        if (!newActiveSection) {
            const sectionIds = Object.keys(sectionPositions);
            if (sectionIds.length > 0) {
                if (window.scrollY < 10) {
                    newActiveSection = sectionIds[0];
                } else if (window.scrollY + window.innerHeight >= document.body.scrollHeight - 10) {
                    newActiveSection = sectionIds[sectionIds.length - 1];
                }
            }
        }
        return newActiveSection || activeSection;
    }

    function setActiveSection(sectionId) {
        if (sectionId === activeSection) return;
        navLinks.forEach(link => {
            if (link.getAttribute('data-section') === sectionId) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
        activeSection = sectionId;
        if (!isMobile) {
            if (isMainPage) {
                updateIndicatorPosition(sectionId);
            } else {
                snapIndicatorToLogo();
            }
        }
    }

    function snapIndicatorToLogo(immediate = false) {
        if (isMobile) return;
        const navRect = nav.getBoundingClientRect();
        const logoRect = logoText.getBoundingClientRect();
        const leftPosition = logoRect.left - navRect.left;
        if (immediate) {
            indicator.style.transition = 'none';
        } else {
            indicator.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.1, 0.25, 1), width 0.4s cubic-bezier(0.25, 0.1, 0.25, 1), opacity 0.4s cubic-bezier(0.25, 0.1, 0.25, 1)';
        }
        indicator.style.width = `${logoRect.width}px`;
        indicator.style.transform = `translateX(${leftPosition}px)`;
        indicator.style.opacity = '1';
        if (immediate) {
            indicator.offsetWidth;
            indicator.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.1, 0.25, 1), width 0.4s cubic-bezier(0.25, 0.1, 0.25, 1), opacity 0.4s cubic-bezier(0.25, 0.1, 0.25, 1)';
        }
    }

    function updateIndicatorPosition(sectionId, immediate = false) {
        if (isMobile) return;
        if (!isMainPage) {
            snapIndicatorToLogo(immediate);
            return;
        }
        const activeLink = document.querySelector(`.nav-link[data-section="${sectionId}"]`);
        if (!activeLink) return;
        const navRect = nav.getBoundingClientRect();
        const linkRect = activeLink.getBoundingClientRect();
        const leftPosition = linkRect.left - navRect.left;
        if (immediate) {
            indicator.style.transition = 'none';
        } else {
            indicator.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.1, 0.25, 1), width 0.4s cubic-bezier(0.25, 0.1, 0.25, 1), opacity 0.4s cubic-bezier(0.25, 0.1, 0.25, 1)';
        }
        indicator.style.width = `${linkRect.width}px`;
        indicator.style.transform = `translateX(${leftPosition}px)`;
        indicator.style.opacity = '1';
        if (immediate) {
            indicator.offsetWidth;
            indicator.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.1, 0.25, 1), width 0.4s cubic-bezier(0.25, 0.1, 0.25, 1), opacity 0.4s cubic-bezier(0.25, 0.1, 0.25, 1)';
        }
    }

    function handleScroll() {
        if (!isMainPage) return;
        if (!ticking) {
            window.requestAnimationFrame(() => {
                if (isProgrammaticScroll) {
                    ticking = false;
                    return;
                }
                const newActiveSection = determineActiveSection();
                if (newActiveSection && newActiveSection !== activeSection) {
                    setActiveSection(newActiveSection);
                }
                ticking = false;
            });
            ticking = true;
        }
    }

    function handleResize() {
        const wasMobile = isMobile;
        const newIsMobile = window.innerWidth < 768;
        if (wasMobile !== newIsMobile) {
            isMobile = newIsMobile;
            if (!isMobile && nav.classList.contains('active')) {
                nav.classList.remove('active');
                mobileMenuToggle.classList.remove('active');
            }
        }
        calculateSectionPositions();
        if (!isMobile) {
            if (isMainPage) {
                updateIndicatorPosition(activeSection, true);
            } else {
                snapIndicatorToLogo(true);
            }
        }
    }

    function toggleMobileMenu() {
        nav.classList.toggle('active');
        mobileMenuToggle.classList.toggle('active');
        header.classList.toggle('mobile-menu-open');
        const blurOverlay = document.querySelector('.menu-blur-overlay');
        if (header.classList.contains('mobile-menu-open')) {
            blurOverlay.classList.add('active');
        } else {
            blurOverlay.classList.remove('active');
        }
    }

    function scrollToSection(sectionId) {
        if (!isMainPage) return;
        const section = sections[sectionId];
        if (!section) return;
        if (programmaticScrollTimeout) {
            clearTimeout(programmaticScrollTimeout);
        }
        isProgrammaticScroll = true;
        setActiveSection(sectionId);
        const offsetPosition = sectionPositions[sectionId].top - header.offsetHeight;
        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
        if (isMobile && nav.classList.contains('active')) {
            toggleMobileMenu();
        }
        programmaticScrollTimeout = setTimeout(() => {
            isProgrammaticScroll = false;
        }, 800);
    }
    window.addEventListener('scroll', handleScroll, {
        passive: true
    });
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(handleResize, 100);
    });
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionId = link.getAttribute('data-section');
            if (isMainPage) {
                scrollToSection(sectionId);
            } else {
                window.location.href = `/index.html#${sectionId}`;
            }
        });
    });
    mobileMenuToggle.addEventListener('click', toggleMobileMenu);
    init();
    window.addEventListener('load', () => {
        calculateSectionPositions();
        if (isMainPage) {
            updateIndicatorPosition(activeSection, true);
        } else {
            snapIndicatorToLogo(true);
        }
    });
});