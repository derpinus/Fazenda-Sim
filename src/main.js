import { Engine } from "./core/engine.js";
import { Renderer } from "./core/renderer.js";

import { GameState } from "./managers/gameState.js";
import { Inventory } from "./managers/inventory.js";
import { SaveManager } from "./managers/saveManager.js";

import { FarmingSystem } from "./systems/farmingsystem.js";
import { HUD } from "./ui/hud.js";
import "./ui/sandbox.js";
import { InputSystem } from "./systems/inputSystem.js";
import { AnimalSystem } from "./systems/animalSystem.js";
import { EconomySystem } from "./systems/economySystem.js";
import { InteractionSystem } from "./systems/interactionSystem.js";
import { DayNightSystem } from "./systems/dayNightSystem.js";
import { Player } from "./entities/player.js";
import { Animal } from "./entities/animal.js";
import { Building } from "./entities/building.js";
import { CropPlot } from "./entities/cropPlot.js";

GameState.inventory =
    new Inventory();

const renderer =
    new Renderer();

const hud = new HUD();
    
const inputSystem = new InputSystem();

const saveManager =
    new SaveManager();

const farmingSystem =
    new FarmingSystem();

const animalSystem =
    new AnimalSystem();

const economySystem =
    new EconomySystem(GameState);

const interactionSystem =
    new InteractionSystem(GameState);

const dayNightSystem =
    new DayNightSystem();

const engine =
    new Engine({

        renderer,

        systems: [
            farmingSystem,
            animalSystem,
            economySystem,
            interactionSystem,
            dayNightSystem,
            hud,
            inputSystem
        ]

    });

window.saveGame = () =>
    saveManager.save();

window.loadGame = () =>
    saveManager.load();

window.deleteSave = () =>
    saveManager.deleteSave();

function initializeWorld() {

    // Limpa estado anterior

    GameState.animals = [];
    GameState.cropPlots = [];
    GameState.buildings = [];

    // Jogador

    GameState.player =
        new Player(12, 12);

    // Animais

    GameState.animals.push(

        new Animal(
            "chicken",
            10,
            10
        )

    );

    // Construções

    GameState.buildings.push(

        new Building(
            "market",
            15,
            10
        )

    );

    GameState.buildings.push(

        new Building(
            "cheesePress",
            18,
            10
        )

    );

    // Plantações

    const wheatPlot =
        new CropPlot(
            "wheat",
            8,
            8
        );

    wheatPlot.state = "ready";

    GameState.cropPlots.push(
        wheatPlot
    );

    console.log(
        "✅ Mundo inicial carregado"
    );
}

window.addEventListener(
    "keydown",
    (e) => {

        if (!GameState.player) {
            return;
        }

        switch (e.code) {

            case "Space":

                GameState.player.interactPressed = true;

                break;
        }
    }
);

if (saveManager.hasSave()) {

    saveManager.load();

    console.log(
        "📂 Save carregado"
    );

} else {

    initializeWorld();

}
window.GameState = GameState;

engine.start();