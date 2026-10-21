export class EconomySystem {

    constructor(gameState) {
        this.gameState = gameState;
    }

    addMoney(value) {

        this.gameState.money += value;
    }

    spendMoney(value) {

        if (this.gameState.mode === "creative") {
            return true;
        }

        if (this.gameState.money < value) {
            return false;
        }

        this.gameState.money -= value;

        return true;
    }

    update() {

    }
}