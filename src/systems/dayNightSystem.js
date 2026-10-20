import { GameState } from "../managers/gameState.js";

export class DayNightSystem {

    update(deltaTime) {

        GameState.worldTime += deltaTime;
    }
}