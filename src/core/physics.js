// Gestão do Grid do Mapa, Obstáculos, Pastagens e Sistema de Colisão Física Global

const mapGrid = Array.from({ length: MAP_SIZE }, () => Array(MAP_SIZE).fill(null));
let mapObstacles = [];
let pasturePlots = [];
let cornPlots = [];

// Função universal de colisão para qualquer entidade contra o mundo/estruturas
function checkWorldCollision(x, y, radius = 0.35) {
    if (x < 0.5 || x > MAP_SIZE - 0.5 || y < 0.5 || y > MAP_SIZE - 0.5) {
        return true;
    }

    const tileX = Math.floor(x);
    const tileY = Math.floor(y);
    if (tileX >= 0 && tileX < MAP_SIZE && tileY >= 0 && tileY < MAP_SIZE) {
        if (mapGrid[tileX][tileY] !== null && mapGrid[tileX][tileY].isSolid) {
            return true;
        }
    }

    for (const obs of mapObstacles) {
        const dist = Math.hypot(obs.x - x, obs.y - y);
        if (dist < radius + (obs.radius || 0.4)) {
            return true;
        }
    }

    return false;
}

// Função de colisão entre entidades
function checkEntityCollision(x, y, radius, entities, excludeEntity = null) {
    for (const ent of entities) {
        if (ent === excludeEntity) continue;
        const dist = Math.hypot(ent.x - x, ent.y - y);
        if (dist < radius) {
            return true;
        }
    }
    return false;
}

// Função para desenhar obstáculos de teste no mapa
function drawMapObstacles(ctx) {
    for (const obs of mapObstacles) {
        const { isoX, isoY } = toIso(obs.x, obs.y);
        drawShadow(ctx, isoX, isoY, 16, 8);
        
        ctx.fillStyle = '#64748B';
        ctx.beginPath();
        ctx.ellipse(isoX, isoY - 8, 14, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1.5;
        ctx.stroke();
    }
}