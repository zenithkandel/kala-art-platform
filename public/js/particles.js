(function(){
  const canvas = document.getElementById('bgParticles');
  if(!canvas) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduce) { canvas.style.display = 'none'; return; }
  const ctx = canvas.getContext('2d');
  let w, h, pxRatio;
  function resize(){
    w = canvas.width = window.innerWidth * (window.devicePixelRatio||1);
    h = canvas.height = window.innerHeight * (window.devicePixelRatio||1);
    pxRatio = window.devicePixelRatio||1;
  }
  resize();
  window.addEventListener('resize', resize);
  const N = Math.max(24, Math.min(48, Math.floor((window.innerWidth*window.innerHeight)/60000)));
  const parts = Array.from({length:N}, () => ({
    x: Math.random()*w, y: Math.random()*h,
    vx: (Math.random()-.5)*0.15*pxRatio, vy: (Math.random()-.5)*0.15*pxRatio,
    r: (Math.random()*1.4 + 0.6)*pxRatio, a: Math.random()*0.6 + 0.2
  }));
  let raf, last=0;
  function step(ts){
    if(document.hidden){ raf = requestAnimationFrame(step); return; }
    const dt = Math.min(32, ts - last); last = ts;
    ctx.clearRect(0,0,w,h);
    ctx.globalCompositeOperation = 'lighter';
    parts.forEach(p => {
      p.x += p.vx*dt; p.y += p.vy*dt;
      if(p.x<0||p.x>w) p.vx*=-1; if(p.y<0||p.y>h) p.vy*=-1;
      ctx.beginPath();
      ctx.fillStyle = `rgba(124,92,255,${p.a})`;
      ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
      ctx.fill();
    });
    raf = requestAnimationFrame(step);
  }
  raf = requestAnimationFrame(step);
})();
