// Original SHD implementation: three bounded parallax planes + independent idle motion.
// No external dependencies. Mount only inside an empty, dedicated background element.
const slots = [
  { plane: 0, x: 12, y: 28, w: 13, angle: -12, opacity: .78, blur: 0 },
  { plane: 0, x: 88, y: 73, w: 14, angle: 12, opacity: .82, blur: 0 },
  { plane: 0, x: 15, y: 85, w: 12, angle: 11, opacity: .72, blur: 0 },
  { plane: 1, x: 86, y: 17, w: 10, angle: -12, opacity: .58, blur: .5 },
  { plane: 1, x: 30, y: 3, w: 9, angle: -7, opacity: .48, blur: .6 },
  { plane: 1, x: 72, y: 98, w: 10, angle: -9, opacity: .5, blur: .7 },
  { plane: 2, x: 2, y: 58, w: 8, angle: 12, opacity: .29, blur: 1.5 },
  { plane: 2, x: 98, y: 44, w: 8, angle: -13, opacity: .3, blur: 1.5 },
  { plane: 2, x: 67, y: 0, w: 8, angle: 8, opacity: .25, blur: 1.5 },
];

/** @param {HTMLElement} scene @param {HTMLElement} layer @param {string[]} covers */
export function mountFloatingBooks(scene, layer, covers) {
  if (!scene || !layer || !Array.isArray(covers) || !covers.length) return () => {};
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const planes = [0,1,2].map(i => {
    const el = document.createElement('div');
    el.className = 'shd-fb-plane'; el.dataset.plane = String(i);
    return el;
  });
  // Far behind near. Keep DOM order deterministic; do not randomize on render.
  layer.replaceChildren(...[...planes].reverse());
  slots.slice(0, covers.length).forEach((s, i) => {
    const el = document.createElement('div');
    el.className = 'shd-fb-book'; el.dataset.depth = String(s.plane);
    Object.entries({ x: `${s.x}%`, y: `${s.y}%`, w: `${s.w}vw`, angle: `${s.angle}deg`, opacity: s.opacity, blur: `${s.blur}px`, duration: `${6.8 + i * .85}s`, delay: `${-i * 1.17}s`, drift: `${12 + (i%3)*6}px` }).forEach(([k,v])=>el.style.setProperty(`--${k}`, String(v)));
    const img = document.createElement('img'); img.src = covers[i]; img.alt = ''; img.draggable = false; img.decoding = 'async';
    el.append(img); planes[s.plane].append(el);
  });
  const mask = document.createElement('div'); mask.className = 'shd-fb-mask'; layer.append(mask);
  const factors = [1, .5, .25];
  let x=0,y=0,tx=0,ty=0,raf=0,last=0,visible=true,paused=false,running=false;
  const pauseButton = scene.querySelector('[data-fb-pause]');
  function paint() { planes.forEach((p,i)=>p.style.transform=`translate3d(${(x*factors[i]).toFixed(3)}px,${(y*factors[i]).toFixed(3)}px,0)`); }
  function stop() { if(raf) cancelAnimationFrame(raf); raf=0; last=0; }
  function tick(now) {
    raf=0; if(!running || !fine.matches) return;
    const dt=last?Math.min(now-last,50):16.67; last=now;
    const a=1-Math.pow(.92,dt/16.67); // ~0.08 lerp at 60Hz
    x+=(tx-x)*a; y+=(ty-y)*a;
    if(Math.abs(tx-x)<.05 && Math.abs(ty-y)<.05){x=tx;y=ty;paint();last=0;return;}
    paint(); raf=requestAnimationFrame(tick);
  }
  function schedule(){ if(running && fine.matches && !raf) raf=requestAnimationFrame(tick); }
  function onMove(e){
    if(!running || !fine.matches || e.pointerType==='touch')return;
    const r=scene.getBoundingClientRect(); if(!r.width||!r.height)return;
    const clamp=n=>Math.max(-1,Math.min(1,n));
    tx=clamp(2*(e.clientX-r.left)/r.width-1)*95;
    ty=clamp(2*(e.clientY-r.top)/r.height-1)*65;
    schedule();
  }
  function onLeave(){tx=0;ty=0;schedule();}
  function sync(){
    running=visible && !document.hidden && !motion.matches && !paused;
    layer.dataset.running=String(running);
    if(!running || !fine.matches){stop();x=y=tx=ty=0;paint();}
    if(pauseButton){pauseButton.hidden=motion.matches;pauseButton.setAttribute('aria-pressed',String(paused));pauseButton.textContent=paused?'Tiếp tục chuyển động':'Tạm dừng chuyển động';}
  }
  function toggle(){paused=!paused;sync();}
  scene.addEventListener('pointermove',onMove,{passive:true});
  scene.addEventListener('pointerleave',onLeave);
  pauseButton?.addEventListener('click',toggle);
  document.addEventListener('visibilitychange',sync);
  motion.addEventListener('change',sync); fine.addEventListener('change',sync);
  const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();},{threshold:0});
  observer.observe(scene); paint(); sync();
  return ()=>{stop();observer.disconnect();scene.removeEventListener('pointermove',onMove);scene.removeEventListener('pointerleave',onLeave);pauseButton?.removeEventListener('click',toggle);document.removeEventListener('visibilitychange',sync);motion.removeEventListener('change',sync);fine.removeEventListener('change',sync);layer.replaceChildren();delete layer.dataset.running;};
}
