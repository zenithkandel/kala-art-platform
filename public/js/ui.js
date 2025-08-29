(function(){
  // Mobile menu toggle with enhanced animation
  const menuBtn = document.querySelector('.nav__menu');
  const links = document.querySelector('.nav__links');
  if(menuBtn && links){
    menuBtn.addEventListener('click', () => {
      const isOpen = links.hasAttribute('data-open');
      if(isOpen){ 
        links.classList.add('animate-fadeInUp');
        links.removeAttribute('data-open'); 
        menuBtn.setAttribute('aria-expanded', 'false'); 
      } else { 
        links.setAttribute('data-open', ''); 
        links.classList.add('animate-fadeInUp');
        menuBtn.setAttribute('aria-expanded', 'true'); 
      }
    });
  }

  // Enhanced reveal-on-scroll with simple animations
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if(e.isIntersecting){ 
        e.target.setAttribute('data-inview','');
        e.target.style.opacity = '1';
        e.target.style.transform = 'translateY(0)';
        io.unobserve(e.target); 
      }
    });
  }, { rootMargin: '0px 0px -5% 0px', threshold: 0.15 });
  
  // Observe cards and other elements with initial hidden state
  document.querySelectorAll('.card, .stat, .form').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    io.observe(el);
  });

  // Enhanced smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener('click', (e) => {
    const id = a.getAttribute('href');
    const target = id && document.querySelector(id);
    if(target){ 
      e.preventDefault(); 
      target.scrollIntoView({ behavior: 'smooth', block: 'start' }); 
      // Add focus ring animation
      target.classList.add('focus-ring');
      setTimeout(() => target.classList.remove('focus-ring'), 2000);
    }
  }));

  // Simple button hover effects
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('mouseenter', () => {
      btn.style.transform = 'translateY(-2px) scale(1.02)';
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });

  // Remove floating animations for cleaner look

  // Progressive enhancement for stats counter animation
  const statNumbers = document.querySelectorAll('.stat__num');
  statNumbers.forEach(stat => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    });
    observer.observe(stat);
  });

  function animateCounter(element) {
    const target = parseInt(element.textContent) || 0;
    const duration = 2000;
    const start = performance.now();
    const startValue = 0;

    function update(currentTime) {
      const elapsed = currentTime - start;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const current = Math.floor(startValue + (target - startValue) * easeOutQuart);
      
      element.textContent = current;
      
      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        element.textContent = target;
      }
    }
    
    requestAnimationFrame(update);
  }

  // Add parallax effect to background elements (subtle)
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    window.addEventListener('scroll', () => {
      const scrolled = window.pageYOffset;
      const hero = document.querySelector('.hero');
      if (hero) {
        hero.style.transform = `translateY(${scrolled * 0.1}px)`;
      }
    });
  }

  // Enhanced form interactions
  document.querySelectorAll('input, textarea').forEach(input => {
    input.addEventListener('focus', () => {
      input.parentElement.classList.add('animate-scaleIn');
    });
    input.addEventListener('blur', () => {
      input.parentElement.classList.remove('animate-scaleIn');
    });
  });
})();
