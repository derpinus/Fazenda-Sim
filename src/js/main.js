const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const player = {
    x: 8, y: 8,
    vx: 0, vy: 0,
    maxSpeed: 0.018,
    accel: 0.0035,
    friction: 0.78,
    isMoving: false, 
    animTimer: 0,
    coins: 30, maxCap: 5,
    seeds: 4, wheat: 0, milk: 0, wool: 0, cheese: 0, eggs: 0
};
const keys = {};

let timeOfDay = 0;
const DAY_LENGTH = 2000;

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playTone(freq, type, duration) {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
}

function playSound(action) {
    if (action === 'step') playTone(90, 'triangle', 0.05);
    if (action === 'collect') { playTone(440, 'sine', 0.1); setTimeout(() => playTone(880, 'sine', 0.15), 80); }
    if (action === 'coins') { playTone(587, 'sine', 0.1); setTimeout(() => playTone(1174, 'sine', 0.2), 100); }
    if (action === 'animal') { playTone(150, 'sawtooth', 0.25); }
}

const market = { x: 7, y: 7 };
const cheesePress = { x: 8, y: 7, status: 'vazia', timer: 0 }; // <--- Adicionado status e timer aqui

const animals = [
    new Animal('cow', 2, 12, cowPen),
    new Animal('sheep', 12, 12, sheepPen),
    new Animal('chicken', 12, 4, chickenPen),
    new Animal('horse', 2, 4, horsePen)
];

const farmPlots = [
    { x: 7, y: 5, state: 'empty', timer: 0 },
    { x: 8, y: 5, state: 'empty', timer: 0 },
    { x: 7, y: 9, state: 'empty', timer: 0 },
    { x: 8, y: 9, state: 'empty', timer: 0 }
];

let shopOpen = false;

window.addEventListener('keydown', e => {
    const k = e.key.toLowerCase();
    keys[k] = true;
    if (k === 'e' || k === 'escape') {
        if (shopOpen) closeShop();
        else if (Math.hypot(player.x - market.x, player.y - market.y) < 2) openShop();
    }
});
window.addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);

function openShop() { shopOpen = true; document.getElementById('shop-modal').style.display = 'block'; }
function closeShop() { shopOpen = false; document.getElementById('shop-modal').style.display = 'none'; }

function buyItem(type, cost) {
    if (player.coins < cost) return alert('Moedas insuficientes!');
    if (type === 'seed') {
        if (player.seeds >= player.maxCap) return alert('Mochila cheia!');
        player.seeds++; player.coins -= cost;
    } else if (type === 'bag') {
        player.maxCap += 5; player.coins -= cost;
    } else if (type === 'cow') {
        animals.push(new Animal('cow', cowPen.minX + 1, cowPen.minY + 1, cowPen));
        player.coins -= cost;
    } else if (type === 'sheep') {
        animals.push(new Animal('sheep', sheepPen.minX + 1, sheepPen.minY + 1, sheepPen));
        player.coins -= cost;
    } else if (type === 'chicken') {
        animals.push(new Animal('chicken', chickenPen.minX + 1, chickenPen.minY + 1, chickenPen));
        player.coins -= cost;
    } else if (type === 'horse') {
        animals.push(new Animal('horse', horsePen.minX + 1, horsePen.minY + 1, horsePen));
        player.coins -= cost;
    }
    playSound('coins');
    updateUI();
}

function sellAll() {
    const total = (player.milk * 15) + (player.wool * 18) + (player.cheese * 45) + (player.eggs * 10) + (player.wheat * 12);
    if (total === 0) return alert('Sem produtos para vender!');
    player.coins += total;
    player.milk = 0; player.wool = 0; player.cheese = 0; player.eggs = 0; player.wheat = 0;
    playSound('coins');
    updateUI();
}

function update() {
    if (shopOpen) return;

    timeOfDay = (timeOfDay + 1) % DAY_LENGTH;

    let inputX = 0;
    let inputY = 0;
    if (keys['w'] || keys['arrowup']) { inputX -= 1; inputY -= 1; }
    if (keys['s'] || keys['arrowdown']) { inputX += 1; inputY += 1; }
    if (keys['a'] || keys['arrowleft']) { inputX -= 1; inputY += 1; }
    if (keys['d'] || keys['arrowright']) { inputX += 1; inputY -= 1; }

    if (inputX !== 0 || inputY !== 0) {
        const len = Math.hypot(inputX, inputY);
        player.vx += (inputX / len) * player.accel;
        player.vy += (inputY / len) * player.accel;
    }

    player.vx *= player.friction;
    player.vy *= player.friction;

    const currentSpeed = Math.hypot(player.vx, player.vy);
    if (currentSpeed > player.maxSpeed) {
        player.vx = (player.vx / currentSpeed) * player.maxSpeed;
        player.vy = (player.vy / currentSpeed) * player.maxSpeed;
    }

    player.x += player.vx;
    player.y += player.vy;

    // --- CÂMARA DINÂMICA ANCORADA NA BASE ISOMÉTRICA ---
    const targetIsoX = (player.x - player.y) * (TILE_WIDTH / 2);
    const targetIsoY = (player.x + player.y) * (TILE_HEIGHT / 2);

    // Ajustamos o offset vertical para centrar o jogador ligeiramente acima do terço inferior do ecrã,
    // dando a sensação de que o mapa se abre para cima (a partir da ponta de baixo)
    const desiredOriginX = (canvas.width / 2) - targetIsoX;
    const desiredOriginY = (canvas.height * 0.55) - targetIsoY;

    ORIGIN_X += (desiredOriginX - ORIGIN_X) * 0.1;
    ORIGIN_Y += (desiredOriginY - ORIGIN_Y) * 0.1;
    // ----------------------------------------------------

    player.isMoving = currentSpeed > 0.0015;
    if (player.isMoving) {
        player.animTimer += 0.05;
        if (Math.floor(player.animTimer * 10) % 25 === 0) playSound('step');
    } else {
        player.animTimer = 0;
    }

    player.x = Math.max(0, Math.min(MAP_SIZE - 1, player.x));
    player.y = Math.max(0, Math.min(MAP_SIZE - 1, player.y));

    animals.forEach(a => a.update());

    farmPlots.forEach(p => {
        if (p.state === 'growing') {
            p.timer++;
            if (p.timer > 200) { p.state = 'ready'; p.timer = 0; }
        }
    });

    if (cheesePress.status === 'processando') {
        cheesePress.timer++;
        if (cheesePress.timer > 150) { cheesePress.status = 'pronto'; cheesePress.timer = 0; }
    }

    const prompt = document.getElementById('action-prompt');
    prompt.innerText = '';

    if (Math.hypot(player.x - market.x, player.y - market.y) < 2) {
        prompt.innerText = '[E] Entrar na Loja da Vila';
    }

    animals.forEach(a => {
        if (Math.hypot(player.x - a.x, player.y - a.y) < 1.3) {
            if (a.hasProduct && player.maxCap > (player.milk + player.wool + player.eggs + player.wheat)) {
                if (a.type === 'cow') {
                    prompt.innerText = '[ESPAÇO] Ordenhar Vaca';
                    if (keys[' ']) { player.milk++; a.hasProduct = false; playSound('animal'); playSound('collect'); keys[' '] = false; }
                } else if (a.type === 'sheep') {
                    prompt.innerText = '[ESPAÇO] Tosquia de Lã';
                    if (keys[' ']) { player.wool++; a.hasProduct = false; playSound('animal'); playSound('collect'); keys[' '] = false; }
                } else if (a.type === 'chicken') {
                    prompt.innerText = '[ESPAÇO] Coletar Ovo';
                    if (keys[' ']) { player.eggs++; a.hasProduct = false; playSound('collect'); keys[' '] = false; }
                } else if (a.type === 'horse') {
                    prompt.innerText = '🐎 Cavalo Amigável (Mascote)';
                }
            } else if (!a.hasProduct && player.wheat > 0 && !a.fed && a.type !== 'horse') {
                prompt.innerText = '[ESPAÇO] Alimentar Trigo (Acelera 3x)';
                if (keys[' ']) { player.wheat--; a.fed = true; playSound('collect'); keys[' '] = false; }
            }
        }
    });

    farmPlots.forEach(p => {
        if (Math.hypot(player.x - p.x, player.y - p.y) < 1.2) {
            if (p.state === 'empty' && player.seeds > 0) {
                prompt.innerText = '[ESPAÇO] Plantar Trigo';
                if (keys[' ']) { player.seeds--; p.state = 'growing'; playSound('collect'); keys[' '] = false; }
            } else if (p.state === 'ready' && player.maxCap > (player.milk + player.wool + player.eggs + player.wheat)) {
                prompt.innerText = '[ESPAÇO] Colher Trigo';
                if (keys[' ']) { player.wheat++; p.state = 'empty'; playSound('collect'); keys[' '] = false; }
            }
        }
    });

    if (Math.hypot(player.x - cheesePress.x, player.y - cheesePress.y) < 1.2) {
        if (cheesePress.status === 'vazia' && player.milk > 0) {
            prompt.innerText = '[ESPAÇO] Iniciar Prensa de Queijo';
            if (keys[' ']) { player.milk--; cheesePress.status = 'processando'; playSound('collect'); keys[' '] = false; }
        } else if (cheesePress.status === 'pronto' && player.maxCap > (player.milk + player.wool + player.eggs + player.wheat + player.cheese)) {
            prompt.innerText = '[ESPAÇO] Coletar Queijo';
            if (keys[' ']) { player.cheese++; cheesePress.status = 'vazia'; playSound('collect'); keys[' '] = false; }
        }
    }

    updateUI();
}

function updateUI() {
    document.getElementById('coins').innerText = player.coins;
    document.getElementById('maxCap').innerText = player.maxCap;
    document.getElementById('seeds').innerText = player.seeds;
    document.getElementById('wheat').innerText = player.wheat;
    document.getElementById('milk').innerText = player.milk;
    document.getElementById('wool').innerText = player.wool;
    document.getElementById('cheese').innerText = player.cheese;
    document.getElementById('eggs').innerText = player.eggs;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let x = 0; x < MAP_SIZE; x++) {
        for (let y = 0; y < MAP_SIZE; y++) {
            let topColor = '#4ade80';
            let sideColor = '#166534';
            let accentColor = '#14532d';
            
            if ((x >= cowPen.minX && x <= cowPen.maxX && y >= cowPen.minY && y <= cowPen.maxY) ||
                (x >= sheepPen.minX && x <= sheepPen.maxX && y >= sheepPen.minY && y <= sheepPen.maxY)) {
                topColor = '#b45309'; sideColor = '#78350f'; accentColor = '#451a03';
            }
            if ((x >= chickenPen.minX && x <= chickenPen.maxX && y >= chickenPen.minY && y <= chickenPen.maxY) ||
                (x >= horsePen.minX && x <= horsePen.maxX && y >= horsePen.minY && y <= horsePen.maxY)) {
                topColor = '#d97706'; sideColor = '#92400e'; accentColor = '#78350f';
            }

            drawIsometricTile(ctx, x, y, sideColor, topColor, accentColor);
        }
    }

    const renderables = [];

    renderables.push({
        y: -10,
        draw: () => { drawPenFences(ctx); }
    });

    farmPlots.forEach(p => {
        renderables.push({
            y: p.x + p.y,
            draw: () => {
                const { isoX, isoY } = toIso(p.x, p.y);
                
                // Desenhar o canteiro de terra no formato exato de losango isométrico
                ctx.fillStyle = '#451a03'; // Cor de terra arada
                ctx.beginPath();
                ctx.moveTo(isoX, isoY);
                ctx.lineTo(isoX + TILE_WIDTH/2, isoY + TILE_HEIGHT/2);
                ctx.lineTo(isoX, isoY + TILE_HEIGHT);
                ctx.lineTo(isoX - TILE_WIDTH/2, isoY + TILE_HEIGHT/2);
                ctx.closePath();
                ctx.fill();
                ctx.strokeStyle = '#271002';
                ctx.lineWidth = 1;
                ctx.stroke();

                // Renderizar o estado da plantação perfeitamente centrado no tile
                if (p.state === 'growing') {
                    ctx.fillStyle = '#a3e635';
                    ctx.beginPath();
                    ctx.arc(isoX, isoY + TILE_HEIGHT/2, 4, 0, Math.PI * 2);
                    ctx.fill();
                } else if (p.state === 'ready') {
                    const sway = Math.sin(Date.now() * 0.005) * 2;
                    ctx.font = '20px sans-serif';
                    ctx.fillText('🌾', isoX - 8 + sway, isoY + TILE_HEIGHT/2 + 6);
                }
            }
        });
    });

    // Mercado com suporte a sprites
    renderables.push({
        y: market.x + market.y,
        draw: () => {
            const { isoX, isoY } = toIso(market.x, market.y);
            drawShadow(ctx, isoX, isoY + 5, 28, 14);
            const sprite = Sprites['market'];
            if (sprite && sprite.complete && sprite.naturalWidth > 0) {
                ctx.drawImage(sprite, isoX - 36, isoY - 75, 72, 72);
            } else {
                ctx.fillStyle = '#64748b';
                ctx.fillRect(isoX - 30, isoY - 45, 60, 50);
                ctx.fillStyle = '#78350f';
                ctx.fillRect(isoX - 10, isoY - 18, 20, 24);
                ctx.fillStyle = '#b91c1c';
                ctx.beginPath();
                ctx.moveTo(isoX - 36, isoY - 45);
                ctx.lineTo(isoX, isoY - 75);
                ctx.lineTo(isoX + 36, isoY - 45);
                ctx.fill();
                ctx.fillStyle = '#fef08a';
                ctx.font = 'bold 11px sans-serif';
                ctx.fillText('MERCADO', isoX - 22, isoY - 55);
            }
        }
    });

    // Prensa de Queijo com suporte a sprites
    // Prensa de Queijo com suporte a sprites e alinhamento isométrico exato
    renderables.push({
        y: cheesePress.x + cheesePress.y,
        draw: () => {
            const { isoX, isoY } = toIso(cheesePress.x, cheesePress.y);
            
            // Desenhar a base em losango isométrico igual aos canteiros, dando a sensação de fundação no mapa
            ctx.fillStyle = '#b45309'; // Tom de madeira/pedra rústica da base
            ctx.beginPath();
            ctx.moveTo(isoX, isoY);
            ctx.lineTo(isoX + TILE_WIDTH/2, isoY + TILE_HEIGHT/2);
            ctx.lineTo(isoX, isoY + TILE_HEIGHT);
            ctx.lineTo(isoX - TILE_WIDTH/2, isoY + TILE_HEIGHT/2);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = '#451a03';
            ctx.lineWidth = 1;
            ctx.stroke();

            drawShadow(ctx, isoX, isoY + 2, 16, 8);
            
            const sprite = Sprites['cheesePress'];
            if (sprite && sprite.complete && sprite.naturalWidth > 0) {
                ctx.drawImage(sprite, isoX - 20, isoY - 32, 40, 40);
            } else {
                ctx.fillStyle = '#78350f';
                ctx.fillRect(isoX - 16, isoY - 22, 32, 26);
                
                if (cheesePress.status === 'processando') {
                    const bounce = Math.abs(Math.sin(Date.now() * 0.01)) * 4;
                    ctx.font = '16px sans-serif';
                    ctx.fillText('⚙️', isoX - 8, isoY - 8 - bounce);
                } else if (cheesePress.status === 'pronto') {
                    ctx.font = '18px sans-serif';
                    ctx.fillText('🧀', isoX - 9, isoY - 8);
                }
            }
        }
    });

    animals.forEach(a => {
        renderables.push({
            y: a.x + a.y,
            draw: () => a.draw(ctx)
        });
    });

    // Jogador com suporte a sprites
    renderables.push({
        y: player.x + player.y,
        draw: () => {
            const { isoX, isoY } = toIso(player.x, player.y);
            drawShadow(ctx, isoX, isoY, 14, 7);
            const sprite = Sprites['farmer'];
            if (sprite && sprite.complete && sprite.naturalWidth > 0) {
                const bounce = player.isMoving ? Math.abs(Math.sin(player.animTimer * 4)) * 3 : 0;
                ctx.drawImage(sprite, isoX - 16, isoY - 36 - bounce, 32, 36);
            } else {
                const bounce = player.isMoving ? Math.abs(Math.sin(player.animTimer * 4)) * 3 : 0;
                const legSwing = player.isMoving ? Math.sin(player.animTimer * 4) * 3.5 : 0;
                ctx.fillStyle = '#1e3a8a';
                ctx.fillRect(isoX - 6 + legSwing, isoY - 10, 4, 10);
                ctx.fillRect(isoX + 2 - legSwing, isoY - 10, 4, 10);
                ctx.fillStyle = '#0284c7';
                ctx.fillRect(isoX - 8, isoY - 24 - bounce, 16, 16);
                ctx.fillStyle = '#fde047';
                ctx.fillRect(isoX - 12, isoY - 32 - bounce, 24, 6);
                ctx.fillStyle = '#fed7aa';
                ctx.fillRect(isoX - 6, isoY - 28 - bounce, 12, 6);
            }
        }
    });

    renderables.sort((a, b) => a.y - b.y);
    renderables.forEach(r => r.draw());

    const nightAlpha = Math.abs(Math.sin((timeOfDay / DAY_LENGTH) * Math.PI)) * 0.45;
    ctx.fillStyle = `rgba(15, 23, 42, ${nightAlpha})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();