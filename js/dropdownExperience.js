document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('toggle-logos');
    btn.addEventListener('click', () => {
        const open = document.body.classList.toggle('logos-open');
        btn.setAttribute('aria-expanded', open);
        btn.setAttribute('aria-label', open ? 'Hide games' : 'Show more games');
    });
});
