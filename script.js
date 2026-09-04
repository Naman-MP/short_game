const game = document.getElementById('game');
const bird = document.getElementById('bird');
const scoreEl = document.getElementById('score');
const heightText = document.getElementById('heightText');
const startScreen = document.getElementById('startScreen');
const gameOver = document.getElementById('gameOver');
const finalScore = document.getElementById('finalScore');
const overTitle = document.getElementById('overTitle');
const overText = document.getElementById('overText');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');

const W = () => game.clientWidth;
const H = () => game.clientHeight - 35;

let birdX, birdY, velocity, score, running, paused, lastTime, spawnTimer;
let obstacles = [];
const gravity = 1550;
const flapPower = -510;
const obstacleSpeed = 245;
const gap = 190;
const birdW = 72;
const birdH = 90;

function reset() {
  obstacles.forEach(o => o.el.remove());
  obstacles = [];
  birdX = W() * 0.17;
  birdY = H() * 0.44;
  velocity = 0;
  score = 0;
  spawnTimer = 0;
  scoreEl.textContent = '0';
  heightText.textContent = '4\'11"';
  bird.style.left = `${birdX}px`;
  bird.style.top = `${birdY}px`;
  bird.style.transform = 'rotate(0deg)';
}

function start() {
  reset();
  running = true;
  paused = false;
  startScreen.classList.add('hidden');
  gameOver.classList.add('hidden');
  lastTime = performance.now();
  requestAnimationFrame(loop);
  flap();
}

function flap() {
  if (!running || paused) return;
  velocity = flapPower;
}

function spawnObstacle() {
  const safeTop = 70;
  const safeBottom = H() - 70;
  const gapTop = safeTop + Math.random() * Math.max(40, safeBottom - safeTop - gap);
  const topHeight = gapTop;
  const bottomTop = gapTop + gap;
  const bottomHeight = H() - bottomTop;
  const x = W() + 30;

  createObstacle('top', x, 0, topHeight);
  createObstacle('bottom', x, bottomTop, bottomHeight);
}

function createObstacle(type, x, y, height) {
  const el = document.createElement('div');
  el.className = `obstacle ${type}`;
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  el.style.height = `${Math.max(40, height)}px`;
  el.innerHTML = `
    <div class="bar"></div>
    <div class="cap"></div>
    <img src="assets/complan.jpeg" alt="Complan obstacle" />
  `;
  game.appendChild(el);
  obstacles.push({ el, x, y, width: 92, height, scored: false });
}

function hit(a, b) {
  const padX = 13;
  const padY = 13;
  return a.x + padX < b.x + b.width &&
         a.x + birdW - padX > b.x &&
         a.y + padY < b.y + b.height &&
         a.y + birdH - padY > b.y;
}

function endGame() {
  running = false;
  finalScore.textContent = score;
  const lines = [
    ['BONK.', 'Gravity remains undefeated.'],
    ['TOO SHORT.', 'The gap was literally taller than her. 💀'],
    ['VERTICAL L.', '4\'11" of courage, approximately 0% altitude.'],
    ['SHE FELL.', 'Someone get the step stool. 😭']
  ];
  const [title, text] = lines[Math.floor(Math.random() * lines.length)];
  overTitle.textContent = title;
  overText.textContent = text;
  gameOver.classList.remove('hidden');
}

function loop(now) {
  if (!running) return;
  if (paused) {
    lastTime = now;
    requestAnimationFrame(loop);
    return;
  }

  const dt = Math.min((now - lastTime) / 1000, 0.033);
  lastTime = now;
  velocity += gravity * dt;
  birdY += velocity * dt;

  spawnTimer += dt;
  if (spawnTimer > 1.55) {
    spawnObstacle();
    spawnTimer = 0;
  }

  if (birdY < 0 || birdY + birdH > H()) return endGame();

  bird.style.top = `${birdY}px`;
  bird.style.left = `${birdX}px`;
  const angle = Math.max(-25, Math.min(80, velocity * 0.075));
  bird.style.transform = `rotate(${angle}deg)`;

  const birdRect = { x: birdX, y: birdY, width: birdW, height: birdH };
  for (const o of obstacles) {
    o.x -= obstacleSpeed * dt;
    o.el.style.left = `${o.x}px`;
    if (hit(birdRect, o)) return endGame();

    if (!o.scored && o.x + o.width < birdX) {
      o.scored = true;
      score += 0.5;
      if (Number.isInteger(score)) scoreEl.textContent = score;
    }
  }

  obstacles = obstacles.filter(o => {
    if (o.x < -130) {
      o.el.remove();
      return false;
    }
    return true;
  });

  // A silly little height meter that stays playful rather than pretending to be real physics.
  const pseudoHeight = Math.max(0, Math.round(4 + (H() - birdY) / 80));
  heightText.textContent = `${pseudoHeight}'${pseudoHeight % 2 ? '11' : '02'}"`;

  requestAnimationFrame(loop);
}

game.addEventListener('pointerdown', e => {
  if (e.target.closest('button')) return;
  if (!running) return start();
  flap();
});

document.addEventListener('keydown', e => {
  if (e.code === 'Space') {
    e.preventDefault();
    if (!running) start(); else flap();
  }
  if (e.code === 'Escape' && running) paused = !paused;
});

startBtn.addEventListener('click', start);
restartBtn.addEventListener('click', start);

reset();
