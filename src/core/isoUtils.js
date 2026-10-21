import {
    TILE_WIDTH,
    TILE_HEIGHT
} from "./config.js";
import { MAP_SIZE } from "./config.js";
import { GameState } from "../managers/gameState.js";

export const ISO_OFFSET_X = MAP_SIZE * TILE_WIDTH / 2;
export const ISO_OFFSET_Y = 72;
export const ELEVATION_HEIGHT = 20;

let cameraOffsetX = 0;
let cameraOffsetY = 0;

export function toIsoBase(x, y) {
    return {
        isoX: (x - y) * (TILE_WIDTH / 2) + ISO_OFFSET_X,
        isoY:
            (x + y) * (TILE_HEIGHT / 2) +
            ISO_OFFSET_Y -
            getElevationAt(x, y) * ELEVATION_HEIGHT
    };
}

export function getElevationAt(x, y) {
    return GameState.world?.elevation?.[Math.floor(x)]?.[Math.floor(y)] ?? 0;
}

export function setCameraTarget(x, y, viewportWidth, viewportHeight) {
    const target = toIsoBase(x, y);
    cameraOffsetX = target.isoX - viewportWidth / 2;
    cameraOffsetY = target.isoY - viewportHeight / 2;
}

export function setCameraOffset(x, y) {
    cameraOffsetX = x;
    cameraOffsetY = y;
}

export function getCameraOffset() {
    return { x: cameraOffsetX, y: cameraOffsetY };
}

export function toGrid(screenX, screenY) {
    const isoX = screenX + cameraOffsetX - ISO_OFFSET_X;
    const horizontal = isoX / (TILE_WIDTH / 2);
    let isoY = screenY + cameraOffsetY - ISO_OFFSET_Y;
    let position;
    for (let attempt = 0; attempt < 3; attempt++) {
        const vertical = isoY / (TILE_HEIGHT / 2);
        position = {
            x: (horizontal + vertical) / 2,
            y: (vertical - horizontal) / 2
        };
        isoY = screenY + cameraOffsetY - ISO_OFFSET_Y +
            getElevationAt(position.x, position.y) * ELEVATION_HEIGHT;
    }
    return position;
}

export function toIso(x, y) {
    const point = toIsoBase(x, y);
    return {
        isoX: point.isoX - cameraOffsetX,
        isoY: point.isoY - cameraOffsetY
    };
}

export function drawShadow(
    ctx,
    x,
    y,
    width,
    height
) {

    ctx.fillStyle =
        "rgba(0,0,0,0.25)";

    ctx.beginPath();

    ctx.ellipse(
        x,
        y,
        width,
        height,
        0,
        0,
        Math.PI * 2
    );

    ctx.fill();
}

export function drawIsometricTile(
    ctx,
    x,
    y,
    topColor,
    leftColor,
    rightColor
) {

    const { isoX, isoY } =
        toIso(x, y);

    ctx.fillStyle =
        topColor;

    ctx.beginPath();

    ctx.moveTo(
        isoX,
        isoY
    );

    ctx.lineTo(
        isoX + TILE_WIDTH / 2,
        isoY + TILE_HEIGHT / 2
    );

    ctx.lineTo(
        isoX,
        isoY + TILE_HEIGHT
    );

    ctx.lineTo(
        isoX - TILE_WIDTH / 2,
        isoY + TILE_HEIGHT / 2
    );

    ctx.closePath();

    ctx.fill();

    ctx.strokeStyle = "#0f172a";

    ctx.lineWidth = 1;

    ctx.stroke();
}

window.toIso = toIso;