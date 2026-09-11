import { W, H, GROUND_Y } from './constants.js';
import { LEVEL_W, solidsFromGround, pipes, blocks, stairs, coins, enemies, flag } from './level.js';
import { keys, consumeJumpBuffer } from './input.js';
import { sfx } from './audio.js';

const GRAVITY = 0.62, MAX_FALL = 15, MOVE_ACCEL = 0.55, MAX_SPEED = 4.4, FRICTION = 0.72, JUMP_V = -12.4, JUMP_CUT = 0.5;

export const player = { x:60, y:0, w:26, h:34, vx:0, vy:0, onGround:false, dir:1, anim:0, alive:true, invuln:0, sliding:false };

export const G = {
  camX: 0,
  score: 0,
  coinCount: 0,
  lives: 3,
  state: 'ready', // ready | playing | dead | win | sliding
  particles: [],
  flyCoins: [],
};

let onGameOver = ()=>{};
let onGameWin = ()=>{};
export function setGameOverHandler(fn){ onGameOver = fn; }
export function setGameWinHandler(fn){ onGameWin = fn; }

export function resetPlayer(){
  player.x = 60; player.y = GROUND_Y - player.h - 1; player.vx=0; player.vy=0; player.onGround=false; player.invuln=90; player.alive=true;
}

export function resetLevel(){
  blocks.forEach(b=>{b.used=false; b.bump=0;});
  coins.forEach(c=>c.taken=false);
  enemies.forEach(e=>{e.alive=true; e.dir=-1; e.squashT=0;});
  G.score=0; G.coinCount=0; G.lives=3;
  G.particles=[]; G.flyCoins=[];
  resetPlayer();
}
resetLevel();

function allSolids(){ return solidsFromGround().concat(pipes, blocks, stairs); }

function aabb(a,b){ return a.x < b.x+b.w && a.x+a.w > b.x && a.y < b.y+b.h && a.y+a.h > b.y; }

export function updatePlayer(dt){
  if(!player.alive) return;
  // horizontal input
  if(keys.left && !keys.right){ player.vx -= MOVE_ACCEL*dt; player.dir=-1; }
  else if(keys.right && !keys.left){ player.vx += MOVE_ACCEL*dt; player.dir=1; }
  else { player.vx *= Math.pow(FRICTION, dt); if(Math.abs(player.vx)<0.05) player.vx=0; }
  player.vx = Math.max(-MAX_SPEED, Math.min(MAX_SPEED, player.vx));

  if(consumeJumpBuffer() && player.onGround){
    player.vy = JUMP_V;
    player.onGround = false;
    sfx.jump();
  }
  if(!keys.jump && player.vy < -JUMP_V*JUMP_CUT*-1 && player.vy < 0){
    // variable jump height: cut upward velocity if jump released early
    player.vy *= 0.92;
  }

  player.vy += GRAVITY*dt;
  if(player.vy > MAX_FALL) player.vy = MAX_FALL;

  const solids = allSolids();

  // move X
  player.x += player.vx*dt;
  player.x = Math.max(0, Math.min(LEVEL_W - player.w, player.x));
  for(const s of solids){
    if(aabb(player,s)){
      if(player.vx > 0) player.x = s.x - player.w;
      else if(player.vx < 0) player.x = s.x + s.w;
      player.vx = 0;
    }
  }

  // move Y
  const prevY = player.y;
  const prevBottom = prevY + player.h;
  player.y += player.vy*dt;
  player.onGround = false;
  for(const s of solids){
    if(aabb(player,s)){
      if(player.vy >= 0 && prevBottom <= s.y + 1){
        // landing on top
        player.y = s.y - player.h;
        player.vy = 0;
        player.onGround = true;
      } else if(player.vy < 0 && prevY >= s.y + s.h - 1){
        // hit head on block from below
        player.y = s.y + s.h;
        player.vy = 0.5;
        if(s.type==='question' || s.type==='brick'){
          bumpBlock(s);
        }
      }
    }
  }

  // fell into pit / off level
  if(player.y > H + 60){
    killPlayer();
    return;
  }

  if(player.invuln>0) player.invuln -= dt;

  // animation
  if(Math.abs(player.vx) > 0.3 && player.onGround){ player.anim += dt*0.28; } else if(player.onGround){ player.anim = 0; }

  G.camX = Math.max(0, Math.min(LEVEL_W - W, player.x - W/2 + player.w/2));

  // enemy collisions
  for(const en of enemies){
    if(!en.alive) continue;
    if(aabb(player, en)){
      const stomp = player.vy > 0 && (prevBottom - en.y) < 16;
      if(stomp){
        en.alive = false; en.squashT = 20;
        player.vy = JUMP_V*0.55;
        G.score += 200; sfx.stomp();
        spawnParticles(en.x+en.w/2, en.y, '#ff5a5f');
      } else if(player.invuln<=0){
        hurtPlayer();
      }
    }
  }

  // coins
  for(const c of coins){
    if(!c.taken && aabb(player, c)){
      c.taken = true; G.coinCount++; G.score += 100; sfx.coin();
    }
  }

  // flag
  if(G.state==='playing' && player.x + player.w >= flag.x){
    G.state = 'sliding';
    player.sliding = true;
    player.x = flag.x;
    sfx.win();
  }
  if(G.state==='sliding'){
    player.vx = 0;
    player.y = Math.min(GROUND_Y - player.h, player.y + 3*dt);
    if(player.y >= GROUND_Y - player.h){
      finishWin();
    }
  }
}

function bumpBlock(b){
  if(b.bump>0) return;
  b.bump = 8;
  if(b.type==='question' && !b.used){
    b.used = true;
    G.score += 100;
    G.flyCoins.push({x:b.x+8, y:b.y, t:0});
    sfx.coin();
  } else {
    sfx.bump();
  }
}

function spawnParticles(x,y,color){
  for(let i=0;i<6;i++){
    G.particles.push({x,y,vx:(Math.random()-0.5)*3,vy:-Math.random()*3-1,life:24,color});
  }
}

function hurtPlayer(){
  G.lives -= 1;
  sfx.hurt();
  if(G.lives<=0){
    killPlayer();
  } else {
    player.invuln = 100;
    player.vx = (player.x < W/2 ? -1:1)*2;
    player.vy = -8;
  }
}

function killPlayer(){
  if(!player.alive) return;
  player.alive = false;
  sfx.dead();
  setTimeout(()=>{
    G.lives -= 1;
    if(G.lives>0){
      resetPlayer();
      player.alive = true;
      G.state = 'playing';
    } else {
      G.state = 'dead';
      onGameOver(G.score);
    }
  }, 700);
}

function finishWin(){
  G.state = 'win';
  onGameWin(G.score, G.coinCount);
}

export function updateEnemies(dt){
  for(const en of enemies){
    if(!en.alive){
      if(en.squashT>0) en.squashT -= dt;
      continue;
    }
    en.x += en.dir*en.speed*dt;
    if(en.x < en.min){ en.x = en.min; en.dir = 1; }
    if(en.x+en.w > en.max){ en.x = en.max-en.w; en.dir = -1; }
  }
}

export function updateBlocks(dt){
  for(const b of blocks){ if(b.bump>0) b.bump = Math.max(0, b.bump-dt); }
}
export function updateParticles(dt){
  G.particles = G.particles.filter(p=>p.life>0);
  for(const p of G.particles){ p.x+=p.vx*dt; p.y+=p.vy*dt; p.vy+=0.18*dt; p.life-=dt; }
  G.flyCoins = G.flyCoins.filter(c=>c.t<18);
  for(const c of G.flyCoins){ c.t += dt; c.y -= 1.1*dt; }
}
