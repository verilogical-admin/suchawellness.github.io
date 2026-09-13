const yogaNav = document.querySelector('.sucha-nav');
const yogaMenu = yogaNav.querySelector('.nav-menu-toggle');
yogaMenu.addEventListener('click', () => {
 const open = yogaNav.classList.toggle('is-menu-open');
 yogaMenu.setAttribute('aria-expanded', String(open));
 yogaMenu.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
});
yogaNav.querySelector('.nav-links').addEventListener('click', event => {
 if (!event.target.closest('a')) return;
 yogaNav.classList.remove('is-menu-open');
 yogaMenu.setAttribute('aria-expanded', 'false');
 yogaMenu.setAttribute('aria-label', 'Open menu');
});
