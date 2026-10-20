import { Entity } from "./entity.js";

export class Player extends Entity {

    constructor(x = 8, y = 8) {

        super(x, y);

        this.vx = 0;
        this.vy = 0;

        this.maxSpeed = 0.018;

        this.accel = 0.0035;

        this.friction = 0.78;

        this.isMoving = false;

        this.animTimer = 0;

        this.isRiding = false;

        this.mountHorse = null;
    }

    update(deltaTime) {

    }
}