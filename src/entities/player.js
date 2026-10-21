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

        this.maxSpeed = 3.2;
        this.runSpeed = 4.8;
        this.acceleration = 16;
        this.drag = 14;

        this.isMoving = false;

        this.animTimer = 0;

        this.isRiding = false;

        this.mountHorse = null;

        this.interactPressed = false;

        this.marketPressed = false;

        this.inventoryPressed = false;

        this.farmPressed = false;

        this.waterPressed = false;

        this.direction = "south";
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

        ctx.save();
        if (this.direction === "west" || this.direction === "north") {
            ctx.translate(isoX * 2, 0);
            ctx.scale(-1, 1);
        }

        const bounce =
            this.isMoving
                ? Math.abs(
                    Math.sin(
                        this.animTimer * 4
                    )
                ) * 3
                : 0;

        const legSwing = this.isMoving
            ? Math.sin(this.animTimer) * 3
            : 0;
        const feetY = isoY - 2 - bounce;
        ctx.fillStyle = "#624936";
        ctx.beginPath();
        ctx.ellipse(isoX - 5, feetY + legSwing, 4, 2.5, -0.15, 0, Math.PI * 2);
        ctx.ellipse(isoX + 5, feetY - legSwing, 4, 2.5, 0.15, 0, Math.PI * 2);
        ctx.fill();

        const coat = ctx.createLinearGradient(
            isoX - 10,
            isoY - 28 - bounce,
            isoX + 9,
            isoY - 4 - bounce
        );
        coat.addColorStop(0, this.isWorker ? "#8bb38a" : "#d69a59");
        coat.addColorStop(0.55, this.isWorker ? "#547f62" : "#a96842");
        coat.addColorStop(1, this.isWorker ? "#365b4b" : "#754638");
        ctx.fillStyle = coat;
        ctx.strokeStyle = "#674536";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(isoX - 8, isoY - 24 - bounce);
        ctx.quadraticCurveTo(isoX - 12, isoY - 10 - bounce, isoX - 9, isoY - 4 - bounce);
        ctx.quadraticCurveTo(isoX, isoY, isoX + 9, isoY - 4 - bounce);
        ctx.lineTo(isoX + 8, isoY - 24 - bounce);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.strokeStyle = "#815a43";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(isoX - 6, isoY - 4 - bounce);
        ctx.lineTo(isoX - 7, isoY + 1 - bounce + legSwing);
        ctx.moveTo(isoX + 5, isoY - 4 - bounce);
        ctx.lineTo(isoX + 6, isoY + 1 - bounce - legSwing);
        ctx.stroke();

        ctx.fillStyle = "#eac49a";
        ctx.beginPath();
        ctx.arc(isoX, isoY - 30 - bounce, 7.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#815a43";
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = this.isWorker ? "#385244" : "#624936";
        ctx.beginPath();
        ctx.ellipse(isoX, isoY - 34 - bounce, 8, 4.5, 0, Math.PI, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = this.isWorker ? "#9b7547" : "#8c6245";
        ctx.beginPath();
        ctx.ellipse(isoX, isoY - 36 - bounce, 10, 2.5, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#f4d786";
        ctx.beginPath();
        ctx.ellipse(isoX - 5, isoY - 16 - bounce, 2.5, 5, -0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#634631";
        ctx.beginPath();
        ctx.arc(isoX + 3, isoY - 31 - bounce, 1, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
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