import { Entity } from "./entity.js";

export class Animal extends Entity {

    constructor(
        type,
        x,
        y
    ) {

        super(x, y);

        this.type = type;

        this.hunger = 100;

        this.happiness = 100;

        this.productionTimer = 0;

        this.productionTime = 60;

        this.product = "egg";

        this.ready = false;
    }

    serialize() {

        return {

            ...super.serialize(),

            type: this.type,

            hunger: this.hunger,

            happiness: this.happiness,

            productionTimer:
                this.productionTimer,

            productionTime:
                this.productionTime,

            product: this.product,

            ready: this.ready
        };
    }

    static fromJSON(data) {

        const animal = new Animal(
            data.type,
            data.x,
            data.y
        );

        Object.assign(
            animal,
            data
        );

        return animal;
    }
}