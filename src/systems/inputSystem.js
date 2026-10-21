import { GameState } from "../managers/gameState.js";
import { moveWithCollision } from "../core/worldCollision.js";

export class InputSystem {

    constructor() {

        this.keys = {};

        window.addEventListener(
            "keydown",
            this.onKeyDown.bind(this)
        );

        window.addEventListener(
            "keyup",
            this.onKeyUp.bind(this)
        );
    }

    onKeyDown(event) {

        this.keys[event.code] = true;

        if (
            [
                "ArrowUp",
                "ArrowDown",
                "ArrowLeft",
                "ArrowRight",
                "Space"
            ].includes(event.code)
        ) {
            event.preventDefault();
        }

        if (
            event.repeat &&
            ["Space", "KeyE", "KeyI", "KeyF", "KeyG"].includes(event.code)
        ) {
            return;
        }

        const player = GameState.player;

        if (!player) return;

        switch (event.code) {

            case "Space":

                player.interactPressed = true;
                break;

            case "KeyE":

                player.marketPressed = true;
                break;

            case "KeyI":

                player.inventoryPressed = true;
                break;

            case "KeyF":

                player.farmPressed = true;
                break;

            case "KeyG":

                player.waterPressed = true;
                break;
        }
    }

    onKeyUp(event) {

        this.keys[event.code] = false;
    }

    isPressed(key) {

        return !!this.keys[key];
    }

    update(deltaTime) {

        const player = GameState.player;

        if (!player) return;

        let moveX = 0;
        let moveY = 0;

        if (
            this.keys["KeyW"] ||
            this.keys["ArrowUp"]
        ) {
            moveY -= 1;
        }

        if (
            this.keys["KeyS"] ||
            this.keys["ArrowDown"]
        ) {
            moveY += 1;
        }

        if (
            this.keys["KeyA"] ||
            this.keys["ArrowLeft"]
        ) {
            moveX -= 1;
        }

        if (
            this.keys["KeyD"] ||
            this.keys["ArrowRight"]
        ) {
            moveX += 1;
        }

        const inputLength = Math.hypot(moveX, moveY);

        if (inputLength > 0) {
            moveX /= inputLength;
            moveY /= inputLength;
            const topSpeed = this.keys["ShiftLeft"] || this.keys["ShiftRight"]
                ? player.runSpeed
                : player.maxSpeed;

            player.vx += moveX * player.acceleration * deltaTime;
            player.vy += moveY * player.acceleration * deltaTime;
            const speed = Math.hypot(player.vx, player.vy);

            if (speed > topSpeed) {
                player.vx = player.vx / speed * topSpeed;
                player.vy = player.vy / speed * topSpeed;
            }

            player.direction = this.getDirection(moveX, moveY);
        } else {
            const drag = Math.exp(-player.drag * deltaTime);
            player.vx *= drag;
            player.vy *= drag;

            if (Math.hypot(player.vx, player.vy) < 0.04) {
                player.vx = 0;
                player.vy = 0;
            }
        }

        const nextX = player.x + player.vx * deltaTime;
        const nextY = player.y + player.vy * deltaTime;
        const previousX = player.x;
        const previousY = player.y;
        const moved = moveWithCollision(
            player,
            nextX,
            nextY,
            0.24
        );

        if (Math.abs(player.x - nextX) > 0.0001) {
            player.vx = 0;
        }

        if (Math.abs(player.y - nextY) > 0.0001) {
            player.vy = 0;
        }

        const actualSpeed = Math.hypot(player.vx, player.vy);
        player.isMoving = moved && actualSpeed > 0.12;

        if (!moved && inputLength > 0) {
            player.vx *= 0.2;
            player.vy *= 0.2;
        }

        if (player.isMoving) {
            player.animTimer += deltaTime * (actualSpeed > player.maxSpeed ? 13 : 9);
        }
    }

    getDirection(x, y) {
        if (Math.abs(x) > Math.abs(y)) {
            return x > 0 ? "east" : "west";
        }

        return y > 0 ? "south" : "north";
    }
}