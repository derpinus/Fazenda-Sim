import { Entity } from "./entity.js";

import {
    toIso,
    drawShadow
}
from "../core/isoUtils.js";

export class Building extends Entity {

    constructor(
        type,
        x,
        y
    ) {

        super(x, y);

        this.type = type;

        this.status = "idle";

        this.productionTimer = 0;

        this.productionTime = 0;

        this.ready = false;
    }

    draw(ctx) {

        const { isoX, isoY } =
            toIso(this.x, this.y);

        drawShadow(
            ctx,
            isoX,
            isoY + 4,
            20,
            10
        );

        switch (this.type) {

            case "market":

                ctx.font = "30px sans-serif";

                ctx.fillText(
                    "🏪",
                    isoX - 16,
                    isoY - 24
                );

                break;

            case "cheesePress":

                ctx.font = "30px sans-serif";

                ctx.fillText(
                    "🧀",
                    isoX - 16,
                    isoY - 24
                );

                break;

            case "barn":

                ctx.font = "34px sans-serif";

                ctx.fillText(
                    "🏚️",
                    isoX - 18,
                    isoY - 28
                );

                break;

            case "silo":

                ctx.font = "30px sans-serif";

                ctx.fillText(
                    "🏗️",
                    isoX - 16,
                    isoY - 24
                );

                break;

            default:

                ctx.fillStyle =
                    "#f59e0b";

                ctx.fillRect(
                    isoX - 12,
                    isoY - 20,
                    24,
                    24
                );
        }

        // Indicador de produção pronta

        if (this.ready) {

            ctx.font = "14px sans-serif";

            ctx.fillText(
                "✅",
                isoX + 12,
                isoY - 18
            );
        }
    }

    serialize() {

        return {

            ...super.serialize(),

            type: this.type,

            status: this.status,

            productionTimer:
                this.productionTimer,

            productionTime:
                this.productionTime,

            ready: this.ready
        };
    }

    static fromJSON(data) {

        const building =
            new Building(
                data.type,
                data.x,
                data.y
            );

        Object.assign(
            building,
            data
        );

        return building;
    }
}