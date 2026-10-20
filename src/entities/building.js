import { Entity } from "./entity.js";

export class Building extends Entity {

    constructor(
        type,
        x,
        y
    ) {

        super(x, y);

        this.type = type;

        this.status = "idle";
    }

    serialize() {

        return {

            ...super.serialize(),

            type: this.type,

            status: this.status
        };
    }

    static fromJSON(data) {

        const building = new Building(
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