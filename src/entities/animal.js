import { Entity } from "./entity.js";

import {
    toIso,
    drawShadow
} from "../core/isoUtils.js";

export class Animal extends Entity {

    constructor(type, x, y) {

        super(x, y);

        this.type = type;

        // IA / Estados

        this.state = "idle";

        this.direction = "south";

        this.speed = 0.001;

        // Necessidades

        this.hunger = 100;

        this.happiness = 100;

        // Produção

        this.productionTimer = 0;

        this.productionTime = 60;

        this.product = "egg";

        this.ready = false;
    }

    draw(ctx) {

        const { isoX, isoY } =
            toIso(this.x, this.y);

        drawShadow(
            ctx,
            isoX,
            isoY,
            12,
            6
        );

        switch (this.type) {

            case "chicken":

                ctx.font = "20px sans-serif";

                ctx.fillText(
                    "🐔",
                    isoX - 10,
                    isoY - 16
                );

                break;

            case "cow":

                ctx.font = "24px sans-serif";

                ctx.fillText(
                    "🐄",
                    isoX - 12,
                    isoY - 18
                );

                break;

            case "sheep":

                ctx.font = "24px sans-serif";

                ctx.fillText(
                    "🐑",
                    isoX - 12,
                    isoY - 18
                );

                break;

            case "horse":

                ctx.font = "24px sans-serif";

                ctx.fillText(
                    "🐎",
                    isoX - 12,
                    isoY - 18
                );

                break;

            default:

                ctx.fillStyle =
                    "#ef4444";

                ctx.beginPath();

                ctx.arc(
                    isoX,
                    isoY,
                    8,
                    0,
                    Math.PI * 2
                );

                ctx.fill();
        }

        // Indicador de produção pronta

        if (this.ready) {

            ctx.font = "14px sans-serif";

            ctx.fillText(
                "✅",
                isoX + 10,
                isoY - 20
            );
        }
    }

    serialize() {

        return {

            ...super.serialize(),

            type: this.type,

            state: this.state,

            direction: this.direction,

            speed: this.speed,

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

        const animal =
            new Animal(
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