import { ensureAudio, toggleMute } from './audio.js';
import {
  G, resetLevel, updatePlayer, updateEnemies, updateBlocks, updateParticles,
  setGameOverHandler, setGameWinHandler
} from './physics.js';
import { initRenderer, draw, updateHud } from './render.js';
import './input.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
initRenderer(ctx);

document.getElementById('muteBtn').addEventListener('click', function(){
  const muted = toggleMute();
  this.textContent = muted ? '🔇 صدا' : '🔊 صدا';
  this.classList.toggle('on', !muted);
});

setGameOverHandler((score)=>{
  document.getElementById('loseScore').textContent = 'امتیاز نهایی: ' + score;
  document.getElementById('loseOverlay').hidden = false;
});
setGameWinHandler((score, coinCount)=>{
  document.getElementById('winScore').textContent = 'امتیاز: ' + score + '  |  سکه: ' + coinCount;
  document.getElementById('winOverlay').hidden = false;
});

function startGame(){
  ensureAudio();
  resetLevel();
  G.state = 'playing';
  document.getElementById('startOverlay').hidden = true;
  document.getElementById('loseOverlay').hidden = true;
  document.getElementById('winOverlay').hidden = true;
}

document.getElementById('startBtn').addEventListener('click', startGame);
document.getElementById('retryBtn').addEventListener('click', startGame);
document.getElementById('againBtn').addEventListener('click', startGame);

let lastT = performance.now();
function loop(t){
  const dt = Math.max(0, Math.min(2.2, (t-lastT)/16.67));
  lastT = t;
  if(G.state==='playing' || G.state==='sliding'){
    updatePlayer(dt);
    updateEnemies(dt);
    updateBlocks(dt);
    updateParticles(dt);
  }
  draw();
  updateHud();
  requestAnimationFrame(loop);
}

updateHud();
draw();
requestAnimationFrame(loop);
