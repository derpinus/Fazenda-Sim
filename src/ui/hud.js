import { GameState } from "../managers/gameState.js";

export class HUD {

    update() {

        this.updateMoney();
        this.updateInventory();
        this.updateDayInfo();
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
    }

    updateDayInfo() {

        const day =
            document.getElementById("day");

        if (!day) return;

        day.textContent =
            GameState.day;
    }

    setValue(id, value) {

        const element =
            document.getElementById(id);

        if (!element) return;

        element.textContent = value;
    }
}