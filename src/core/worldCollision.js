import { MAP_SIZE } from "./config.js";
import { GameState } from "../managers/gameState.js";

const BLOCKING_DECORATIONS = new Set(["tree", "rock", "mountain"]);

function distanceToSegment(x, y, startX, startY, endX, endY) {
    const dx = endX - startX;
    const dy = endY - startY;
    const lengthSquared = dx * dx + dy * dy;
    const projection = Math.max(
        0,
        Math.min(1, ((x - startX) * dx + (y - startY) * dy) / lengthSquared)
    );
    return Math.hypot(
        x - (startX + projection * dx),
        y - (startY + projection * dy)
    );
}

export function canOccupy(x, y, radius = 0.25, gameState = GameState) {
    if (
        x < radius ||
        y < radius ||
        x > MAP_SIZE - radius ||
        y > MAP_SIZE - radius
    ) {
        return false;
    }

    const tileX = Math.floor(x);
    const tileY = Math.floor(y);

    if (
        ["water", "ocean", "cliff", "highland"].includes(
            gameState.world?.tiles?.[tileX]?.[tileY]
        )
    ) {
        return false;
    }

    for (const decoration of gameState.world?.decorations ?? []) {
        if (decoration.type === "gate" && decoration.open) continue;
        if (
            decoration.type === "fenceX" ||
            decoration.type === "fenceY" ||
            decoration.type === "gate"
        ) {
            const horizontal = decoration.type === "fenceX" ||
                decoration.type === "gate" && decoration.orientation !== "y";
            const distance = distanceToSegment(
                x,
                y,
                decoration.x - (horizontal ? 0.5 : 0),
                decoration.y - (horizontal ? 0 : 0.5),
                decoration.x + (horizontal ? 0.5 : 0),
                decoration.y + (horizontal ? 0 : 0.5)
            );
            if (distance < radius + 0.04) return false;
            continue;
        }

        if (!BLOCKING_DECORATIONS.has(decoration.type)) {
            continue;
        }

        const obstacleRadius = decoration.type === "tree" ? 0.42 : 0.3;

        if (Math.hypot(decoration.x - x, decoration.y - y) < radius + obstacleRadius) {
            return false;
        }
    }

    for (const building of gameState.buildings ?? []) {
        if (Math.hypot(building.x - x, building.y - y) < radius + 0.42) {
            return false;
        }
    }

    return true;
}

export function moveWithCollision(
    entity,
    nextX,
    nextY,
    radius = 0.25,
    gameState = GameState
) {
    let moved = false;
    const elevationAt = (x, y) =>
        gameState.world?.elevation?.[Math.floor(x)]?.[Math.floor(y)] ?? 0;

    if (
        Math.abs(elevationAt(nextX, entity.y) - elevationAt(entity.x, entity.y)) <= 1 &&
        canOccupy(nextX, entity.y, radius, gameState)
    ) {
        moved ||= nextX !== entity.x;
        entity.x = nextX;
    }

    if (
        Math.abs(elevationAt(entity.x, nextY) - elevationAt(entity.x, entity.y)) <= 1 &&
        canOccupy(entity.x, nextY, radius, gameState)
    ) {
        moved ||= nextY !== entity.y;
        entity.y = nextY;
    }

    return moved;
}
