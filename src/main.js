import { Engine } from "./core/engine.js";
import { Renderer } from "./core/renderer.js";

import { GameState } from "./managers/gameState.js";
import { Inventory } from "./managers/inventory.js";
import { SaveManager } from "./managers/saveManager.js";

import { FarmingSystem } from "./systems/farmingsystem.js";
import { AnimalSystem } from "./systems/animalSystem.js";
import { EconomySystem } from "./systems/economySystem.js";
import { InteractionSystem } from "./systems/interactionSystem.js";
import { DayNightSystem } from "./systems/dayNightSystem.js";

GameState.inventory =
    new Inventory();

const renderer =
    new Renderer();

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
            dayNightSystem
        ]

    });

window.saveGame = () =>
    saveManager.save();

window.loadGame = () =>
    saveManager.load();

window.deleteSave = () =>
    saveManager.deleteSave();

engine.start();