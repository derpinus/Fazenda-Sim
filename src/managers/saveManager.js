import { GameState } from "./gameState.js";

import { Animal } from "../entities/animal.js";
import { CropPlot } from "../entities/cropPlot.js";
import { Building } from "../entities/building.js";
import { Player } from "../entities/player.js";
import { Worker } from "../entities/worker.js";
import { generateWorld } from "../core/worldGenerator.js";
import { MAP_SIZE } from "../core/config.js";
import { canOccupy } from "../core/worldCollision.js";

export class SaveManager {

    save() {

        const saveData = {

            money: GameState.money,

            day: GameState.day,

            season: GameState.season,

            worldTime: GameState.worldTime,

            mode: GameState.mode,

            worldSeed: GameState.worldSeed,

            mapVersion: 6,

            decorations: GameState.world?.decorations ?? [],

            inventoryCapacity: GameState.inventoryCapacity,

            exploredTiles: GameState.exploredTiles,

            player: GameState.player,

            workers: GameState.workers.map(worker => worker.serialize()),

            selectedWorkerId: GameState.selectedWorkerId,

            animals:
                GameState.animals.map(
                    animal => animal.serialize()
                ),

            cropPlots:
                GameState.cropPlots.map(
                    plot => plot.serialize()
                ),

            buildings:
                GameState.buildings.map(
                    building => building.serialize()
                ),

            inventory: GameState.inventory
                ? GameState.inventory.getAll()
                : {}
        };

        localStorage.setItem(
            "fazenda_save",
            JSON.stringify(saveData)
        );

        console.log("💾 Jogo salvo");
    }

    load() {

        const rawData =
            localStorage.getItem(
                "fazenda_save"
            );

        if (!rawData) {

            console.log(
                "Nenhum save encontrado"
            );

            return false;
        }

        const data =
            JSON.parse(rawData);
        if ((data.mapVersion ?? 1) < 6) {
            const sourceSize = data.mapVersion >= 3
                ? MAP_SIZE
                : data.mapVersion >= 2 ? 48 : 24;
            const scale = MAP_SIZE / sourceSize;
            const scalePosition = entity => {
                if (!entity) return;
                entity.x *= scale;
                entity.y *= scale;
                for (const key of ["homeX", "homeY", "targetX", "targetY"]) {
                    if (Number.isFinite(entity[key])) entity[key] *= scale;
                }
            };
            scalePosition(data.player);
            for (const collection of [data.animals, data.cropPlots, data.buildings, data.decorations]) {
                collection?.forEach(scalePosition);
            }
            if (Array.isArray(data.exploredTiles)) {
                const explored = Array.from(
                    { length: MAP_SIZE },
                    () => Array(MAP_SIZE).fill(false)
                );
                for (let x = 0; x < MAP_SIZE; x++) {
                    for (let y = 0; y < MAP_SIZE; y++) {
                        explored[x][y] = !!data.exploredTiles[
                            Math.floor(x / scale)
                        ]?.[Math.floor(y / scale)];
                    }
                }
                data.exploredTiles = explored;
            }
            data.decorations = data.decorations?.filter(
                decoration => decoration.type !== "dock"
            );
            data.mapVersion = 6;
        }

        GameState.money =
            data.money ?? 100;

        GameState.day =
            data.day ?? 1;

        GameState.season =
            data.season ?? "spring";

        GameState.worldTime =
            data.worldTime ?? 0;

        GameState.player =
            data.player
                ? Player.fromJSON(data.player)
                : null;

        GameState.workers =
            data.workers?.map(Worker.fromJSON) ?? [];
        GameState.selectedWorkerId =
            GameState.workers.some(worker => worker.id === data.selectedWorkerId)
                ? data.selectedWorkerId
                : GameState.workers[0]?.id ?? null;
        GameState.workerCommand = null;

        GameState.animals =
            data.animals?.map(Animal.fromJSON) ?? [];

        GameState.cropPlots =
            data.cropPlots?.map(CropPlot.fromJSON) ?? [];

        GameState.buildings =
            data.buildings?.map(Building.fromJSON) ?? [];

        GameState.mode =
            data.mode === "creative" ? "creative" : "adventure";

        GameState.worldSeed =
            data.worldSeed ?? "Fazenda antiga";

        GameState.inventoryCapacity =
            data.inventoryCapacity ?? 5;

        GameState.world =
            generateWorld(GameState.worldSeed);
        if (Array.isArray(data.decorations)) {
            const borderScenery = GameState.world.decorations.filter(
                decoration => decoration.type === "mountain" ||
                    ["tree", "rock"].includes(decoration.type) &&
                    Math.min(
                        decoration.x,
                        decoration.y,
                        MAP_SIZE - decoration.x,
                        MAP_SIZE - decoration.y
                    ) <= 11
            );
            const savedDecorations = data.decorations.filter(
                decoration => !["tree", "rock", "mountain"].includes(decoration.type) ||
                    Math.min(
                        decoration.x,
                        decoration.y,
                        MAP_SIZE - decoration.x,
                        MAP_SIZE - decoration.y
                    ) > 11
            );
            GameState.world.decorations = [...savedDecorations, ...borderScenery];
        }
        if (!GameState.workers.length && GameState.player) {
            const candidates = [
                [1.15, 0.2], [-0.15, 1.15], [1.15, -0.6], [-1.1, -0.7],
                [0.1, 1.7], [1.8, 0.9], [-1.5, 0.2], [0.3, -1.5]
            ];
            for (const [dx, dy] of candidates) {
                const x = GameState.player.x + dx;
                const y = GameState.player.y + dy;
                if (!canOccupy(x, y, 0.22)) continue;
                GameState.workers.push(new Worker(x, y));
                if (GameState.workers.length === 2) break;
            }
            for (let radius = 0.5; GameState.workers.length < 2 && radius <= 3; radius += 0.5) {
                for (let dx = -radius; dx <= radius && GameState.workers.length < 2; dx += 0.5) {
                    for (let dy = -radius; dy <= radius && GameState.workers.length < 2; dy += 0.5) {
                        const x = GameState.player.x + dx;
                        const y = GameState.player.y + dy;
                        if (
                            GameState.workers.some(worker => Math.hypot(worker.x - x, worker.y - y) < 0.55) ||
                            !canOccupy(x, y, 0.22)
                        ) continue;
                        GameState.workers.push(new Worker(x, y));
                    }
                }
            }
            GameState.selectedWorkerId = GameState.workers[0]?.id ?? null;
        }

        GameState.exploredTiles =
            data.exploredTiles ?? [];

        if (GameState.inventory) {
            GameState.inventory.items = { ...data.inventory };
        }

        console.log("📂 Save carregado");

        return data;
    }

    deleteSave() {

        localStorage.removeItem(
            "fazenda_save"
        );

        console.log(
            "🗑 Save removido"
        );
    }

    hasSave() {

        return (
            localStorage.getItem(
                "fazenda_save"
            ) !== null
        );
    }
}