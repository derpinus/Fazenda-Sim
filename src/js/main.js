// Núcleo do Jogo, Inicialização, Atualização Lógica e Game Loop

// Mercado e Prensa começam nulos/inativos até serem colocados pelo Sandbox ou construídos
const market = { x: -99, y: -99 };
const cheesePress = { x: -99, y: -99, status: 'vazia', timer: 0 };

const animals = [];    // Começa sem animais no mapa
const farmPlots = [];  // Começa sem canteiros de plantação

function update() {
    if (typeof shopOpen !== 'undefined' && shopOpen) return;

    timeOfDay = (timeOfDay + 1) % DAY_LENGTH;

    // --- MOVIMENTO E COLISÃO DO JOGADOR ---
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

    const nextX = player.x + player.vx;
    if (!checkWorldCollision(nextX, player.y, 0.35) && !checkEntityCollision(nextX, player.y, 0.5, animals)) {
        player.x = nextX;
    } else { player.vx = 0; }

    const nextY = player.y + player.vy;
    if (!checkWorldCollision(player.x, nextY, 0.35) && !checkEntityCollision(player.x, nextY, 0.5, animals)) {
        player.y = nextY;
    } else { player.vy = 0; }

    // --- CÂMARA DINÂMICA ANCORADA ---
    const targetIsoX = (player.x - player.y) * (TILE_WIDTH / 2);
    const targetIsoY = (player.x + player.y) * (TILE_HEIGHT / 2);

    ORIGIN_X += ((canvas.width / 2) - targetIsoX - ORIGIN_X) * 0.1;
    ORIGIN_Y += ((canvas.height * 0.55) - targetIsoY - ORIGIN_Y) * 0.1;

    player.isMoving = currentSpeed > 0.0015;
    if (player.isMoving) {
        player.animTimer += 0.05;
        if (Math.floor(player.animTimer * 10) % 25 === 0 && typeof playSound === 'function') playSound('step');
    } else { player.animTimer = 0; }

    // Atualizar animais
    animals.forEach(a => a.update(animals, player));

    // Atualizar canteiros de cultivo de trigo
    farmPlots.forEach(p => {
        if (p.state === 'growing') {
            p.timer++;
            if (p.timer > 2000) { p.state = 'ready'; p.timer = 0; }
        }
    });

    // Atualizar canteiros de milho
    if (typeof cornPlots !== 'undefined') {
        cornPlots.forEach(c => {
            if (c.state === 'growing') {
                c.timer++;
                if (c.timer > 2000) { c.state = 'ready'; c.timer = 0; }
            }
        });
    }

    if (cheesePress.status === 'processando') {
        cheesePress.timer++;
        if (cheesePress.timer > 150) { cheesePress.status = 'pronto'; cheesePress.timer = 0; }
    }

    const prompt = document.getElementById('action-prompt');
    if (prompt) prompt.innerText = '';

    // Só interage com o mercado se ele estiver posicionado no mapa
    if (market.x >= 0 && Math.hypot(player.x - market.x, player.y - market.y) < 2) {
        if (prompt) prompt.innerText = '[E] Entrar na Loja da Vila';
    }

    animals.forEach(a => {
        if (Math.hypot(player.x - a.x, player.y - a.y) < 1.3) {
            if (a.type === 'horse') {
                if (!player.isRiding) {
                    if (prompt) prompt.innerText = '[ESPAÇO] Montar no Cavalo';
                    if (keys[' ']) {
                        player.isRiding = true;
                        player.maxSpeed = 0.035;
                        const index = animals.indexOf(a);
                        if (index > -1) animals.splice(index, 1);
                        player.mountHorse = a; 
                        if (typeof playSound === 'function') { playSound('animal'); }
                        keys[' '] = false;
                    }
                }
            } else if (a.hasProduct && player.maxCap > (player.milk + player.wool + player.eggs + player.wheat)) {
                if (a.type === 'cow') {
                    if (prompt) prompt.innerText = '[ESPAÇO] Ordenhar Vaca';
                    if (keys[' ']) { player.milk++; a.hasProduct = false; if (typeof playSound === 'function') { playSound('animal'); playSound('collect'); } keys[' '] = false; }
                } else if (a.type === 'sheep') {
                    if (prompt) prompt.innerText = '[ESPAÇO] Tosquia de Lã';
                    if (keys[' ']) { player.wool++; a.hasProduct = false; if (typeof playSound === 'function') { playSound('animal'); playSound('collect'); } keys[' '] = false; }
                } else if (a.type === 'chicken') {
                    if (prompt) prompt.innerText = '[ESPAÇO] Coletar Ovo';
                    if (keys[' ']) { player.eggs++; a.hasProduct = false; if (typeof playSound === 'function') playSound('collect'); keys[' '] = false; }
                }
            } else if (!a.hasProduct && player.wheat > 0 && !a.fed && a.type !== 'horse') {
                if (prompt) prompt.innerText = '[ESPAÇO] Alimentar Trigo (Acelera 3x)';
                if (keys[' ']) { player.wheat--; a.fed = true; if (typeof playSound === 'function') playSound('collect'); keys[' '] = false; }
            }
        }
    });

    // Atualizar crescimento do capim e colheita
    pasturePlots.forEach(p => {
        if (p.state === 'empty' || p.state === 'growing') {
            p.timer++;
            if (p.timer > 2000) {
                p.state = p.state === 'empty' ? 'growing' : 'ready';
                p.timer = 0;
            }
        }
        if (Math.hypot(player.x - p.x, player.y - p.y) < 1.2) {
            if (p.state === 'ready') {
                if (prompt) prompt.innerText = '[ESPAÇO] Colher Capim (Fardo de Feno)';
                if (keys[' ']) {
                    player.wheat++;
                    p.state = 'empty';
                    p.timer = 0;
                    if (typeof playSound === 'function') playSound('collect');
                    keys[' '] = false;
                }
            }
        }
    });

    if (player.isRiding && keys[' ']) {
        player.isRiding = false;
        player.maxSpeed = 0.018;
        player.mountHorse.x = player.x;
        player.mountHorse.y = player.y;
        player.mountHorse.targetX = player.x;
        player.mountHorse.targetY = player.y;
        animals.push(player.mountHorse);
        player.mountHorse = null;
        if (typeof playSound === 'function') playSound('animal');
        keys[' '] = false;
    }

    farmPlots.forEach(p => {
        if (Math.hypot(player.x - p.x, player.y - p.y) < 1.2) {
            if (p.state === 'empty' && player.seeds > 0) {
                if (prompt) prompt.innerText = '[ESPAÇO] Plantar Trigo';
                if (keys[' ']) { player.seeds--; p.state = 'growing'; if (typeof playSound === 'function') playSound('collect'); keys[' '] = false; }
            } else if (p.state === 'ready' && player.maxCap > (player.milk + player.wool + player.eggs + player.wheat)) {
                if (prompt) prompt.innerText = '[ESPAÇO] Colher Trigo';
                if (keys[' ']) { player.wheat++; p.state = 'empty'; if (typeof playSound === 'function') playSound('collect'); keys[' '] = false; }
            }
        }
    });

    if (cheesePress.status !== 'vazia' && Math.hypot(player.x - cheesePress.x, player.y - cheesePress.y) < 1.2) {
        if (cheesePress.status === 'vazia' && player.milk > 0) {
            if (prompt) prompt.innerText = '[ESPAÇO] Iniciar Prensa de Queijo';
            if (keys[' ']) { player.milk--; cheesePress.status = 'processando'; if (typeof playSound === 'function') playSound('collect'); keys[' '] = false; }
        } else if (cheesePress.status === 'pronto' && player.maxCap > (player.milk + player.wool + player.eggs + player.wheat + player.cheese)) {
            if (prompt) prompt.innerText = '[ESPAÇO] Coletar Queijo';
            if (keys[' ']) { player.cheese++; cheesePress.status = 'vazia'; if (typeof playSound === 'function') playSound('collect'); keys[' '] = false; }
        }
    }

    if (typeof updateUI === 'function') updateUI();
}

// Evento de clique no Canvas para Sandbox / Posicionamento (Delega para o sandbox.js)
canvas.addEventListener('click', e => {
    if (typeof currentSandboxTool === 'undefined' || !currentSandboxTool) return;

    const rect = canvas.getBoundingClientRect();
    const mouseScreenX = e.clientX - rect.left;
    const mouseScreenY = e.clientY - rect.top;

    const shiftedX = mouseScreenX - ORIGIN_X;
    const shiftedY = mouseScreenY - ORIGIN_Y;

    const isoW = TILE_WIDTH / 2;
    const isoH = TILE_HEIGHT / 2;

    const worldY = (shiftedY / isoH - shiftedX / isoW) / 2;
    const worldX = (shiftedY / isoH + shiftedX / isoW) / 2;

    if (worldX >= 0 && worldX < MAP_SIZE && worldY >= 0 && worldY < MAP_SIZE) {
        if (currentSandboxTool === 'remove') {
            if (typeof removeObjectAt === 'function') removeObjectAt(worldX, worldY, animals, farmPlots);
        } else {
            if (typeof spawnEntityOrStructure === 'function') {
                spawnEntityOrStructure(currentSandboxTool, worldX, worldY, animals, farmPlots);
            }
        }
    }
});

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();