export class Inventory {

    constructor() {

        this.items = {};
    }

    add(itemId, quantity = 1) {

        if (!this.items[itemId]) {

            this.items[itemId] = 0;
        }

        this.items[itemId] += quantity;
    }

    remove(itemId, quantity = 1) {

        if (!this.items[itemId]) {
            return false;
        }

        if (this.items[itemId] < quantity) {
            return false;
        }

        this.items[itemId] -= quantity;

        if (this.items[itemId] <= 0) {
            delete this.items[itemId];
        }

        return true;
    }

    count(itemId) {

        return this.items[itemId] || 0;
    }

    has(itemId, quantity = 1) {

        return this.count(itemId) >= quantity;
    }

    getAll() {

        return this.items;
    }
}