# Achtung die Kurva Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Браузерная локальная игра 2–4 игрока в стиле Achtung die Kurve — три статических файла, без сборщиков.

**Architecture:** Три файла в одной папке: `index.html` (меню + игровой экран), `style.css` (flexbox-разметка и оформление), `game.js` (вся логика, разделена секциями-комментариями). Игра запускается двойным кликом по `index.html`. Состояние держится в одном глобальном объекте, цикл — `requestAnimationFrame`. Столкновения — через чтение пикселей canvas. Настройки клавиш — `localStorage`.

**Tech Stack:** Чистый HTML5 + CSS3 + JavaScript (ES2015+). Canvas 2D API. Никаких внешних библиотек, никакого Node.js.

**Note on testing:** Это canvas-игра, у нас нет тест-фреймворка (мы сознательно не используем Node.js). Каждая задача проверяется вручную в браузере по чёткому чек-листу. Для невизуальной логики используется `console.log`.

**Папка проекта:** Игра живёт в `web/achtung/` относительно корня репозитория. Все пути ниже — относительно корня.

---

### Task 1: Скелет проекта и заготовки файлов

**Files:**
- Create: `web/achtung/index.html`
- Create: `web/achtung/style.css`
- Create: `web/achtung/game.js`

- [ ] **Step 1: Создать `web/achtung/index.html`**

```html
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <title>Achtung die Kurva</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div id="screen-menu" class="screen active">
    <h1>Achtung die Kurva</h1>
    <p>Меню в разработке</p>
  </div>

  <div id="screen-game" class="screen">
    <canvas id="field" width="700" height="700"></canvas>
    <aside id="sidebar">
      <h2>Счёт</h2>
      <div id="score-list"></div>
    </aside>
  </div>

  <script src="game.js"></script>
</body>
</html>
```

- [ ] **Step 2: Создать `web/achtung/style.css`**

```css
* { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: system-ui, sans-serif;
  background: #111;
  color: #eee;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.screen { display: none; padding: 20px; }
.screen.active { display: flex; }

#screen-menu { flex-direction: column; align-items: center; gap: 20px; }
#screen-menu h1 { font-size: 48px; }

#screen-game { gap: 20px; }
#field {
  background: #000;
  border: 2px solid #444;
}
#sidebar {
  width: 250px;
  background: #1a1a1a;
  padding: 16px;
  border: 2px solid #444;
}
#sidebar h2 { margin-bottom: 12px; }
```

- [ ] **Step 3: Создать `web/achtung/game.js`**

```javascript
// ============================================================
// Achtung die Kurva
// ============================================================

// === STATE ==================================================
const state = {
  screen: 'menu', // 'menu' | 'game'
};

// === MENU ===================================================

// === GAME LOOP ==============================================

// === PLAYERS ================================================

// === BONUSES ================================================

// === SIDEBAR ================================================

// === INIT ===================================================
console.log('Achtung die Kurva loaded');
```

- [ ] **Step 4: Проверить в браузере**

Открой `web/achtung/index.html` двойным кликом.
Ожидается: чёрный фон, белый заголовок «Achtung die Kurva», текст «Меню в разработке». В DevTools (F12) → Console: `Achtung die Kurva loaded`.

- [ ] **Step 5: Commit**

```bash
git add web/achtung/index.html web/achtung/style.css web/achtung/game.js
git commit -m "feat(achtung): scaffold three-file project"
```

---

### Task 2: Игровой экран — canvas и боковая панель

**Files:**
- Modify: `web/achtung/style.css`
- Modify: `web/achtung/game.js`

- [ ] **Step 1: Изменить CSS, чтобы игровой экран был flex-разметкой «поле + панель»**

В `style.css` заменить блок `#screen-game` и добавить `#sidebar`:

```css
#screen-game {
  display: none;
  gap: 20px;
  align-items: flex-start;
}
#screen-game.active { display: flex; }

#field {
  background: #000;
  border: 2px solid #444;
  display: block;
}

#sidebar {
  width: 250px;
  min-height: 700px;
  background: #1a1a1a;
  padding: 16px;
  border: 2px solid #444;
  display: flex;
  flex-direction: column;
}
```

Удалить общее правило `.screen.active { display: flex; }`, заменить на отдельные правила для каждого экрана:

```css
#screen-menu { display: none; flex-direction: column; align-items: center; gap: 20px; }
#screen-menu.active { display: flex; }
```

- [ ] **Step 2: Добавить в `game.js` функцию переключения экранов**

В секции `// === INIT ===` (заменить весь её текст):

```javascript
// === INIT ===================================================
function showScreen(name) {
  document.getElementById('screen-menu').classList.toggle('active', name === 'menu');
  document.getElementById('screen-game').classList.toggle('active', name === 'game');
  state.screen = name;
}

// Временная кнопка для проверки переключения экранов:
window.addEventListener('keydown', (e) => {
  if (e.key === 'g') showScreen('game');
  if (e.key === 'm') showScreen('menu');
});

console.log('Achtung die Kurva loaded. Press G for game, M for menu.');
```

- [ ] **Step 3: Проверить в браузере**

Перезагрузи страницу. Нажми клавишу `G` — должен появиться чёрный квадрат 700×700 (canvas) и серая панель «Счёт» справа от него. Нажми `M` — вернёшься в меню.

- [ ] **Step 4: Commit**

```bash
git add web/achtung/style.css web/achtung/game.js
git commit -m "feat(achtung): add game screen layout with canvas and sidebar"
```

---

### Task 3: Меню — выбор количества игроков

**Files:**
- Modify: `web/achtung/index.html`
- Modify: `web/achtung/style.css`
- Modify: `web/achtung/game.js`

- [ ] **Step 1: Заменить содержимое `#screen-menu` в `index.html`**

```html
<div id="screen-menu" class="screen active">
  <h1>Achtung die Kurva</h1>
  <div id="player-count-buttons">
    <button class="count-btn" data-count="2">2 игрока</button>
    <button class="count-btn" data-count="3">3 игрока</button>
    <button class="count-btn" data-count="4">4 игрока</button>
  </div>
  <div id="player-list"></div>
  <button id="start-btn" disabled>Старт</button>
</div>
```

- [ ] **Step 2: Добавить стили в `style.css`**

В конец файла:

```css
button {
  background: #333;
  color: #eee;
  border: 2px solid #555;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  border-radius: 4px;
}
button:hover:not(:disabled) { background: #444; }
button:disabled { opacity: 0.4; cursor: not-allowed; }

#player-count-buttons { display: flex; gap: 10px; }
.count-btn.selected { background: #2a5; border-color: #4c7; }

#player-list { display: flex; flex-direction: column; gap: 10px; min-width: 400px; }

#start-btn { font-size: 20px; padding: 14px 40px; }
```

- [ ] **Step 3: Добавить логику меню в `game.js`**

Заменить секцию `// === MENU ===`:

```javascript
// === MENU ===================================================
const PLAYER_DEFAULTS = [
  { name: 'Игрок 1', color: '#e44', left: 'ArrowLeft',  right: 'ArrowRight' },
  { name: 'Игрок 2', color: '#48f', left: 'a',          right: 'd' },
  { name: 'Игрок 3', color: '#4c4', left: 'j',          right: 'l' },
  { name: 'Игрок 4', color: '#ed4', left: '4',          right: '6' },
];

const menu = {
  playerCount: 2,
  players: [], // {name, color, left, right}
};

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
      <span>Влево: <kbd>${p.left}</kbd></span>
      <span>Вправо: <kbd>${p.right}</kbd></span>
    `;
    list.appendChild(row);
  });
}

function updateStartButton() {
  document.getElementById('start-btn').disabled = false; // пока всегда активна
}

document.querySelectorAll('.count-btn').forEach(btn => {
  btn.addEventListener('click', () => selectPlayerCount(Number(btn.dataset.count)));
});

document.getElementById('start-btn').addEventListener('click', () => {
  showScreen('game');
});

selectPlayerCount(2);
```

- [ ] **Step 4: Стили для строк игроков**

В конец `style.css`:

```css
.player-row {
  display: flex;
  gap: 16px;
  align-items: center;
  background: #222;
  padding: 10px;
  border-radius: 4px;
}
.player-name { font-weight: bold; min-width: 100px; }
kbd {
  background: #333;
  border: 1px solid #555;
  padding: 2px 8px;
  border-radius: 3px;
  font-family: monospace;
}
```

- [ ] **Step 5: Проверить в браузере**

Перезагрузи. В меню видно 3 кнопки выбора количества (2 выбрана), список из 2 игроков с их цветами и клавишами. Кликни «3 игрока» — список становится из 3 строк. Кнопка «Старт» переключает на игровой экран.

- [ ] **Step 6: Commit**

```bash
git add web/achtung/index.html web/achtung/style.css web/achtung/game.js
git commit -m "feat(achtung): menu with player count selection"
```

---

### Task 4: Настройка клавиш через клик по кнопке

**Files:**
- Modify: `web/achtung/game.js`
- Modify: `web/achtung/style.css`

- [ ] **Step 1: Заменить функцию `renderPlayerList` в `game.js`**

```javascript
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
}
```

- [ ] **Step 2: Добавить захват клавиши**

В секцию `// === MENU ===`, после `renderPlayerList`:

```javascript
let capturingButton = null;

function startKeyCapture(btn) {
  if (capturingButton) capturingButton.classList.remove('capturing');
  capturingButton = btn;
  btn.classList.add('capturing');
  btn.innerHTML = 'Нажми клавишу…';
}

window.addEventListener('keydown', (e) => {
  if (!capturingButton) return;
  e.preventDefault();
  const playerIdx = Number(capturingButton.dataset.player);
  const side = capturingButton.dataset.side;
  menu.players[playerIdx][side] = e.key;
  capturingButton.classList.remove('capturing');
  capturingButton = null;
  saveKeysToStorage();
  renderPlayerList();
});
```

- [ ] **Step 3: Сохранение в `localStorage`**

В секцию `// === MENU ===`:

```javascript
function saveKeysToStorage() {
  const data = menu.players.map(p => ({ left: p.left, right: p.right }));
  localStorage.setItem('achtung-keys', JSON.stringify(data));
}

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
```

Вызвать `loadKeysFromStorage()` **до** первого вызова `selectPlayerCount(2)`.

- [ ] **Step 4: Проверка конфликтов клавиш**

В секцию `// === MENU ===`:

```javascript
function findKeyConflicts() {
  const conflicts = new Set();
  const seen = new Map(); // key -> "playerIdx-side"
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
```

Заменить `updateStartButton`:

```javascript
function updateStartButton() {
  const hasConflict = findKeyConflicts().size > 0;
  document.getElementById('start-btn').disabled = hasConflict;
}
```

И вызвать `updateStartButton()` в конце `renderPlayerList`.

- [ ] **Step 5: Стили в `style.css`**

В конец:

```css
.key-btn { padding: 6px 14px; font-size: 14px; }
.key-btn.capturing { background: #2a5; }
.key-btn.conflict { background: #722; border-color: #c44; }
```

- [ ] **Step 6: Проверить в браузере**

1. Перезагрузи. Кликни по кнопке клавиши игрока 1 — текст становится «Нажми клавишу…».
2. Нажми любую клавишу — она запоминается и отображается.
3. Назначь обоим игрокам одинаковую клавишу — кнопки подсвечиваются красным, «Старт» становится неактивен.
4. Перезагрузи страницу — клавиши сохранились.

- [ ] **Step 7: Commit**

```bash
git add web/achtung/game.js web/achtung/style.css
git commit -m "feat(achtung): rebindable keys with localStorage and conflict detection"
```

---

### Task 5: Игроки — состояние, спавн, рисование одной точки

**Files:**
- Modify: `web/achtung/game.js`

- [ ] **Step 1: Добавить константы и функции спавна**

Заменить секции `// === STATE ===` и `// === PLAYERS ===`:

```javascript
// === STATE ==================================================
const FIELD_SIZE = 700;
const BASE_SPEED = 90;       // пикселей в секунду
const BASE_THICKNESS = 4;    // ширина следа
const TURN_RATE = 3.0;       // радиан в секунду

const state = {
  screen: 'menu',
  players: [],
  ctx: null,
  lastFrameTime: 0,
  running: false,
};

// === PLAYERS ================================================
function createPlayer(config) {
  return {
    name: config.name,
    color: config.color,
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
    effects: {},   // {speedUp: timeLeft, ...}
    inGap: false,
    gapTimer: 1 + Math.random() * 2,
    pressed: { left: false, right: false },
  };
}

function spawnPlayers() {
  state.players = menu.players.map(createPlayer);
}

function drawPlayerHead(p) {
  const ctx = state.ctx;
  ctx.fillStyle = p.color;
  ctx.beginPath();
  ctx.arc(p.x, p.y, p.thickness / 2, 0, Math.PI * 2);
  ctx.fill();
}
```

- [ ] **Step 2: Запуск игры из меню**

Заменить обработчик кнопки «Старт»:

```javascript
document.getElementById('start-btn').addEventListener('click', () => {
  startGame();
});

function startGame() {
  showScreen('game');
  state.ctx = document.getElementById('field').getContext('2d');
  state.ctx.fillStyle = '#000';
  state.ctx.fillRect(0, 0, FIELD_SIZE, FIELD_SIZE);
  spawnPlayers();
  state.players.forEach(drawPlayerHead);
  console.log('Players:', state.players);
}
```

- [ ] **Step 3: Проверить в браузере**

1. Открой меню, выбери 2 игроков, нажми «Старт».
2. На чёрном поле появятся 2 цветные точки (красная и синяя) в случайных местах.
3. В консоли видно массив игроков с их полями.

- [ ] **Step 4: Commit**

```bash
git add web/achtung/game.js
git commit -m "feat(achtung): spawn players and draw initial positions"
```

---

### Task 6: Игровой цикл и движение прямо

**Files:**
- Modify: `web/achtung/game.js`

- [ ] **Step 1: Добавить игровой цикл**

Заменить секцию `// === GAME LOOP ===`:

```javascript
// === GAME LOOP ==============================================
function gameLoop(now) {
  if (!state.running) return;
  const dt = Math.min((now - state.lastFrameTime) / 1000, 0.05);
  state.lastFrameTime = now;
  updatePlayers(dt);
  requestAnimationFrame(gameLoop);
}

function updatePlayers(dt) {
  const ctx = state.ctx;
  for (const p of state.players) {
    if (!p.alive) continue;
    const oldX = p.x, oldY = p.y;
    p.x += Math.cos(p.angle) * p.speed * dt;
    p.y += Math.sin(p.angle) * p.speed * dt;
    ctx.strokeStyle = p.color;
    ctx.lineWidth = p.thickness;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(oldX, oldY);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
  }
}
```

- [ ] **Step 2: Запуск цикла из `startGame`**

Заменить `startGame`:

```javascript
function startGame() {
  showScreen('game');
  state.ctx = document.getElementById('field').getContext('2d');
  state.ctx.fillStyle = '#000';
  state.ctx.fillRect(0, 0, FIELD_SIZE, FIELD_SIZE);
  spawnPlayers();
  state.running = true;
  state.lastFrameTime = performance.now();
  requestAnimationFrame(gameLoop);
}
```

- [ ] **Step 3: Проверить в браузере**

Запусти игру. Игроки должны двигаться по прямым линиям в своих случайных направлениях, оставляя цветной след. Они пока никак не реагируют на клавиши и проходят сквозь стены и друг друга.

- [ ] **Step 4: Commit**

```bash
git add web/achtung/game.js
git commit -m "feat(achtung): game loop with straight-line movement"
```

---

### Task 7: Управление клавишами и поворот

**Files:**
- Modify: `web/achtung/game.js`

- [ ] **Step 1: Слушатели клавиш игроков**

В секцию `// === PLAYERS ===`:

```javascript
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
```

Вызвать `setupGameKeys()` один раз в `// === INIT ===`:

```javascript
setupGameKeys();
```

- [ ] **Step 2: Применять поворот в `updatePlayers`**

Заменить начало цикла `for (const p of state.players)` в `updatePlayers`:

```javascript
for (const p of state.players) {
  if (!p.alive) continue;
  const reverse = p.effects.reverse > 0 ? -1 : 1;
  if (p.pressed.left)  p.angle -= TURN_RATE * dt * reverse;
  if (p.pressed.right) p.angle += TURN_RATE * dt * reverse;
  const oldX = p.x, oldY = p.y;
  // ... остальное без изменений
```

(Эффект `reverse` пока всегда 0, но логика готова к Task по бонусам.)

- [ ] **Step 3: Проверить в браузере**

Запусти игру с 2 игроками. Игрок 1 (красный) — стрелки ←/→. Игрок 2 (синий) — A/D. Зажми клавишу — линия должна плавно поворачивать.

- [ ] **Step 4: Commit**

```bash
git add web/achtung/game.js
git commit -m "feat(achtung): keyboard turning controls"
```

---

### Task 8: Столкновения со стенами

**Files:**
- Modify: `web/achtung/game.js`

- [ ] **Step 1: Проверка границ перед движением**

В `updatePlayers`, после вычисления новых `p.x, p.y`, до отрисовки линии:

```javascript
p.x += Math.cos(p.angle) * p.speed * dt;
p.y += Math.sin(p.angle) * p.speed * dt;

if (p.x < 0 || p.x >= FIELD_SIZE || p.y < 0 || p.y >= FIELD_SIZE) {
  p.alive = false;
  console.log(`${p.name} hit the wall`);
  continue;
}

ctx.strokeStyle = p.color;
// ...
```

- [ ] **Step 2: Проверить в браузере**

Запусти игру. Дай игроку доехать до края поля (или поверни в стену). Линия должна остановиться у края, в консоли — сообщение «Игрок 1 hit the wall».

- [ ] **Step 3: Commit**

```bash
git add web/achtung/game.js
git commit -m "feat(achtung): wall collisions kill players"
```

---

### Task 9: Столкновения со следами через пиксели

**Files:**
- Modify: `web/achtung/game.js`

- [ ] **Step 1: Иммунитет к собственному свежему следу**

В `createPlayer` уже есть `recentDistance` нет — добавим. Заменить `createPlayer`:

```javascript
function createPlayer(config) {
  return {
    name: config.name,
    color: config.color,
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
    spawnImmunity: 0.3, // секунд иммунитета после спавна (двигаемся, но не проверяем столкновения)
  };
}
```

- [ ] **Step 2: Заменить `updatePlayers` целиком**

```javascript
function updatePlayers(dt) {
  const ctx = state.ctx;
  for (const p of state.players) {
    if (!p.alive) continue;

    const reverse = p.effects.reverse > 0 ? -1 : 1;
    if (p.pressed.left)  p.angle -= TURN_RATE * dt * reverse;
    if (p.pressed.right) p.angle += TURN_RATE * dt * reverse;

    const oldX = p.x, oldY = p.y;
    p.x += Math.cos(p.angle) * p.speed * dt;
    p.y += Math.sin(p.angle) * p.speed * dt;

    // Wall
    if (p.x < 0 || p.x >= FIELD_SIZE || p.y < 0 || p.y >= FIELD_SIZE) {
      p.alive = false;
      console.log(`${p.name} hit the wall`);
      continue;
    }

    // Trail collision (только если иммунитет спавна закончился)
    if (p.spawnImmunity > 0) {
      p.spawnImmunity -= dt;
    } else {
      const checkRadius = Math.max(1, Math.floor(p.thickness / 2));
      const px = Math.floor(p.x);
      const py = Math.floor(p.y);
      const data = ctx.getImageData(px - checkRadius, py - checkRadius, checkRadius * 2 + 1, checkRadius * 2 + 1).data;
      let hit = false;
      for (let i = 0; i < data.length; i += 4) {
        // Если хоть один непрозрачный не-чёрный пиксель — это след
        if (data[i+3] > 0 && (data[i] > 10 || data[i+1] > 10 || data[i+2] > 10)) {
          hit = true;
          break;
        }
      }
      if (hit) {
        p.alive = false;
        console.log(`${p.name} hit a trail`);
        continue;
      }
    }

    // Draw
    ctx.strokeStyle = p.color;
    ctx.lineWidth = p.thickness;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(oldX, oldY);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
  }
}
```

- [ ] **Step 3: Проверить в браузере**

Запусти игру с 2 игроками. Веди свою линию в чужой след — должен умереть. Веди в свой собственный (после поворота на 360°) — тоже должен умереть. Спавн-иммунитет (0.3 сек) защищает от случайной смерти на старте.

Если столкновения срабатывают слишком рано/часто на собственном свежем следе — попробуй увеличить `spawnImmunity` до 0.5.

- [ ] **Step 4: Commit**

```bash
git add web/achtung/game.js
git commit -m "feat(achtung): pixel-based trail collisions"
```

---

### Task 10: Разрывы в следе

**Files:**
- Modify: `web/achtung/game.js`

- [ ] **Step 1: Логика разрывов в `updatePlayers`**

В цикле обработки игрока, перед `// Draw`, добавить:

```javascript
// Gap timer
p.gapTimer -= dt;
if (p.gapTimer <= 0) {
  if (p.inGap) {
    // Заканчиваем разрыв
    p.inGap = false;
    p.gapTimer = 1 + Math.random() * 2; // следующий разрыв через 1–3 сек
  } else {
    // Начинаем разрыв
    p.inGap = true;
    p.gapTimer = 0.15; // длительность разрыва
  }
}
```

- [ ] **Step 2: Заменить блок отрисовки**

```javascript
// Draw
if (!p.inGap) {
  ctx.strokeStyle = p.color;
  ctx.lineWidth = p.thickness;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(oldX, oldY);
  ctx.lineTo(p.x, p.y);
  ctx.stroke();
}
```

- [ ] **Step 3: Проверить в браузере**

Запусти игру. Через секунду-две на следе каждого игрока должны появляться короткие пробелы (~150 мс). Через эти пробелы можно проезжать без столкновения.

- [ ] **Step 4: Commit**

```bash
git add web/achtung/game.js
git commit -m "feat(achtung): random gaps in trails"
```

---

### Task 11: Конец раунда и подсчёт очков

**Files:**
- Modify: `web/achtung/game.js`
- Modify: `web/achtung/index.html`
- Modify: `web/achtung/style.css`

- [ ] **Step 1: Добавить overlay для сообщений между раундами**

В `index.html`, внутри `#screen-game` после `<canvas>`:

```html
<div id="round-overlay" class="hidden">
  <div id="round-message"></div>
  <div id="round-hint">Нажми Enter для следующего раунда</div>
</div>
```

- [ ] **Step 2: Стили в `style.css`**

В конец:

```css
#round-overlay {
  position: absolute;
  width: 700px;
  height: 700px;
  background: rgba(0, 0, 0, 0.7);
  color: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  font-size: 32px;
  pointer-events: none;
}
#round-overlay.hidden { display: none; }
#round-hint { font-size: 18px; opacity: 0.7; }

#screen-game { position: relative; }
```

- [ ] **Step 3: Логика конца раунда в `game.js`**

В секцию `// === STATE ===` добавить:

```javascript
state.round = 0;
state.targetScore = 10;
state.phase = 'menu'; // 'playing' | 'between-rounds' | 'game-over'
```

В секцию `// === GAME LOOP ===`, в конце `gameLoop` после `updatePlayers(dt)` добавить `updateRoundState()`:

```javascript
function updateRoundState() {
  if (state.phase !== 'playing') return;
  const alive = state.players.filter(p => p.alive);
  if (alive.length <= 1) {
    // Раунд закончился — каждому выжившему уже не дадим очков (выживший один или ноль).
    // По правилам: каждый раз когда КТО-ТО умирает, выжившие получают +1.
    // Уже учтено в updatePlayers (см. Step 4).
    state.phase = 'between-rounds';
    showRoundOverlay();
  }
}
```

- [ ] **Step 4: Заменить `updatePlayers` — давать очки при смерти**

В местах, где `p.alive = false;` (в стену и в след), сразу после строки добавить:

```javascript
for (const other of state.players) {
  if (other !== p && other.alive) other.score += 1;
}
```

То есть оба места стали:

```javascript
if (p.x < 0 || p.x >= FIELD_SIZE || p.y < 0 || p.y >= FIELD_SIZE) {
  p.alive = false;
  for (const other of state.players) {
    if (other !== p && other.alive) other.score += 1;
  }
  console.log(`${p.name} hit the wall`);
  continue;
}
```

И аналогично для `hit a trail`.

- [ ] **Step 5: Overlay и обработка Enter**

В секцию `// === GAME LOOP ===`:

```javascript
function showRoundOverlay() {
  const winner = state.players.find(p => p.alive);
  const msg = winner ? `Победитель раунда: ${winner.name} (+1)` : 'Никто не выжил';
  document.getElementById('round-message').textContent = msg;
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
    document.getElementById('round-hint').textContent = 'Нажми Enter для возврата в меню';
  }
}

window.addEventListener('keydown', (e) => {
  if (e.key !== 'Enter') return;
  if (state.phase === 'between-rounds') {
    startRound();
  } else if (state.phase === 'game-over') {
    showScreen('menu');
    state.phase = 'menu';
    hideRoundOverlay();
  }
});
```

- [ ] **Step 6: Разделить `startGame` и `startRound`**

Заменить `startGame`:

```javascript
function startGame() {
  showScreen('game');
  state.ctx = document.getElementById('field').getContext('2d');
  state.targetScore = (menu.players.length - 1) * 10;
  state.round = 0;
  // Создаём игроков с очками 0
  state.players = menu.players.map(createPlayer);
  state.players.forEach(p => p.score = 0);
  startRound();
}

function startRound() {
  state.round++;
  state.ctx.fillStyle = '#000';
  state.ctx.fillRect(0, 0, FIELD_SIZE, FIELD_SIZE);
  // Сохраняем счёт, перерандомим позицию
  for (const p of state.players) {
    p.x = Math.random() * (FIELD_SIZE - 200) + 100;
    p.y = Math.random() * (FIELD_SIZE - 200) + 100;
    p.angle = Math.random() * Math.PI * 2;
    p.alive = true;
    p.effects = {};
    p.inGap = false;
    p.gapTimer = 1 + Math.random() * 2;
    p.spawnImmunity = 0.5;
    p.speed = p.baseSpeed;
    p.thickness = p.baseThickness;
  }
  hideRoundOverlay();
  state.phase = 'playing';
  state.running = true;
  state.lastFrameTime = performance.now();
  requestAnimationFrame(gameLoop);
}
```

- [ ] **Step 7: Проверить в браузере**

1. Запусти игру с 2 игроками. Цель — `(2-1)*10 = 10` очков.
2. Один игрок умирает — другой получает +1, появляется overlay «Победитель раунда…».
3. Нажми Enter — поле очищается, новый раунд.
4. Доиграй до 10 очков — появляется «🏆 Победил…», Enter возвращает в меню.

- [ ] **Step 8: Commit**

```bash
git add web/achtung/index.html web/achtung/style.css web/achtung/game.js
git commit -m "feat(achtung): rounds, scoring, and game-over flow"
```

---

### Task 12: Боковая панель — счёт и клавиши

**Files:**
- Modify: `web/achtung/game.js`
- Modify: `web/achtung/style.css`

- [ ] **Step 1: Заменить секцию `// === SIDEBAR ===` в `game.js`**

```javascript
// === SIDEBAR ================================================
function updateSidebar() {
  const list = document.getElementById('score-list');
  list.innerHTML = '';
  const sorted = [...state.players].sort((a, b) => b.score - a.score);
  for (const p of sorted) {
    const row = document.createElement('div');
    row.className = 'score-row';
    const effectsList = Object.entries(p.effects)
      .filter(([, t]) => t > 0)
      .map(([name, t]) => `<span class="effect">${name} ${t.toFixed(1)}s</span>`)
      .join('');
    row.innerHTML = `
      <div class="score-main">
        <span style="color:${p.color}">${p.name}</span>
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
```

- [ ] **Step 2: Стили в `style.css`**

В конец:

```css
.score-row {
  background: #222;
  padding: 8px;
  border-radius: 4px;
  margin-bottom: 8px;
}
.score-main {
  display: flex;
  justify-content: space-between;
  font-weight: bold;
  font-size: 18px;
}
.score-keys { font-size: 12px; opacity: 0.7; margin-top: 4px; }
.score-effects { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 4px; }
.effect {
  font-size: 11px;
  background: #444;
  padding: 2px 6px;
  border-radius: 3px;
}
```

- [ ] **Step 3: Вызывать `updateSidebar` каждый кадр**

В `gameLoop` после `updatePlayers(dt)`:

```javascript
updatePlayers(dt);
updateSidebar();
updateRoundState();
```

- [ ] **Step 4: Кнопка «В меню»**

В `index.html`, внутри `#sidebar` добавить в конце:

```html
<button id="back-to-menu">В меню</button>
```

В `game.js` (`// === INIT ===`):

```javascript
document.getElementById('back-to-menu').addEventListener('click', () => {
  state.running = false;
  state.phase = 'menu';
  hideRoundOverlay();
  showScreen('menu');
});
```

CSS, в конец:

```css
#sidebar { display: flex; flex-direction: column; }
#back-to-menu { margin-top: auto; }
```

- [ ] **Step 5: Проверить в браузере**

Запусти игру. Справа в панели:
- видно всех игроков, отсортированы по очкам;
- видно их клавиши;
- очки обновляются после смерти;
- кнопка «В меню» возвращает в меню.

- [ ] **Step 6: Commit**

```bash
git add web/achtung/index.html web/achtung/style.css web/achtung/game.js
git commit -m "feat(achtung): sidebar with live scores, keys, and back-to-menu"
```

---

### Task 13: Бонусы — спавн и подбор (без эффектов)

**Files:**
- Modify: `web/achtung/game.js`

- [ ] **Step 1: Состояние бонусов**

В `// === STATE ===` добавить:

```javascript
state.bonuses = []; // {x, y, type, color, letter}
state.bonusSpawnTimer = 3;
```

Константы (в той же секции):

```javascript
const BONUS_RADIUS = 14;
const MAX_BONUSES = 3;

const BONUS_TYPES = [
  { type: 'speedUp',   color: '#4f4', letter: 'A' },
  { type: 'slowDown',  color: '#fa4', letter: 'B' },
  { type: 'thinLine',  color: '#4cf', letter: 'C' },
  { type: 'thickLine', color: '#a4f', letter: 'D' },
  { type: 'clearAll',  color: '#fff', letter: 'E' },
  { type: 'reverse',   color: '#f44', letter: 'F' },
];
```

- [ ] **Step 2: Логика бонусов**

Заменить секцию `// === BONUSES ===`:

```javascript
// === BONUSES ================================================
function updateBonuses(dt) {
  state.bonusSpawnTimer -= dt;
  if (state.bonusSpawnTimer <= 0) {
    if (state.bonuses.length < MAX_BONUSES) trySpawnBonus();
    state.bonusSpawnTimer = 3 + Math.random() * 4;
  }
  drawBonuses();
  checkBonusPickup();
}

function trySpawnBonus() {
  // Найти свободное место (не на следе)
  for (let attempt = 0; attempt < 30; attempt++) {
    const x = BONUS_RADIUS + 10 + Math.random() * (FIELD_SIZE - (BONUS_RADIUS + 10) * 2);
    const y = BONUS_RADIUS + 10 + Math.random() * (FIELD_SIZE - (BONUS_RADIUS + 10) * 2);
    if (isAreaClear(x, y, BONUS_RADIUS + 4)) {
      const t = BONUS_TYPES[Math.floor(Math.random() * BONUS_TYPES.length)];
      state.bonuses.push({ x, y, ...t });
      return;
    }
  }
}

function isAreaClear(x, y, r) {
  const ctx = state.ctx;
  const data = ctx.getImageData(x - r, y - r, r * 2, r * 2).data;
  for (let i = 0; i < data.length; i += 4) {
    if (data[i+3] > 0 && (data[i] > 10 || data[i+1] > 10 || data[i+2] > 10)) return false;
  }
  return true;
}

function drawBonuses() {
  const ctx = state.ctx;
  for (const b of state.bonuses) {
    ctx.fillStyle = b.color;
    ctx.beginPath();
    ctx.arc(b.x, b.y, BONUS_RADIUS, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(b.letter, b.x, b.y);
  }
}

function checkBonusPickup() {
  for (let i = state.bonuses.length - 1; i >= 0; i--) {
    const b = state.bonuses[i];
    for (const p of state.players) {
      if (!p.alive) continue;
      const dx = p.x - b.x;
      const dy = p.y - b.y;
      if (dx*dx + dy*dy <= BONUS_RADIUS * BONUS_RADIUS) {
        applyBonus(p, b);
        // Стереть бонус с canvas (закрасить чёрным)
        const ctx = state.ctx;
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(b.x, b.y, BONUS_RADIUS + 1, 0, Math.PI * 2);
        ctx.fill();
        state.bonuses.splice(i, 1);
        break;
      }
    }
  }
}

function applyBonus(picker, bonus) {
  console.log(`${picker.name} picked up ${bonus.type}`);
  // Эффекты добавим в Task 14
}
```

- [ ] **Step 3: Вызвать в `gameLoop`**

```javascript
updatePlayers(dt);
updateBonuses(dt);
updateSidebar();
updateRoundState();
```

- [ ] **Step 4: Проверить в браузере**

Запусти игру. Через 3–7 секунд на поле появляется цветной круг с буквой (A/B/C/D/E/F). Веди игрока в круг — он исчезает, в консоли «Игрок 1 picked up speedUp» (или другой тип). Бонус остаётся на поле, пока его не подберут.

- [ ] **Step 5: Commit**

```bash
git add web/achtung/game.js
git commit -m "feat(achtung): bonus spawning and pickup detection"
```

---

### Task 14: Эффекты бонусов

**Files:**
- Modify: `web/achtung/game.js`

- [ ] **Step 1: Заменить `applyBonus`**

```javascript
const EFFECT_DURATION = 5;

function applyBonus(picker, bonus) {
  switch (bonus.type) {
    case 'speedUp':
      addEffect(picker, 'speedUp', EFFECT_DURATION);
      break;
    case 'thinLine':
      addEffect(picker, 'thinLine', EFFECT_DURATION);
      break;
    case 'slowDown':
      for (const p of state.players) {
        if (p !== picker && p.alive) addEffect(p, 'slowDown', EFFECT_DURATION);
      }
      break;
    case 'thickLine':
      for (const p of state.players) {
        if (p !== picker && p.alive) addEffect(p, 'thickLine', EFFECT_DURATION);
      }
      break;
    case 'reverse':
      for (const p of state.players) {
        if (p !== picker && p.alive) addEffect(p, 'reverse', EFFECT_DURATION);
      }
      break;
    case 'clearAll':
      clearAllTrails();
      break;
  }
}

function addEffect(player, name, duration) {
  // Складываем таймер
  player.effects[name] = (player.effects[name] || 0) + duration;
}

function clearAllTrails() {
  const ctx = state.ctx;
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, FIELD_SIZE, FIELD_SIZE);
  // Дать всем короткий иммунитет, чтобы не врезаться в момент очистки
  for (const p of state.players) {
    if (p.alive) p.spawnImmunity = 0.3;
  }
  // Перерисовать существующие бонусы (они тоже стёрлись)
  drawBonuses();
}
```

- [ ] **Step 2: Применять эффекты в `updatePlayers`**

В начале цикла обработки игрока (после `if (!p.alive) continue;`) обновлять параметры:

```javascript
// Обновить таймеры эффектов
for (const name of Object.keys(p.effects)) {
  p.effects[name] -= dt;
  if (p.effects[name] <= 0) delete p.effects[name];
}

// Применить текущие эффекты к speed/thickness
const speedMult = (p.effects.speedUp ? 1.7 : 1) * (p.effects.slowDown ? 0.5 : 1);
const thickMult = (p.effects.thinLine ? 0.5 : 1) * (p.effects.thickLine ? 2 : 1);
p.speed = p.baseSpeed * speedMult;
p.thickness = p.baseThickness * thickMult;

const reverse = p.effects.reverse ? -1 : 1;
if (p.pressed.left)  p.angle -= TURN_RATE * dt * reverse;
if (p.pressed.right) p.angle += TURN_RATE * dt * reverse;
```

(Старая строка `const reverse = p.effects.reverse > 0 ? -1 : 1;` заменена на новую — она теперь правильно работает, потому что `p.effects.reverse` либо `undefined`, либо число.)

- [ ] **Step 3: Проверить в браузере с 2 игроками**

Подбери каждый из 6 бонусов и проверь:

| Буква | Что должно произойти |
|---|---|
| A speedUp | Подобравший резко ускоряется на 5 сек |
| B slowDown | Все остальные замедляются на 5 сек |
| C thinLine | След подобравшего становится в 2 раза тоньше |
| D thickLine | След остальных становится в 2 раза толще |
| E clearAll | Всё поле очищается мгновенно |
| F reverse | У остальных ← и → меняются местами на 5 сек |

Подбери дважды один и тот же бонус (например, A) — таймер сложится (~10 сек).

В боковой панели около имени игрока появляются плашки с названием эффекта и таймером.

- [ ] **Step 4: Commit**

```bash
git add web/achtung/game.js
git commit -m "feat(achtung): all six bonus effects with stacking timers"
```

---

### Task 15: «3, 2, 1, GO!» отсчёт перед раундом

**Files:**
- Modify: `web/achtung/game.js`

- [ ] **Step 1: Изменить `startRound`**

Заменить целиком:

```javascript
function startRound() {
  state.round++;
  state.ctx.fillStyle = '#000';
  state.ctx.fillRect(0, 0, FIELD_SIZE, FIELD_SIZE);
  for (const p of state.players) {
    p.x = Math.random() * (FIELD_SIZE - 200) + 100;
    p.y = Math.random() * (FIELD_SIZE - 200) + 100;
    p.angle = Math.random() * Math.PI * 2;
    p.alive = true;
    p.effects = {};
    p.inGap = false;
    p.gapTimer = 1 + Math.random() * 2;
    p.spawnImmunity = 0.5;
    p.speed = p.baseSpeed;
    p.thickness = p.baseThickness;
    p.pressed = { left: false, right: false };
  }
  state.bonuses = [];
  state.bonusSpawnTimer = 3;
  hideRoundOverlay();
  state.phase = 'countdown';
  runCountdown();
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
```

- [ ] **Step 2: Защитить `gameLoop` от запуска во время отсчёта**

`state.phase === 'countdown'` означает «не двигаемся». Уже работает: `state.running = true` устанавливается только после отсчёта.

- [ ] **Step 3: Проверить в браузере**

Старт нового раунда: видно «3», потом «2», «1», «GO!», затем игра начинается. Между раундами после Enter — снова отсчёт.

- [ ] **Step 4: Commit**

```bash
git add web/achtung/game.js
git commit -m "feat(achtung): 3-2-1-GO countdown before each round"
```

---

### Task 16: Финальные проверки и полировка

**Files:**
- Read: всё
- Modify: при необходимости

- [ ] **Step 1: Сценарий полного матча с 4 игроками**

1. В меню выбери 4 игрока, при необходимости перенастрой клавиши.
2. Сыграй до победы — `(4-1)*10 = 30` очков.
3. Проверь:
   - Все 4 цвета различимы.
   - Бонусы спавнятся регулярно, до 3 одновременно.
   - Между раундами видна правильная таблица очков.
   - При победе — экран «🏆 Победил…», Enter возвращает в меню.
   - В меню очки сброшены, клавиши помнятся.

- [ ] **Step 2: Проверить отсутствие зависших слушателей**

Открой DevTools → Console. Несколько раз сыграй и вернись в меню. В консоли не должно быть ошибок. Если есть — поправь.

- [ ] **Step 3: Подкрутить значения, если что-то не ощущается**

Если игра кажется слишком быстрой/медленной — поправь константы в `// === STATE ===`:
- `BASE_SPEED = 90` — скорость
- `TURN_RATE = 3.0` — насколько быстро поворачивает
- `BASE_THICKNESS = 4` — толщина следа

Если столкновения с собственным следом срабатывают слишком чувствительно — увеличь `spawnImmunity` в `startRound` до `0.7`.

- [ ] **Step 4: Финальный коммит**

```bash
git add -A
git commit -m "chore(achtung): final tuning and polish"
```

---

## Self-Review

Прошёлся по плану и спеке:

**Spec coverage:**
- 3-файловая структура → Task 1 ✓
- Игровой экран и боковая панель → Task 2, 12 ✓
- Меню с количеством игроков → Task 3 ✓
- Настройка клавиш + localStorage + конфликты → Task 4 ✓
- Игроки, спавн, движение → Task 5, 6, 7 ✓
- Столкновения со стенами и следами → Task 8, 9 ✓
- Разрывы в следе → Task 10 ✓
- Раунды, очки `(N-1)*10`, конец игры → Task 11 ✓
- Боковая панель — счёт, эффекты, клавиши, кнопка в меню → Task 12 ✓
- 6 бонусов, спавн без таймера, складывание эффектов → Task 13, 14 ✓
- «3, 2, 1, GO!» и Enter перед раундом → Task 11, 15 ✓
- Заголовок «Achtung die Kurva» → Task 1, 3 ✓

**Placeholder scan:** TBD/TODO/«implement later» нет, у каждого шага есть код.

**Type/name consistency:** проверил — `state.players`, `p.effects`, `BONUS_TYPES.type`, `applyBonus(picker, bonus)` совпадают между задачами. `addEffect` определён в Task 14 и используется только там и далее.
