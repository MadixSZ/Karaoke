// navbar-scroll.js -
(function() {
  const navbar = document.querySelector('nav.navbar-transparente');
  let lastScrollY = window.scrollY;
  const navbarHeight = navbar.offsetHeight;
  let ticking = false;

  function updateNavbar() {
    const currentScrollY = window.scrollY;
    
    // Se está rolando para baixo e passou da altura da navbar, esconde
    if (currentScrollY > lastScrollY && currentScrollY > navbarHeight) {
      navbar.classList.add('navbar-hidden');
    } 
    // Se está rolando para cima, mostra
    else if (currentScrollY < lastScrollY) {
      navbar.classList.remove('navbar-hidden');
    }
    
    lastScrollY = currentScrollY;
    ticking = false;
  }

  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(updateNavbar);
      ticking = true;
    }
  }

  // Inicializa a navbar 
  navbar.classList.remove('navbar-hidden');
  
  window.addEventListener('scroll', onScroll, { passive: true });
})();