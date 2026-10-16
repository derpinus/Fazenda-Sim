// Gestão de Animais, Currais e IA de Movimentação Autónoma

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
        this.pen = penBounds; // Limites do curral: {minX, maxX, minY, maxY}
        this.animOffset = Math.random() * 100;
    }

    update() {
        // IA de Movimentação Autónoma dentro do Curral
        const dist = Math.hypot(this.targetX - this.x, this.targetY - this.y);
        if (dist < 0.08) {
            // Pequena probabilidade de escolher um novo destino no curral
            if (Math.random() < 0.015) {
                this.targetX = this.pen.minX + Math.random() * (this.pen.maxX - this.pen.minX);
                this.targetY = this.pen.minY + Math.random() * (this.pen.maxY - this.pen.minY);
            }
        } else {
            this.x += (this.targetX - this.x) * this.speed;
            this.y += (this.targetY - this.y) * this.speed;
        }

        // Sistema de produção de recursos (Leite, Ovos, Lã)
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
            ctx.fillStyle = '#f1f5f9'; // Lã fofa
            ctx.beginPath(); ctx.arc(isoX, isoY - 12, 13 + puff, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#334155'; // Cabeça
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
            ctx.fillStyle = '#9a3412'; // Marrom cavalo
            ctx.beginPath(); ctx.ellipse(isoX, isoY - 14, 18, 11, 0, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#78350f'; // Cabeça erguida
            ctx.beginPath(); ctx.ellipse(isoX - 12, isoY - 22 + bob, 7, 10, -0.3, 0, Math.PI * 2); ctx.fill();
            ctx.font = '14px sans-serif'; ctx.fillText('🐎', isoX - 8, isoY - 32);
        }
    }
}

// Desenho de Cercas e Currais no Mapa
function drawPenFences(ctx) {
    // Curral das Vacas (Esquerda) e Ovelhas (Direita Inferior)
    const pens = [
        { minX: 1, maxX: 4, minY: 5, maxY: 9, color: '#b45309' },
        { minX: 6, maxX: 9, minY: 6, maxY: 9, color: '#65a30d' }
    ];

    pens.forEach(pen => {
        // Desenha postes/cercas nos limites
        for (let x = pen.minX; x <= pen.maxX; x++) {
            for (let y = pen.minY; y <= pen.maxY; y++) {
                if (x === pen.minX || x === pen.maxX || y === pen.minY || y === pen.maxY) {
                    const { isoX, isoY } = toIso(x, y);
                    ctx.fillStyle = '#78350f';
                    ctx.fillRect(isoX - 3, isoY + 4, 6, 12);
                }
            }
        }
    });
}