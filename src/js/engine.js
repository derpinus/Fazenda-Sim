// Motor Isométrico e Utilitários de Projeção
const TILE_WIDTH = 64;
const TILE_HEIGHT = 32;
const MAP_SIZE = 16;       // Grelha expandida para 16x16
const ORIGIN_X = 550;      // Centralizado horizontalmente para canvas de 1100px
const ORIGIN_Y = 80;       // Ajustado verticalmente para o topo

function toIso(x, y) {
    return {
        isoX: ORIGIN_X + (x - y) * (TILE_WIDTH / 2),
        isoY: ORIGIN_Y + (x + y) * (TILE_HEIGHT / 2)
    };
}

function drawIsometricTile(ctx, gx, gy, color, topColor, accentColor) {
    const { isoX, isoY } = toIso(gx, gy);
    
    // Lateral Esquerda
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

    // Topo
    ctx.fillStyle = topColor;
    ctx.beginPath();
    ctx.moveTo(isoX, isoY);
    ctx.lineTo(isoX + TILE_WIDTH/2, isoY + TILE_HEIGHT/2);
    ctx.lineTo(isoX, isoY + TILE_HEIGHT);
    ctx.lineTo(isoX - TILE_WIDTH/2, isoY + TILE_HEIGHT/2);
    ctx.closePath();
    ctx.fill();
    
    ctx.strokeStyle = 'rgba(0,0,0,0.12)';
    ctx.lineWidth = 1;
    ctx.stroke();
}

function drawShadow(ctx, isoX, isoY, radiusX = 14, radiusY = 7) {
    ctx.fillStyle = 'rgba(15, 23, 42, 0.35)';
    ctx.beginPath();
    ctx.ellipse(isoX, isoY + 2, radiusX, radiusY, 0, 0, Math.PI * 2);
    ctx.fill();
}