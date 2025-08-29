(function(){
  const el = document.getElementById('pageTransition');
  if(!el) return;
  const D = 250;
  function show(){ el.setAttribute('data-active',''); }
  function hide(){ setTimeout(()=> el.removeAttribute('data-active'), D); }
  window.addEventListener('pageshow', hide);
  // Intercept internal navigations for a subtle transition
  document.addEventListener('click', (e)=>{
    const a = e.target.closest('a[href]');
    if(!a) return;
    const url = new URL(a.href, window.location.href);
    const sameOrigin = url.origin === window.location.origin;
    const isHash = url.pathname === window.location.pathname && url.hash;
    if(sameOrigin && !isHash && !a.target && !a.hasAttribute('download')){
      e.preventDefault();
      show();
      setTimeout(()=> { window.location.href = a.href; }, D);
    }
  });
  // initial fade-in
  hide();
})();
