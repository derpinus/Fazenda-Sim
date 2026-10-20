import { Entity } from "./entity.js";

export class CropPlot extends Entity {

    constructor(
        type,
        x,
        y
    ) {

        super(x, y);

        this.type = type;

        this.state = "empty";

        this.growth = 0;

        this.growthTime = 60;

        this.ready = false;
    }

    serialize() {

        return {

            ...super.serialize(),

            type: this.type,

            state: this.state,

            growth: this.growth,

            growthTime: this.growthTime,

            ready: this.ready
        };
    }

    static fromJSON(data) {

        const plot = new CropPlot(
            data.type,
            data.x,
            data.y
        );

        Object.assign(
            plot,
            data
        );

        return plot;
    }
}