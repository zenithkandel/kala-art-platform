(function(){
  const canvas = document.getElementById('bgParticles');
  if(!canvas) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduce) { canvas.style.display = 'none'; return; }
  
  const ctx = canvas.getContext('2d');
  let w, h, pxRatio, mouse = {x: 0, y: 0};
  
  function resize(){
    w = canvas.width = window.innerWidth * (window.devicePixelRatio||1);
    h = canvas.height = window.innerHeight * (window.devicePixelRatio||1);
    pxRatio = window.devicePixelRatio||1;
  }
  resize();
  window.addEventListener('resize', resize);

  // Track mouse for interactive particles
  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX * pxRatio;
    mouse.y = e.clientY * pxRatio;
  });

  const N = Math.max(8, Math.min(15, Math.floor((window.innerWidth*window.innerHeight)/200000)));
  const parts = Array.from({length:N}, () => ({
    x: Math.random()*w, 
    y: Math.random()*h,
    vx: (Math.random()-.5)*0.1*pxRatio, 
    vy: (Math.random()-.5)*0.1*pxRatio,
    r: (Math.random()*1.5 + 0.3)*pxRatio, 
    a: Math.random()*0.4 + 0.1,
    color: Math.random() < 0.7 ? [124,92,255] : [74,214,184], // mix primary and accent
    phase: Math.random() * Math.PI * 2, // for pulsing
    pulse: Math.random() * 0.01 + 0.005
  }));

  let raf, last=0;
  function step(ts){
    if(document.hidden){ raf = requestAnimationFrame(step); return; }
    const dt = Math.min(32, ts - last); last = ts;
    
    ctx.clearRect(0,0,w,h);
    ctx.globalCompositeOperation = 'screen';
    
    parts.forEach((p, i) => {
      // Update position
      p.x += p.vx*dt; 
      p.y += p.vy*dt;
      
      // Bounce off edges
      if(p.x<0||p.x>w) p.vx*=-1; 
      if(p.y<0||p.y>h) p.vy*=-1;
      
      // Mouse interaction - very subtle attraction
      const dx = mouse.x - p.x;
      const dy = mouse.y - p.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if(dist < 150*pxRatio) {
        const force = (150*pxRatio - dist) / (150*pxRatio);
        p.vx += dx * force * 0.00005;
        p.vy += dy * force * 0.00005;
      }
      
      // Simple core particle - no pulse
      ctx.save();
      ctx.globalAlpha = p.a;
      ctx.fillStyle = `rgba(${p.color[0]},${p.color[1]},${p.color[2]},0.6)`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
      ctx.fill();
      ctx.restore();
      
      // Draw connections to nearby particles - removed for cleaner look
    });
    
    raf = requestAnimationFrame(step);
  }
  raf = requestAnimationFrame(step);
})();
