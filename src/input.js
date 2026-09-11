import { ensureAudio } from './audio.js';

export const keys = { left:false, right:false, jump:false };
let jumpBuffered = false;

window.addEventListener('keydown', e=>{
  if(['ArrowLeft','KeyA'].includes(e.code)) keys.left = true;
  if(['ArrowRight','KeyD'].includes(e.code)) keys.right = true;
  if(['Space','ArrowUp','KeyW'].includes(e.code)){ if(!keys.jump) jumpBuffered = true; keys.jump = true; e.preventDefault(); }
  if(['ArrowLeft','ArrowRight','ArrowUp','Space'].includes(e.code)) e.preventDefault();
}, {passive:false});
window.addEventListener('keyup', e=>{
  if(['ArrowLeft','KeyA'].includes(e.code)) keys.left = false;
  if(['ArrowRight','KeyD'].includes(e.code)) keys.right = false;
  if(['Space','ArrowUp','KeyW'].includes(e.code)) keys.jump = false;
});

function bindTouch(id, onDown, onUp){
  const el = document.getElementById(id);
  const down = e=>{ e.preventDefault(); onDown(); ensureAudio(); };
  const up = e=>{ e.preventDefault(); onUp(); };
  el.addEventListener('pointerdown', down);
  el.addEventListener('pointerup', up);
  el.addEventListener('pointerleave', up);
  el.addEventListener('pointercancel', up);
}
bindTouch('btnLeft', ()=>keys.left=true, ()=>keys.left=false);
bindTouch('btnRight', ()=>keys.right=true, ()=>keys.right=false);
bindTouch('btnJump', ()=>{ if(!keys.jump) jumpBuffered = true; keys.jump = true; }, ()=>keys.jump=false);

export function consumeJumpBuffer(){
  const v = jumpBuffered;
  jumpBuffered = false;
  return v;
}
