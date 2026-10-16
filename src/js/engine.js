// Motor de Projeção Volumétrica (Perspetiva Estilo 3 Pontos / Axonométrica)
const TILE_WIDTH = 64;
const TILE_HEIGHT = 32;
const MAP_SIZE = 24;       

let ORIGIN_X = 800;      
let ORIGIN_Y = 220;      

const Sprites = {};

function loadSprite(key, path) {
    const img = new Image();
    img.src = path;
    Sprites[key] = img;
}

// Carregamento de Sprites com Fallback Automático
loadSprite('farmer', 'assets/game/farmer.png');
loadSprite('cow', 'assets/game/cow.png');
loadSprite('sheep', 'assets/game/sheep.png');
loadSprite('chicken', 'assets/game/chicken.png');
loadSprite('horse', 'assets/game/horse.png');
loadSprite('market', 'assets/game/market.png');
loadSprite('cheesePress', 'assets/game/cheese_press.png');
loadSprite('barn', 'assets/game/barn.png');

// Projeção refinada para dar volume tridimensional (Eixos X, Y e altura Z simulada)
function toIso(x, y) {
    return {
        isoX: ORIGIN_X + (x - y) * (TILE_WIDTH / 2),
        isoY: ORIGIN_Y + (x + y) * (TILE_HEIGHT / 2)
    };
}

function drawIsometricTile(ctx, gx, gy, color, topColor, accentColor) {
    const { isoX, isoY } = toIso(gx, gy);
    
    // Altura de extrusão maior (16px) para dar o efeito volumétrico de bloco 3D sólido
    const blockHeight = 16; 

    // Lateral Esquerda (face com sombra profunda)
    ctx.fillStyle = accentColor || '#11381c';
    ctx.beginPath();
    ctx.moveTo(isoX - TILE_WIDTH/2, isoY + TILE_HEIGHT/2);
    ctx.lineTo(isoX, isoY + TILE_HEIGHT);
    ctx.lineTo(isoX, isoY + TILE_HEIGHT + blockHeight);
    ctx.lineTo(isoX - TILE_WIDTH/2, isoY + TILE_HEIGHT/2 + blockHeight);
    ctx.fill();

    // Lateral Direita (face iluminada secundária)
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(isoX, isoY + TILE_HEIGHT);
    ctx.lineTo(isoX + TILE_WIDTH/2, isoY + TILE_HEIGHT/2);
    ctx.lineTo(isoX + TILE_WIDTH/2, isoY + TILE_HEIGHT/2 + blockHeight);
    ctx.lineTo(isoX, isoY + TILE_HEIGHT + blockHeight);
    ctx.fill();

    // Topo (Superfície principal)
    ctx.fillStyle = topColor;
    ctx.beginPath();
    ctx.moveTo(isoX, isoY);
    ctx.lineTo(isoX + TILE_WIDTH/2, isoY + TILE_HEIGHT/2);
    ctx.lineTo(isoX, isoY + TILE_HEIGHT);
    ctx.lineTo(isoX - TILE_WIDTH/2, isoY + TILE_HEIGHT/2);
    ctx.closePath();
    ctx.fill();
    
    // Contorno subtil para destacar a volumetria dos blocos
    ctx.strokeStyle = 'rgba(0,0,0,0.15)';
    ctx.lineWidth = 1;
    ctx.stroke();
}

function drawShadow(ctx, isoX, isoY, radiusX = 14, radiusY = 7) {
    ctx.fillStyle = 'rgba(15, 23, 42, 0.35)';
    ctx.beginPath();
    ctx.ellipse(isoX, isoY + 2, radiusX, radiusY, 0, 0, Math.PI * 2);
    ctx.fill();
}