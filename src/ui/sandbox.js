import { GameState } from "../managers/gameState.js";
import { Animal } from "../entities/animal.js";
import { Building } from "../entities/building.js";
import { CropPlot } from "../entities/cropPlot.js";
import { MAP_SIZE } from "../core/config.js";
import { toGrid } from "../core/isoUtils.js";

let currentTool = null;

export function setSandboxTool(tool) {
    currentTool = tool;

    const label = document.getElementById("current-tool-label");

    if (label) {
        label.textContent = `Ferramenta Ativa: ${tool}`;
    }
}

function toGridPosition(event, canvas) {
    const bounds = canvas.getBoundingClientRect();
    const screenX = (event.clientX - bounds.left) * canvas.width / bounds.width;
    const screenY = (event.clientY - bounds.top) * canvas.height / bounds.height;
    return toGrid(screenX, screenY);
}

function removeAt(x, y) {
    const collections = [
        GameState.animals,
        GameState.buildings,
        GameState.cropPlots,
        GameState.world.decorations
    ];
    let closest = null;

    for (const collection of collections) {
        for (const entity of collection) {
            const distance = Math.hypot(entity.x - x, entity.y - y);

            if (distance < 0.9 && (!closest || distance < closest.distance)) {
                closest = { collection, entity, distance };
            }
        }
    }

    if (closest) {
        closest.collection.splice(
            closest.collection.indexOf(closest.entity),
            1
        );
    }
}

function placeAt(tool, x, y) {
    if (tool === "remove") {
        removeAt(x, y);
        return;
    }

    if (["chicken", "cow", "sheep", "horse"].includes(tool)) {
        GameState.animals.push(new Animal(tool, x, y));
        return;
    }

    if (["market", "cheesePress"].includes(tool)) {
        GameState.buildings.push(new Building(tool, x, y));
        return;
    }

    if (tool === "plot" || tool === "corn") {
        const plot = new CropPlot(tool === "corn" ? "corn" : "wheat", x, y);
        GameState.cropPlots.push(plot);
        return;
    }

    if (tool === "obstacle" || tool === "pasture") {
        GameState.world.decorations.push({
            type: tool === "obstacle" ? "rock" : "fence",
            x,
            y,
            variation: 0.5
        });
    }
}

const canvas = document.getElementById("gameCanvas");
canvas.addEventListener("click", event => {
    if (
        GameState.mode !== "creative" ||
        !currentTool ||
        !GameState.world
    ) {
        return;
    }

    const position = toGridPosition(event, canvas);

    if (
        position.x < 0 ||
        position.y < 0 ||
        position.x >= MAP_SIZE ||
        position.y >= MAP_SIZE
    ) {
        return;
    }

    placeAt(currentTool, position.x, position.y);
});

window.setSandboxTool = setSandboxTool;
