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

  const N = Math.max(30, Math.min(60, Math.floor((window.innerWidth*window.innerHeight)/50000)));
  const parts = Array.from({length:N}, () => ({
    x: Math.random()*w, 
    y: Math.random()*h,
    vx: (Math.random()-.5)*0.2*pxRatio, 
    vy: (Math.random()-.5)*0.2*pxRatio,
    r: (Math.random()*2 + 0.5)*pxRatio, 
    a: Math.random()*0.8 + 0.2,
    color: Math.random() < 0.7 ? [124,92,255] : [74,214,184], // mix primary and accent
    phase: Math.random() * Math.PI * 2, // for pulsing
    pulse: Math.random() * 0.02 + 0.01
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
      
      // Mouse interaction - subtle attraction
      const dx = mouse.x - p.x;
      const dy = mouse.y - p.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if(dist < 200*pxRatio) {
        const force = (200*pxRatio - dist) / (200*pxRatio);
        p.vx += dx * force * 0.0001;
        p.vy += dy * force * 0.0001;
      }
      
      // Update pulse phase
      p.phase += p.pulse;
      const pulseScale = 1 + Math.sin(p.phase) * 0.3;
      
      // Draw particle with enhanced effects
      ctx.save();
      ctx.globalAlpha = p.a * (0.7 + Math.sin(p.phase) * 0.3);
      
      // Glow effect
      const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * pulseScale * 3);
      gradient.addColorStop(0, `rgba(${p.color[0]},${p.color[1]},${p.color[2]},0.8)`);
      gradient.addColorStop(0.5, `rgba(${p.color[0]},${p.color[1]},${p.color[2]},0.3)`);
      gradient.addColorStop(1, `rgba(${p.color[0]},${p.color[1]},${p.color[2]},0)`);
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * pulseScale * 3, 0, Math.PI*2);
      ctx.fill();
      
      // Core particle
      ctx.fillStyle = `rgba(${p.color[0]},${p.color[1]},${p.color[2]},1)`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * pulseScale, 0, Math.PI*2);
      ctx.fill();
      
      ctx.restore();
      
      // Draw connections to nearby particles
      for(let j = i + 1; j < parts.length; j++) {
        const other = parts[j];
        const dx2 = p.x - other.x;
        const dy2 = p.y - other.y;
        const dist2 = Math.sqrt(dx2*dx2 + dy2*dy2);
        
        if(dist2 < 120*pxRatio) {
          ctx.save();
          ctx.globalAlpha = (120*pxRatio - dist2) / (120*pxRatio) * 0.15;
          ctx.strokeStyle = `rgba(${p.color[0]},${p.color[1]},${p.color[2]},1)`;
          ctx.lineWidth = 0.5*pxRatio;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(other.x, other.y);
          ctx.stroke();
          ctx.restore();
        }
      }
    });
    
    raf = requestAnimationFrame(step);
  }
  raf = requestAnimationFrame(step);
})();
