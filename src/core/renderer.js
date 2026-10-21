// renderer.js

import { GameState } from "../managers/gameState.js";
import { drawAnimal } from "../rendering/animalRenderer.js";
const canvas = document.getElementById("gameCanvas");
let ctx = canvas.getContext("2d");
const miniMap = document.getElementById("mini-map");
const miniMapContext = miniMap?.getContext("2d");
const groundCanvas = document.createElement("canvas");
groundCanvas.width = MAP_SIZE * TILE_WIDTH + 128;
groundCanvas.height = MAP_SIZE * TILE_HEIGHT + 128;
let groundSeed = null;

function isVisible(x, y) {
    return !!GameState.visibleTiles?.[Math.floor(x)]?.[Math.floor(y)];
}

import {
    MAP_SIZE,
    TILE_WIDTH,
    TILE_HEIGHT
} from "./config.js";

import {
    toIso,
    toIsoBase,
    setCameraTarget,
    getCameraOffset,
    drawShadow,
    getElevationAt,
    ELEVATION_HEIGHT
}
    from "./isoUtils.js";


function renderBuildings(renderables) {

    if (!GameState.buildings?.length) {
        return;
    }

    GameState.buildings.forEach(
        building => {
            if (!isVisible(building.x, building.y)) return;

            renderables.push({

                y:
                    building.x +
                    building.y,

                draw: () => {
                    if (!isVisible(building.x, building.y)) return;
                    building.draw(ctx);
                }
            });
        }
    );
}

function tileColors(type) {
    switch (type) {
        case "path":
            return ["#d5b66f", "#c5a664"];
        case "water":
            return ["#63c4c4", "#287f91"];
        case "shore":
            return ["#e1d090", "#b7ad70"];
        case "cliff":
            return ["#91866a", "#81765e"];
        case "hill":
            return ["#a4a064", "#7e814e"];
        case "highland":
            return ["#91866a", "#6d6854"];
        case "field":
            return ["#a37b50", "#8f6946"];
        case "wildflower":
            return ["#98b85e", "#72974f"];
        case "meadow-light":
            return ["#a4b95f", "#91aa55"];
        default:
            return ["#91aa55", "#829e4e"];
    }
}

function renderPaintedTile(x, y, type) {
    const { isoX, isoY } = toIsoBase(x, y);
    const [base, edge] = tileColors(type);
    const elevation = getElevationAt(x, y);
    const drawSlopeFace = (firstX, firstY, secondX, secondY, neighborX, neighborY, color) => {
        const drop = Math.max(
            0,
            elevation - getElevationAt(neighborX, neighborY)
        ) * ELEVATION_HEIGHT;
        if (!drop) return;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(isoX + firstX, isoY + firstY);
        ctx.lineTo(isoX + secondX, isoY + secondY);
        ctx.lineTo(isoX + secondX, isoY + secondY + drop);
        ctx.lineTo(isoX + firstX, isoY + firstY + drop);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "rgba(54, 54, 41, 0.28)";
        ctx.lineWidth = 1;
        ctx.stroke();
    };
    const gradient = ctx.createLinearGradient(
        isoX - TILE_WIDTH / 2,
        isoY,
        isoX + TILE_WIDTH / 2,
        isoY + TILE_HEIGHT
    );

    gradient.addColorStop(0, base);
    gradient.addColorStop(1, edge);

    ctx.beginPath();
    ctx.moveTo(isoX, isoY);
    ctx.lineTo(isoX + TILE_WIDTH / 2, isoY + TILE_HEIGHT / 2);
    ctx.lineTo(isoX, isoY + TILE_HEIGHT);
    ctx.lineTo(isoX - TILE_WIDTH / 2, isoY + TILE_HEIGHT / 2);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    if (type === "cliff") {
        ctx.fillStyle = "#554f43";
        ctx.beginPath();
        ctx.moveTo(isoX - TILE_WIDTH / 2, isoY + TILE_HEIGHT / 2);
        ctx.lineTo(isoX, isoY + TILE_HEIGHT);
        ctx.lineTo(isoX + TILE_WIDTH / 2, isoY + TILE_HEIGHT / 2);
        ctx.lineTo(isoX + TILE_WIDTH / 2, isoY + TILE_HEIGHT / 2 + 15);
        ctx.lineTo(isoX, isoY + TILE_HEIGHT + 14);
        ctx.lineTo(isoX - TILE_WIDTH / 2, isoY + TILE_HEIGHT / 2 + 15);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "rgba(210, 195, 151, 0.22)";
        ctx.beginPath();
        ctx.moveTo(isoX - 28, isoY + 25);
        ctx.lineTo(isoX, isoY + 34);
        ctx.lineTo(isoX + 28, isoY + 25);
        ctx.lineTo(isoX + 28, isoY + 29);
        ctx.lineTo(isoX, isoY + 38);
        ctx.lineTo(isoX - 28, isoY + 29);
        ctx.closePath();
        ctx.fill();
    }

    ctx.save();
    ctx.clip();

    if (type === "water") {
        ctx.strokeStyle = "rgba(223, 248, 222, 0.36)";
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.moveTo(isoX - 18, isoY + 12);
        ctx.quadraticCurveTo(isoX - 5, isoY + 5, isoX + 9, isoY + 13);
        ctx.moveTo(isoX - 9, isoY + 23);
        ctx.quadraticCurveTo(isoX + 3, isoY + 17, isoX + 19, isoY + 22);
        ctx.stroke();
        ctx.fillStyle = "rgba(255, 246, 207, 0.3)";
        ctx.beginPath();
        ctx.ellipse(isoX + 8, isoY + 9, 4, 1.2, -0.2, 0, Math.PI * 2);
        ctx.fill();

        const neighbors = [
            { x: x + 1, y, startX: isoX + 8, startY: isoY + 4, endX: isoX + 25, endY: isoY + 12 },
            { x: x - 1, y, startX: isoX - 8, startY: isoY + 4, endX: isoX - 25, endY: isoY + 12 },
            { x, y: y + 1, startX: isoX - 8, startY: isoY + 20, endX: isoX - 24, endY: isoY + 12 },
            { x, y: y - 1, startX: isoX + 8, startY: isoY + 20, endX: isoX + 24, endY: isoY + 12 }
        ];

        ctx.strokeStyle = "rgba(247, 244, 211, 0.82)";
        ctx.lineWidth = 3;
        ctx.lineCap = "round";
        for (const neighbor of neighbors) {
            if (
                GameState.world?.tiles?.[neighbor.x]?.[neighbor.y] &&
                GameState.world.tiles[neighbor.x][neighbor.y] !== "water"
            ) {
                ctx.beginPath();
                ctx.moveTo(neighbor.startX, neighbor.startY);
                ctx.quadraticCurveTo(
                    (neighbor.startX + neighbor.endX) / 2,
                    (neighbor.startY + neighbor.endY) / 2 - 2,
                    neighbor.endX,
                    neighbor.endY
                );
                ctx.stroke();
            }
        }
    } else if (type === "cliff") {
        ctx.fillStyle = "rgba(238, 222, 172, 0.4)";
        ctx.beginPath();
        ctx.ellipse(isoX - 8, isoY + 15, 11, 3, -0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(43, 45, 37, 0.25)";
        ctx.beginPath();
        ctx.ellipse(isoX + 12, isoY + 22, 9, 3, 0.2, 0, Math.PI * 2);
        ctx.fill();
    } else {
        const hash = (x * 73856093 ^ y * 19349663) >>> 0;

        if (type === "path" || type === "shore" || type === "field" || type === "hill" || type === "highland") {
            ctx.fillStyle = type === "field"
                ? "rgba(64, 39, 28, 0.22)"
                : type === "hill" || type === "highland"
                    ? "rgba(238, 224, 170, 0.2)"
                    : "rgba(255, 244, 207, 0.19)";
            ctx.beginPath();
            ctx.ellipse(isoX + (hash % 13) - 6, isoY + 13, 14, 4, -0.24, 0, Math.PI * 2);
            ctx.fill();
        }

        if (type === "hill" || type === "highland") {
            ctx.strokeStyle = type === "highland"
                ? "rgba(65, 65, 54, 0.22)"
                : "rgba(235, 224, 172, 0.22)";
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.ellipse(isoX, isoY + 16, 18, 7, 0, Math.PI, Math.PI * 2);
            ctx.stroke();
        }

        if (type === "field") {
            ctx.strokeStyle = "rgba(70, 47, 29, 0.34)";
            ctx.lineWidth = 1.4;
            for (let row = -1; row <= 1; row++) {
                ctx.beginPath();
                ctx.moveTo(isoX - 17, isoY + 10 + row * 5);
                ctx.quadraticCurveTo(isoX, isoY + 16 + row * 5, isoX + 17, isoY + 10 + row * 5);
                ctx.stroke();
            }
        }

        if (type === "wildflower") {
            const flowers = ["#f7edc1", "#eea866", "#e9e2bd"];
            ctx.fillStyle = flowers[hash % flowers.length];
            ctx.beginPath();
            ctx.arc(isoX + 8, isoY + 15, 1.8, 0, Math.PI * 2);
            ctx.arc(isoX - 10, isoY + 19, 1.4, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    ctx.restore();
    ctx.strokeStyle = type === "water"
        ? "rgba(255, 250, 225, 0.025)"
        : "rgba(45, 75, 55, 0.035)";
    ctx.lineWidth = 1;
    ctx.stroke();
    drawSlopeFace(32, 16, 0, 32, x + 1, y, "#655d42");
    drawSlopeFace(0, 32, -32, 16, x, y + 1, "#796b48");
    if (type === "cliff") {
        ctx.fillStyle = "#4e5148";
        ctx.beginPath();
        ctx.moveTo(isoX - 32, isoY + 16);
        ctx.lineTo(isoX, isoY + 32);
        ctx.lineTo(isoX + 32, isoY + 16);
        ctx.lineTo(isoX + 32, isoY + 22);
        ctx.lineTo(isoX, isoY + 38);
        ctx.lineTo(isoX - 32, isoY + 22);
        ctx.closePath();
        ctx.fill();
    }
}

function renderGround() {
    const seed = GameState.world?.seed ?? "empty";

    if (groundSeed !== seed) {
        const screenContext = ctx;
        ctx = groundCanvas.getContext("2d");
        ctx.clearRect(0, 0, groundCanvas.width, groundCanvas.height);
        const tiles = [];
        for (let x = 0; x < MAP_SIZE; x++) {
            for (let y = 0; y < MAP_SIZE; y++) {
                tiles.push({ x, y, depth: x + y });
            }
        }

        tiles.sort((left, right) => left.depth - right.depth);

        for (const tile of tiles) {
            renderPaintedTile(
                tile.x,
                tile.y,
                GameState.world?.tiles?.[tile.x]?.[tile.y] ?? "water"
            );
        }

        groundSeed = seed;
        ctx = screenContext;
    }

    const camera = getCameraOffset();
    ctx.drawImage(groundCanvas, -camera.x, -camera.y);
}

function renderDecorations(renderables) {
    for (const decoration of GameState.world?.decorations ?? []) {
        if (!isVisible(decoration.x, decoration.y)) continue;
        renderables.push({
            y: decoration.x + decoration.y,
            draw: () => {
                if (!isVisible(decoration.x, decoration.y)) return;
                const { isoX, isoY } = toIso(decoration.x, decoration.y);

                if (decoration.type === "tree") {
                    const scale = 0.92 + (decoration.variation ?? 0.5) * 0.55;
                    const canopyY = isoY - 43 * scale;
                    drawShadow(ctx, isoX + 8, isoY + 2, 24 * scale, 10 * scale);
                    ctx.fillStyle = "#70472f";
                    ctx.beginPath();
                    ctx.moveTo(isoX - 6 * scale, isoY + 2);
                    ctx.lineTo(isoX - 4 * scale, canopyY + 17 * scale);
                    ctx.lineTo(isoX + 4 * scale, canopyY + 17 * scale);
                    ctx.lineTo(isoX + 7 * scale, isoY + 2);
                    ctx.closePath();
                    ctx.fill();
                    ctx.strokeStyle = "#a8784e";
                    ctx.lineWidth = 3.2 * scale;
                    ctx.lineCap = "round";
                    ctx.beginPath();
                    ctx.moveTo(isoX, canopyY + 24 * scale);
                    ctx.lineTo(isoX - 15 * scale, canopyY + 2 * scale);
                    ctx.moveTo(isoX + 1 * scale, canopyY + 19 * scale);
                    ctx.lineTo(isoX + 17 * scale, canopyY - 4 * scale);
                    ctx.stroke();

                    if (decoration.form === "bare") {
                        ctx.strokeStyle = "#765039";
                        ctx.lineWidth = 3 * scale;
                        ctx.beginPath();
                        ctx.moveTo(isoX, isoY);
                        ctx.lineTo(isoX - 2 * scale, canopyY - 12 * scale);
                        ctx.moveTo(isoX - 1 * scale, canopyY + 4 * scale);
                        ctx.lineTo(isoX - 18 * scale, canopyY - 11 * scale);
                        ctx.lineTo(isoX - 27 * scale, canopyY - 28 * scale);
                        ctx.moveTo(isoX - 16 * scale, canopyY - 10 * scale);
                        ctx.lineTo(isoX - 13 * scale, canopyY - 31 * scale);
                        ctx.lineTo(isoX - 7 * scale, canopyY - 39 * scale);
                        ctx.moveTo(isoX - 1 * scale, canopyY - 2 * scale);
                        ctx.lineTo(isoX + 16 * scale, canopyY - 17 * scale);
                        ctx.lineTo(isoX + 27 * scale, canopyY - 33 * scale);
                        ctx.moveTo(isoX + 15 * scale, canopyY - 16 * scale);
                        ctx.lineTo(isoX + 11 * scale, canopyY - 37 * scale);
                        ctx.lineTo(isoX + 5 * scale, canopyY - 45 * scale);
                        ctx.stroke();
                        ctx.strokeStyle = "rgba(193, 147, 94, 0.75)";
                        ctx.lineWidth = 1.3 * scale;
                        ctx.beginPath();
                        ctx.moveTo(isoX - 26 * scale, canopyY - 28 * scale);
                        ctx.lineTo(isoX - 34 * scale, canopyY - 37 * scale);
                        ctx.moveTo(isoX + 26 * scale, canopyY - 33 * scale);
                        ctx.lineTo(isoX + 34 * scale, canopyY - 42 * scale);
                        ctx.stroke();
                        return;
                    }

                    if (decoration.form === "evergreen") {
                        for (let level = 0; level < 4; level++) {
                            const branchY = canopyY + 7 * scale - level * 14 * scale;
                            const width = (24 - level * 4) * scale;
                            ctx.fillStyle = level % 2 ? "#456342" : "#52754a";
                            ctx.beginPath();
                            ctx.moveTo(isoX, branchY - 17 * scale);
                            ctx.lineTo(isoX + width, branchY + 8 * scale);
                            ctx.lineTo(isoX - width, branchY + 8 * scale);
                            ctx.closePath();
                            ctx.fill();
                            ctx.strokeStyle = "rgba(207, 206, 139, 0.38)";
                            ctx.lineWidth = 1.3 * scale;
                            ctx.stroke();
                        }
                        return;
                    }

                    const crown = ctx.createRadialGradient(
                        isoX - 8 * scale,
                        isoY - 48 * scale,
                        2,
                        isoX,
                        isoY - 30 * scale,
                        37 * scale
                    );
                    const palette = decoration.variation > 0.72
                        ? ["#e4a851", "#a9633d"]
                        : decoration.variation > 0.48
                            ? ["#b6c85e", "#436844"]
                            : ["#a9be55", "#385f43"];
                    crown.addColorStop(0, palette[0]);
                    crown.addColorStop(1, palette[1]);

                    ctx.fillStyle = crown;
                    ctx.beginPath();
                    ctx.arc(isoX, canopyY, 30 * scale, 0, Math.PI * 2);
                    ctx.arc(isoX - 21 * scale, canopyY + 12 * scale, 20 * scale, 0, Math.PI * 2);
                    ctx.arc(isoX + 21 * scale, canopyY + 13 * scale, 21 * scale, 0, Math.PI * 2);
                    ctx.arc(isoX - 5 * scale, canopyY + 22 * scale, 22 * scale, 0, Math.PI * 2);
                    ctx.fill();
                    for (let dab = 0; dab < 18; dab++) {
                        const angle = dab * 2.399;
                        const radius = (0.22 + (dab % 5) * 0.13) * 25 * scale;
                        const dabX = isoX + Math.cos(angle) * radius;
                        const dabY = canopyY + Math.sin(angle) * radius * 0.76;
                        ctx.fillStyle = dab % 3 === 0
                            ? "rgba(240, 208, 112, 0.3)"
                            : dab % 3 === 1
                                ? "rgba(34, 74, 47, 0.2)"
                                : "rgba(203, 211, 108, 0.22)";
                        ctx.beginPath();
                        ctx.ellipse(
                            dabX,
                            dabY,
                            (3 + dab % 3) * scale,
                            (2 + dab % 2) * scale,
                            angle,
                            0,
                            Math.PI * 2
                        );
                        ctx.fill();
                    }
                    return;
                }

                if (decoration.type === "rock") {
                    const size = decoration.variation > 0.9 ? 1.9 :
                        decoration.variation > 0.76 ? 1.45 : 1;
                    drawShadow(ctx, isoX, isoY + 2, 15 * size, 6 * size);
                    ctx.fillStyle = "#59605a";
                    ctx.beginPath();
                    ctx.moveTo(isoX - 15 * size, isoY);
                    ctx.lineTo(isoX - 12 * size, isoY - 12 * size);
                    ctx.lineTo(isoX - 3 * size, isoY - 20 * size);
                    ctx.lineTo(isoX + 6 * size, isoY - 19 * size);
                    ctx.lineTo(isoX + 16 * size, isoY - 9 * size);
                    ctx.lineTo(isoX + 15 * size, isoY);
                    ctx.closePath();
                    ctx.fill();
                    ctx.fillStyle = "#899087";
                    ctx.beginPath();
                    ctx.moveTo(isoX - 12 * size, isoY - 11 * size);
                    ctx.lineTo(isoX - 3 * size, isoY - 20 * size);
                    ctx.lineTo(isoX + 5 * size, isoY - 18 * size);
                    ctx.lineTo(isoX + 1 * size, isoY - 8 * size);
                    ctx.lineTo(isoX - 9 * size, isoY - 5 * size);
                    ctx.closePath();
                    ctx.fill();
                    ctx.fillStyle = "rgba(226, 228, 207, 0.55)";
                    ctx.beginPath();
                    ctx.ellipse(isoX - 4 * size, isoY - 15 * size, 5 * size, 2 * size, -0.5, 0, Math.PI * 2);
                    ctx.fill();
                    return;
                }

                if (decoration.type === "mountain") {
                    const scale = 1 + (decoration.height ?? 1) * 0.34;
                    drawShadow(ctx, isoX + 4, isoY + 5, 34 * scale, 12 * scale);
                    ctx.fillStyle = "#454c47";
                    ctx.beginPath();
                    ctx.moveTo(isoX - 42 * scale, isoY + 6);
                    ctx.lineTo(isoX - 27 * scale, isoY - 43 * scale);
                    ctx.lineTo(isoX - 10 * scale, isoY - 24 * scale);
                    ctx.lineTo(isoX + 9 * scale, isoY - 67 * scale);
                    ctx.lineTo(isoX + 34 * scale, isoY - 18 * scale);
                    ctx.lineTo(isoX + 48 * scale, isoY + 5);
                    ctx.closePath();
                    ctx.fill();
                    ctx.fillStyle = "#777d73";
                    ctx.beginPath();
                    ctx.moveTo(isoX - 27 * scale, isoY - 43 * scale);
                    ctx.lineTo(isoX - 10 * scale, isoY - 24 * scale);
                    ctx.lineTo(isoX + 9 * scale, isoY - 67 * scale);
                    ctx.lineTo(isoX + 18 * scale, isoY - 29 * scale);
                    ctx.lineTo(isoX + 2 * scale, isoY - 12 * scale);
                    ctx.closePath();
                    ctx.fill();
                    ctx.fillStyle = "#d9d5c1";
                    ctx.beginPath();
                    ctx.moveTo(isoX + 9 * scale, isoY - 67 * scale);
                    ctx.lineTo(isoX + 1 * scale, isoY - 44 * scale);
                    ctx.lineTo(isoX + 9 * scale, isoY - 48 * scale);
                    ctx.lineTo(isoX + 17 * scale, isoY - 34 * scale);
                    ctx.lineTo(isoX + 18 * scale, isoY - 29 * scale);
                    ctx.lineTo(isoX + 9 * scale, isoY - 37 * scale);
                    ctx.lineTo(isoX + 2 * scale, isoY - 34 * scale);
                    ctx.closePath();
                    ctx.fill();
                    return;
                }

                if (
                    decoration.type === "fence" ||
                    decoration.type === "fenceX" ||
                    decoration.type === "fenceY" ||
                    decoration.type === "gate"
                ) {
                    const fenceX = decoration.type === "fenceY" ||
                        decoration.type === "gate" && decoration.orientation === "y";
                    const startX = fenceX ? isoX - 18 : isoX - 18;
                    const endX = isoX + 18;
                    const startY = fenceX ? isoY + 9 : isoY - 9;
                    const endY = fenceX ? isoY - 9 : isoY + 9;
                    if (!(decoration.type === "gate" && decoration.open)) {
                        ctx.strokeStyle = "#593d2e";
                        ctx.lineWidth = 5;
                        ctx.lineCap = "round";
                        ctx.beginPath();
                        ctx.moveTo(startX, startY - 6);
                        ctx.lineTo(endX, endY - 6);
                        ctx.moveTo(startX, startY);
                        ctx.lineTo(endX, endY);
                        ctx.stroke();
                        ctx.strokeStyle = "#c38a51";
                        ctx.lineWidth = 2;
                        ctx.beginPath();
                        ctx.moveTo(startX, startY - 7);
                        ctx.lineTo(endX, endY - 7);
                        ctx.moveTo(startX, startY - 1);
                        ctx.lineTo(endX, endY - 1);
                        ctx.stroke();
                    }
                    ctx.fillStyle = "#80593b";
                    for (const [postX, postY] of [[startX, startY], [endX, endY]]) {
                        ctx.fillRect(postX - 2.5, postY - 13, 5, 17);
                        ctx.fillStyle = "#d3a368";
                        ctx.fillRect(postX - 2.5, postY - 13, 5, 3);
                        ctx.fillStyle = "#80593b";
                    }
                    return;
                }

                if (decoration.type === "dock") {
                    drawShadow(ctx, isoX + 9, isoY + 9, 30, 9);
                    ctx.fillStyle = "#705039";
                    ctx.beginPath();
                    ctx.moveTo(isoX - 20, isoY - 16);
                    ctx.lineTo(isoX + 16, isoY - 2);
                    ctx.lineTo(isoX + 16, isoY + 21);
                    ctx.lineTo(isoX - 20, isoY + 5);
                    ctx.closePath();
                    ctx.fill();
                    ctx.strokeStyle = "#c38a51";
                    ctx.lineWidth = 3;
                    for (let plank = 0; plank < 5; plank++) {
                        const offset = plank * 6;
                        ctx.beginPath();
                        ctx.moveTo(isoX - 18 + offset, isoY - 14 + offset * 0.38);
                        ctx.lineTo(isoX - 18 + offset, isoY + 4 + offset * 0.38);
                        ctx.stroke();
                    }
                    return;
                }

                if (decoration.type === "hay") {
                    drawShadow(ctx, isoX, isoY + 2, 11, 5);
                    ctx.fillStyle = "#d49a43";
                    ctx.beginPath();
                    ctx.ellipse(isoX, isoY - 5, 9, 8, 0, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.strokeStyle = "#f0cc75";
                    ctx.lineWidth = 1.5;
                    ctx.beginPath();
                    ctx.ellipse(isoX, isoY - 5, 9, 8, 0, 0, Math.PI * 2);
                    ctx.moveTo(isoX - 7, isoY - 4);
                    ctx.lineTo(isoX + 7, isoY - 4);
                    ctx.moveTo(isoX, isoY - 12);
                    ctx.lineTo(isoX, isoY + 2);
                    ctx.stroke();
                    return;
                }

                if (decoration.type === "grass") {
                    ctx.strokeStyle = "#587a45";
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    for (let blade = 0; blade < 5; blade++) {
                        const offset = blade * 4 - 8;
                        ctx.moveTo(isoX + offset, isoY);
                        ctx.quadraticCurveTo(
                            isoX + offset - 5,
                            isoY - 13,
                            isoX + offset + (decoration.variation > 0.5 ? 4 : -4),
                            isoY - 25 - blade % 3 * 3
                        );
                    }
                    ctx.stroke();
                    return;
                }

                ctx.fillStyle = decoration.variation > 0.5 ? "#f4dc9b" : "#e8adad";
                ctx.beginPath();
                ctx.arc(isoX - 3, isoY - 2, 2, 0, Math.PI * 2);
                ctx.arc(isoX + 3, isoY - 1, 2, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = "#e7c96d";
                ctx.beginPath();
                ctx.arc(isoX, isoY - 2, 1.5, 0, Math.PI * 2);
                ctx.fill();
            }
        });
    }
}

function renderBackdrop() {
    const landscape = ctx.createLinearGradient(0, 0, 0, canvas.height);
    landscape.addColorStop(0, "#84927a");
    landscape.addColorStop(0.56, "#667952");
    landscape.addColorStop(1, "#465e42");
    ctx.fillStyle = landscape;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const camera = getCameraOffset();
    const parallaxX = -((camera.x * 0.035) % canvas.width);
    const ridgeLayers = [
        { offset: 0.04, amplitude: 72, color: "rgba(71, 91, 67, 0.48)", phase: 0.7 },
        { offset: 0.12, amplitude: 54, color: "rgba(91, 111, 76, 0.38)", phase: 2.2 },
        { offset: 0.2, amplitude: 37, color: "rgba(133, 143, 92, 0.24)", phase: 4.1 }
    ];
    for (const layer of ridgeLayers) {
        const baseY = canvas.height * layer.offset + 180;
        ctx.fillStyle = layer.color;
        ctx.beginPath();
        for (let x = -canvas.width; x <= canvas.width * 2; x += 28) {
            const worldX = x + parallaxX;
            const ridgeY = baseY +
                Math.sin(worldX * 0.004 + layer.phase) * layer.amplitude +
                Math.sin(worldX * 0.011 + layer.phase * 2) * layer.amplitude * 0.32;
            if (x === -canvas.width) ctx.moveTo(x, ridgeY);
            else ctx.lineTo(x, ridgeY);
        }
        ctx.lineTo(canvas.width * 2, canvas.height);
        ctx.lineTo(-canvas.width, canvas.height);
        ctx.closePath();
        ctx.fill();
    }

    for (let row = 0; row < 18; row++) {
        const y = row * 56 + (row % 2) * 24;
        ctx.fillStyle = row % 2 === 0
            ? "rgba(35, 61, 43, 0.13)"
            : "rgba(213, 205, 151, 0.045)";
        ctx.beginPath();
        for (let x = -80; x <= canvas.width + 80; x += 32) {
            const ridge = y + Math.sin(x * 0.012 + row * 1.7) * 12 +
                Math.sin(x * 0.027 + row) * 5;
            if (x === -80) ctx.moveTo(x, ridge);
            else ctx.lineTo(x, ridge);
        }
        ctx.lineTo(canvas.width + 80, canvas.height);
        ctx.lineTo(-80, canvas.height);
        ctx.closePath();
        ctx.fill();
    }

    const sunGlow = ctx.createRadialGradient(180, 90, 4, 180, 90, 190);
    sunGlow.addColorStop(0, "rgba(255, 240, 170, 0.22)");
    sunGlow.addColorStop(1, "rgba(255, 240, 170, 0)");
    ctx.fillStyle = sunGlow;
    ctx.fillRect(0, 0, 400, 330);
}

function renderMiniMap() {
    if (!miniMapContext || !GameState.world) {
        return;
    }

    const size = miniMap.width;
    const tileSize = size / MAP_SIZE;
    miniMapContext.clearRect(0, 0, size, size);
    miniMapContext.fillStyle = "#304a35";
    miniMapContext.fillRect(0, 0, size, size);

    for (let x = 0; x < MAP_SIZE; x++) {
        for (let y = 0; y < MAP_SIZE; y++) {
            const explored = GameState.exploredTiles?.[x]?.[y];
            if (!explored) {
                miniMapContext.fillStyle = "#17242b";
                miniMapContext.fillRect(x * tileSize, y * tileSize, tileSize + 0.5, tileSize + 0.5);
                continue;
            }
            const type = GameState.world.tiles[x][y];
            const color = type === "water"
                ? "#55b7bd"
                : type === "cliff"
                    ? "#847b5e"
                    : type === "shore"
                        ? "#dfca82"
                        : type === "path"
                            ? "#b9945d"
                            : type === "field"
                                ? "#9c6c42"
                                : type === "highland"
                                    ? "#81775e"
                                    : type === "hill"
                                        ? "#a49a5c"
                                : "#71934a";
            miniMapContext.fillStyle = color;
            miniMapContext.fillRect(x * tileSize, y * tileSize, tileSize + 0.5, tileSize + 0.5);
            if (!GameState.visibleTiles?.[x]?.[y]) {
                miniMapContext.fillStyle = "rgba(9, 18, 24, 0.58)";
                miniMapContext.fillRect(x * tileSize, y * tileSize, tileSize + 0.5, tileSize + 0.5);
            }
        }

    }

    for (const building of GameState.buildings) {
        const buildingX = Math.floor(building.x);
        const buildingY = Math.floor(building.y);
        if (!GameState.exploredTiles?.[buildingX]?.[buildingY]) continue;
        miniMapContext.fillStyle = building.type === "farmhouse" ? "#f5e2b7" : "#a94f36";
        miniMapContext.beginPath();
        miniMapContext.arc(
            (building.x + 0.5) * tileSize,
            (building.y + 0.5) * tileSize,
            2.4,
            0,
            Math.PI * 2
        );
        miniMapContext.fill();
    }

    if (GameState.player) {
        miniMapContext.fillStyle = "#fff0a8";
        miniMapContext.strokeStyle = "#354b39";
        miniMapContext.lineWidth = 1.5;
        miniMapContext.beginPath();
        miniMapContext.arc(
            (GameState.player.x + 0.5) * tileSize,
            (GameState.player.y + 0.5) * tileSize,
            4.5,
            0,
            Math.PI * 2
        );
        miniMapContext.fill();
        miniMapContext.stroke();
    }
}

function renderFogOfWar() {
    if (!GameState.world || !GameState.exploredTiles) return;

    for (let x = 0; x < MAP_SIZE; x++) {
        for (let y = 0; y < MAP_SIZE; y++) {
            if (GameState.visibleTiles?.[x]?.[y]) continue;
            const { isoX, isoY } = toIso(x, y);
            const fogColor = GameState.exploredTiles[x]?.[y]
                ? "rgba(16, 25, 31, 0.56)"
                : "#263d40";
            ctx.fillStyle = fogColor;
            ctx.beginPath();
            ctx.moveTo(isoX, isoY - 1);
            ctx.lineTo(isoX + TILE_WIDTH / 2 + 1, isoY + TILE_HEIGHT / 2);
            ctx.lineTo(isoX, isoY + TILE_HEIGHT + 1);
            ctx.lineTo(isoX - TILE_WIDTH / 2 - 1, isoY + TILE_HEIGHT / 2);
            ctx.closePath();
            ctx.fill();

            const fillFogFace = (firstX, firstY, secondX, secondY, drop) => {
                if (!drop) return;
                ctx.fillStyle = fogColor;
                ctx.beginPath();
                ctx.moveTo(isoX + firstX, isoY + firstY);
                ctx.lineTo(isoX + secondX, isoY + secondY);
                ctx.lineTo(isoX + secondX, isoY + secondY + drop);
                ctx.lineTo(isoX + firstX, isoY + firstY + drop);
                ctx.closePath();
                ctx.fill();
            };
            const elevation = getElevationAt(x, y);
            fillFogFace(
                32, 16, 0, 32,
                Math.max(0, elevation - getElevationAt(x + 1, y)) * ELEVATION_HEIGHT
            );
            fillFogFace(
                0, 32, -32, 16,
                Math.max(0, elevation - getElevationAt(x, y + 1)) * ELEVATION_HEIGHT
            );
            if (GameState.world.tiles[x][y] === "cliff") {
                fillFogFace(-32, 16, 0, 32, 15);
                fillFogFace(0, 32, 32, 16, 15);
            }
        }
    }
}

function renderBuildPreview() {
    const preview = GameState.buildPreview;
    if (!preview) return;
    if (preview.tool === "fenceX" || preview.tool === "fenceY") {
        const horizontal = preview.tool === "fenceX";
        const startIndex = Math.floor(horizontal ? preview.start.x : preview.start.y);
        const endIndex = Math.floor(horizontal ? preview.end.x : preview.end.y);
        const fixed = Math.floor(horizontal ? preview.start.y : preview.start.x);
        const first = Math.min(startIndex, endIndex);
        const last = Math.max(startIndex, endIndex);
        const start = horizontal
            ? toIso(first + 0.5, fixed)
            : toIso(fixed, first + 0.5);
        const end = horizontal
            ? toIso(last + 0.5, fixed)
            : toIso(fixed, last + 0.5);
        ctx.save();
        ctx.strokeStyle = "rgba(245, 228, 154, 0.9)";
        ctx.lineWidth = 6;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(start.isoX, start.isoY);
        ctx.lineTo(end.isoX, end.isoY);
        ctx.stroke();
        ctx.restore();
        return;
    }
    const minX = Math.floor(Math.min(preview.start.x, preview.end.x));
    const maxX = Math.floor(Math.max(preview.start.x, preview.end.x)) + 1;
    const minY = Math.floor(Math.min(preview.start.y, preview.end.y));
    const maxY = Math.floor(Math.max(preview.start.y, preview.end.y)) + 1;
    const corners = [
        toIso(minX, minY),
        toIso(maxX, minY),
        toIso(maxX, maxY),
        toIso(minX, maxY)
    ];
    ctx.save();
    ctx.fillStyle = "rgba(216, 232, 145, 0.16)";
    ctx.strokeStyle = "#f5e49a";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(corners[0].isoX, corners[0].isoY);
    for (const corner of corners.slice(1)) {
        ctx.lineTo(corner.isoX, corner.isoY);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
}

function renderCropPlots(renderables) {

    if (!GameState.cropPlots?.length) {
        return;
    }

    function drawCrop(context, x, y, type, ready, growth) {
        const height = type === "corn" ? 16 : 12;
        const spread = type === "corn" ? 9 : 12;
        const progress = ready ? 1 : Math.max(0.25, Math.min(0.8, growth / 20));
        const stalkGradient = context.createLinearGradient(x - spread, y, x + spread, y - height);
        stalkGradient.addColorStop(0, "#557b3e");
        stalkGradient.addColorStop(0.55, type === "corn" ? "#779742" : "#9aa84c");
        stalkGradient.addColorStop(1, ready ? "#e5bd55" : "#b3bd61");

        context.save();
        context.lineCap = "round";
        context.lineJoin = "round";

        for (let stalk = -1; stalk <= 1; stalk++) {
            const stemX = x + stalk * spread;
            const stemHeight = height * progress * (stalk === 0 ? 1 : 0.78);
            const stemTop = y - stemHeight;

            context.strokeStyle = stalkGradient;
            context.lineWidth = type === "corn" ? 3 : 2;
            context.beginPath();
            context.moveTo(stemX, y);
            context.quadraticCurveTo(stemX + 2, y - stemHeight * 0.55, stemX, stemTop);
            context.stroke();

            context.fillStyle = ready ? "#d5ac48" : "#86a84d";
            context.beginPath();
            context.ellipse(stemX - 4, y - stemHeight * 0.45, 5, 2, -0.55, 0, Math.PI * 2);
            context.ellipse(stemX + 4, y - stemHeight * 0.66, 5, 2, 0.55, 0, Math.PI * 2);
            context.fill();

            if (type === "corn") {
                context.fillStyle = ready ? "#f2c75e" : "#b7cf70";
                context.beginPath();
                context.ellipse(stemX + 3, stemTop + 4, 3, 5, -0.15, 0, Math.PI * 2);
                context.fill();
                context.strokeStyle = "#788c43";
                context.lineWidth = 1;
                context.stroke();
            } else if (ready) {
                context.fillStyle = "#eac85d";
                context.beginPath();
                context.ellipse(stemX, stemTop + 2, 2, 5, -0.3, 0, Math.PI * 2);
                context.fill();
            }
        }

        context.restore();
    }

    GameState.cropPlots.forEach(plot => {
        if (!isVisible(plot.x, plot.y)) return;

        renderables.push({

            y: plot.x + plot.y,

            draw: () => {
                if (!isVisible(plot.x, plot.y)) return;

                const { isoX, isoY } =
                    toIso(plot.x, plot.y);

                ctx.fillStyle = "#451a03";

                ctx.beginPath();

                ctx.moveTo(isoX, isoY);

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

                if (plot.state === "growing") {

                    drawCrop(ctx, isoX, isoY + TILE_HEIGHT / 2, plot.type, false, plot.growth);
                }

                if (plot.state === "ready") {

                    drawCrop(ctx, isoX, isoY + TILE_HEIGHT / 2, plot.type, true, plot.growth);
                }
            }
        });
    });
}

function renderAnimals(renderables) {

    if (!GameState.animals?.length) {
        return;
    }

    GameState.animals.forEach(animal => {
        if (!isVisible(animal.x, animal.y)) return;

        renderables.push({

            y: animal.x + animal.y,

            draw: () => {
                if (!isVisible(animal.x, animal.y)) return;

                drawAnimal(ctx, animal);
            }
        });
    });
}

function renderPlayer(renderables) {

    const player = GameState.player;

    if (!player) {
        return;
    }

    if (!isVisible(player.x, player.y)) return;
    renderables.push({

        y: player.y + player.x,

        draw: () => {

            if (!isVisible(player.x, player.y)) return;
            player.draw(ctx);

        }
    });
}

function renderWorkers(renderables) {
    for (const worker of GameState.workers ?? []) {
        if (!isVisible(worker.x, worker.y)) continue;
        renderables.push({
            y: worker.x + worker.y,
            draw: () => {
                if (!isVisible(worker.x, worker.y)) return;
                const { isoX, isoY } = toIso(worker.x, worker.y);
                if (worker.id === GameState.selectedWorkerId) {
                    ctx.strokeStyle = "#f4d786";
                    ctx.lineWidth = 2.5;
                    ctx.beginPath();
                    ctx.ellipse(isoX, isoY + 1, 17, 8, 0, 0, Math.PI * 2);
                    ctx.stroke();
                    ctx.fillStyle = "#f4d786";
                    ctx.font = "bold 11px Segoe UI";
                    ctx.textAlign = "center";
                    ctx.fillText("Selecionado", isoX, isoY - 46);
                }
                worker.draw(ctx);
                if (
                    worker.state === "moving" &&
                    worker.path?.length
                ) {
                    ctx.strokeStyle = "rgba(244, 215, 134, 0.72)";
                    ctx.lineWidth = 1.5;
                    ctx.setLineDash([4, 4]);
                    ctx.beginPath();
                    ctx.moveTo(isoX, isoY - 3);
                    let pathContinues = true;
                    for (const waypoint of worker.path?.slice(worker.pathIndex) ?? []) {
                        if (!isVisible(waypoint.x, waypoint.y)) {
                            pathContinues = false;
                            continue;
                        }
                        const point = toIso(waypoint.x, waypoint.y);
                        if (pathContinues) {
                            ctx.lineTo(point.isoX, point.isoY);
                        } else {
                            ctx.moveTo(point.isoX, point.isoY);
                        }
                        pathContinues = true;
                    }
                    ctx.stroke();
                    ctx.setLineDash([]);
                }
            }
        });
    }
}

export function draw() {

    if (GameState.player) {
        setCameraTarget(
            GameState.player.x,
            GameState.player.y,
            canvas.width,
            canvas.height
        );
    }

    renderBackdrop();

    renderGround();
    renderFogOfWar();

    const renderables = [];

    renderCropPlots(renderables);

    renderBuildings(renderables);

    renderDecorations(renderables);

    renderAnimals(renderables);

    renderWorkers(renderables);

    renderPlayer(renderables);

    renderables.sort(
        (a, b) => a.y - b.y
    );

    renderables.forEach(r => r.draw());
    renderBuildPreview();
    renderMiniMap();
}

export class Renderer {

    constructor() {

    }

    render() {

        draw();
    }
}