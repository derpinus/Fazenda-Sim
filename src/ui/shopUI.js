import { GameState } from "../managers/gameState.js";
import { Animal } from "../entities/animal.js";
import { ItemData } from "../data/items.js";

function showShopMessage(message) {
    const status = document.getElementById("shop-status");

    if (status) {
        status.textContent = message;
    }
}

export function buyItem(item, cost) {
    if (
        GameState.mode !== "creative" &&
        GameState.money < cost
    ) {
        showShopMessage("Moedas insuficientes.");
        return false;
    }

    if (GameState.mode !== "creative") {
        GameState.money -= cost;
    }

    if (item === "seed") {
        GameState.inventory.add("seed", 1);
    } else if (item === "bag") {
        GameState.inventoryCapacity += 5;
    } else {
        const player = GameState.player;
        const offsets = {
            chicken: [1, 0],
            cow: [0, 1],
            sheep: [-1, 0],
            horse: [0, -1]
        };
        const [offsetX, offsetY] = offsets[item] ?? [1, 1];
        GameState.animals.push(
            new Animal(item, player.x + offsetX, player.y + offsetY)
        );
    }

    showShopMessage(
        GameState.mode === "creative" ? "Adicionado sem custo!" : "Compra realizada!"
    );
    return true;
}

export function sellAll() {
    if (GameState.mode === "creative") {
        showShopMessage("No modo Criativo, os recursos são livres.");
        return 0;
    }

    const inventory = GameState.inventory.getAll();
    const values = Object.fromEntries(
        Object.values(ItemData).map(item => [item.id, item.sellPrice])
    );
    let total = 0;

    for (const [item, quantity] of Object.entries(inventory)) {
        const price = values[item];

        if (price === undefined) {
            continue;
        }

        total += price * quantity;
        GameState.inventory.remove(item, quantity);
    }

    if (total === 0) {
        showShopMessage("Você não tem produtos para vender.");
        return 0;
    }

    GameState.money += total;
    showShopMessage(`Produtos vendidos por ${total} moedas.`);
    return total;
}

export function closeShop() {
    const shop = document.getElementById("shop-modal");

    if (shop) {
        shop.style.display = "none";
    }
}

window.buyItem = buyItem;
window.sellAll = sellAll;
window.closeShop = closeShop;

window.addEventListener("keydown", event => {
    if (event.code === "Escape") {
        closeShop();
    }
});