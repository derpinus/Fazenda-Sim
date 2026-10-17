class Animal {
    constructor(type, x, y) {
        this.type = type; // 'cow', 'sheep', 'chicken', 'rooster', 'horse'
        this.x = x;
        this.y = y;
        this.targetX = x;
        this.targetY = y;
        
        if (type === 'cow') {
            this.speed = 0.002;
        } else if (type === 'chicken' || type === 'rooster') {
            this.speed = 0.004;  
        } else if (type === 'horse') {
            this.speed = 0.0035;
        } else {
            this.speed = 0.003;
        }

        this.radius = 0.4;
        this.hasProduct = true;
        this.timer = 0;
        this.fed = false;
        this.animOffset = Math.random() * 100;
        this.aiState = 'WANDER';
        this.panicTimer = 0;

        // Propriedades direcionais para os 4 frames da galinha
        this.facing = 'front-right';
        this.animTimer = Math.random() * 10;
    }

    update(allAnimals, player) {
        AnimalAI.update(this, allAnimals, player);

        if (this.panicTimer > 0) {
            this.panicTimer--;
        } else if (this.aiState === 'PANIC') {
            this.aiState = 'WANDER';
        }

        const angleToTarget = Math.atan2(this.targetY - this.y, this.targetX - this.x);
        
        let currentSpeed = this.speed;
        if (this.aiState === 'SEEK_GRASS' || this.aiState === 'SEEK_CORN') {
            currentSpeed = this.speed * 1.3;
        } else if (this.aiState === 'PANIC') {
            currentSpeed = 0.007; 
        }
        
        let nextX = this.x + Math.cos(angleToTarget) * currentSpeed;
        let nextY = this.y + Math.sin(angleToTarget) * currentSpeed;

        // Atualiza a direção (facing) com base no vetor de movimento para os 4 frames
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        if (Math.hypot(dx, dy) > 0.05) {
            this.animTimer += 0.1;
            if (dx >= 0 && dy >= 0) {
                this.facing = 'front-right';
            } else if (dx < 0 && dy >= 0) {
                this.facing = 'front-left';
            } else if (dx >= 0 && dy < 0) {
                this.facing = 'back-right';
            } else {
                this.facing = 'back-left';
            }
        }

        const hitWorld = checkWorldCollision(nextX, nextY, this.radius);
        const hitAnimal = checkEntityCollision(nextX, nextY, this.radius * 1.5, allAnimals, this);
        const hitPlayer = player && !player.isRiding && Math.hypot(player.x - nextX, player.y - nextY) < (this.radius + 0.35);

        if (!hitWorld && !hitAnimal && !hitPlayer) {
            this.x = nextX;
            this.y = nextY;
        } else {
            let deviated = false;
            const deviationAngles = [0.5, -0.5, 1.0, -1.0, 1.57, -1.57];

            for (const offset of deviationAngles) {
                const altAngle = angleToTarget + offset;
                const altX = this.x + Math.cos(altAngle) * currentSpeed;
                const altY = this.y + Math.sin(altAngle) * currentSpeed;

                if (!checkWorldCollision(altX, altY, this.radius) && 
                    !checkEntityCollision(altX, altY, this.radius * 1.5, allAnimals, this)) {
                    this.x = altX;
                    this.y = altY;
                    deviated = true;
                    break;
                }
            }

            if (!deviated) {
                this.targetX = this.x + (Math.random() - 0.5) * 2;
                this.targetY = this.y + (Math.random() - 0.5) * 2;
            }
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

        drawShadow(ctx, isoX, isoY, this.type === 'horse' ? 20 : 12, 6);

        // Tratamento para os 4 frames direcionais da galinha
        if ((this.type === 'chicken' || this.type === 'rooster') && typeof ChickenSprites !== 'undefined') {
            const spriteKey = ChickenSprites[this.facing] ? this.facing : 'front-right';
            const sprite = ChickenSprites[spriteKey];

            if (sprite && sprite.src) {
                const bob = Math.sin(this.animTimer) * 1.5; 
                
                const spriteSize = 36; 
                ctx.drawImage(
                    sprite, 
                    isoX - spriteSize / 2,         // Centraliza horizontalmente
                    isoY - spriteSize + 6 + bob,   // <--- Alterado de -4 para +6 para descer a galinha até à sombra
                    spriteSize, 
                    spriteSize
                );
                
                if (this.hasProduct) {
                    ctx.font = '12px sans-serif';
                    let icon = this.type === 'rooster' ? '👑' : '🥚';
                    ctx.fillText(icon, isoX - 5, isoY - spriteSize + 2 + bob);
                }
                return;
            }
        }

        // Indicadores visuais de susto ou fome/desejo
        if (this.panicTimer > 0) {
            ctx.font = '12px sans-serif';
            ctx.fillText('❗', isoX + 8, isoY - 40);
        } else if (this.aiState === 'SEEK_GRASS' || this.aiState === 'SEEK_CORN') {
            ctx.font = '12px sans-serif';
            ctx.fillText('🤤', isoX + 10, isoY - 40);
        }
    }

    drawFallback(ctx, isoX, isoY) {
        if (this.type === 'cow') {
            ctx.fillStyle = '#ffffff';
            ctx.beginPath(); ctx.ellipse(isoX, isoY - 12, 16, 12, 0, 0, Math.PI * 2); ctx.fill();
        } else if (this.type === 'sheep') {
            ctx.fillStyle = '#f1f5f9';
            ctx.beginPath(); ctx.arc(isoX, isoY - 12, 13, 0, Math.PI * 2); ctx.fill();
        } else if (this.type === 'chicken') {
            ctx.fillStyle = '#f97316';
            ctx.beginPath(); ctx.arc(isoX, isoY - 8, 9, 0, Math.PI * 2); ctx.fill();
        } else if (this.type === 'rooster') {
            ctx.fillStyle = '#dc2626'; // Galo vermelho
            ctx.beginPath(); ctx.arc(isoX, isoY - 9, 10, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#facc15';
            ctx.fillRect(isoX - 2, isoY - 21, 4, 5);
        } else if (this.type === 'horse') {
            ctx.fillStyle = '#9a3412';
            ctx.beginPath(); ctx.ellipse(isoX, isoY - 14, 18, 11, 0, 0, Math.PI * 2); ctx.fill();
        }
    }
}