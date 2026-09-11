let audioCtx = null;
let muted = false;

export function ensureAudio(){
  if(!audioCtx){
    try{ audioCtx = new (window.AudioContext||window.webkitAudioContext)(); }catch(e){}
  }
}

function beep(freq, dur, type, gain, delay){
  if(muted || !audioCtx) return;
  const t0 = audioCtx.currentTime + (delay||0);
  const osc = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  osc.type = type||'square';
  osc.frequency.setValueAtTime(freq, t0);
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(gain||0.15, t0+0.01);
  g.gain.exponentialRampToValueAtTime(0.001, t0+dur);
  osc.connect(g).connect(audioCtx.destination);
  osc.start(t0);
  osc.stop(t0+dur+0.02);
}

export const sfx = {
  jump(){ beep(520,0.14,'square',0.14); beep(760,0.10,'square',0.10,0.04); },
  coin(){ beep(988,0.08,'square',0.16); beep(1568,0.16,'square',0.14,0.06); },
  stomp(){ beep(180,0.12,'square',0.18); },
  bump(){ beep(140,0.08,'square',0.12); },
  hurt(){ beep(220,0.3,'sawtooth',0.16); beep(140,0.35,'sawtooth',0.14,0.05); },
  win(){ [523,659,784,1046].forEach((f,i)=>beep(f,0.22,'square',0.15,i*0.14)); },
  dead(){ [392,349,330,294,262].forEach((f,i)=>beep(f,0.25,'triangle',0.16,i*0.16)); }
};

export function isMuted(){ return muted; }
export function toggleMute(){ muted = !muted; return muted; }
