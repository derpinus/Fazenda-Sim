// renderer.js

import { GameState } from "../managers/gameState.js";
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

import {
    MAP_SIZE,
    TILE_WIDTH,
    TILE_HEIGHT,
    DAY_LENGTH
} from "./config.js";

import {
    toIso,
    drawShadow,
    drawIsometricTile
}
    from "./isoUtils.js";


function renderBuildings(renderables) {

    if (!GameState.buildings?.length) {
        return;
    }

    GameState.buildings.forEach(
        building => {

            renderables.push({

                y:
                    building.x +
                    building.y,

                draw: () => {

                    building.draw(ctx);

                }
            });
        }
    );
}

function renderGround() {

    for (let x = 0; x < MAP_SIZE; x++) {

        for (let y = 0; y < MAP_SIZE; y++) {

            drawIsometricTile(
                ctx,
                x,
                y,
                "#166534",
                "#4ade80",
                "#14532d"
            );
        }
    }
}

function renderCropPlots(renderables) {

    if (!GameState.cropPlots?.length) {
        return;
    }

    GameState.cropPlots.forEach(plot => {

        renderables.push({

            y: plot.x + plot.y,

            draw: () => {

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

                    ctx.fillStyle = "#a3e635";

                    ctx.beginPath();

                    ctx.arc(
                        isoX,
                        isoY + TILE_HEIGHT / 2,
                        4,
                        0,
                        Math.PI * 2
                    );

                    ctx.fill();
                }

                if (plot.state === "ready") {

                    ctx.font = "20px sans-serif";

                    ctx.fillText(
                        "🌾",
                        isoX - 8,
                        isoY + TILE_HEIGHT / 2 + 6
                    );
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

        renderables.push({

            y: animal.x + animal.y,

            draw: () => {

                animal.draw(ctx);
            }
        });
    });
}

function renderPlayer(renderables) {

    const player = GameState.player;

    if (!player) {
        return;
    }

    renderables.push({

        y: player.y + player.x,

        draw: () => {

            player.draw(ctx);

        }
    });
}

export function draw() {

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    renderGround();

    const renderables = [];

    renderCropPlots(renderables);

    renderBuildings(renderables);

    renderAnimals(renderables);

    renderPlayer(renderables);

    renderables.sort(
        (a, b) => a.y - b.y
    );

    renderables.forEach(r => {

        if (r.draw) {

            r.draw();
        }

    });

    renderables.forEach(
        r => r.draw()
    );

    const nightAlpha = 0;
}

export class Renderer {

    constructor() {

    }

    render() {

        draw();
    }
}