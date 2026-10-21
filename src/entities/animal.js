import { Entity } from "./entity.js";
import { AnimalData } from "../data/animals.js";

function createInitialAiSeed(type, x, y) {
    const source = `${type}:${x.toFixed(3)}:${y.toFixed(3)}`;
    let seed = 2166136261;
    for (const character of source) {
        seed ^= character.charCodeAt(0);
        seed = Math.imul(seed, 16777619);
    }
    return (seed >>> 0) || 1;
}

export class Animal extends Entity {
    constructor(type, x, y) {
        super(x, y);

        this.type = type;
        const animalData = AnimalData[type];
        this.speed = animalData?.movementSpeed ?? 1;
        this.wanderRadius = animalData?.wanderRadius ?? 3;
        this.forageRadius = animalData?.forageRadius ?? this.wanderRadius;
        this.hungerRate = animalData?.hungerRate ?? 0.1;
        this.thirstRate = animalData?.thirstRate ?? 0.08;
        this.grazeRecovery = animalData?.grazeRecovery ?? 2.5;
        this.restChance = animalData?.restChance ?? 0.3;
        this.peckDuration = animalData?.peckDuration ?? 1.8;
        this.flockDistance = animalData?.flockDistance ?? 1.6;

        this.state = "idle";
        this.direction = "south";
        this.vx = 0;
        this.vy = 0;
        this.animTimer = 0;
        this.aiTimer = 0;
        this.aiSeed = createInitialAiSeed(type, x, y);
        this.homeX = x;
        this.homeY = y;
        this.targetX = x;
        this.targetY = y;
        this.stuckTimer = 0;

        this.hunger = 100;
        this.thirst = 100;
        this.happiness = 100;

        this.productionTimer = 0;
        this.productionTime = animalData?.produceTime ?? 60;
        this.product = animalData ? animalData.produceItem : "egg";
        this.ready = false;
    }

    serialize() {
        return {
            ...super.serialize(),
            type: this.type,
            state: this.state,
            direction: this.direction,
            speed: this.speed,
            wanderRadius: this.wanderRadius,
            forageRadius: this.forageRadius,
            hungerRate: this.hungerRate,
            thirstRate: this.thirstRate,
            grazeRecovery: this.grazeRecovery,
            restChance: this.restChance,
            peckDuration: this.peckDuration,
            flockDistance: this.flockDistance,
            vx: this.vx,
            vy: this.vy,
            animTimer: this.animTimer,
            isMoving: this.isMoving,
            aiTimer: this.aiTimer,
            targetX: this.targetX,
            targetY: this.targetY,
            stuckTimer: this.stuckTimer,
            homeX: this.homeX,
            homeY: this.homeY,
            aiSeed: this.aiSeed,
            hunger: this.hunger,
            thirst: this.thirst,
            happiness: this.happiness,
            productionTimer: this.productionTimer,
            productionTime: this.productionTime,
            product: this.product,
            ready: this.ready
        };
    }

    static fromJSON(data) {
        const animal = new Animal(data.type, data.x, data.y);
        Object.assign(animal, data);

        if (!Number.isInteger(animal.aiSeed) || animal.aiSeed === 0) {
            animal.aiSeed = createInitialAiSeed(
                animal.type,
                animal.x,
                animal.y
            );
        }

        if (data.speed < 0.1) {
            animal.speed = AnimalData[data.type]?.movementSpeed ?? 1;
        }

        return animal;
    }
}
