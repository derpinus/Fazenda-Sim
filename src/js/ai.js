// Comportamento de IA individualizado para cada animal com personalidades únicas
const AnimalAI = {
    update(animal, allAnimals, player) {
        // --- 1. COMPORTAMENTO DE ASSUSTO DA GALINHA / GALO ---
        if (animal.type === 'chicken' || animal.type === 'rooster') {
            const frightDist = 0.9; 
            let nearestBigAnimal = null;
            let minThreatDist = 999;

            for (const other of allAnimals) {
                if (other !== animal && other.type !== 'chicken' && other.type !== 'rooster') {
                    const d = Math.hypot(other.x - animal.x, other.y - animal.y);
                    if (d < minThreatDist) {
                        minThreatDist = d;
                        nearestBigAnimal = other;
                    }
                }
            }

            if (minThreatDist < frightDist && nearestBigAnimal) {
                animal.aiState = 'PANIC';
                animal.panicTimer = 120; // O susto dura ~2 segundos
                const angleAway = Math.atan2(animal.y - nearestBigAnimal.y, animal.x - nearestBigAnimal.x);
                
                animal.targetX = Math.max(1, Math.min(MAP_SIZE - 2, animal.x + Math.cos(angleAway) * 2.0));
                animal.targetY = Math.max(1, Math.min(MAP_SIZE - 2, animal.y + Math.sin(angleAway) * 2.0));
                return;
            }
        }

        // --- 2. ROTINAS POR ESPÉCIE ---
        switch (animal.type) {
            case 'cow':
                this.handleCowAI(animal, allAnimals, player);
                break;
            case 'sheep':
                this.handleSheepAI(animal, allAnimals);
                break;
            case 'chicken':
                this.handleChickenAI(animal, allAnimals);
                break;
            case 'rooster':
                this.handleRoosterAI(animal, allAnimals);
                break;
            case 'horse':
                this.handleHorseAI(animal, player);
                break;
            default:
                this.handleWander(animal);
                break;
        }
    },

    // Vaca: Cadência lenta e pausas longas
    handleCowAI(animal, allAnimals, player) {
        if (!animal.fed) {
            let closestGrass = null;
            let minDist = 999;

            for (const p of pasturePlots) {
                if (p.state === 'ready') {
                    const d = Math.hypot(p.x - animal.x, p.y - animal.y);
                    if (d < minDist) {
                        minDist = d;
                        closestGrass = p;
                    }
                }
            }

            if (closestGrass) {
                animal.aiState = 'SEEK_GRASS';
                animal.targetX = closestGrass.x;
                animal.targetY = closestGrass.y;

                if (minDist < 0.6) {
                    closestGrass.state = 'empty';
                    closestGrass.timer = 0;
                    animal.fed = true;
                    animal.aiState = 'WANDER';
                    if (typeof playSound === 'function') playSound('collect');
                }
                return;
            }
        }

        animal.aiState = 'WANDER';
        this.handleStopAndGoWander(animal, 2.0, 0.008, 150);
    },

    // Ovelha
    handleSheepAI(animal, allAnimals) {
        if (!animal.fed) {
            let closestGrass = null;
            let minDist = 999;

            for (const p of pasturePlots) {
                if (p.state === 'ready') {
                    const d = Math.hypot(p.x - animal.x, p.y - animal.y);
                    if (d < minDist) {
                        minDist = d;
                        closestGrass = p;
                    }
                }
            }

            if (closestGrass) {
                animal.aiState = 'SEEK_GRASS';
                animal.targetX = closestGrass.x;
                animal.targetY = closestGrass.y;

                if (minDist < 0.6) {
                    closestGrass.state = 'empty';
                    closestGrass.timer = 0;
                    animal.fed = true;
                    animal.aiState = 'WANDER';
                    if (typeof playSound === 'function') playSound('collect');
                }
                return;
            }
        }

        animal.aiState = 'WANDER';
        const distToTarget = Math.hypot(animal.targetX - animal.x, animal.targetY - animal.y);
        if (distToTarget < 0.08) {
            let groupX = 0, groupY = 0, count = 0;
            let nearestDist = 999;

            for (const other of allAnimals) {
                if (other !== animal && other.type === 'sheep') {
                    const d = Math.hypot(other.x - animal.x, other.y - animal.y);
                    groupX += other.x;
                    groupY += other.y;
                    count++;
                    if (d < nearestDist) nearestDist = d;
                }
            }

            if (count > 0 && nearestDist > 2.5) {
                const centerX = groupX / count;
                const centerY = groupY / count;
                const angleToCenter = Math.atan2(centerY - animal.y, centerX - animal.x) + (Math.random() - 0.5) * 0.5;
                const offsetDist = 1.5 + Math.random() * 1.0;
                
                animal.targetX = Math.max(1, Math.min(MAP_SIZE - 2, centerX - Math.cos(angleToCenter) * offsetDist));
                animal.targetY = Math.max(1, Math.min(MAP_SIZE - 2, centerY - Math.sin(angleToCenter) * offsetDist));
            } else {
                this.handleWander(animal, 1.5, 0.04);
            }
        }
    },

    // Galinha
    handleChickenAI(animal, allAnimals) {
        if (!animal.fed) {
            let closestCorn = null;
            let minDist = 999;

            for (const c of cornPlots) {
                if (c.state === 'ready') {
                    const d = Math.hypot(c.x - animal.x, c.y - animal.y);
                    if (d < minDist) {
                        minDist = d;
                        closestCorn = c;
                    }
                }
            }

            if (closestCorn) {
                animal.aiState = 'SEEK_CORN';
                animal.targetX = closestCorn.x;
                animal.targetY = closestCorn.y;

                if (minDist < 0.6) {
                    closestCorn.state = 'empty';
                    closestCorn.timer = 0;
                    animal.fed = true;
                    animal.aiState = 'WANDER';
                    if (typeof playSound === 'function') playSound('collect');
                }
                return;
            }
        }

        animal.aiState = 'WANDER';
        const distToTarget = Math.hypot(animal.targetX - animal.x, animal.targetY - animal.y);
        if (distToTarget < 0.08) {
            let leaderX = 0, leaderY = 0, count = 0;
            let nearestLeaderDist = 999;
            let roosterFound = null;

            for (const other of allAnimals) {
                if (other !== animal) {
                    if (other.type === 'rooster') {
                        roosterFound = other;
                        break;
                    } else if (other.type === 'chicken') {
                        const d = Math.hypot(other.x - animal.x, other.y - animal.y);
                        leaderX += other.x;
                        leaderY += other.y;
                        count++;
                        if (d < nearestLeaderDist) nearestLeaderDist = d;
                    }
                }
            }

            if (roosterFound) {
                const dToRooster = Math.hypot(roosterFound.x - animal.x, roosterFound.y - animal.y);
                if (dToRooster > 2.0) {
                    const angle = Math.atan2(roosterFound.y - animal.y, roosterFound.x - animal.x) + (Math.random() - 0.5) * 0.6;
                    animal.targetX = Math.max(1, Math.min(MAP_SIZE - 2, roosterFound.x - Math.cos(angle) * 1.5));
                    animal.targetY = Math.max(1, Math.min(MAP_SIZE - 2, roosterFound.y - Math.sin(angle) * 1.5));
                } else {
                    this.handleWander(animal, 1.0, 0.05);
                }
            } else if (count > 0 && nearestLeaderDist > 2.0) {
                const centerX = leaderX / count;
                const centerY = leaderY / count;
                const angle = Math.atan2(centerY - animal.y, centerX - animal.x) + (Math.random() - 0.5) * 0.6;
                
                animal.targetX = Math.max(1, Math.min(MAP_SIZE - 2, centerX - Math.cos(angle) * 1.2));
                animal.targetY = Math.max(1, Math.min(MAP_SIZE - 2, centerY - Math.sin(angle) * 1.2));
            } else {
                this.handleWander(animal, 1.2, 0.05);
            }
        }
    },

    handleRoosterAI(animal, allAnimals) {
        animal.aiState = 'WANDER';
        this.handleWander(animal, 2.5, 0.03);
    },

    handleHorseAI(animal, player) {
        animal.aiState = 'WANDER';
        this.handleWander(animal, 3, 0.015);
    },

    handleWander(animal, maxDistance = 3, frequency = 0.02) {
        const dist = Math.hypot(animal.targetX - animal.x, animal.targetY - animal.y);
        if (dist < 0.08) {
            if (Math.random() < frequency) {
                const angle = Math.random() * Math.PI * 2;
                const distance = 1 + Math.random() * maxDistance;
                animal.targetX = Math.max(1, Math.min(MAP_SIZE - 2, animal.x + Math.cos(angle) * distance));
                animal.targetY = Math.max(1, Math.min(MAP_SIZE - 2, animal.y + Math.sin(angle) * distance));
            }
        }
    },

    // Função que estava em falta e causava a falha ao carregar
    handleStopAndGoWander(animal, maxDistance, frequency, pauseDuration) {
        const dist = Math.hypot(animal.targetX - animal.x, animal.targetY - animal.y);
        if (dist < 0.08) {
            if (!animal.pauseTimer) animal.pauseTimer = 0;
            
            if (animal.pauseTimer > 0) {
                animal.pauseTimer--;
                return;
            }

            if (Math.random() < frequency) {
                const angle = Math.random() * Math.PI * 2;
                const distance = 1 + Math.random() * maxDistance;
                animal.targetX = Math.max(1, Math.min(MAP_SIZE - 2, animal.x + Math.cos(angle) * distance));
                animal.targetY = Math.max(1, Math.min(MAP_SIZE - 2, animal.y + Math.sin(angle) * distance));
                animal.pauseTimer = pauseDuration;
            }
        }
    }
};