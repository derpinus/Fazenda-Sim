export class InteractionSystem {

    constructor(gameState, soundManager, farmingSystem, animalSystem) {

        this.gameState = gameState;
        this.soundManager = soundManager;
        this.farmingSystem = farmingSystem;
        this.animalSystem = animalSystem;
    }

    update() {

        const player =
            this.gameState.player;

        if (!player) {
            return;
        }

        if (player.interactPressed || player.marketPressed) {

            this.handleInteraction();

            player.interactPressed = false;
            player.marketPressed = false;
        }

        if (player.farmPressed) {
            this.handleFarmAction();
            player.farmPressed = false;
        }

        if (player.waterPressed) {
            this.handleWaterAction();
            player.waterPressed = false;
        }
    }

    handleFarmAction() {
        const player = this.gameState.player;
        const inventory = this.gameState.inventory;
        const nearbyPlot = this.gameState.cropPlots.find(
            plot =>
                plot.state === "empty" &&
                Math.hypot(plot.x - player.x, plot.y - player.y) < 1.5
        );

        if (nearbyPlot) {
            if (!inventory?.remove("seed", 1)) {
                this.showActionMessage("Compre sementes no mercado para plantar.");
                return;
            }

            this.farmingSystem?.plant(nearbyPlot, "wheat", 25);
            this.showActionMessage("Semente plantada. Ela vai crescer com o tempo!");
            return;
        }

        const nearbyAnimal = this.gameState.animals.find(
            animal =>
                Math.hypot(animal.x - player.x, animal.y - player.y) < 1.5
        );

        if (nearbyAnimal) {
            const food = inventory?.has("corn", 1) ? "corn" : "wheat";

            if (!inventory?.remove(food, 1)) {
                this.showActionMessage("Use trigo ou milho para alimentar o animal.");
                return;
            }

            this.animalSystem?.feed(nearbyAnimal, 40);
            this.showActionMessage(`${nearbyAnimal.type} alimentado com ${food}.`);
            return;
        }

        this.showActionMessage("Aproxime-se de um canteiro ou animal.");
    }

    showActionMessage(message) {
        this.gameState.actionMessage = message;

        window.setTimeout(() => {
            if (this.gameState.actionMessage === message) {
                this.gameState.actionMessage = "";
            }
        }, 3000);
    }

    handleWaterAction() {
        const player = this.gameState.player;
        const animal = this.gameState.animals.find(
            candidate => Math.hypot(candidate.x - player.x, candidate.y - player.y) < 1.7
        );

        if (!animal) {
            this.showActionMessage("Aproxime-se de um animal para dar água.");
            return;
        }

        if (!this.gameState.inventory?.remove("water", 1)) {
            this.showActionMessage("Busque água no poço ou na lagoa (ESPAÇO).");
            return;
        }

        animal.thirst = 100;
        this.showActionMessage(`${animal.type} bebeu água.`);
    }

    handleInteraction() {

        const player =
            this.gameState.player;

        const nearbyGate = this.gameState.world?.decorations.find(
            item => item.type === "gate" &&
                Math.hypot(item.x - player.x, item.y - player.y) < 1.5
        );
        if (nearbyGate) {
            nearbyGate.open = !nearbyGate.open;
            this.showActionMessage(`Portão ${nearbyGate.open ? "aberto" : "fechado"}.`);
            return;
        }

        const nearbyTree = this.gameState.world?.decorations.find(
            item => item.type === "tree" && Math.hypot(item.x - player.x, item.y - player.y) < 1.6
        );
        if (nearbyTree) {
            this.gameState.world.decorations.splice(
                this.gameState.world.decorations.indexOf(nearbyTree),
                1
            );
            this.gameState.inventory?.add("wood", 4);
            this.showActionMessage("Árvore derrubada: +4 madeira.");
            return;
        }

        const nearbyRock = this.gameState.world?.decorations.find(
            item => item.type === "rock" && Math.hypot(item.x - player.x, item.y - player.y) < 1.4
        );
        if (nearbyRock) {
            this.gameState.world.decorations.splice(
                this.gameState.world.decorations.indexOf(nearbyRock),
                1
            );
            this.gameState.inventory?.add("stone", 2);
            this.showActionMessage("Pedra coletada: +2 pedra.");
            return;
        }

        const nearbyWell = this.gameState.buildings.find(
            building => building.type === "well" && Math.hypot(building.x - player.x, building.y - player.y) < 2
        );
        const pond = this.gameState.world?.pond;
        const atPond = pond && Math.hypot(pond.x - player.x, pond.y - player.y) < 3;
        if (nearbyWell || atPond) {
            this.gameState.inventory?.add("water", 5);
            this.showActionMessage("Balde cheio: +5 água. Use G perto de um animal.");
            return;
        }

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
                plot.growth = 0;
                plot.ready = false;

                console.log(
                    "🌾 Colheita realizada"
                );

                this.gameState.inventory?.add(
                    "wheat",
                    1
                );

                this.soundManager?.playCollect();

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

                this.soundManager?.playCollect();

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

                case "well":
                    this.gameState.inventory?.add("water", 5);
                    this.showActionMessage("Balde cheio: +5 água. Use G perto de um animal.");
                    return;
            }
        }
    }
}