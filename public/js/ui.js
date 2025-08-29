(function(){
  // Mobile menu toggle
  const menuBtn = document.querySelector('.nav__menu');
  const links = document.querySelector('.nav__links');
  if(menuBtn && links){
    menuBtn.addEventListener('click', () => {
      const isOpen = links.hasAttribute('data-open');
      if(isOpen){ links.removeAttribute('data-open'); menuBtn.setAttribute('aria-expanded', 'false'); }
      else { links.setAttribute('data-open', ''); menuBtn.setAttribute('aria-expanded', 'true'); }
    });
  }

  // Reveal-on-scroll for cards
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if(e.isIntersecting){ e.target.setAttribute('data-inview',''); io.unobserve(e.target); }
    });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });
  document.querySelectorAll('.card').forEach(el => io.observe(el));

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener('click', (e) => {
    const id = a.getAttribute('href');
    const target = id && document.querySelector(id);
    if(target){ e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  }));
})();
