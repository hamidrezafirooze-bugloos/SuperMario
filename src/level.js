import { GROUND_Y, H } from './constants.js';

// Layout rhythm (pipe pairs, block clusters, the mid pit, the closing
// staircase pyramid before the flag) follows the classic World 1-1 map,
// redrawn here with original programmer art rather than any copyrighted tiles.
export const LEVEL_W = 3940;

// ground segments: [x, width] on the GROUND_Y line, with a pit gap
export const groundSegments = [
  {x:0, w:1180},
  {x:1300, w:2600}
];

export function solidsFromGround(){
  return groundSegments.map(s=>({x:s.x,y:GROUND_Y,w:s.w,h:H-GROUND_Y,type:'ground'}));
}

export const pipes = [
  {x:340,w:70,h:64}, {x:640,w:70,h:80}, {x:900,w:70,h:96},
  {x:2080,w:70,h:64}, {x:3660,w:70,h:64}
].map(p=>({x:p.x,y:GROUND_Y-p.h,w:p.w,h:p.h,type:'pipe'}));

export const blocks = [
  {x:520,y:170,type:'question',used:false},
  {x:1420,y:170,type:'brick'},
  {x:1452,y:170,type:'question',used:false},
  {x:1484,y:170,type:'brick'},
  {x:1516,y:170,type:'brick'},
  {x:1560,y:200,type:'question',used:false},
  {x:1900,y:170,type:'question',used:false},
  {x:2260,y:170,type:'brick'},
  {x:2292,y:170,type:'question',used:false},
  {x:2600,y:210,type:'brick'},
  {x:2632,y:210,type:'question',used:false},
  {x:2664,y:210,type:'brick'},
].map(b=>({...b, w:32, h:32, bump:0}));

// closing staircase pyramid, the signature run-up to the flagpole
const STAIR_TILE = 32;
function buildPyramid(x0, steps, tile){
  const arr = [];
  const total = steps*2-1;
  for(let i=0;i<total;i++){
    const height = Math.min(i, total-1-i)+1;
    for(let h=0; h<height; h++){
      arr.push({x:x0+i*tile, y:GROUND_Y - tile*(h+1), w:tile, h:tile, type:'stair'});
    }
  }
  return arr;
}
export const stairs = buildPyramid(3340, 4, STAIR_TILE);

export const coins = [
  {x:1220,y:230},{x:1260,y:200},{x:1360,y:180},{x:1410,y:230},
  {x:1900,y:130},{x:2900,y:230},{x:2940,y:200},{x:2980,y:230},
  {x:200,y:220},{x:240,y:220},
  {x:3400,y:GROUND_Y-64},{x:3568,y:GROUND_Y-160},
].map(c=>({...c, w:18, h:18, taken:false, bob:Math.random()*10}));

export const enemies = [
  {x:520, min:420, max:1120},
  {x:1700, min:1360, max:2260},
  {x:2450, min:1360, max:2960},
  {x:3120, min:3000, max:3300},
].map(e=>({x:e.x, min:e.min, max:e.max, y:GROUND_Y-28, w:30, h:28, dir:-1, speed:1.1, alive:true, squashT:0}));

export const flag = {x:3860, y:70, h:GROUND_Y-70};

// ---------- clouds / hills / bushes (parallax) ----------
export const clouds = [];
for(let i=0;i<14;i++) clouds.push({x:Math.random()*LEVEL_W, y:40+Math.random()*90, s:0.7+Math.random()*0.8});
export const hills = [];
for(let i=0;i<10;i++) hills.push({x:i*420+Math.random()*80, s:0.8+Math.random()*0.6});
export const bushes = [];
for(let i=0;i<16;i++) bushes.push({x:Math.random()*LEVEL_W, s:0.8+Math.random()*0.7});
