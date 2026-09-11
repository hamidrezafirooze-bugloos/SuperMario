import { W, H, GROUND_Y } from './constants.js';
import { groundSegments, pipes, blocks, stairs, coins, enemies, flag, clouds, hills, bushes } from './level.js';
import { player, G } from './physics.js';

let ctx = null;
export function initRenderer(context){ ctx = context; }

function skyGrad(){
  const g = ctx.createLinearGradient(0,0,0,H);
  g.addColorStop(0,'#5c94fc'); g.addColorStop(1,'#8fb9ff');
  return g;
}

function drawCloud(x,y,s){
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.ellipse(x,y,20*s,12*s,0,0,Math.PI*2);
  ctx.ellipse(x+18*s,y-6*s,16*s,11*s,0,0,Math.PI*2);
  ctx.ellipse(x-18*s,y-4*s,14*s,10*s,0,0,Math.PI*2);
  ctx.ellipse(x+2*s,y+5*s,24*s,10*s,0,0,Math.PI*2);
  ctx.fill();
}
function drawHill(x,s){
  ctx.fillStyle = '#3f9a4d';
  ctx.beginPath();
  ctx.moveTo(x-90*s, GROUND_Y);
  ctx.quadraticCurveTo(x, GROUND_Y-70*s, x+90*s, GROUND_Y);
  ctx.closePath(); ctx.fill();
}
function drawBush(x,s){
  ctx.fillStyle = '#2f8f43';
  const y = GROUND_Y;
  ctx.beginPath();
  ctx.ellipse(x,y,16*s,12*s,0,0,Math.PI*2);
  ctx.ellipse(x+16*s,y+2*s,13*s,10*s,0,0,Math.PI*2);
  ctx.ellipse(x-15*s,y+2*s,12*s,9*s,0,0,Math.PI*2);
  ctx.fill();
}

function drawGround(){
  for(const s of groundSegments){
    const x = s.x - G.camX;
    if(x+s.w < 0 || x > W) continue;
    ctx.fillStyle = '#c8703a';
    ctx.fillRect(x, GROUND_Y, s.w, H-GROUND_Y);
    ctx.fillStyle = '#39a03c';
    ctx.fillRect(x, GROUND_Y, s.w, 12);
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    for(let i=0;i<s.w;i+=32){ ctx.fillRect(x+i, GROUND_Y+12, 2, H-GROUND_Y-12); }
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.fillRect(x, GROUND_Y+12, s.w, 3);
  }
}

function drawPipe(p){
  const x = p.x-G.camX;
  if(x+p.w<0||x>W) return;
  ctx.fillStyle = '#1fa32a';
  ctx.fillRect(x, p.y+14, p.w, p.h-14);
  ctx.fillStyle = '#0e6a17';
  ctx.fillRect(x, p.y+14, 6, p.h-14);
  ctx.fillRect(x+p.w-6, p.y+14, 6, p.h-14);
  ctx.fillStyle = '#28c236';
  ctx.fillRect(x-4, p.y, p.w+8, 18);
  ctx.fillStyle = '#0e6a17';
  ctx.fillRect(x-4, p.y, p.w+8, 5);
}

function drawStair(b){
  const x = b.x-G.camX;
  if(x+b.w<0||x>W) return;
  ctx.fillStyle = '#c8703a';
  ctx.fillRect(x,b.y,b.w,b.h);
  ctx.strokeStyle = '#8a4a20'; ctx.lineWidth=2;
  ctx.strokeRect(x+1,b.y+1,b.w-2,b.h-2);
  ctx.fillStyle = 'rgba(255,255,255,0.18)';
  ctx.fillRect(x+2,b.y+2,b.w-4,4);
}

function drawBlock(b){
  const x = b.x-G.camX;
  if(x+b.w<0||x>W) return;
  const y = b.y - (b.bump>0 ? Math.min(6,b.bump) : 0);
  if(b.type==='question' && !b.used){
    ctx.fillStyle = '#f0a830';
    ctx.fillRect(x,y,b.w,b.h);
    ctx.strokeStyle = '#8a4a20'; ctx.lineWidth=2;
    ctx.strokeRect(x+1,y+1,b.w-2,b.h-2);
    ctx.fillStyle = '#8a4a20';
    ctx.font = "16px 'Press Start 2P'";
    ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText('?', x+b.w/2, y+b.h/2+2);
  } else if(b.type==='question' && b.used){
    ctx.fillStyle = '#9a5a30';
    ctx.fillRect(x,y,b.w,b.h);
    ctx.strokeStyle = '#5a3010'; ctx.lineWidth=2;
    ctx.strokeRect(x+1,y+1,b.w-2,b.h-2);
  } else {
    ctx.fillStyle = '#c8703a';
    ctx.fillRect(x,y,b.w,b.h);
    ctx.strokeStyle = '#8a4a20'; ctx.lineWidth=2;
    ctx.strokeRect(x+1,y+1,b.w-2,b.h-2);
    ctx.beginPath();
    ctx.moveTo(x,y+b.h/2); ctx.lineTo(x+b.w,y+b.h/2);
    ctx.moveTo(x+b.w/2,y); ctx.lineTo(x+b.w/2,y+b.h/2);
    ctx.strokeStyle='#8a4a20'; ctx.lineWidth=1.5; ctx.stroke();
  }
}

function drawCoin(c){
  if(c.taken) return;
  const x = c.x-G.camX;
  if(x+c.w<0||x>W) return;
  const bob = Math.sin((performance.now()/180)+c.bob)*3;
  ctx.save();
  ctx.translate(x+c.w/2, c.y+c.h/2+bob);
  const sq = Math.abs(Math.sin(performance.now()/260));
  ctx.scale(0.4+sq*0.6,1);
  ctx.fillStyle = '#ffd34d';
  ctx.beginPath(); ctx.arc(0,0,c.w/2,0,Math.PI*2); ctx.fill();
  ctx.strokeStyle = '#b8860b'; ctx.lineWidth=2; ctx.stroke();
  ctx.restore();
}

function drawEnemy(en){
  const x = en.x-G.camX;
  if(x+en.w<0||x>W) return;
  ctx.save();
  if(!en.alive){
    ctx.translate(x, en.y+en.h-8);
    ctx.scale(1,0.28);
    ctx.translate(0,-(en.y+en.h-8));
    ctx.translate(x*-1,0);
    ctx.translate(x,0);
  }
  const by = en.y;
  ctx.fillStyle = '#a0522d';
  ctx.beginPath();
  ctx.ellipse(x+en.w/2, by+en.h*0.55, en.w/2, en.h*0.45,0,0,Math.PI*2);
  ctx.fill();
  ctx.fillStyle = '#6b3418';
  ctx.fillRect(x+3, by+en.h-8, en.w-6, 8);
  ctx.fillStyle='#fff';
  ctx.beginPath(); ctx.ellipse(x+en.w*0.32, by+en.h*0.45,4,5,0,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(x+en.w*0.68, by+en.h*0.45,4,5,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#1a1a1a';
  ctx.beginPath(); ctx.arc(x+en.w*0.32, by+en.h*0.47,2,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(x+en.w*0.68, by+en.h*0.47,2,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#4a2410';
  ctx.fillRect(x+en.w*0.18, by+en.h*0.22, en.w*0.22, 4);
  ctx.fillRect(x+en.w*0.60, by+en.h*0.22, en.w*0.22, 4);
  ctx.restore();
}

// the hero, drawn to resemble the reference photo: silver swept hair,
// full grey beard, big round ears, tan skin, white shirt, blue lanyard
function drawHero(){
  if(!player.alive) return;
  const x = player.x - G.camX, y = player.y;
  const w = player.w, h = player.h;
  const dir = player.dir;
  const walking = Math.abs(player.vx) > 0.3 && player.onGround;
  const bob = walking ? Math.sin(player.anim*Math.PI*2)*2 : 0;
  const legSwing = walking ? Math.sin(player.anim*Math.PI*2)*6 : 0;
  const blink = player.invuln>0 && Math.floor(player.invuln/4)%2===0;
  if(blink) return;

  ctx.save();
  ctx.translate(x+w/2, y+h/2+bob);
  ctx.scale(dir,1);

  const skin = '#e3ad7d';
  const skinShade = '#c98f5f';
  const hair = '#c7cbd1';
  const hairShade = '#9aa0aa';
  const shirt = '#f7f7f7';
  const shirtShade = '#d7d7d7';
  const pants = '#31415e';
  const lanyard = '#2f6fe0';

  // legs
  ctx.fillStyle = pants;
  if(!player.onGround){
    ctx.fillRect(-8,10,7,12);
    ctx.fillRect(1,10,7,12);
  } else {
    ctx.fillRect(-8+legSwing*0.15, 10, 7, 12);
    ctx.fillRect(1-legSwing*0.15, 10, 7, 12);
  }

  // torso / shirt
  ctx.fillStyle = shirt;
  ctx.beginPath();
  ctx.moveTo(-9,10); ctx.lineTo(-10,-6); ctx.quadraticCurveTo(0,-11,10,-6); ctx.lineTo(9,10);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = shirtShade;
  ctx.fillRect(-9,4,18,6);

  // arms
  ctx.fillStyle = shirt;
  const armSwing = walking ? Math.sin(player.anim*Math.PI*2+Math.PI)*5 : (player.onGround?0:-4);
  ctx.fillRect(7, -4+armSwing*0.3, 5, 12);
  ctx.fillStyle = skin;
  ctx.fillRect(7, 7+armSwing*0.3, 5, 4);

  // lanyard strap
  ctx.strokeStyle = lanyard; ctx.lineWidth = 2.4;
  ctx.beginPath(); ctx.moveTo(-6,-9); ctx.lineTo(2,6); ctx.stroke();
  ctx.fillStyle = '#dfe6f5';
  ctx.fillRect(0,5,4,5);

  // neck
  ctx.fillStyle = skinShade;
  ctx.fillRect(-4,-10,8,5);

  // ears (big, a signature trait from the reference photo)
  ctx.fillStyle = skin;
  ctx.beginPath(); ctx.ellipse(-11,-16,4.6,6,0,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(11,-16,4.6,6,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle = skinShade;
  ctx.beginPath(); ctx.ellipse(-11,-16,2,3.4,0,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(11,-16,2,3.4,0,0,Math.PI*2); ctx.fill();

  // head
  ctx.fillStyle = skin;
  ctx.beginPath(); ctx.ellipse(0,-18,10.5,10,0,0,Math.PI*2); ctx.fill();

  // beard
  ctx.fillStyle = hair;
  ctx.beginPath();
  ctx.moveTo(-9,-15);
  ctx.quadraticCurveTo(-10,-6,0,-4);
  ctx.quadraticCurveTo(10,-6,9,-15);
  ctx.quadraticCurveTo(6,-11,0,-11);
  ctx.quadraticCurveTo(-6,-11,-9,-15);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = hairShade;
  ctx.beginPath(); ctx.ellipse(0,-6,4,2.4,0,0,Math.PI*2); ctx.fill();

  // hair on top / back
  ctx.fillStyle = hair;
  ctx.beginPath();
  ctx.moveTo(-10.5,-19);
  ctx.quadraticCurveTo(-12,-29,-2,-29);
  ctx.quadraticCurveTo(9,-30,10.5,-20);
  ctx.quadraticCurveTo(6,-25,0,-25.5);
  ctx.quadraticCurveTo(-6,-25,-10.5,-19);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = hairShade;
  ctx.beginPath();
  ctx.ellipse(7,-20,3.4,5,0.5,0,Math.PI*2); ctx.fill();

  // eyebrow
  ctx.strokeStyle = '#6d6f78'; ctx.lineWidth = 1.6; ctx.lineCap='round';
  ctx.beginPath(); ctx.moveTo(2.5,-20.5); ctx.lineTo(7,-21.2); ctx.stroke();

  // eye (front-facing side only, reads as looking forward)
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.ellipse(4.5,-18.5,2.6,2.2,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle = '#3a2a1e';
  ctx.beginPath(); ctx.arc(5.6,-18.3,1.3,0,Math.PI*2); ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.arc(6.1,-18.8,0.5,0,Math.PI*2); ctx.fill();

  // nose
  ctx.fillStyle = skinShade;
  ctx.beginPath(); ctx.moveTo(9.5,-18); ctx.lineTo(12,-15.5); ctx.lineTo(8.5,-15); ctx.closePath(); ctx.fill();

  ctx.restore();
}

function drawFlag(){
  const x = flag.x - G.camX;
  if(x<-30||x>W+30) return;
  ctx.fillStyle = '#c9cdd6';
  ctx.fillRect(x-2, flag.y, 4, flag.h);
  ctx.fillStyle = '#ffd34d';
  ctx.beginPath(); ctx.arc(x, flag.y, 6, 0, Math.PI*2); ctx.fill();
  const wave = Math.sin(performance.now()/220)*4;
  ctx.fillStyle = G.state==='win'||G.state==='sliding' ? '#39a03c' : '#ff5a5f';
  ctx.beginPath();
  ctx.moveTo(x+2, flag.y+10);
  ctx.lineTo(x+30+wave, flag.y+18);
  ctx.lineTo(x+2, flag.y+26);
  ctx.closePath(); ctx.fill();
  // castle block at base
  ctx.fillStyle = '#8a8f9c';
  ctx.fillRect(x-24, GROUND_Y-26, 48, 26);
  ctx.fillStyle = '#6d7280';
  for(let i=0;i<5;i++) ctx.fillRect(x-24+i*10, GROUND_Y-32, 6, 8);
}

export function draw(){
  ctx.fillStyle = skyGrad();
  ctx.fillRect(0,0,W,H);

  for(const c of clouds){ const cx=c.x-G.camX*0.3; if(cx>-40&&cx<W+40) drawCloud(cx,c.y,c.s); }
  for(const hl of hills){ const hx=hl.x-G.camX*0.55; if(hx>-120&&hx<W+120) drawHill(hx,hl.s); }
  for(const b of bushes){ const bx=b.x-G.camX*0.85; if(bx>-40&&bx<W+40) drawBush(bx,b.s); }

  drawGround();
  for(const p of pipes) drawPipe(p);
  for(const b of blocks) drawBlock(b);
  for(const s of stairs) drawStair(s);
  drawFlag();
  for(const c of coins) drawCoin(c);
  for(const en of enemies) drawEnemy(en);
  drawHero();

  // particles
  for(const p of G.particles){
    ctx.fillStyle = p.color;
    ctx.globalAlpha = Math.max(0,p.life/24);
    ctx.fillRect(p.x-G.camX-2,p.y-2,4,4);
    ctx.globalAlpha = 1;
  }
  for(const c of G.flyCoins){
    ctx.save();
    ctx.globalAlpha = Math.max(0,1-c.t/18);
    ctx.fillStyle = '#ffd34d';
    ctx.beginPath(); ctx.arc(c.x-G.camX,c.y,7,0,Math.PI*2); ctx.fill();
    ctx.restore();
  }

  // pit warning stripes at gap edges (subtle depth)
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  for(const s of groundSegments){
    const rightEdge = s.x + s.w - G.camX;
    if(rightEdge>-4 && rightEdge<W+4) ctx.fillRect(rightEdge-3, GROUND_Y, 3, H-GROUND_Y);
    const leftEdge = s.x - G.camX;
    if(leftEdge>-4 && leftEdge<W+4) ctx.fillRect(leftEdge, GROUND_Y, 3, H-GROUND_Y);
  }
}

export function updateHud(){
  document.getElementById('hud-score').textContent = String(G.score).padStart(6,'0');
  document.getElementById('hud-coins').textContent = '×' + String(G.coinCount).padStart(2,'0');
  const livesEl = document.getElementById('hud-lives');
  livesEl.innerHTML = '';
  for(let i=0;i<Math.max(0,G.lives);i++){
    const s = document.createElementNS('http://www.w3.org/2000/svg','svg');
    s.setAttribute('viewBox','0 0 16 14'); s.setAttribute('class','heart');
    s.innerHTML = '<path d="M8 13 C2 9 0 6 0 3.6 C0 1.4 1.8 0 3.7 0 C5.2 0 6.4 0.9 8 2.6 C9.6 0.9 10.8 0 12.3 0 C14.2 0 16 1.4 16 3.6 C16 6 14 9 8 13 Z" fill="#ff5a5f"/>';
    livesEl.appendChild(s);
  }
}
