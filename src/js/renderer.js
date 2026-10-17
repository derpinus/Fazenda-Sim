// Motor de Renderização Gráfica e Ordenação por Profundidade (Z-Index)

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let timeOfDay = 0;
const DAY_LENGTH = 2000;

// --- CARREGAMENTO DOS SPRITES DIRECIONAIS DA GALINHA ---
const ChickenSprites = {
    'front-right': new Image(),
    'front-left': new Image(),
    'back-right': new Image(),
    'back-left': new Image()
};

ChickenSprites['front-right'].src = 'D:/Projects/Fazenda-sim/assets/game/chicken_front_right.png';
ChickenSprites['front-left'].src = 'D:/Projects/Fazenda-sim/assets/game/chicken_front_left.png';
ChickenSprites['back-right'].src = 'D:/Projects/Fazenda-sim/assets/game/chicken_back_right.png';
ChickenSprites['back-left'].src = 'D:/Projects/Fazenda-sim/assets/game/chicken_back_left.png';

// Adicionar listener de erro opcional para depuração na consola do navegador
Object.keys(ChickenSprites).forEach(key => {
    ChickenSprites[key].onerror = () => {
        console.warn(`⚠️ Erro ao carregar sprite da galinha: D:/Projects/Fazenda-sim/assets/game/chicken_${key}.png`);
    };
});

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let x = 0; x < MAP_SIZE; x++) {
        for (let y = 0; y < MAP_SIZE; y++) {
            drawIsometricTile(ctx, x, y, '#166534', '#4ade80', '#14532d');
        }
    }

    const renderables = [];

    renderables.push({
        y: -10,
        draw: () => { drawMapObstacles(ctx); }
    });

    // Renderizar canteiros de Milho
    if (typeof cornPlots !== 'undefined') {
        cornPlots.forEach(c => {
            renderables.push({
                y: c.x + c.y,
                draw: () => {
                    const { isoX, isoY } = toIso(c.x, c.y);
                    
                    ctx.fillStyle = '#78350f';
                    ctx.beginPath();
                    ctx.moveTo(isoX, isoY);
                    ctx.lineTo(isoX + TILE_WIDTH/2, isoY + TILE_HEIGHT/2);
                    ctx.lineTo(isoX, isoY + TILE_HEIGHT);
                    ctx.lineTo(isoX - TILE_WIDTH/2, isoY + TILE_HEIGHT/2);
                    ctx.closePath();
                    ctx.fill();
                    ctx.strokeStyle = '#451a03';
                    ctx.lineWidth = 1;
                    ctx.stroke();

                    if (c.state === 'ready') {
                        ctx.fillStyle = '#facc15';
                        const offsets = [
                            { dx: -10, dy: 6 }, { dx: -4, dy: 4 }, { dx: 4, dy: 5 },
                            { dx: 10, dy: 8 }, { dx: -8, dy: 12 }, { dx: -1, dy: 10 },
                            { dx: 6, dy: 11 }, { dx: -4, dy: 16 }, { dx: 3, dy: 15 },
                            { dx: 8, dy: 14 }
                        ];
                        const grainRadius = 1.0; 

                        offsets.forEach(pt => {
                            ctx.beginPath();
                            ctx.arc(isoX + pt.dx, isoY + pt.dy, grainRadius, 0, Math.PI * 2);
                            ctx.fill();
                        });
                    } else if (c.state === 'growing') {
                        ctx.fillStyle = '#fde047';
                        ctx.beginPath();
                        ctx.arc(isoX, isoY + TILE_HEIGHT/2, 2.5, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }
            });
        });
    }

    // Pastagens
    if (typeof pasturePlots !== 'undefined') {
        pasturePlots.forEach(p => {
            renderables.push({
                y: p.x + p.y,
                draw: () => {
                    const { isoX, isoY } = toIso(p.x, p.y);
                    
                    ctx.fillStyle = '#15803d';
                    ctx.beginPath();
                    ctx.moveTo(isoX, isoY);
                    ctx.lineTo(isoX + TILE_WIDTH/2, isoY + TILE_HEIGHT/2);
                    ctx.lineTo(isoX, isoY + TILE_HEIGHT);
                    ctx.lineTo(isoX - TILE_WIDTH/2, isoY + TILE_HEIGHT/2);
                    ctx.closePath();
                    ctx.fill();

                    if (p.state === 'growing') {
                        ctx.fillStyle = '#86efac';
                        ctx.font = '12px sans-serif';
                        ctx.fillText('🌿', isoX - 6, isoY + TILE_HEIGHT/2 + 4);
                    } else if (p.state === 'ready') {
                        ctx.font = '16px sans-serif';
                        ctx.fillText('🌾', isoX - 8, isoY + TILE_HEIGHT/2 + 6);
                    }
                }
            });
        });
    }

    // Canteiros de Plantação (Trigo)
    farmPlots.forEach(p => {
        renderables.push({
            y: p.x + p.y,
            draw: () => {
                const { isoX, isoY } = toIso(p.x, p.y);
                
                ctx.fillStyle = '#451a03';
                ctx.beginPath();
                ctx.moveTo(isoX, isoY);
                ctx.lineTo(isoX + TILE_WIDTH/2, isoY + TILE_HEIGHT/2);
                ctx.lineTo(isoX, isoY + TILE_HEIGHT);
                ctx.lineTo(isoX - TILE_WIDTH/2, isoY + TILE_HEIGHT/2);
                ctx.closePath();
                ctx.fill();
                ctx.strokeStyle = '#271002';
                ctx.lineWidth = 1;
                ctx.stroke();

                if (p.state === 'growing') {
                    ctx.fillStyle = '#a3e635';
                    ctx.beginPath();
                    ctx.arc(isoX, isoY + TILE_HEIGHT/2, 4, 0, Math.PI * 2);
                    ctx.fill();
                } else if (p.state === 'ready') {
                    const sway = Math.sin(Date.now() * 0.005) * 2;
                    ctx.font = '20px sans-serif';
                    ctx.fillText('🌾', isoX - 8 + sway, isoY + TILE_HEIGHT/2 + 6);
                }
            }
        });
    });

    // Mercado
    renderables.push({
        y: market.x + market.y,
        draw: () => {
            const { isoX, isoY } = toIso(market.x, market.y);
            drawShadow(ctx, isoX, isoY + 5, 28, 14);
            const sprite = Sprites['market'];
            if (sprite && sprite.complete && sprite.naturalWidth > 0) {
                ctx.drawImage(sprite, isoX - 36, isoY - 75, 72, 72);
            } else {
                ctx.fillStyle = '#64748b';
                ctx.fillRect(isoX - 30, isoY - 45, 60, 50);
                ctx.fillStyle = '#78350f';
                ctx.fillRect(isoX - 10, isoY - 18, 20, 24);
                ctx.fillStyle = '#b91c1c';
                ctx.beginPath();
                ctx.moveTo(isoX - 36, isoY - 45);
                ctx.lineTo(isoX, isoY - 75);
                ctx.lineTo(isoX + 36, isoY - 45);
                ctx.fill();
                ctx.fillStyle = '#fef08a';
                ctx.font = 'bold 11px sans-serif';
                ctx.fillText('MERCADO', isoX - 22, isoY - 55);
            }
        }
    });

    // Prensa de Queijo
    renderables.push({
        y: cheesePress.x + cheesePress.y,
        draw: () => {
            const { isoX, isoY } = toIso(cheesePress.x, cheesePress.y);
            
            ctx.fillStyle = '#b45309';
            ctx.beginPath();
            ctx.moveTo(isoX, isoY);
            ctx.lineTo(isoX + TILE_WIDTH/2, isoY + TILE_HEIGHT/2);
            ctx.lineTo(isoX, isoY + TILE_HEIGHT);
            ctx.lineTo(isoX - TILE_WIDTH/2, isoY + TILE_HEIGHT/2);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = '#451a03';
            ctx.lineWidth = 1;
            ctx.stroke();

            drawShadow(ctx, isoX, isoY + 2, 16, 8);
            
            const sprite = Sprites['cheesePress'];
            if (sprite && sprite.complete && sprite.naturalWidth > 0) {
                ctx.drawImage(sprite, isoX - 20, isoY - 32, 40, 40);
            } else {
                ctx.fillStyle = '#78350f';
                ctx.fillRect(isoX - 16, isoY - 22, 32, 26);
                
                if (cheesePress.status === 'processando') {
                    const bounce = Math.abs(Math.sin(Date.now() * 0.01)) * 4;
                    ctx.font = '16px sans-serif';
                    ctx.fillText('⚙️', isoX - 8, isoY - 8 - bounce);
                } else if (cheesePress.status === 'pronto') {
                    ctx.font = '18px sans-serif';
                    ctx.fillText('🧀', isoX - 9, isoY - 8);
                }
            }
        }
    });

    animals.forEach(a => {
        renderables.push({
            y: a.x + a.y,
            draw: () => a.draw(ctx)
        });
    });

    // Jogador / Cavaleiro
    renderables.push({
        y: player.x + player.y,
        draw: () => {
            const { isoX, isoY } = toIso(player.x, player.y);

            if (player.isRiding) {
                drawShadow(ctx, isoX, isoY, 22, 10);
                
                const horseSprite = Sprites['horse'];
                if (horseSprite && horseSprite.complete && horseSprite.naturalWidth > 0) {
                    ctx.drawImage(horseSprite, isoX - 28, isoY - 44, 56, 56);
                } else {
                    ctx.fillStyle = '#9a3412';
                    ctx.beginPath(); ctx.ellipse(isoX, isoY - 16, 20, 12, 0, 0, Math.PI * 2); ctx.fill();
                }

                const farmerSprite = Sprites['farmer'];
                if (farmerSprite && farmerSprite.complete && farmerSprite.naturalWidth > 0) {
                    const bounce = player.isMoving ? Math.abs(Math.sin(player.animTimer * 4)) * 3 : 0;
                    ctx.drawImage(farmerSprite, isoX - 16, isoY - 52 - bounce, 32, 36);
                } else {
                    ctx.fillStyle = '#0284c7';
                    ctx.fillRect(isoX - 8, isoY - 38, 16, 16);
                }
            } else {
                drawShadow(ctx, isoX, isoY, 14, 7);
                const sprite = Sprites['farmer'];
                if (sprite && sprite.complete && sprite.naturalWidth > 0) {
                    const bounce = player.isMoving ? Math.abs(Math.sin(player.animTimer * 4)) * 3 : 0;
                    ctx.drawImage(sprite, isoX - 16, isoY - 36 - bounce, 32, 36);
                } else {
                    ctx.fillStyle = '#0284c7';
                    ctx.fillRect(isoX - 8, isoY - 24, 16, 16);
                }
            }
        }
    });

    renderables.sort((a, b) => a.y - b.y);
    renderables.forEach(r => r.draw());

    const nightAlpha = Math.abs(Math.sin((timeOfDay / DAY_LENGTH) * Math.PI)) * 0.45;
    ctx.fillStyle = `rgba(15, 23, 42, ${nightAlpha})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}