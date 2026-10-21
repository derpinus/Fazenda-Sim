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
import { SoundManager } from "./core/soundManager.js";
import { MAP_SIZE } from "./core/config.js";
import { generateWorld } from "./core/worldGenerator.js";
import { WorldMapSystem } from "./systems/worldMapSystem.js";
import { WorkerSystem } from "./systems/workerSystem.js";
import "./systems/constructionSystem.js";
import "./ui/shopUI.js";

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
    new AnimalSystem(GameState);

const economySystem =
    new EconomySystem(GameState);

const soundManager =
    new SoundManager();

const interactionSystem =
    new InteractionSystem(
        GameState,
        soundManager,
        farmingSystem,
        animalSystem
    );

const dayNightSystem =
    new DayNightSystem();

const worldMapSystem =
    new WorldMapSystem();

const workerSystem = new WorkerSystem();

const engine =
    new Engine({

        renderer,

        systems: [
            farmingSystem,
            animalSystem,
            economySystem,
            interactionSystem,
            dayNightSystem,
            worldMapSystem,
            workerSystem,
            hud,
            inputSystem
        ]

    });

window.saveGame = () =>
    saveManager.save();

window.loadGame = () =>
    window.continueGame();

window.deleteSave = () =>
    saveManager.deleteSave();

function initializeWorld() {

    GameState.animals = [];
    GameState.workers = [];
    GameState.selectedWorkerId = null;
    GameState.workerCommand = null;
    GameState.cropPlots = [];
    GameState.buildings = [];
    GameState.exploredTiles = [];
    GameState.visibleTiles = [];
    GameState.buildPreview = null;
    GameState.actionMessage = "";
    GameState.day = 1;
    GameState.season = "spring";
    GameState.worldTime = 0;
    GameState.inventoryCapacity = 5;
    GameState.inventory = new Inventory();
    GameState.world = generateWorld(GameState.worldSeed);
    GameState.money = GameState.mode === "creative" ? 999999 : 100;

    const scale = MAP_SIZE / 24;
    GameState.player = new Player(12 * scale, 13 * scale);
    workerSystem.createStartingWorkers();
    worldMapSystem.update();
    GameState.animals.push(
        new Animal("chicken", 10.5 * scale, 14 * scale),
        new Animal("chicken", 11.5 * scale, 14.5 * scale),
        new Animal("cow", 10.5 * scale, 15.2 * scale)
    );
    GameState.buildings.push(
        new Building("farmhouse", 10.5 * scale, 12 * scale),
        new Building("barn", 14 * scale, 12 * scale),
        new Building("market", 15 * scale, 14 * scale),
        new Building("cheesePress", 14.5 * scale, 14.5 * scale)
    );

    for (let x = 10 * scale; x <= 13 * scale; x++) {
        for (let y = 11 * scale; y <= 13 * scale; y++) {
            const cropPlot = new CropPlot(
                x === 13 * scale && y === 13 * scale ? "corn" : "wheat",
                x + 0.25,
                y + 0.25
            );

            if (
                Math.floor(x) === Math.floor(11 * scale) &&
                Math.floor(y) === Math.floor(12 * scale)
            ) {
                cropPlot.state = "ready";
                cropPlot.ready = true;
            } else {
                cropPlot.state = "growing";
                cropPlot.growth = (x + y) % 12;
                cropPlot.growthTime = 35;
            }

            GameState.cropPlots.push(cropPlot);
        }
    }

    if (GameState.mode === "creative") {
        GameState.inventory.add("seed", 999);
        GameState.inventory.add("wheat", 999);
        GameState.inventory.add("milk", 999);
        GameState.inventory.add("egg", 999);
        GameState.inventory.add("corn", 999);
        GameState.inventory.add("wood", 999);
        GameState.inventory.add("stone", 999);
        GameState.inventory.add("water", 999);
    }
}

function enterGame() {
    document.getElementById("welcome-screen").style.display = "none";
    document.getElementById("save-controls").style.display = "flex";
    document.getElementById("test-sandbox-panel").style.display =
        GameState.mode === "creative" ? "block" : "none";
    document.getElementById("worker-panel").hidden = false;
    workerSystem.updatePanel();
}

window.startNewGame = (mode) => {
    const seedInput = document.getElementById("world-seed");
    GameState.mode = mode === "creative" ? "creative" : "adventure";
    GameState.worldSeed = seedInput.value.trim() || "Fazenda dos Sonhos";
    initializeWorld();
    enterGame();
};

window.continueGame = () => {
    if (!saveManager.load()) {
        return;
    }

    enterGame();
};

window.randomizeSeed = () => {
    document.getElementById("world-seed").value =
        `Fazenda ${Math.floor(Math.random() * 900000) + 100000}`;
};

window.toggleHud = () => {
    const hud = document.getElementById("ui");
    const button = document.getElementById("hud-toggle");
    const collapsed = hud.classList.toggle("hud-collapsed");
    button.textContent = collapsed ? "+" : "−";
    button.setAttribute("aria-expanded", String(!collapsed));
    button.setAttribute("aria-label", collapsed ? "Expandir painel" : "Recolher painel");
};

if (saveManager.hasSave()) {
    document.getElementById("continue-game").style.display = "block";
}

window.GameState = GameState;

engine.start();