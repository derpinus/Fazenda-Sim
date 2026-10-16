// Motor Isométrico e Desenho Vetorial Detalhado
const TILE_WIDTH = 64;
const TILE_HEIGHT = 32;
const ORIGIN_X = 450;
const ORIGIN_Y = 120;

function toIso(x, y) {
    return {
        isoX: ORIGIN_X + (x - y) * (TILE_WIDTH / 2),
        isoY: ORIGIN_Y + (x + y) * (TILE_HEIGHT / 2)
    };
}

// Desenho dos blocos de terreno com relevo 3D e texturas
function drawIsometricTile(ctx, gx, gy, color, topColor, accentColor) {
    const { isoX, isoY } = toIso(gx, gy);
    
    // Sombra/Lateral Esquerda
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(isoX - TILE_WIDTH/2, isoY + TILE_HEIGHT/2);
    ctx.lineTo(isoX, isoY + TILE_HEIGHT);
    ctx.lineTo(isoX, isoY + TILE_HEIGHT + 14);
    ctx.lineTo(isoX - TILE_WIDTH/2, isoY + TILE_HEIGHT/2 + 14);
    ctx.fill();

    // Lateral Direita
    ctx.fillStyle = accentColor || color;
    ctx.beginPath();
    ctx.moveTo(isoX, isoY + TILE_HEIGHT);
    ctx.lineTo(isoX + TILE_WIDTH/2, isoY + TILE_HEIGHT/2);
    ctx.lineTo(isoX + TILE_WIDTH/2, isoY + TILE_HEIGHT/2 + 14);
    ctx.lineTo(isoX, isoY + TILE_HEIGHT + 14);
    ctx.fill();

    // Topo (Superfície da Terra/Grama)
    ctx.fillStyle = topColor;
    ctx.beginPath();
    ctx.moveTo(isoX, isoY);
    ctx.lineTo(isoX + TILE_WIDTH/2, isoY + TILE_HEIGHT/2);
    ctx.lineTo(isoX, isoY + TILE_HEIGHT);
    ctx.lineTo(isoX - TILE_WIDTH/2, isoY + TILE_HEIGHT/2);
    ctx.closePath();
    ctx.fill();
    
    // Borda sutil de isolamento de tile
    ctx.strokeStyle = 'rgba(0,0,0,0.12)';
    ctx.lineWidth = 1;
    ctx.stroke();
}

// Desenho da Sombra dos Personagens/Objetos
function drawShadow(ctx, isoX, isoY, radiusX = 14, radiusY = 7) {
    ctx.fillStyle = 'rgba(15, 23, 42, 0.35)';
    ctx.beginPath();
    ctx.ellipse(isoX, isoY + 2, radiusX, radiusY, 0, 0, Math.PI * 2);
    ctx.fill();
}