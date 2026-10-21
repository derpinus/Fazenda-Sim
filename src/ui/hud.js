import { GameState } from "../managers/gameState.js";

export class HUD {

    update() {

        this.updateMoney();
        this.updateInventory();
        this.updateDayInfo();
        this.updateWorldProgress();
        this.setValue("maxCap", GameState.inventoryCapacity);
    }

    updateMoney() {

        const coins =
            document.getElementById("coins");

        if (!coins) return;

        coins.textContent =
            GameState.money;
    }

    updateInventory() {

        const inventory =
            GameState.inventory?.getAll() || {};

        this.setValue(
            "seeds",
            inventory.seed || 0
        );

        this.setValue(
            "wheat",
            inventory.wheat || 0
        );

        this.setValue(
            "milk",
            inventory.milk || 0
        );

        this.setValue(
            "wool",
            inventory.wool || 0
        );

        this.setValue(
            "cheese",
            inventory.cheese || 0
        );

        this.setValue(
            "eggs",
            inventory.egg || 0
        );
        this.setValue("wood", inventory.wood || 0);
        this.setValue("stone", inventory.stone || 0);
        this.setValue("water", inventory.water || 0);
    }

    updateDayInfo() {

        const day =
            document.getElementById("day");

        if (!day) return;

        day.textContent =
            GameState.day;

        const season = document.getElementById("season");

        if (season) {
            season.textContent = GameState.mode === "creative"
                ? `Criativo · ${GameState.worldSeed}`
                : "Primavera";
        }
    }

    updateWorldProgress() {
        const mode = document.getElementById("world-mode");
        const count = document.getElementById("world-guidance");
        const message = document.getElementById("action-message");

        if (mode) {
            mode.textContent = GameState.mode === "creative"
                ? "Modo Criativo · recursos livres"
                : "Modo Aventura";
        }

        if (count) {
            const exploredCount = GameState.exploredTiles
                ?.reduce((total, column) => total + column.filter(Boolean).length, 0) ?? 0;
            const mapSize = GameState.world?.tiles.length ?? 1;
            count.textContent = `Mapa revelado: ${Math.floor(exploredCount / (mapSize * mapSize) * 100)}%`;
        }

        if (message) {
            message.textContent = GameState.actionMessage;
        }
    }

    setValue(id, value) {

        const element =
            document.getElementById(id);

        if (!element) return;

        element.textContent = value;
    }
}