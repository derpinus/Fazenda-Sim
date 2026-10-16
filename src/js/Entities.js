// Gestão de Animais, Currais e IA com Suporte a Sprites e Fallback

class Animal {
    constructor(type, x, y, penBounds) {
        this.type = type; // 'cow', 'sheep', 'chicken', 'horse'
        this.x = x;
        this.y = y;
        this.targetX = x;
        this.targetY = y;
        this.speed = 0.005;
        this.hasProduct = true;
        this.timer = 0;
        this.fed = false;
        this.pen = penBounds;
        this.animOffset = Math.random() * 100;
    }

    update() {
        const dist = Math.hypot(this.targetX - this.x, this.targetY - this.y);
        if (dist < 0.08) {
            if (Math.random() < 0.015) {
                this.targetX = this.pen.minX + Math.random() * (this.pen.maxX - this.pen.minX);
                this.targetY = this.pen.minY + Math.random() * (this.pen.maxY - this.pen.minY);
            }
        } else {
            this.x += (this.targetX - this.x) * this.speed;
            this.y += (this.targetY - this.y) * this.speed;
        }

        if (!this.hasProduct) {
            this.timer += this.fed ? 3 : 1;
            let limit = this.type === 'chicken' ? 180 : (this.type === 'sheep' ? 240 : 300);
            if (this.timer > limit) {
                this.hasProduct = true;
                this.timer = 0;
                this.fed = false;
            }
        }
    }

    draw(ctx) {
        const { isoX, isoY } = toIso(this.x, this.y);
        drawShadow(ctx, isoX, isoY, this.type === 'horse' ? 20 : 14, 8);

        const sprite = Sprites[this.type];
        // Verifica se o sprite de imagem foi carregado com sucesso na pasta assets/game/
        if (sprite && sprite.complete && sprite.naturalWidth > 0) {
            ctx.drawImage(sprite, isoX - 24, isoY - 40, 48, 48);
            // Indicador de Produto Pronto
            if (this.hasProduct) {
                ctx.font = '14px sans-serif';
                let icon = this.type === 'cow' ? '🥛' : (this.type === 'sheep' ? '🧶' : (this.type === 'chicken' ? '🥚' : '✨'));
                ctx.fillText(icon, isoX - 6, isoY - 45);
            }
        } else {
            // FALLBACK: Desenho Vetorial Original caso a imagem não exista
            if (this.type === 'cow') {
                const breath = Math.sin((Date.now() + this.animOffset) * 0.004) * 2;
                ctx.fillStyle = '#ffffff';
                ctx.beginPath(); ctx.ellipse(isoX, isoY - 12, 16, 12 + breath, 0, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = '#1e293b';
                ctx.beginPath(); ctx.arc(isoX - 6, isoY - 14, 5, 0, Math.PI * 2); ctx.arc(isoX + 5, isoY - 10, 4, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = '#ffffff';
                ctx.beginPath(); ctx.arc(isoX - 12, isoY - 18, 8, 0, Math.PI * 2); ctx.fill();
                if (this.hasProduct) { ctx.font = '14px sans-serif'; ctx.fillText('🥛', isoX - 7, isoY - 30 + breath); }

            } else if (this.type === 'sheep') {
                const puff = Math.sin((Date.now() + this.animOffset) * 0.005) * 1.5;
                ctx.fillStyle = '#f1f5f9';
                ctx.beginPath(); ctx.arc(isoX, isoY - 12, 13 + puff, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = '#334155';
                ctx.beginPath(); ctx.arc(isoX - 10, isoY - 14, 6, 0, Math.PI * 2); ctx.fill();
                if (this.hasProduct) { ctx.font = '14px sans-serif'; ctx.fillText('🧶', isoX - 7, isoY - 26); }

            } else if (this.type === 'chicken') {
                const peck = Math.abs(Math.sin((Date.now() + this.animOffset) * 0.007)) * 3;
                ctx.fillStyle = '#f97316';
                ctx.beginPath(); ctx.arc(isoX, isoY - 8 - peck, 9, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = '#ef4444';
                ctx.fillRect(isoX - 2, isoY - 19 - peck, 4, 4);
                if (this.hasProduct) { ctx.font = '12px sans-serif'; ctx.fillText('🥚', isoX - 6, isoY - 20); }

            } else if (this.type === 'horse') {
                const bob = Math.sin((Date.now() + this.animOffset) * 0.006) * 2;
                ctx.fillStyle = '#9a3412';
                ctx.beginPath(); ctx.ellipse(isoX, isoY - 14, 18, 11, 0, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = '#78350f';
                ctx.beginPath(); ctx.ellipse(isoX - 12, isoY - 22 + bob, 7, 10, -0.3, 0, Math.PI * 2); ctx.fill();
                ctx.font = '14px sans-serif'; ctx.fillText('🐎', isoX - 8, isoY - 32);
            }
        }
    }
}

const cowPen = { minX: 1, maxX: 5, minY: 10, maxY: 14 };
const sheepPen = { minX: 10, maxX: 14, minY: 10, maxY: 14 };
const chickenPen = { minX: 10, maxX: 14, minY: 2, maxY: 6 };
const horsePen = { minX: 1, maxX: 5, minY: 2, maxY: 6 };

function drawPenFences(ctx) {
    const pens = [cowPen, sheepPen, chickenPen, horsePen];

    pens.forEach(pen => {
        // 1. Contornar o curral com ripas orientadas corretamente para cada eixo isométrico
        // Parede Superior-Esquerda (Eixo X)
        for (let x = pen.minX; x < pen.maxX; x++) {
            const { isoX, isoY } = toIso(x, pen.minY);
            drawFenceSegment(ctx, isoX, isoY, 'x');
        }
        // Parede Inferior-Esquerda (Eixo Y)
        for (let y = pen.minY; y < pen.maxY; y++) {
            const { isoX, isoY } = toIso(pen.minX, y);
            drawFenceSegment(ctx, isoX, isoY, 'y');
        }
        // Parede Superior-Direita (Eixo X)
        for (let x = pen.minX; x < pen.maxX; x++) {
            const { isoX, isoY } = toIso(x, pen.maxY);
            drawFenceSegment(ctx, isoX, isoY, 'x');
        }
        // Parede Inferior-Direita (Eixo Y)
        for (let y = pen.minY; y < pen.maxY; y++) {
            const { isoX, isoY } = toIso(pen.maxX, y);
            drawFenceSegment(ctx, isoX, isoY, 'y');
        }

        // 2. Desenhar os postes verticais robustos nos cantos e ao longo do perímetro
        for (let x = pen.minX; x <= pen.maxX; x++) {
            for (let y = pen.minY; y <= pen.maxY; y++) {
                const isBorder = (x === pen.minX || x === pen.maxX || y === pen.minY || y === pen.maxY);
                const isCorner = (x === pen.minX && y === pen.minY) || 
                                 (x === pen.maxX && y === pen.minY) || 
                                 (x === pen.minX && y === pen.maxY) || 
                                 (x === pen.maxX && y === pen.maxY);
                
                if (isBorder && (isCorner || (x - pen.minX) % 2 === 0 || (y - pen.minY) % 2 === 0)) {
                    const { isoX, isoY } = toIso(x, y);

                    ctx.fillStyle = '#F8FAFC'; // Madeira branca principal
                    ctx.strokeStyle = '#64748B'; // Sombra e contorno
                    ctx.lineWidth = 1.2;

                    ctx.beginPath();
                    ctx.rect(isoX - 3, isoY - 2, 6, 16);
                    ctx.fill();
                    ctx.stroke();
                }
            }
        }
    });
}

// Função auxiliar para desenhar as ripas paralelas respeitando a geometria dos eixos X e Y
function drawFenceSegment(ctx, isoX, isoY, axis) {
    ctx.fillStyle = '#F1F5F9';
    ctx.strokeStyle = '#94A3B8';
    ctx.lineWidth = 1;

    for (let h = 4; h <= 12; h += 4) {
        ctx.beginPath();
        if (axis === 'x') {
            // Eixo X: alinhamento para baixo-direita
            ctx.moveTo(isoX, isoY + TILE_HEIGHT/2 - h);
            ctx.lineTo(isoX + TILE_WIDTH/2, isoY + TILE_HEIGHT - h);
            ctx.lineTo(isoX + TILE_WIDTH/2, isoY + TILE_HEIGHT - h - 2);
            ctx.lineTo(isoX, isoY + TILE_HEIGHT/2 - h - 2);
        } else {
            // Eixo Y: alinhamento para baixo-esquerda
            ctx.moveTo(isoX, isoY + TILE_HEIGHT/2 - h);
            ctx.lineTo(isoX - TILE_WIDTH/2, isoY + TILE_HEIGHT - h);
            ctx.lineTo(isoX - TILE_WIDTH/2, isoY + TILE_HEIGHT - h - 2);
            ctx.lineTo(isoX, isoY + TILE_HEIGHT/2 - h - 2);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }
}