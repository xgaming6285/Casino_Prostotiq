document.addEventListener('DOMContentLoaded', () => {
    const sliderContainer = document.querySelector('.logo-slider-container'); // Взимаме контейнера на плъзгача
    const track = document.querySelector('.logo-slider-track');
    const logos = Array.from(track.querySelectorAll('img.provider-logo'));

    if (!sliderContainer || !track || logos.length === 0) {
        console.warn('Logo slider container, track, or logos not found.');
        return;
    }

    let scrollEndTimeout;

    function updateCenteredLogoAndFrame() {
        const trackScrollportCenter = track.scrollLeft + (track.clientWidth / 2);
        let centeredLogoElement = null;
        let minDistanceToCenter = Infinity;

        logos.forEach(logo => {
            const logoCenter = logo.offsetLeft + (logo.offsetWidth / 2);
            const distance = Math.abs(logoCenter - trackScrollportCenter);

            if (distance < minDistanceToCenter) {
                minDistanceToCenter = distance;
                centeredLogoElement = logo;
            }
        });

        // Премахваме .is-centered-logo от всички лога
        logos.forEach(logo => {
            logo.classList.remove('is-centered-logo');
        });

        if (centeredLogoElement) {
            // Добавяме класа към новото централно лого
            centeredLogoElement.classList.add('is-centered-logo');

            // Взимаме размерите на централното лого
            const logoWidth = centeredLogoElement.offsetWidth;
            const logoHeight = centeredLogoElement.offsetHeight;

            // Задаваме малко отстояние (padding) за рамката около логото
            const framePaddingHorizontal = 24; // Например 12px от всяка страна (общо 24px)
            const framePaddingVertical = 16;   // Например 8px отгоре и отдолу (общо 16px)

            // Изчисляваме новите размери на рамката
            const newFrameWidth = logoWidth + framePaddingHorizontal;
            const newFrameHeight = logoHeight + framePaddingVertical;

            // Задаваме CSS променливите на .logo-slider-container
            sliderContainer.style.setProperty('--frame-width', newFrameWidth + 'px');
            sliderContainer.style.setProperty('--frame-height', newFrameHeight + 'px');

        } else {
            // По желание: Връщаме към стандартни размери, ако няма центрирано лого 
            // (малко вероятно при scroll-snap-type: mandatory)
            sliderContainer.style.setProperty('--frame-width', '160px'); // Резервна ширина
            sliderContainer.style.setProperty('--frame-height', '100px'); // Резервна височина
        }
    }

    // Първоначално извикване
    function initialSetup() {
        // Изчакваме изображенията да се заредят, за да имаме точни размери
        const imageLoadPromises = logos.map(img => {
            return new Promise(resolve => {
                if (img.complete) {
                    resolve();
                } else {
                    img.onload = resolve;
                    img.onerror = resolve; // Разрешаваме promise-а дори при грешка, за да не блокираме
                }
            });
        });

        Promise.all(imageLoadPromises).then(() => {
            updateCenteredLogoAndFrame(); // Извикваме след като всички изображения са поне опитали да се заредят
        });
    }

    if (document.readyState === 'complete') {
        initialSetup();
    } else {
        window.addEventListener('load', initialSetup);
    }

    // Слушаме за събитието 'scroll' на трака
    if ('onscrollend' in track) {
        track.addEventListener('scrollend', updateCenteredLogoAndFrame);
    } else {
        track.addEventListener('scroll', () => {
            clearTimeout(scrollEndTimeout);
            scrollEndTimeout = setTimeout(updateCenteredLogoAndFrame, 66);
        }, { passive: true });
    }
});