import { GameState } from "../managers/gameState.js";

export class WorldMapSystem {
    constructor() {
        this.lastTileX = -1;
        this.lastTileY = -1;
        this.lastWorld = null;
    }

    update() {
        if (
            !GameState.player ||
            !GameState.world
        ) {
            return;
        }

        const size = GameState.world.tiles.length;
        const playerTileX = Math.floor(GameState.player.x);
        const playerTileY = Math.floor(GameState.player.y);
        if (
            GameState.world === this.lastWorld &&
            playerTileX === this.lastTileX &&
            playerTileY === this.lastTileY
        ) {
            return;
        }
        this.lastWorld = GameState.world;
        this.lastTileX = playerTileX;
        this.lastTileY = playerTileY;
        const radius = 11;
        GameState.visibleTiles = Array.from(
            { length: size },
            () => Array(size).fill(false)
        );
        if (GameState.exploredTiles?.length !== size) {
            GameState.exploredTiles = Array.from(
                { length: size },
                () => Array(size).fill(false)
            );
        }

        for (let x = 0; x < size; x++) {
            for (let y = 0; y < size; y++) {
                if (
                    Math.hypot(
                        x + 0.5 - GameState.player.x,
                        y + 0.5 - GameState.player.y
                    ) <= radius
                ) {
                    GameState.visibleTiles[x][y] = true;
                    GameState.exploredTiles[x][y] = true;
                }
            }
        }
    }
}
