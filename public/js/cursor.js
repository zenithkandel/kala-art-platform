(function(){
  if(matchMedia('(pointer: coarse)').matches) return; // disable on touch
  const root = document.documentElement;
  const c = document.getElementById('cursor');
  const dot = document.getElementById('cursorDot');
  if(!c||!dot) return;
  let x=0, y=0; let tx=0, ty=0; const lerp = (a,b,t)=>a+(b-a)*t;
  function move(e){ x = e.clientX; y = e.clientY; }
  window.addEventListener('mousemove', move);
  window.addEventListener('mousedown', ()=> root.classList.add('cursor--active'));
  window.addEventListener('mouseup', ()=> root.classList.remove('cursor--active'));
  function loop(){
    tx = lerp(tx, x, 0.2); ty = lerp(ty, y, 0.2);
    dot.style.left = tx + 'px'; dot.style.top = ty + 'px';
    requestAnimationFrame(loop);
  }
  loop();
  const hoverables = 'a, button, .btn, .card, input, textarea, select';
  document.addEventListener('mouseover', (e)=>{
    if(e.target.closest(hoverables)) root.classList.add('cursor--hover');
  });
  document.addEventListener('mouseout', (e)=>{
    if(e.target.closest(hoverables)) root.classList.remove('cursor--hover');
  });
})();
