const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Estado do Jogador com Animações de Passos
const player = {
    x: 5, y: 5, speed: 0.08,
    isMoving: false, animTimer: 0, dir: 'S',
    coins: 20, maxCap: 5,
    seeds: 2, wheat: 0, milk: 0, cheese: 0, eggs: 0
};
const keys = {};

// Ciclo Dia/Noite (Opção 2)
let timeOfDay = 0; // 0 a 1000
const DAY_LENGTH = 2000;

// Efeitos Sonoros com Web Audio API (Opção 1)
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playTone(freq, type, duration) {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
}

function playSound(action) {
    if (action === 'step') playTone(120, 'triangle', 0.05);
    if (action === 'collect') { playTone(440, 'sine', 0.1); setTimeout(() => playTone(880, 'sine', 0.15), 80); }
    if (action === 'coins') { playTone(587, 'sine', 0.1); setTimeout(() => playTone(1174, 'sine', 0.2), 100); }
    if (action === 'cow') { playTone(150, 'sawtooth', 0.3); }
}

// Entidades
const market = { x: 1, y: 1 };
const cheesePress = { x: 4, y: 2, status: 'vazia', timer: 0 };

const cows = [{ x: 2, y: 7, hasMilk: true, timer: 0, fed: false, animOffset: Math.random()*100 }];
const chickens = [{ x: 8, y: 3, hasEgg: true, timer: 0, fed: false, animOffset: Math.random()*100 }];

const farmPlots = [
    { x: 6, y: 6, state: 'empty', timer: 0 },
    { x: 7, y: 6, state: 'empty', timer: 0 },
    { x: 8, y: 6, state: 'empty', timer: 0 }
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
        cows.push({ x: 1 + Math.random()*3, y: 6 + Math.random()*3, hasMilk: false, timer: 0, fed: false, animOffset: Math.random()*100 });
        player.coins -= cost;
    } else if (type === 'chicken') {
        chickens.push({ x: 7 + Math.random()*3, y: 1 + Math.random()*3, hasEgg: false, timer: 0, fed: false, animOffset: Math.random()*100 });
        player.coins -= cost;
    }
    playSound('coins');
    updateUI();
}

function sellAll() {
    const total = (player.milk * 15) + (player.cheese * 45) + (player.eggs * 10) + (player.wheat * 12);
    if (total === 0) return alert('Sem produtos para vender!');
    player.coins += total;
    player.milk = 0; player.cheese = 0; player.eggs = 0; player.wheat = 0;
    playSound('coins');
    updateUI();
}

function update() {
    if (shopOpen) return;

    // Atualiza Relógio Dia/Noite
    timeOfDay = (timeOfDay + 1) % DAY_LENGTH;

    // Movimentação & Animação (Opção 3)
    let dx = 0, dy = 0;
    if (keys['w'] || keys['arrowup']) { dx -= player.speed; dy -= player.speed; }
    if (keys['s'] || keys['arrowdown']) { dx += player.speed; dy += player.speed; }
    if (keys['a'] || keys['arrowleft']) { dx -= player.speed; dy += player.speed; }
    if (keys['d'] || keys['arrowright']) { dx += player.speed; dy -= player.speed; }

    player.isMoving = (dx !== 0 || dy !== 0);
    if (player.isMoving) {
        player.x += dx;
        player.y += dy;
        player.animTimer += 0.2;
        if (Math.floor(player.animTimer) % 3 === 0) playSound('step');
    } else {
        player.animTimer = 0;
    }

    player.x = Math.max(0, Math.min(10, player.x));
    player.y = Math.max(0, Math.min(10, player.y));

    // Animais
    cows.forEach(c => {
        if (!c.hasMilk) {
            c.timer += c.fed ? 3 : 1;
            if (c.timer > 300) { c.hasMilk = true; c.timer = 0; c.fed = false; }
        }
    });

    chickens.forEach(ch => {
        if (!ch.hasEgg) {
            ch.timer += ch.fed ? 3 : 1;
            if (ch.timer > 200) { ch.hasEgg = true; ch.timer = 0; ch.fed = false; }
        }
    });

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

    // Interações
    const prompt = document.getElementById('action-prompt');
    prompt.innerText = '';

    if (Math.hypot(player.x - market.x, player.y - market.y) < 2) {
        prompt.innerText = '[E] Entrar na Loja da Vila';
    }

    cows.forEach(c => {
        if (Math.hypot(player.x - c.x, player.y - c.y) < 1.2) {
            if (c.hasMilk && player.milk < player.maxCap) {
                prompt.innerText = '[ESPAÇO] Ordenhar Vaca';
                if (keys[' ']) { player.milk++; c.hasMilk = false; playSound('cow'); playSound('collect'); keys[' '] = false; }
            } else if (!c.hasMilk && player.wheat > 0 && !c.fed) {
                prompt.innerText = '[ESPAÇO] Alimentar Trigo (Acelera 3x)';
                if (keys[' ']) { player.wheat--; c.fed = true; playSound('collect'); keys[' '] = false; }
            }
        }
    });

    chickens.forEach(ch => {
        if (Math.hypot(player.x - ch.x, player.y - ch.y) < 1.2) {
            if (ch.hasEgg && player.eggs < player.maxCap) {
                prompt.innerText = '[ESPAÇO] Coletar Ovo';
                if (keys[' ']) { player.eggs++; ch.hasEgg = false; playSound('collect'); keys[' '] = false; }
            }
        }
    });

    farmPlots.forEach(p => {
        if (Math.hypot(player.x - p.x, player.y - p.y) < 1.2) {
            if (p.state === 'empty' && player.seeds > 0) {
                prompt.innerText = '[ESPAÇO] Plantar Trigo';
                if (keys[' ']) { player.seeds--; p.state = 'growing'; playSound('collect'); keys[' '] = false; }
            } else if (p.state === 'ready' && player.wheat < player.maxCap) {
                prompt.innerText = '[ESPAÇO] Colher Trigo';
                if (keys[' ']) { player.wheat++; p.state = 'empty'; playSound('collect'); keys[' '] = false; }
            }
        }
    });

    if (Math.hypot(player.x - cheesePress.x, player.y - cheesePress.y) < 1.2) {
        if (cheesePress.status === 'vazia' && player.milk > 0) {
            prompt.innerText = '[ESPAÇO] Iniciar Prensa de Queijo';
            if (keys[' ']) { player.milk--; cheesePress.status = 'processando'; playSound('collect'); keys[' '] = false; }
        } else if (cheesePress.status === 'pronto' && player.cheese < player.maxCap) {
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
    document.getElementById('cheese').innerText = player.cheese;
    document.getElementById('eggs').innerText = player.eggs;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Desenhar Terreno
    for (let x = 0; x < 11; x++) {
        for (let y = 0; y < 11; y++) {
            let topColor = '#4ade80';
            let sideColor = '#166534';
            let accentColor = '#14532d';
            
            if (x >= 1 && x <= 4 && y >= 5 && y <= 9) { topColor = '#b45309'; sideColor = '#78350f'; accentColor = '#451a03'; }
            if (x >= 6 && x <= 10 && y >= 1 && y <= 5) { topColor = '#d97706'; sideColor = '#92400e'; accentColor = '#78350f'; }

            drawIsometricTile(ctx, x, y, sideColor, topColor, accentColor);
        }
    }

    const renderables = [];

    // Horta com Animações de Balanço do Trigo
    farmPlots.forEach(p => {
        renderables.push({
            y: p.x + p.y,
            draw: () => {
                const { isoX, isoY } = toIso(p.x, p.y);
                ctx.fillStyle = '#451a03';
                ctx.fillRect(isoX - 18, isoY + 2, 36, 18);
                if (p.state === 'growing') {
                    ctx.fillStyle = '#a3e635';
                    ctx.fillRect(isoX - 3, isoY - 2, 6, 10);
                } else if (p.state === 'ready') {
                    const sway = Math.sin(Date.now() * 0.005) * 3;
                    ctx.font = '22px sans-serif';
                    ctx.fillText('🌾', isoX - 11 + sway, isoY + 6);
                }
            }
        });
    });

    // Casa do Mercado Ilustrada (Arte Estilizada)
    renderables.push({
        y: market.x + market.y,
        draw: () => {
            const { isoX, isoY } = toIso(market.x, market.y);
            drawShadow(ctx, isoX, isoY + 5, 28, 14);
            
            // Paredes de Pedra
            ctx.fillStyle = '#64748b';
            ctx.fillRect(isoX - 30, isoY - 45, 60, 50);
            
            // Porta de Madeira
            ctx.fillStyle = '#78350f';
            ctx.fillRect(isoX - 10, isoY - 18, 20, 24);
            
            // Telhado
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
    });

    // Prensa de Queijo
    renderables.push({
        y: cheesePress.x + cheesePress.y,
        draw: () => {
            const { isoX, isoY } = toIso(cheesePress.x, cheesePress.y);
            drawShadow(ctx, isoX, isoY + 2, 16, 8);
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
    });

    // Vacas Animadas (Respiração e Mastigação)
    cows.forEach(c => {
        renderables.push({
            y: c.x + c.y,
            draw: () => {
                const { isoX, isoY } = toIso(c.x, c.y);
                drawShadow(ctx, isoX, isoY, 18, 9);

                const breath = Math.sin((Date.now() + c.animOffset) * 0.004) * 2;
                
                // Corpo da Vaca (Branco com Manchas)
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.ellipse(isoX, isoY - 12, 16, 12 + breath, 0, 0, Math.PI * 2);
                ctx.fill();

                // Manchas Pretas
                ctx.fillStyle = '#1e293b';
                ctx.beginPath();
                ctx.arc(isoX - 6, isoY - 14, 5, 0, Math.PI * 2);
                ctx.arc(isoX + 5, isoY - 10, 4, 0, Math.PI * 2);
                ctx.fill();

                // Cabeça
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.arc(isoX - 12, isoY - 18, 8, 0, Math.PI * 2);
                ctx.fill();

                if (c.hasMilk) {
                    ctx.font = '14px sans-serif';
                    ctx.fillText('🥛', isoX - 7, isoY - 30 + breath);
                }
            }
        });
    });

    // Galinhas Animadas
    chickens.forEach(ch => {
        renderables.push({
            y: ch.x + ch.y,
            draw: () => {
                const { isoX, isoY } = toIso(ch.x, ch.y);
                drawShadow(ctx, isoX, isoY, 10, 5);

                const peck = Math.abs(Math.sin((Date.now() + ch.animOffset) * 0.006)) * 3;

                ctx.fillStyle = '#f97316';
                ctx.beginPath();
                ctx.arc(isoX, isoY - 8 - peck, 9, 0, Math.PI * 2);
                ctx.fill();

                // Crista Vermelha
                ctx.fillStyle = '#ef4444';
                ctx.fillRect(isoX - 2, isoY - 19 - peck, 4, 4);

                if (ch.hasEgg) {
                    ctx.font = '12px sans-serif';
                    ctx.fillText('🥚', isoX - 6, isoY - 20);
                }
            }
        });
    });

    // Fazendeiro com Walk-Cycle (Opção 3: Passos Animados)
    renderables.push({
        y: player.x + player.y,
        draw: () => {
            const { isoX, isoY } = toIso(player.x, player.y);
            drawShadow(ctx, isoX, isoY, 14, 7);

            // Animação de Passos e Balanço
            const bounce = player.isMoving ? Math.abs(Math.sin(player.animTimer)) * 5 : 0;
            const legSwing = player.isMoving ? Math.sin(player.animTimer) * 6 : 0;

            // Pernas
            ctx.fillStyle = '#1e3a8a';
            ctx.fillRect(isoX - 6 + legSwing, isoY - 10, 4, 10);
            ctx.fillRect(isoX + 2 - legSwing, isoY - 10, 4, 10);

            // Corpo
            ctx.fillStyle = '#0284c7';
            ctx.fillRect(isoX - 8, isoY - 24 - bounce, 16, 16);

            // Cabeça
            ctx.fillStyle = '#fde047'; // Chapéu de Palha
            ctx.fillRect(isoX - 12, isoY - 32 - bounce, 24, 6);
            ctx.fillStyle = '#fed7aa'; // Rosto
            ctx.fillRect(isoX - 6, isoY - 28 - bounce, 12, 6);
        }
    });

    // Ordenação e Renderização
    renderables.sort((a, b) => a.y - b.y);
    renderables.forEach(r => r.draw());

    // 2. Sobreposição do Ciclo Dia e Noite / Iluminação (Opção 2)
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