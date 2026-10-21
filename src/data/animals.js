export const AnimalData = {

    chicken: {
        id: "chicken",
        name: "Galinha",

        price: 50,

        maxHunger: 100,

        movementSpeed: 1.35,

        wanderRadius: 4,

        forageRadius: 2.2,

        thirstRate: 0.09,

        grazeRecovery: 1.8,

        restChance: 0.2,

        peckDuration: 1.8,

        hungerRate: 0.12,

        produceItem: "egg",

        produceTime: 60
    },

    cow: {
        id: "cow",
        name: "Vaca",

        price: 250,

        maxHunger: 100,

        movementSpeed: 0.8,

        wanderRadius: 2.5,

        forageRadius: 2.8,

        thirstRate: 0.065,

        grazeRecovery: 3.4,

        restChance: 0.35,

        hungerRate: 0.08,

        produceItem: "milk",

        produceTime: 120
    },

    sheep: {
        id: "sheep",
        name: "Ovelha",
        price: 120,
        maxHunger: 100,
        movementSpeed: 1.05,
        wanderRadius: 3,
        forageRadius: 2.5,
        thirstRate: 0.075,
        grazeRecovery: 2.8,
        restChance: 0.28,
        flockDistance: 1.6,
        hungerRate: 0.1,
        produceItem: "wool",
        produceTime: 120
    },

    horse: {
        id: "horse",
        name: "Cavalo",
        price: 250,
        maxHunger: 100,
        movementSpeed: 1.8,
        wanderRadius: 5,
        forageRadius: 4,
        thirstRate: 0.09,
        grazeRecovery: 2.2,
        restChance: 0.18,
        hungerRate: 0.14,
        produceItem: null,
        produceTime: 0
    }
};