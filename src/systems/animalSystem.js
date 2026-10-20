import { GameState } from "../managers/gameState.js";

export class AnimalSystem {

    update(deltaTime) {

        if (!GameState.animals?.length) {
            return;
        }

        for (const animal of GameState.animals) {

            this.updateProduction(
                animal,
                deltaTime
            );

            this.updateHunger(
                animal,
                deltaTime
            );
        }
    }

    updateProduction(
        animal,
        deltaTime
    ) {

        animal.productionTimer +=
            deltaTime;

        if (
            animal.productionTimer >=
            animal.productionTime
        ) {

            animal.productionTimer = 0;

            animal.ready = true;
        }
    }

    updateHunger(
        animal,
        deltaTime
    ) {

        if (
            animal.hunger === undefined
        ) {
            animal.hunger = 100;
        }

        animal.hunger -=
            deltaTime * 0.1;

        if (
            animal.hunger < 0
        ) {
            animal.hunger = 0;
        }
    }

    feed(animal, amount = 25) {

        animal.hunger = Math.min(
            100,
            animal.hunger + amount
        );
    }

    collect(animal) {

        if (!animal.ready) {
            return null;
        }

        animal.ready = false;

        return animal.product;
    }
}