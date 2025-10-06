document.addEventListener('DOMContentLoaded', function() {
  const hamburger = document.querySelector('.hamburger');
  const menu = document.getElementById('menu');
  const body = document.body;

  if (!hamburger || !menu) return;

  hamburger.addEventListener('click', function() {
    // Toggle aktywnych klas
    hamburger.classList.toggle('active');
    menu.classList.toggle('active');
    body.classList.toggle('menu-open');
  });

  // Zamknij menu po kliknięciu w link
  const menuLinks = menu.querySelectorAll('a');
  menuLinks.forEach(function(link) {
    link.addEventListener('click', function() {
      if (menu.classList.contains('active')) {
        hamburger.classList.remove('active');
        menu.classList.remove('active');
        body.classList.remove('menu-open');
      }
    });
  });

  // Zamknij menu po kliknięciu poza nim
  document.addEventListener('click', function(event) {
    const isClickInsideMenu = menu.contains(event.target);
    const isClickOnHamburger = hamburger.contains(event.target);

    if (!isClickInsideMenu && !isClickOnHamburger && menu.classList.contains('active')) {
      hamburger.classList.remove('active');
      menu.classList.remove('active');
      body.classList.remove('menu-open');
    }
  });

  // Zamknij menu przy resize powyżej 768px
  window.addEventListener('resize', function() {
    if (window.innerWidth > 768 && menu.classList.contains('active')) {
      hamburger.classList.remove('active');
      menu.classList.remove('active');
      body.classList.remove('menu-open');
    }
  });
});