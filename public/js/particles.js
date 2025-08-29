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

  const N = Math.max(12, Math.min(20, Math.floor((window.innerWidth*window.innerHeight)/150000)));
  const parts = Array.from({length:N}, () => ({
    x: Math.random()*w, 
    y: Math.random()*h,
    vx: (Math.random()-.5)*0.15*pxRatio, 
    vy: (Math.random()-.5)*0.15*pxRatio,
    r: (Math.random()*1.2 + 0.4)*pxRatio, 
    a: Math.random()*0.3 + 0.15,
    color: [124,92,255], // Only use primary purple
    phase: Math.random() * Math.PI * 2,
    pulse: Math.random() * 0.008 + 0.004,
    drift: Math.random() * 0.02 + 0.01
  }));

  let raf, last=0;
  function step(ts){
    if(document.hidden){ raf = requestAnimationFrame(step); return; }
    const dt = Math.min(32, ts - last); last = ts;
    
    ctx.clearRect(0,0,w,h);
    ctx.globalCompositeOperation = 'screen';
    
    parts.forEach((p, i) => {
      // Update position with gentle drift
      p.x += p.vx*dt + Math.sin(p.phase * 0.5) * p.drift; 
      p.y += p.vy*dt + Math.cos(p.phase * 0.7) * p.drift;
      
      // Bounce off edges
      if(p.x<0||p.x>w) p.vx*=-1; 
      if(p.y<0||p.y>h) p.vy*=-1;
      
      // Mouse interaction - very subtle attraction
      const dx = mouse.x - p.x;
      const dy = mouse.y - p.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if(dist < 120*pxRatio) {
        const force = (120*pxRatio - dist) / (120*pxRatio);
        p.vx += dx * force * 0.00003;
        p.vy += dy * force * 0.00003;
      }
      
      // Update phase for gentle pulsing
      p.phase += p.pulse;
      const pulseScale = 1 + Math.sin(p.phase) * 0.2;
      
      // Draw particle with gentle glow
      ctx.save();
      ctx.globalAlpha = p.a * (0.8 + Math.sin(p.phase) * 0.2);
      
      // Soft glow effect
      const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * pulseScale * 2);
      gradient.addColorStop(0, `rgba(${p.color[0]},${p.color[1]},${p.color[2]},0.4)`);
      gradient.addColorStop(0.7, `rgba(${p.color[0]},${p.color[1]},${p.color[2]},0.1)`);
      gradient.addColorStop(1, `rgba(${p.color[0]},${p.color[1]},${p.color[2]},0)`);
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * pulseScale * 2, 0, Math.PI*2);
      ctx.fill();
      
      // Core particle
      ctx.fillStyle = `rgba(${p.color[0]},${p.color[1]},${p.color[2]},0.8)`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * pulseScale, 0, Math.PI*2);
      ctx.fill();
      
      ctx.restore();
      
      // Draw connections to nearby particles - removed for cleaner look
    });
    
    raf = requestAnimationFrame(step);
  }
  raf = requestAnimationFrame(step);
})();
