import { Entity } from "./entity.js";

import {
    toIso,
    drawShadow
} from "../core/isoUtils.js";

export class Player extends Entity {

    constructor(x = 64, y = 64) {

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

        this.interactPressed = false;

        this.marketPressed = false;

        this.inventoryPressed = false;
    }

    update(deltaTime) {

    }

    draw(ctx) {

        const {
            isoX,
            isoY
        } = toIso(
            this.x,
            this.y
        );

        drawShadow(
            ctx,
            isoX,
            isoY,
            14,
            7
        );

        const bounce =
            this.isMoving
                ? Math.abs(
                    Math.sin(
                        this.animTimer * 4
                    )
                ) * 3
                : 0;

        ctx.fillStyle =
            "#3b82f6";

        ctx.beginPath();

        ctx.arc(
            isoX,
            isoY - 16 - bounce,
            12,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.fillStyle =
            "#f8fafc";

        ctx.beginPath();

        ctx.arc(
            isoX,
            isoY - 34 - bounce,
            7,
            0,
            Math.PI * 2
        );

        ctx.fill();
    }

    serialize() {

        return {

            ...super.serialize(),

            vx: this.vx,

            vy: this.vy,

            isMoving:
                this.isMoving,

            isRiding:
                this.isRiding
        };
    }

    static fromJSON(data) {

        const player =
            new Player(
                data.x,
                data.y
            );

        Object.assign(
            player,
            data
        );

        return player;
    }
}