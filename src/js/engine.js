// Motor Isométrico e Utilitários de Projeção
const TILE_WIDTH = 64;
const TILE_HEIGHT = 32;
const ORIGIN_X = 450; // Centralizado para canvas de 900px
const ORIGIN_Y = 120;

function toIso(x, y) {
    return {
        isoX: ORIGIN_X + (x - y) * (TILE_WIDTH / 2),
        isoY: ORIGIN_Y + (x + y) * (TILE_HEIGHT / 2)
    };
}

function drawIsometricTile(ctx, gx, gy, color, topColor) {
    const { isoX, isoY } = toIso(gx, gy);
    
    // Lateral do Bloco
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(isoX, isoY);
    ctx.lineTo(isoX + TILE_WIDTH/2, isoY + TILE_HEIGHT/2);
    ctx.lineTo(isoX + TILE_WIDTH/2, isoY + TILE_HEIGHT/2 + 12);
    ctx.lineTo(isoX, isoY + TILE_HEIGHT + 12);
    ctx.fill();

    // Topo do Bloco
    ctx.fillStyle = topColor;
    ctx.beginPath();
    ctx.moveTo(isoX, isoY);
    ctx.lineTo(isoX + TILE_WIDTH/2, isoY + TILE_HEIGHT/2);
    ctx.lineTo(isoX, isoY + TILE_HEIGHT);
    ctx.lineTo(isoX - TILE_WIDTH/2, isoY + TILE_HEIGHT/2);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.15)';
    ctx.stroke();
}