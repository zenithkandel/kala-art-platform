(function(){
  const root = document.documentElement;
  const stored = localStorage.getItem('theme');
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  const initial = stored || (media.matches ? 'dark' : 'light');
  root.setAttribute('data-theme', initial);
  const btn = document.getElementById('themeToggle');
  function setTheme(next){ root.setAttribute('data-theme', next); localStorage.setItem('theme', next); }
  if(btn){
    btn.addEventListener('click', () => {
      const curr = root.getAttribute('data-theme');
      setTheme(curr === 'dark' ? 'light' : 'dark');
      const icon = btn.querySelector('i');
      icon.className = (root.getAttribute('data-theme') === 'dark') ? 'fa-duotone fa-sun-bright' : 'fa-duotone fa-moon-stars';
    });
    // Set initial icon
    const icon = btn.querySelector('i');
    icon.className = (initial === 'dark') ? 'fa-duotone fa-sun-bright' : 'fa-duotone fa-moon-stars';
  }
})();
