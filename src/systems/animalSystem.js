import { GameState } from "../managers/gameState.js";
import { MAP_SIZE } from "../core/config.js";
import { canOccupy, moveWithCollision } from "../core/worldCollision.js";

const DECISION_MIN = 2.5;
const DECISION_MAX = 6;
const GRAZE_THRESHOLD = 38;
const GRAZE_FULL_THRESHOLD = 58;
const THIRST_SEEK_THRESHOLD = 28;
const THIRST_RECOVERY = 30;
const WALKABLE_TILES = new Set([
    "grass", "meadow", "meadow-light", "wildflower", "path",
    "shore", "field", "hill", "lowland", "forest"
]);
const FORAGE_TILES = new Set([
    "grass", "meadow", "meadow-light", "wildflower", "field", "lowland"
]);

function random(animal) {
    let value = animal.aiSeed >>> 0;
    value ^= value << 13;
    value ^= value >>> 17;
    value ^= value << 5;
    animal.aiSeed = value >>> 0;
    return animal.aiSeed / 4294967296;
}

export class AnimalSystem {
    constructor(gameState = GameState) {
        this.gameState = gameState;
    }

    update(deltaTime) {
        for (const animal of this.gameState.animals ?? []) {
            this.updateProduction(animal, deltaTime);
            this.updateHunger(animal, deltaTime);
            this.updateThirst(animal, deltaTime);
            this.updateMovement(animal, deltaTime);
        }
    }

    updateProduction(animal, deltaTime) {
        if (
            !animal.product ||
            animal.productionTime <= 0 ||
            animal.hunger <= 0 ||
            animal.thirst <= 0
        ) {
            return;
        }

        animal.productionTimer += deltaTime;

        if (animal.productionTimer >= animal.productionTime) {
            animal.productionTimer = 0;
            animal.ready = true;
        }
    }

    updateHunger(animal, deltaTime) {
        animal.hunger = Math.max(
            0,
            animal.hunger - deltaTime * animal.hungerRate
        );
    }

    updateThirst(animal, deltaTime) {
        animal.thirst = Math.max(
            0,
            (animal.thirst ?? 100) - deltaTime * animal.thirstRate
        );
    }

    updateMovement(animal, deltaTime) {
        animal.animTimer += deltaTime * (animal.isMoving ? 9 : 1.2);
        animal.aiTimer -= deltaTime;
        animal.stuckTimer += deltaTime;

        const playerDistance = this.gameState.player
            ? Math.hypot(
                this.gameState.player.x - animal.x,
                this.gameState.player.y - animal.y
            )
            : Infinity;

        if (animal.state === "drinking") {
            animal.thirst = Math.min(100, animal.thirst + THIRST_RECOVERY * deltaTime);
            this.stop(animal);
            if (animal.thirst >= 72) {
                animal.state = "idle";
                animal.aiTimer = 0;
            }
            return;
        }

        if (animal.state === "grazing") {
            animal.hunger = Math.min(
                100,
                animal.hunger + animal.grazeRecovery * deltaTime
            );
            this.stop(animal);
            if (animal.hunger >= GRAZE_FULL_THRESHOLD) {
                animal.state = "idle";
                animal.aiTimer = 0;
            }
            return;
        }

        if (
            animal.state === "pecking" ||
            animal.state === "resting" ||
            animal.state === "thirsty"
        ) {
            this.stop(animal);
            if (animal.aiTimer > 0) return;
            animal.state = "idle";
        }

        if (
            animal.thirst <= THIRST_SEEK_THRESHOLD &&
            animal.state !== "seekingWater"
        ) {
            const water = this.findWaterTarget(animal);
            if (water) {
                this.setTarget(animal, water.x, water.y, "seekingWater");
                animal.aiTimer = DECISION_MIN;
            } else {
                animal.state = "thirsty";
                animal.aiTimer = 8;
                this.stop(animal);
                return;
            }
        }

        if (animal.state === "seekingWater") {
            if (animal.thirst > THIRST_SEEK_THRESHOLD + 6) {
                animal.state = "idle";
                animal.aiTimer = 0;
            } else if (this.hasArrived(animal)) {
                animal.state = "drinking";
                animal.aiTimer = 0;
                animal.vx = 0;
                animal.vy = 0;
                animal.isMoving = false;
                return;
            }
        }

        if (
            animal.hunger <= GRAZE_THRESHOLD &&
            animal.state !== "seekingFood" &&
            animal.state !== "seekingWater"
        ) {
            const forage = this.findForageTarget(animal);
            if (forage) {
                this.setTarget(animal, forage.x, forage.y, "seekingFood");
                animal.aiTimer = DECISION_MIN;
            } else {
                animal.state = "grazing";
                return;
            }
        }

        if (animal.state === "seekingFood" && this.hasArrived(animal)) {
            animal.state = "grazing";
            animal.vx = 0;
            animal.vy = 0;
            animal.isMoving = false;
            return;
        }

        if (
            animal.state !== "seekingWater" &&
            animal.state !== "seekingFood"
        ) {
            if (
                animal.type === "horse" &&
                playerDistance > 2 &&
                playerDistance < 7
            ) {
                this.setHorseFollowTarget(animal);
                animal.aiTimer = 0.3;
            } else if (animal.aiTimer <= 0 || animal.stuckTimer > 2) {
                this.chooseBehavior(animal, playerDistance);
            }
        }

        if (
            animal.state === "pecking" ||
            animal.state === "resting" ||
            animal.state === "thirsty"
        ) {
            this.stop(animal);
            return;
        }

        const deltaX = animal.targetX - animal.x;
        const deltaY = animal.targetY - animal.y;
        const distance = Math.hypot(deltaX, deltaY);

        if (distance < 0.12) {
            animal.vx = 0;
            animal.vy = 0;
            animal.isMoving = false;
            animal.stuckTimer = 0;
            if (animal.state === "seekingWater") {
                animal.state = "drinking";
            } else if (animal.state === "seekingFood") {
                animal.state = "grazing";
            } else if (animal.state === "walking" || animal.state === "following") {
                animal.state = "idle";
                animal.aiTimer = 0.4 + random(animal);
            }
            return;
        }

        const speedFactor = animal.hunger < GRAZE_THRESHOLD ? 0.6 : 1;
        const step = Math.min(
            distance,
            animal.speed * speedFactor * deltaTime
        );
        const moveX = deltaX / distance * step;
        const moveY = deltaY / distance * step;
        const oldX = animal.x;
        const oldY = animal.y;

        moveWithCollision(
            animal,
            animal.x + moveX,
            animal.y + moveY,
            animal.type === "chicken" ? 0.16 : 0.23,
            this.gameState
        );

        const actualX = animal.x - oldX;
        const actualY = animal.y - oldY;
        animal.isMoving = Math.hypot(actualX, actualY) > 0.002;
        animal.vx = deltaTime > 0 ? actualX / deltaTime : 0;
        animal.vy = deltaTime > 0 ? actualY / deltaTime : 0;

        if (animal.isMoving) {
            animal.direction = Math.abs(actualX) > Math.abs(actualY)
                ? actualX > 0 ? "east" : "west"
                : actualY > 0 ? "south" : "north";
            animal.stuckTimer = 0;
        } else if (animal.stuckTimer > 2) {
            if (animal.state === "seekingWater") {
                const water = this.findWaterTarget(animal);
                if (water) {
                    this.setTarget(animal, water.x, water.y, "seekingWater");
                    animal.stuckTimer = 0;
                } else {
                    animal.state = "thirsty";
                    animal.aiTimer = 8;
                }
            } else if (animal.state === "seekingFood") {
                const forage = this.findForageTarget(animal);
                if (forage) {
                    this.setTarget(animal, forage.x, forage.y, "seekingFood");
                    animal.stuckTimer = 0;
                } else {
                    animal.state = "grazing";
                }
            }
        }
    }

    chooseBehavior(animal, playerDistance) {
        const others = (this.gameState.animals ?? []).filter(
            other =>
                other !== animal &&
                other.type === animal.type &&
                Math.hypot(other.x - animal.x, other.y - animal.y) < 5
        );

        if (animal.hunger <= GRAZE_THRESHOLD) {
            const forage = this.findForageTarget(animal);
            if (forage) {
                this.setTarget(animal, forage.x, forage.y, "seekingFood");
            } else {
                animal.state = "grazing";
            }
            animal.aiTimer = DECISION_MIN + random(animal) * 2;
            return;
        }

        if (animal.type === "horse" && playerDistance > 2 && playerDistance < 7) {
            this.setHorseFollowTarget(animal);
            animal.aiTimer = 0.5;
            return;
        }

        if (animal.type === "sheep" && others.length > 0) {
            const center = others.reduce(
                (sum, sheep) => ({
                    x: sum.x + sheep.x / others.length,
                    y: sum.y + sheep.y / others.length
                }),
                { x: 0, y: 0 }
            );
            const offsetX = animal.x - center.x;
            const offsetY = animal.y - center.y;
            const flockDistance = Math.hypot(offsetX, offsetY);
            if (flockDistance > animal.flockDistance) {
                this.setTarget(animal, center.x, center.y, "walking");
                animal.aiTimer = DECISION_MIN + random(animal) * 2;
                return;
            }
            if (flockDistance < 0.55 && flockDistance > 0.001) {
                this.setTarget(
                    animal,
                    animal.x + offsetX / flockDistance * 0.75,
                    animal.y + offsetY / flockDistance * 0.75,
                    "walking"
                );
                animal.aiTimer = DECISION_MIN + random(animal) * 2;
                return;
            }
        }

        if (random(animal) < animal.restChance) {
            animal.state = animal.type === "chicken" ? "pecking" : "resting";
            animal.aiTimer = animal.type === "chicken"
                ? animal.peckDuration * (0.7 + random(animal) * 0.6)
                : 2 + random(animal) * 4;
            this.stop(animal);
            return;
        }

        const radius = animal.wanderRadius *
            (animal.type === "chicken" ? 0.55 : 1);
        let targetX = animal.homeX;
        let targetY = animal.homeY;
        let foundTarget = false;

        for (let attempt = 0; attempt < 12; attempt++) {
            targetX = animal.homeX + (random(animal) * 2 - 1) * radius;
            targetY = animal.homeY + (random(animal) * 2 - 1) * radius;
            targetX = Math.max(0.4, Math.min(MAP_SIZE - 0.4, targetX));
            targetY = Math.max(0.4, Math.min(MAP_SIZE - 0.4, targetY));

            if (
                Math.hypot(targetX - animal.homeX, targetY - animal.homeY) <= radius &&
                WALKABLE_TILES.has(
                    this.gameState.world?.tiles?.[Math.floor(targetX)]?.[Math.floor(targetY)]
                ) &&
                canOccupy(
                    targetX,
                    targetY,
                    animal.type === "chicken" ? 0.16 : 0.23,
                    this.gameState
                )
            ) {
                foundTarget = true;
                break;
            }
        }

        if (foundTarget) {
            this.setTarget(animal, targetX, targetY, "walking");
        } else {
            animal.state = "idle";
        }

        animal.aiTimer = DECISION_MIN + random(animal) * DECISION_MAX;
    }

    findForageTarget(animal) {
        let best = null;
        for (let attempt = 0; attempt < 16; attempt++) {
            const angle = random(animal) * Math.PI * 2;
            const distance = 0.5 + random(animal) * animal.forageRadius;
            const x = Math.max(0.3, Math.min(MAP_SIZE - 0.3, animal.x + Math.cos(angle) * distance));
            const y = Math.max(0.3, Math.min(MAP_SIZE - 0.3, animal.y + Math.sin(angle) * distance));
            const tile = this.gameState.world?.tiles?.[Math.floor(x)]?.[Math.floor(y)];
            if (
                !FORAGE_TILES.has(tile) ||
                Math.hypot(x - animal.homeX, y - animal.homeY) > animal.forageRadius + 1 ||
                !canOccupy(
                    x,
                    y,
                    animal.type === "chicken" ? 0.16 : 0.23,
                    this.gameState
                )
            ) {
                continue;
            }
            const score = Math.hypot(x - animal.x, y - animal.y) + random(animal) * 0.4;
            if (!best || score < best.score) best = { x, y, score };
        }
        return best;
    }

    findWaterTarget(animal) {
        let best = null;
        const maxDistance = Math.max(8, animal.wanderRadius * 2 + 3);
        const consider = (x, y) => {
            const distance = Math.hypot(x - animal.x, y - animal.y);
            if (
                distance > maxDistance ||
                !canOccupy(
                    x,
                    y,
                    animal.type === "chicken" ? 0.16 : 0.23,
                    this.gameState
                )
            ) {
                return;
            }
            if (!best || distance < best.distance) best = { x, y, distance };
        };

        for (let x = 0; x < MAP_SIZE; x++) {
            for (let y = 0; y < MAP_SIZE; y++) {
                if (this.gameState.world?.tiles?.[x]?.[y] !== "shore") continue;
                consider(x + 0.5, y + 0.5);
            }
        }
        for (const building of this.gameState.buildings ?? []) {
            if (building.type !== "well") continue;
            for (let index = 0; index < 8; index++) {
                const angle = index * Math.PI / 4;
                consider(
                    building.x + Math.cos(angle) * 0.75,
                    building.y + Math.sin(angle) * 0.75
                );
            }
        }
        return best;
    }

    hasArrived(animal) {
        return Math.hypot(
            animal.targetX - animal.x,
            animal.targetY - animal.y
        ) < 0.16;
    }

    stop(animal) {
        animal.vx = 0;
        animal.vy = 0;
        animal.isMoving = false;
    }

    setTarget(animal, x, y, state) {
        animal.targetX = x;
        animal.targetY = y;
        animal.state = state;
    }

    setHorseFollowTarget(animal) {
        const player = this.gameState.player;
        const dx = animal.x - player.x;
        const dy = animal.y - player.y;
        const distance = Math.hypot(dx, dy) || 1;
        const followDistance = 1.5;

        this.setTarget(
            animal,
            player.x + dx / distance * followDistance,
            player.y + dy / distance * followDistance,
            "following"
        );
    }

    feed(animal, amount = 25) {
        animal.hunger = Math.min(100, animal.hunger + amount);
    }

    collect(animal) {
        if (!animal.ready) {
            return null;
        }

        animal.ready = false;
        return animal.product;
    }
}
