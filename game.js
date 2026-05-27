// ============================================================
// Achtung die Kurva
// ============================================================

// === STATE ==================================================
const FIELD_SIZE = 840;
const BASE_SPEED = 90;
const BASE_THICKNESS = 4;
const TURN_RATE = 3.0;
const EFFECT_DURATION = 5;
const BLINK_PERIOD_MS = 150; // полупериод мигания для wallPass
const BONUS_RADIUS = 14;
const MAX_BONUSES = 3;

// fixedCategory задаёт категорию жёстко (например для clearAll). Если
// не указана — при спавне случайно выбирается 'self' или 'enemy'.
const BONUS_TYPES = [
  { type: 'speedUp',   color: '#4f4', icon: '⚡' },
  { type: 'slowDown',  color: '#fa4', icon: '🐢' },
  { type: 'thinLine',  color: '#4cf', icon: '➖' },
  { type: 'thickLine', color: '#a4f', icon: '⬛' },
  { type: 'reverse',   color: '#f44', icon: '🔄' },
  { type: 'noTrail',   color: '#888', icon: '🌫️' },
  { type: 'clearAll',  color: '#fff', icon: '🧹', fixedCategory: 'all' },
  { type: 'wallPass',  color: '#ddd', icon: '👻', fixedCategory: 'all' },
  { type: 'wallPass',  color: '#ddd', icon: '👻', fixedCategory: 'self' },
];

const BONUS_OUTLINE = {
  self:  '#3f3',
  enemy: '#f33',
  all:   '#39f',
};

const state = {
  screen: 'menu',
  phase: 'menu', // 'menu' | 'countdown' | 'playing' | 'paused' | 'between-rounds' | 'game-over'
  players: [],
  bonuses: [],
  bonusSpawnTimer: 3,
  wallsBlinkTimer: 0,
  ctx: null,
  bonusesCtx: null,
  headsCtx: null,
  lastFrameTime: 0,
  running: false,
  round: 0,
  targetScore: 10,
};

// === MENU ===================================================
const PLAYER_DEFAULTS = [
  { name: 'Игрок 1', color: '#e44', left: 'ArrowLeft',  right: 'ArrowRight' },
  { name: 'Игрок 2', color: '#48f', left: 'a',          right: 'd' },
  { name: 'Игрок 3', color: '#4c4', left: 'j',          right: 'l' },
  { name: 'Игрок 4', color: '#ed4', left: '4',          right: '6' },
];

const menu = {
  playerCount: 2,
  players: [],
};

function loadKeysFromStorage() {
  const raw = localStorage.getItem('achtung-keys');
  if (!raw) return;
  try {
    const data = JSON.parse(raw);
    data.forEach((k, i) => {
      if (PLAYER_DEFAULTS[i]) {
        PLAYER_DEFAULTS[i].left = k.left;
        PLAYER_DEFAULTS[i].right = k.right;
      }
    });
  } catch (e) {
    console.warn('Failed to load keys from storage', e);
  }
}

function saveKeysToStorage() {
  const data = menu.players.map(p => ({ left: p.left, right: p.right }));
  localStorage.setItem('achtung-keys', JSON.stringify(data));
}

function selectPlayerCount(count) {
  menu.playerCount = count;
  menu.players = PLAYER_DEFAULTS.slice(0, count).map(p => ({ ...p }));
  document.querySelectorAll('.count-btn').forEach(btn => {
    btn.classList.toggle('selected', Number(btn.dataset.count) === count);
  });
  renderPlayerList();
  updateStartButton();
}

function renderPlayerList() {
  const list = document.getElementById('player-list');
  list.innerHTML = '';
  menu.players.forEach((p, i) => {
    const row = document.createElement('div');
    row.className = 'player-row';
    row.innerHTML = `
      <span class="player-name" style="color:${p.color}">${p.name}</span>
      <button class="key-btn" data-player="${i}" data-side="left">Влево: <kbd>${p.left}</kbd></button>
      <button class="key-btn" data-player="${i}" data-side="right">Вправо: <kbd>${p.right}</kbd></button>
    `;
    list.appendChild(row);
  });
  list.querySelectorAll('.key-btn').forEach(btn => {
    btn.addEventListener('click', () => startKeyCapture(btn));
  });
  highlightConflicts();
  updateStartButton();
}

let capturingButton = null;

function startKeyCapture(btn) {
  if (capturingButton) capturingButton.classList.remove('capturing');
  capturingButton = btn;
  btn.classList.add('capturing');
  btn.innerHTML = 'Нажми клавишу…';
}

function findKeyConflicts() {
  const conflicts = new Set();
  const seen = new Map();
  menu.players.forEach((p, i) => {
    ['left', 'right'].forEach(side => {
      const key = p[side];
      if (seen.has(key)) {
        conflicts.add(`${i}-${side}`);
        conflicts.add(seen.get(key));
      } else {
        seen.set(key, `${i}-${side}`);
      }
    });
  });
  return conflicts;
}

function highlightConflicts() {
  const conflicts = findKeyConflicts();
  document.querySelectorAll('.key-btn').forEach(btn => {
    const id = `${btn.dataset.player}-${btn.dataset.side}`;
    btn.classList.toggle('conflict', conflicts.has(id));
  });
}

function updateStartButton() {
  const hasConflict = findKeyConflicts().size > 0;
  document.getElementById('start-btn').disabled = hasConflict;
}

// === GAME LOOP ==============================================
function gameLoop(now) {
  if (!state.running) return;
  const dt = Math.min((now - state.lastFrameTime) / 1000, 0.05);
  state.lastFrameTime = now;
  updatePlayers(dt);
  updateBonuses(dt);
  drawHeads();
  updateWallsBlink(dt);
  updateSidebar();
  updateRoundState();
  if (state.running) requestAnimationFrame(gameLoop);
}

function updateWallsBlink(dt) {
  if (state.wallsBlinkTimer > 0) {
    state.wallsBlinkTimer -= dt;
    const field = document.getElementById('field');
    if (state.wallsBlinkTimer > 0) {
      field.style.borderColor = blinkOn() ? '#ddd' : '#444';
    } else {
      field.style.borderColor = '';
    }
  }
}

function blinkOn() {
  return Math.floor(performance.now() / BLINK_PERIOD_MS) % 2 === 0;
}

function drawHeads() {
  const ctx = state.headsCtx;
  ctx.clearRect(0, 0, FIELD_SIZE, FIELD_SIZE);
  const blink = blinkOn();
  for (const p of state.players) {
    if (!p.alive) continue;
    // wallPass: голова мигает в той же фазе, что и рамка поля
    if (p.effects.wallPass && !blink) continue;
    ctx.fillStyle = '#ff0';
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.thickness / 2 - 0.5, 0, Math.PI * 2);
    ctx.fill();
  }
}

function updateRoundState() {
  if (state.phase !== 'playing') return;
  const alive = state.players.filter(p => p.alive);
  if (alive.length <= 1) {
    state.phase = 'between-rounds';
    state.running = false;
    showRoundOverlay();
  }
}

function pauseGame() {
  state.phase = 'paused';
  state.running = false;
  document.getElementById('round-message').textContent = 'Пауза';
  document.getElementById('round-hint').textContent = 'Enter / Space — продолжить';
  document.getElementById('round-overlay').classList.remove('hidden');
}

function resumeGame() {
  state.phase = 'playing';
  hideRoundOverlay();
  state.lastFrameTime = performance.now();
  state.running = true;
  requestAnimationFrame(gameLoop);
}

function showRoundOverlay() {
  const winner = state.players.find(p => p.alive);
  const msg = winner ? `Победитель раунда: ${winner.name} (+1)` : 'Никто не выжил';
  document.getElementById('round-message').textContent = msg;
  document.getElementById('round-hint').textContent = 'Enter / Space — следующий раунд';
  document.getElementById('round-overlay').classList.remove('hidden');
  updateSidebar();
  checkGameOver();
}

function hideRoundOverlay() {
  document.getElementById('round-overlay').classList.add('hidden');
}

function checkGameOver() {
  const winner = state.players.find(p => p.score >= state.targetScore);
  if (winner) {
    state.phase = 'game-over';
    document.getElementById('round-message').textContent = `🏆 Победил ${winner.name}!`;
    document.getElementById('round-hint').textContent = 'Enter / Space — возврат в меню';
  }
}

function runCountdown() {
  const overlay = document.getElementById('round-overlay');
  const msg = document.getElementById('round-message');
  const hint = document.getElementById('round-hint');
  hint.textContent = '';
  overlay.classList.remove('hidden');
  let n = 3;
  msg.textContent = String(n);
  const tick = () => {
    if (state.phase !== 'countdown') return; // отменён выходом в меню
    n--;
    if (n > 0) {
      msg.textContent = String(n);
      setTimeout(tick, 700);
    } else if (n === 0) {
      msg.textContent = 'GO!';
      setTimeout(tick, 500);
    } else {
      overlay.classList.add('hidden');
      state.phase = 'playing';
      state.running = true;
      state.lastFrameTime = performance.now();
      requestAnimationFrame(gameLoop);
    }
  };
  setTimeout(tick, 700);
}

// === PLAYERS ================================================
function hexToRgb(hex) {
  // Поддерживает #rgb и #rrggbb
  let h = hex.replace('#', '');
  if (h.length === 3) h = h.split('').map(c => c + c).join('');
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

function createPlayer(config) {
  const rgb = hexToRgb(config.color);
  return {
    name: config.name,
    color: config.color,
    rgb,
    keyLeft: config.left,
    keyRight: config.right,
    x: Math.random() * (FIELD_SIZE - 200) + 100,
    y: Math.random() * (FIELD_SIZE - 200) + 100,
    angle: Math.random() * Math.PI * 2,
    baseSpeed: BASE_SPEED,
    speed: BASE_SPEED,
    baseThickness: BASE_THICKNESS,
    thickness: BASE_THICKNESS,
    alive: true,
    score: 0,
    effects: {},
    inGap: false,
    gapTimer: 1 + Math.random() * 2,
    pressed: { left: false, right: false },
    spawnImmunity: 0.5,
    recentTrail: [], // последние позиции для иммунитета только к свежему своему следу
  };
}

function setupGameKeys() {
  window.addEventListener('keydown', onGameKeyDown);
  window.addEventListener('keyup', onGameKeyUp);
}

function onGameKeyDown(e) {
  if (state.screen !== 'game') return;
  for (const p of state.players) {
    if (e.key === p.keyLeft)  p.pressed.left = true;
    if (e.key === p.keyRight) p.pressed.right = true;
  }
}

function onGameKeyUp(e) {
  if (state.screen !== 'game') return;
  for (const p of state.players) {
    if (e.key === p.keyLeft)  p.pressed.left = false;
    if (e.key === p.keyRight) p.pressed.right = false;
  }
}

function updatePlayers(dt) {
  const ctx = state.ctx;
  for (const p of state.players) {
    if (!p.alive) continue;

    // Обновить таймеры эффектов
    for (const name of Object.keys(p.effects)) {
      p.effects[name] -= dt;
      if (p.effects[name] <= 0) delete p.effects[name];
    }

    // Применить эффекты
    const speedMult = (p.effects.speedUp ? 1.7 : 1) * (p.effects.slowDown ? 0.5 : 1);
    const thickMult = (p.effects.thinLine ? 0.5 : 1) * (p.effects.thickLine ? 2 : 1);
    p.speed = p.baseSpeed * speedMult;
    p.thickness = p.baseThickness * thickMult;

    const reverse = p.effects.reverse ? -1 : 1;
    if (p.pressed.left)  p.angle -= TURN_RATE * dt * reverse;
    if (p.pressed.right) p.angle += TURN_RATE * dt * reverse;

    const oldX = p.x, oldY = p.y;
    p.x += Math.cos(p.angle) * p.speed * dt;
    p.y += Math.sin(p.angle) * p.speed * dt;

    // Запоминаем свежую позицию (для иммунитета только к своему свежему следу).
    // ~30 точек ≈ полсекунды пути.
    p.recentTrail.push({ x: p.x, y: p.y });
    if (p.recentTrail.length > 30) p.recentTrail.shift();

    // Wall collision (или wrap при wallPass)
    let wrapped = false;
    if (p.x < 0 || p.x >= FIELD_SIZE || p.y < 0 || p.y >= FIELD_SIZE) {
      if (p.effects.wallPass) {
        p.x = ((p.x % FIELD_SIZE) + FIELD_SIZE) % FIELD_SIZE;
        p.y = ((p.y % FIELD_SIZE) + FIELD_SIZE) % FIELD_SIZE;
        wrapped = true;
        // Краткий иммунитет, чтобы проверка следа не сработала на ложной
        // позиции сразу после телепортации.
        if (p.spawnImmunity < 0.1) p.spawnImmunity = 0.1;
      } else {
        p.alive = false;
        for (const other of state.players) {
          if (other !== p && other.alive) other.score += 1;
        }
        console.log(`${p.name} hit the wall`);
        continue;
      }
    }

    // Pickup bonuses BEFORE trail collision check (иначе цветной круг бонуса
    // считается следом и убивает подбирающего)
    pickupBonusesAt(p);

    // Trail collision: проверяем точку впереди головы на расстоянии thickness/2 + 1.
    // Это гарантирует, что свой собственный свежеотрисованный бок (он рисуется
    // ПОЗАДИ точки проверки) не убивает. Чужие следы и свой собственный старый
    // хвост — убивают.
    if (p.spawnImmunity > 0) {
      p.spawnImmunity -= dt;
    } else {
      const lookAhead = p.thickness / 2 + 1;
      const cx = Math.floor(p.x + Math.cos(p.angle) * lookAhead);
      const cy = Math.floor(p.y + Math.sin(p.angle) * lookAhead);
      // Игнорируем столкновение, если точка проверки близка к любой из
      // последних позиций собственной головы — это значит, что мы смотрим
      // на свой только что нарисованный бок (при повороте у толстой
      // змейки бок остаётся в нескольких кадрах назад).
      const selfRadius = Math.max(p.thickness, p.baseThickness) * 0.9;
      const selfR2 = selfRadius * selfRadius;
      let tooCloseToOld = false;
      const trail = p.recentTrail;
      // Проверяем последние ~15 точек (≈ четверть секунды пути).
      const startIdx = Math.max(0, trail.length - 15);
      for (let i = trail.length - 1; i >= startIdx; i--) {
        const dx = cx - trail[i].x;
        const dy = cy - trail[i].y;
        if (dx * dx + dy * dy < selfR2) { tooCloseToOld = true; break; }
      }
      if (!tooCloseToOld && cx >= 0 && cx < FIELD_SIZE && cy >= 0 && cy < FIELD_SIZE) {
        const data = ctx.getImageData(cx, cy, 1, 1).data;
        if (data[3] > 0 && (data[0] > 10 || data[1] > 10 || data[2] > 10)) {
          p.alive = false;
          for (const other of state.players) {
            if (other !== p && other.alive) other.score += 1;
          }
          console.log(`${p.name} hit a trail`);
          continue;
        }
      }
    }

    // Gap timer
    p.gapTimer -= dt;
    if (p.gapTimer <= 0) {
      if (p.inGap) {
        p.inGap = false;
        p.gapTimer = 1 + Math.random() * 2;
      } else {
        p.inGap = true;
        // Длина щели в пикселях = толщина * 3.6 (с запасом ×2, чтобы толстая
        // змейка точно прошла через свою щель). Делим на скорость → время.
        p.gapTimer = (p.thickness * 3.6) / p.speed;
      }
    }

    // Draw (пропускаем при gap, noTrail, или wrap через стену)
    if (!p.inGap && !p.effects.noTrail && !wrapped) {
      ctx.strokeStyle = p.color;
      ctx.lineWidth = p.thickness;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(oldX, oldY);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    }
  }
}

// === BONUSES ================================================
function updateBonuses(dt) {
  state.bonusSpawnTimer -= dt;
  if (state.bonusSpawnTimer <= 0) {
    if (state.bonuses.length < MAX_BONUSES) trySpawnBonus();
    state.bonusSpawnTimer = 3 + Math.random() * 4;
  }
  drawBonuses();
}

function trySpawnBonus() {
  for (let attempt = 0; attempt < 30; attempt++) {
    const x = BONUS_RADIUS + 10 + Math.random() * (FIELD_SIZE - (BONUS_RADIUS + 10) * 2);
    const y = BONUS_RADIUS + 10 + Math.random() * (FIELD_SIZE - (BONUS_RADIUS + 10) * 2);
    if (isAreaClear(x, y, BONUS_RADIUS + 4)) {
      const t = BONUS_TYPES[Math.floor(Math.random() * BONUS_TYPES.length)];
      const category = t.fixedCategory || (Math.random() < 0.5 ? 'self' : 'enemy');
      state.bonuses.push({ x, y, ...t, category });
      return;
    }
  }
}

function isAreaClear(x, y, r) {
  const ctx = state.ctx;
  const x0 = Math.max(0, Math.floor(x - r));
  const y0 = Math.max(0, Math.floor(y - r));
  const w = Math.min(FIELD_SIZE - x0, Math.floor(r * 2));
  const h = Math.min(FIELD_SIZE - y0, Math.floor(r * 2));
  const data = ctx.getImageData(x0, y0, w, h).data;
  for (let i = 0; i < data.length; i += 4) {
    if (data[i+3] > 0 && (data[i] > 10 || data[i+1] > 10 || data[i+2] > 10)) return false;
  }
  return true;
}

function drawBonuses() {
  const ctx = state.bonusesCtx;
  ctx.clearRect(0, 0, FIELD_SIZE, FIELD_SIZE);
  for (const b of state.bonuses) {
    const outline = BONUS_OUTLINE[b.category] || '#fff';
    // Заливка чуть меньшего радиуса, кольцо рисуем поверх — так контур
    // полностью лежит снаружи заливки и хорошо виден.
    const ringWidth = 4;
    ctx.fillStyle = b.color;
    ctx.beginPath();
    ctx.arc(b.x, b.y, BONUS_RADIUS - ringWidth / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = ringWidth;
    ctx.strokeStyle = outline;
    ctx.beginPath();
    ctx.arc(b.x, b.y, BONUS_RADIUS - ringWidth / 2, 0, Math.PI * 2);
    ctx.stroke();
    ctx.font = '18px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(b.icon, b.x, b.y);
  }
}

function pickupBonusesAt(p) {
  if (!p.alive) return;
  // Подбор: проверяем и центр головы, и точку чуть впереди
  const lookAhead = p.speed * (1 / 60) + 1;
  const ax = p.x + Math.cos(p.angle) * lookAhead;
  const ay = p.y + Math.sin(p.angle) * lookAhead;
  const r2 = (BONUS_RADIUS + p.thickness / 2) * (BONUS_RADIUS + p.thickness / 2);
  for (let i = state.bonuses.length - 1; i >= 0; i--) {
    const b = state.bonuses[i];
    const d1 = (p.x - b.x) ** 2 + (p.y - b.y) ** 2;
    const d2 = (ax - b.x) ** 2 + (ay - b.y) ** 2;
    if (d1 <= r2 || d2 <= r2) {
      applyBonus(p, b);
      state.bonuses.splice(i, 1);
    }
  }
}

function applyBonus(picker, bonus) {
  if (bonus.type === 'clearAll') {
    clearAllTrails();
  } else {
    let targets;
    if (bonus.category === 'self') targets = [picker];
    else if (bonus.category === 'all') targets = state.players.filter(p => p.alive);
    else targets = state.players.filter(p => p !== picker && p.alive);
    for (const p of targets) addEffect(p, bonus.type, EFFECT_DURATION);
    // Общий wallPass — стены мигают
    if (bonus.type === 'wallPass' && bonus.category === 'all') {
      state.wallsBlinkTimer = EFFECT_DURATION;
    }
  }
  console.log(`${picker.name} picked up ${bonus.type} (${bonus.category})`);
}

function addEffect(player, name, duration) {
  player.effects[name] = (player.effects[name] || 0) + duration;
}

function clearAllTrails() {
  const ctx = state.ctx;
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, FIELD_SIZE, FIELD_SIZE);
  for (const p of state.players) {
    if (p.alive) p.spawnImmunity = 0.3;
  }
}

// === SIDEBAR ================================================
const EFFECT_LABELS = {
  speedUp: '⚡',
  slowDown: '🐢',
  thinLine: '➖',
  thickLine: '⬛',
  reverse: '🔄',
  noTrail: '🌫️',
  wallPass: '👻',
};

function updateSidebar() {
  const list = document.getElementById('score-list');
  list.innerHTML = '';
  const sorted = [...state.players].sort((a, b) => b.score - a.score);
  for (const p of sorted) {
    const row = document.createElement('div');
    row.className = 'score-row';
    const effectsList = Object.entries(p.effects)
      .filter(([, t]) => t > 0)
      .map(([name, t]) => `<span class="effect">${EFFECT_LABELS[name] || name} ${t.toFixed(1)}s</span>`)
      .join('');
    row.innerHTML = `
      <div class="score-main">
        <span style="color:${p.color}">${p.name}${p.alive ? '' : ' 💀'}</span>
        <span class="score-value">${p.score}</span>
      </div>
      <div class="score-keys">
        <kbd>${p.keyLeft}</kbd> <kbd>${p.keyRight}</kbd>
      </div>
      <div class="score-effects">${effectsList}</div>
    `;
    list.appendChild(row);
  }
}

// === GAME FLOW ==============================================
function startGame() {
  showScreen('game');
  state.ctx = document.getElementById('field').getContext('2d', { willReadFrequently: true });
  state.bonusesCtx = document.getElementById('bonuses').getContext('2d');
  state.headsCtx = document.getElementById('heads').getContext('2d');
  state.targetScore = (menu.players.length - 1) * 10;
  state.round = 0;
  state.players = menu.players.map(createPlayer);
  state.players.forEach(p => p.score = 0);
  startRound();
}

function startRound() {
  state.round++;
  state.ctx.fillStyle = '#000';
  state.ctx.fillRect(0, 0, FIELD_SIZE, FIELD_SIZE);
  if (state.headsCtx) state.headsCtx.clearRect(0, 0, FIELD_SIZE, FIELD_SIZE);
  if (state.bonusesCtx) state.bonusesCtx.clearRect(0, 0, FIELD_SIZE, FIELD_SIZE);
  // Спавн с гарантированным минимальным расстоянием между игроками,
  // и направлением "от центра" чтобы не ехать сразу в соседа.
  const placed = [];
  const minDist = 200;
  const margin = 120;
  const cx = FIELD_SIZE / 2;
  const cy = FIELD_SIZE / 2;
  for (const p of state.players) {
    let x, y;
    for (let attempt = 0; attempt < 100; attempt++) {
      x = margin + Math.random() * (FIELD_SIZE - margin * 2);
      y = margin + Math.random() * (FIELD_SIZE - margin * 2);
      let ok = true;
      for (const q of placed) {
        const dx = x - q.x, dy = y - q.y;
        if (dx*dx + dy*dy < minDist * minDist) { ok = false; break; }
      }
      if (ok) break;
    }
    p.x = x;
    p.y = y;
    // Угол смотрит примерно "от центра" (±60°), чтобы не лететь в гущу
    const awayAngle = Math.atan2(y - cy, x - cx);
    p.angle = awayAngle + (Math.random() - 0.5) * (Math.PI / 1.5);
    p.alive = true;
    p.effects = {};
    p.inGap = false;
    p.gapTimer = 1 + Math.random() * 2;
    p.spawnImmunity = 1.0;
    p.speed = p.baseSpeed;
    p.thickness = p.baseThickness;
    p.pressed = { left: false, right: false };
    p.recentTrail = [];
    placed.push({ x, y });
  }
  state.bonuses = [];
  state.bonusSpawnTimer = 3;
  state.wallsBlinkTimer = 0;
  hideRoundOverlay();
  state.phase = 'countdown';
  updateSidebar();
  runCountdown();
}

// === INIT ===================================================
function showScreen(name) {
  document.getElementById('screen-menu').classList.toggle('active', name === 'menu');
  document.getElementById('screen-game').classList.toggle('active', name === 'game');
  state.screen = name;
}

document.querySelectorAll('.count-btn').forEach(btn => {
  btn.addEventListener('click', () => selectPlayerCount(Number(btn.dataset.count)));
});

document.getElementById('start-btn').addEventListener('click', () => {
  startGame();
});

document.getElementById('back-to-menu').addEventListener('click', () => {
  state.running = false;
  state.phase = 'menu';
  hideRoundOverlay();
  showScreen('menu');
});

window.addEventListener('keydown', (e) => {
  // Захват клавиши для настройки
  if (capturingButton) {
    e.preventDefault();
    const playerIdx = Number(capturingButton.dataset.player);
    const side = capturingButton.dataset.side;
    menu.players[playerIdx][side] = e.key;
    capturingButton.classList.remove('capturing');
    capturingButton = null;
    saveKeysToStorage();
    renderPlayerList();
    return;
  }
  const isConfirm = e.key === 'Enter' || e.key === ' ' || e.code === 'Space';
  if (isConfirm) {
    if (state.phase === 'menu' && e.key === 'Enter') {
      const startBtn = document.getElementById('start-btn');
      if (!startBtn.disabled) startGame();
    } else if (state.phase === 'playing') {
      e.preventDefault();
      pauseGame();
    } else if (state.phase === 'paused') {
      e.preventDefault();
      resumeGame();
    } else if (state.phase === 'between-rounds') {
      e.preventDefault();
      startRound();
    } else if (state.phase === 'game-over') {
      e.preventDefault();
      hideRoundOverlay();
      state.phase = 'menu';
      showScreen('menu');
    }
  }
});

setupGameKeys();
loadKeysFromStorage();
selectPlayerCount(2);

console.log('Achtung die Kurva loaded');
