import { GameState } from "../managers/gameState.js";

export class FarmingSystem {

    update(deltaTime) {

        if (!GameState.cropPlots?.length) {
            return;
        }

        for (const plot of GameState.cropPlots) {

            if (plot.state !== "growing") {
                continue;
            }

            plot.growth += deltaTime;

            if (plot.growth >= plot.growthTime) {

                plot.state = "ready";

                plot.ready = true;
            }
        }
    }

    plant(plot, cropType, growthTime) {

        plot.type = cropType;

        plot.state = "growing";

        plot.growth = 0;

        plot.growthTime = growthTime;

        plot.ready = false;
    }

    harvest(plot) {

        if (plot.state !== "ready") {
            return false;
        }

        plot.state = "empty";

        plot.growth = 0;

        plot.ready = false;

        return true;
    }
}