import { GameState } from "../managers/gameState.js";
import { MAP_SIZE } from "../core/config.js";

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

        const speed = 4 * deltaTime;

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

        const length =
            Math.hypot(
                moveX,
                moveY
            );

        if (length > 0) {

            moveX /= length;
            moveY /= length;

            player.x +=
                moveX * speed;

            player.y +=
                moveY * speed;

            player.isMoving = true;

            player.animTimer +=
                deltaTime * 6;

        } else {

            player.isMoving = false;

        }

        // Limites do mapa

        player.x = Math.max(
            0.5,
            Math.min(
                MAP_SIZE - 0.5,
                player.x
            )
        );

        player.y = Math.max(
            0.5,
            Math.min(
                MAP_SIZE - 0.5,
                player.y
            )
        );

        // Direção para sprites futuros

        if (moveX !== 0 || moveY !== 0) {

            if (moveX > 0 && moveY < 0) {
                player.direction = "east";
            }
            else if (moveX < 0 && moveY > 0) {
                player.direction = "west";
            }
            else if (moveX < 0 && moveY < 0) {
                player.direction = "north";
            }
            else if (moveX > 0 && moveY > 0) {
                player.direction = "south";
            }
        }
    }
}