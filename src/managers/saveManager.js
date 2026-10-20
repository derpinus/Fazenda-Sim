import { GameState } from "./gameState.js";

import { Animal } from "../entities/animal.js";
import { CropPlot } from "../entities/cropPlot.js";
import { Building } from "../entities/building.js";

export class SaveManager {

    save() {

        const saveData = {

            money: GameState.money,

            day: GameState.day,

            season: GameState.season,

            worldTime: GameState.worldTime,

            player: GameState.player,

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

        GameState.money =
            data.money ?? 100;

        GameState.day =
            data.day ?? 1;

        GameState.season =
            data.season ?? "spring";

        GameState.worldTime =
            data.worldTime ?? 0;

        GameState.player =
            data.player ?? null;

        GameState.animals =
            data.animals?.map(Animal.fromJSON) ?? [];

        GameState.cropPlots =
            data.cropPlots?.map(CropPlot.fromJSON) ?? [];

        GameState.buildings =
            data.buildings?.map(Building.fromJSON) ?? [];

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