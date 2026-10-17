// Estado, Inventário e Movimentação do Jogador

const player = {
    x: 8, y: 8,
    vx: 0, vy: 0,
    maxSpeed: 0.018,
    accel: 0.0035,
    friction: 0.78,
    isMoving: false, 
    animTimer: 0,
    coins: 30, maxCap: 5,
    seeds: 4, wheat: 0, milk: 0, wool: 0, cheese: 0, eggs: 0,
    isRiding: false,
    mountHorse: null
};

const keys = {};

window.addEventListener('keydown', e => {
    const k = e.key.toLowerCase();
    keys[k] = true;
    if (k === 'e' || k === 'escape') {
        if (shopOpen) closeShop();
        else if (Math.hypot(player.x - market.x, player.y - market.y) < 2) openShop();
    }
});

window.addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);