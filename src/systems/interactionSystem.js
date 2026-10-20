import { GameState } from "../managers/gameState.js";

export class InteractionSystem {

    constructor(gameState) {

        this.gameState = gameState;
    }

    update() {

        const player =
            this.gameState.player;

        if (!player) {
            return;
        }

        if (player.interactPressed) {

            this.handleInteraction();

            player.interactPressed = false;
        }
    }

    handleInteraction() {

        const player =
            this.gameState.player;

        // ==================
        // Plantações
        // ==================

        for (const plot of this.gameState.cropPlots) {

            const dist = Math.hypot(
                plot.x - player.x,
                plot.y - player.y
            );

            if (
                dist < 1.5 &&
                plot.state === "ready"
            ) {

                plot.state = "empty";

                console.log(
                    "🌾 Colheita realizada"
                );

                this.gameState.inventory?.add(
                    "wheat",
                    1
                );

                return;
            }
        }

        // ==================
        // Animais
        // ==================

        for (const animal of this.gameState.animals) {

            const dist = Math.hypot(
                animal.x - player.x,
                animal.y - player.y
            );

            if (
                dist < 1.5 &&
                animal.ready
            ) {

                animal.ready = false;

                this.gameState.inventory?.add(
                    animal.product,
                    1
                );

                console.log(
                    `✅ Coletado: ${animal.product}`
                );

                return;
            }
        }

        // ==================
        // Construções
        // ==================

        for (const building of this.gameState.buildings) {

            const dist = Math.hypot(
                building.x - player.x,
                building.y - player.y
            );

            if (dist > 2) {
                continue;
            }

            switch (building.type) {

                case "market":

                    console.log(
                        "🏪 Mercado aberto"
                    );

                    const shop =
                        document.getElementById(
                            "shop-modal"
                        );

                    if (shop) {

                        shop.style.display =
                            "block";
                    }

                    return;

                case "cheesePress":

                    console.log(
                        "🧀 Interagiu com a prensa"
                    );

                    return;
            }
        }
    }
}