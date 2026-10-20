export class InteractionSystem {
    constructor(gameState) {
        this.gameState = gameState;
    }

    update(deltaTime) {

        const player = this.gameState.player;

        if (!player) return;

        if (player.interactPressed) {

            this.handleInteraction();

            player.interactPressed = false;
        }
    }

    handleInteraction() {

        console.log("Interação executada");
    }
}