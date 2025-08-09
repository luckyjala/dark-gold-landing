// Combined Three.js hero + GSAP interactions for the Dark+Gold landing
// Uses a stylized vortex (from previous premium script) as hero background.

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, innerWidth/innerHeight, 0.1, 1000);
camera.position.z = 6;

const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('scene'), antialias: true });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.outputEncoding = THREE.sRGBEncoding;

scene.fog = new THREE.FogExp2(0x050007, 0.02);

// Lighting
const keyLight = new THREE.DirectionalLight(0xffe7c2, 0.6);
keyLight.position.set(10, 8, 10);
scene.add(keyLight);
const fill = new THREE.PointLight(0xb88a3a, 0.6, 30);
fill.position.set(-6,-4,6);
scene.add(fill);

// Particle texture (golden glow)
function makeParticleTexture(size=128){
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  const cx = size/2, cy = size/2;
  const r = size/2;
  const g = ctx.createRadialGradient(cx,cy,0,cx,cy,r);
  g.addColorStop(0, 'rgba(255, 245, 200, 1)');
  g.addColorStop(0.2, 'rgba(255, 215, 120, 0.95)');
  g.addColorStop(0.45, 'rgba(200,140,60,0.6)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0,0,size,size);
  for(let i=0;i<12;i++){
    ctx.fillStyle = 'rgba(255,255,255,' + (0.06+Math.random()*0.9).toFixed(2) + ')';
    const sx = cx + (Math.random()-0.5)*r*0.7;
    const sy = cy + (Math.random()-0.5)*r*0.7;
    ctx.fillRect(sx, sy, Math.random()*1.2, Math.random()*1.2);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.premultiplyAlpha = true;
  return tex;
}
const particleTex = makeParticleTexture(128);

// Vortex particles
const PARTICLE_COUNT = 1200;
const positions = new Float32Array(PARTICLE_COUNT*3);
const angles = new Float32Array(PARTICLE_COUNT);
const radii = new Float32Array(PARTICLE_COUNT);
for(let i=0;i<PARTICLE_COUNT;i++){
  const t = i / PARTICLE_COUNT;
  const angle = t * Math.PI * 7 + (Math.random()-0.5)*0.6;
  const radius = 0.6 + Math.pow(t,0.9) * 3.4 + (Math.random()-0.5)*0.12;
  const y = (t - 0.5) * 3.4 + (Math.random()-0.5)*0.5;
  positions[i*3 + 0] = Math.cos(angle) * radius;
  positions[i*3 + 1] = y;
  positions[i*3 + 2] = Math.sin(angle) * radius;
  angles[i] = angle;
  radii[i] = radius;
}
const geom = new THREE.BufferGeometry();
geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
const material = new THREE.PointsMaterial({ size: 0.08, map: particleTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true });
const particles = new THREE.Points(geom, material);
scene.add(particles);

// background ring and streak
const ringGeo = new THREE.RingGeometry(3.0, 3.5, 64);
const ringMat = new THREE.MeshBasicMaterial({ color: 0x3a2208, transparent:true, opacity:0.05, side: THREE.DoubleSide });
const ring = new THREE.Mesh(ringGeo, ringMat);
ring.rotation.x = -Math.PI/2;
ring.position.y = -0.4;
scene.add(ring);

const streakGeo = new THREE.PlaneGeometry(8, 0.35);
const streakMat = new THREE.MeshBasicMaterial({ color: 0xffe6b0, transparent:true, opacity:0.03, side: THREE.DoubleSide });
const streak = new THREE.Mesh(streakGeo, streakMat);
streak.rotation.x = -0.35;
streak.position.z = -1.4;
streak.position.y = 1.0;
scene.add(streak);

// parallax interaction
let mouseX = 0, mouseY = 0;
document.addEventListener('mousemove', (e)=> { mouseX = (e.clientX/innerWidth - 0.5) * 2; mouseY = -(e.clientY/innerHeight - 0.5) * 2; });

// animation
const clock = new THREE.Clock();
function animate(){
  requestAnimationFrame(animate);
  const t = clock.getElapsedTime();
  particles.rotation.y = t * 0.06;
  ring.rotation.z = Math.sin(t*0.12) * 0.03;
  streak.rotation.y = Math.sin(t*0.1) * 0.06;
  const pos = geom.attributes.position.array;
  for(let i=0;i<PARTICLE_COUNT;i++){
    const idx = i*3;
    const baseAngle = angles[i];
    const radius = radii[i];
    const a = baseAngle + t * 0.45 * (0.6 + (i%5)*0.02);
    const r = radius * (0.98 + Math.sin(t*0.2 + i)*0.004);
    pos[idx+0] = Math.cos(a) * r + mouseX * 0.5 * (1 + i / PARTICLE_COUNT);
    pos[idx+1] = ((i / PARTICLE_COUNT)-0.5) * 3.4 + Math.sin(t*0.35 + i) * 0.02 + mouseY * 0.6;
    pos[idx+2] = Math.sin(a) * r + Math.cos(i + t*0.13) * 0.02;
  }
  geom.attributes.position.needsUpdate = true;
  camera.position.x += (mouseX*0.9 - camera.position.x) * 0.06;
  camera.position.y += (mouseY*0.7 - camera.position.y) * 0.06;
  camera.lookAt(scene.position);
  renderer.render(scene, camera);
}
animate();

// Resize
window.addEventListener('resize', ()=> { renderer.setSize(innerWidth, innerHeight); camera.aspect = innerWidth/innerHeight; camera.updateProjectionMatrix(); });

// GSAP page animations
gsap.from('.hero-content .eyebrow', { y: 8, opacity:0, duration:0.9, delay:0.3 });
gsap.from('.hero-content .hero-title', { y: 18, opacity:0, duration:1.2, ease:'power3.out', delay:0.4 });
gsap.from('.hero-content .hero-sub', { y: 10, opacity:0, duration:1.1, delay:0.6 });
gsap.from('.hero-actions .btn', { y: 10, opacity:0, stagger:0.08, duration:0.9, delay:0.8 });

// Audio: embedded loop with autoplay attempt, muted on small screens
const audio = document.getElementById('ambient');
let mobile = /Mobi|Android/i.test(navigator.userAgent);
const audioFallback = document.getElementById('audioFallback');
if(mobile){
  // start muted; require tap to unmute
  audio.muted = true;
}
function tryPlayAudio(){ if(!audio) return; audio.volume = 0; const p = audio.play(); if(p && p.catch){ p.then(()=> gsap.to(audio, { volume: 0.18, duration: 2 })).catch(()=>{ /* blocked */ }); } else { gsap.to(audio, { volume: 0.18, duration: 2 }); } }
setTimeout(tryPlayAudio, 350);

// Create simple scroll reveal for sections
const sections = document.querySelectorAll('main .section');
function revealOnScroll(){ sections.forEach(s=>{ const r = s.getBoundingClientRect(); if(r.top < innerHeight*0.8){ s.classList.add('in'); } }); }
window.addEventListener('scroll', revealOnScroll);
revealOnScroll();
