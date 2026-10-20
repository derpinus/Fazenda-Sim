export class Entity {

    constructor(x = 0, y = 0) {

        this.id = crypto.randomUUID();

        this.x = x;

        this.y = y;

        this.active = true;
    }

    update(deltaTime) {

    }

    render(ctx) {

    }

    serialize() {

        return {

            id: this.id,

            x: this.x,

            y: this.y,

            active: this.active
        };
    }

    deserialize(data) {

        this.id = data.id;

        this.x = data.x;

        this.y = data.y;

        this.active = data.active;
    }
}