const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const player = {
    x: 5, y: 5, speed: 0.08,
    coins: 20, maxCap: 5,
    seeds: 2, wheat: 0, milk: 0, cheese: 0, eggs: 0
};
const keys = {};

const market = { x: 1, y: 1, width: 2, height: 2 };
const cheesePress = { x: 4, y: 2, status: 'vazia', timer: 0 };

const cows = [{ x: 2, y: 7, hasMilk: true, timer: 0, fed: false }];
const chickens = [{ x: 8, y: 3, hasEgg: true, timer: 0, fed: false }];

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
        cows.push({ x: 1 + Math.random()*3, y: 6 + Math.random()*3, hasMilk: false, timer: 0, fed: false });
        player.coins -= cost;
    } else if (type === 'chicken') {
        chickens.push({ x: 7 + Math.random()*3, y: 1 + Math.random()*3, hasEgg: false, timer: 0, fed: false });
        player.coins -= cost;
    }
    updateUI();
}

function sellAll() {
    const total = (player.milk * 15) + (player.cheese * 45) + (player.eggs * 10) + (player.wheat * 12);
    if (total === 0) return alert('Sem produtos para vender!');
    player.coins += total;
    player.milk = 0; player.cheese = 0; player.eggs = 0; player.wheat = 0;
    updateUI();
}

function update() {
    if (shopOpen) return;

    if (keys['w'] || keys['arrowup']) { player.x -= player.speed; player.y -= player.speed; }
    if (keys['s'] || keys['arrowdown']) { player.x += player.speed; player.y += player.speed; }
    if (keys['a'] || keys['arrowleft']) { player.x -= player.speed; player.y += player.speed; }
    if (keys['d'] || keys['arrowright']) { player.x += player.speed; player.y -= player.speed; }

    player.x = Math.max(0, Math.min(10, player.x));
    player.y = Math.max(0, Math.min(10, player.y));

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

    const prompt = document.getElementById('action-prompt');
    prompt.innerText = '';

    if (Math.hypot(player.x - market.x, player.y - market.y) < 2) {
        prompt.innerText = '[E] Entrar na Loja da Vila';
    }

    cows.forEach(c => {
        if (Math.hypot(player.x - c.x, player.y - c.y) < 1.2) {
            if (c.hasMilk && player.milk < player.maxCap) {
                prompt.innerText = '[ESPAÇO] Ordenhar Vaca';
                if (keys[' ']) { player.milk++; c.hasMilk = false; keys[' '] = false; }
            } else if (!c.hasMilk && player.wheat > 0 && !c.fed) {
                prompt.innerText = '[ESPAÇO] Alimentar Trigo (Acelera 3x)';
                if (keys[' ']) { player.wheat--; c.fed = true; keys[' '] = false; }
            }
        }
    });

    chickens.forEach(ch => {
        if (Math.hypot(player.x - ch.x, player.y - ch.y) < 1.2) {
            if (ch.hasEgg && player.eggs < player.maxCap) {
                prompt.innerText = '[ESPAÇO] Coletar Ovo';
                if (keys[' ']) { player.eggs++; ch.hasEgg = false; keys[' '] = false; }
            }
        }
    });

    farmPlots.forEach(p => {
        if (Math.hypot(player.x - p.x, player.y - p.y) < 1.2) {
            if (p.state === 'empty' && player.seeds > 0) {
                prompt.innerText = '[ESPAÇO] Plantar Trigo';
                if (keys[' ']) { player.seeds--; p.state = 'growing'; keys[' '] = false; }
            } else if (p.state === 'ready' && player.wheat < player.maxCap) {
                prompt.innerText = '[ESPAÇO] Colher Trigo';
                if (keys[' ']) { player.wheat++; p.state = 'empty'; keys[' '] = false; }
            }
        }
    });

    if (Math.hypot(player.x - cheesePress.x, player.y - cheesePress.y) < 1.2) {
        if (cheesePress.status === 'vazia' && player.milk > 0) {
            prompt.innerText = '[ESPAÇO] Iniciar Prensa de Queijo';
            if (keys[' ']) { player.milk--; cheesePress.status = 'processando'; keys[' '] = false; }
        } else if (cheesePress.status === 'pronto' && player.cheese < player.maxCap) {
            prompt.innerText = '[ESPAÇO] Coletar Queijo';
            if (keys[' ']) { player.cheese++; cheesePress.status = 'vazia'; keys[' '] = false; }
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

    for (let x = 0; x < 11; x++) {
        for (let y = 0; y < 11; y++) {
            let topColor = '#4ade80';
            let sideColor = '#166534';
            
            if (x >= 1 && x <= 4 && y >= 5 && y <= 9) { topColor = '#b45309'; sideColor = '#78350f'; }
            if (x >= 6 && x <= 10 && y >= 1 && y <= 5) { topColor = '#d97706'; sideColor = '#92400e'; }

            drawIsometricTile(ctx, x, y, sideColor, topColor);
        }
    }

    const renderables = [];

    farmPlots.forEach(p => {
        renderables.push({
            y: p.x + p.y,
            draw: () => {
                const { isoX, isoY } = toIso(p.x, p.y);
                ctx.fillStyle = '#78350f';
                ctx.fillRect(isoX - 16, isoY + 4, 32, 16);
                if (p.state === 'growing') {
                    ctx.fillStyle = '#84cc16';
                    ctx.fillRect(isoX - 4, isoY, 8, 8);
                } else if (p.state === 'ready') {
                    ctx.font = '18px sans-serif';
                    ctx.fillText('🌾', isoX - 10, isoY + 8);
                }
            }
        });
    });

    renderables.push({
        y: market.x + market.y,
        draw: () => {
            const { isoX, isoY } = toIso(market.x, market.y);
            ctx.fillStyle = '#475569';
            ctx.fillRect(isoX - 25, isoY - 35, 50, 40);
            ctx.fillStyle = '#dc2626';
            ctx.beginPath();
            ctx.moveTo(isoX - 30, isoY - 35);
            ctx.lineTo(isoX, isoY - 60);
            ctx.lineTo(isoX + 30, isoY - 35);
            ctx.fill();
            ctx.fillStyle = '#fef08a';
            ctx.font = 'bold 11px sans-serif';
            ctx.fillText('LOJA', isoX - 14, isoY - 15);
        }
    });

    renderables.push({
        y: cheesePress.x + cheesePress.y,
        draw: () => {
            const { isoX, isoY } = toIso(cheesePress.x, cheesePress.y);
            ctx.fillStyle = '#78350f';
            ctx.fillRect(isoX - 15, isoY - 20, 30, 25);
            ctx.fillStyle = '#fbbf24';
            ctx.fillText(cheesePress.status === 'pronto' ? '🧀' : '⚙️', isoX - 7, isoY - 5);
        }
    });

    cows.forEach(c => {
        renderables.push({
            y: c.x + c.y,
            draw: () => {
                const { isoX, isoY } = toIso(c.x, c.y);
                ctx.fillStyle = '#f8fafc';
                ctx.beginPath(); ctx.arc(isoX, isoY - 8, 14, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = '#0f172a';
                ctx.beginPath(); ctx.arc(isoX - 4, isoY - 10, 4, 0, Math.PI * 2); ctx.fill();
                if (c.hasMilk) { ctx.font = '14px sans-serif'; ctx.fillText('🥛', isoX - 7, isoY - 24); }
            }
        });
    });

    chickens.forEach(ch => {
        renderables.push({
            y: ch.x + ch.y,
            draw: () => {
                const { isoX, isoY } = toIso(ch.x, ch.y);
                ctx.fillStyle = '#f97316';
                ctx.beginPath(); ctx.arc(isoX, isoY - 4, 8, 0, Math.PI * 2); ctx.fill();
                if (ch.hasEgg) { ctx.font = '12px sans-serif'; ctx.fillText('🥚', isoX - 6, isoY - 16); }
            }
        });
    });

    renderables.push({
        y: player.x + player.y,
        draw: () => {
            const { isoX, isoY } = toIso(player.x, player.y);
            ctx.fillStyle = 'rgba(0,0,0,0.3)';
            ctx.beginPath(); ctx.ellipse(isoX, isoY + 2, 12, 6, 0, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#0284c7'; ctx.fillRect(isoX - 8, isoY - 22, 16, 20);
            ctx.fillStyle = '#fde047'; ctx.fillRect(isoX - 10, isoY - 30, 20, 8);
        }
    });

    renderables.sort((a, b) => a.y - b.y);
    renderables.forEach(r => r.draw());
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();