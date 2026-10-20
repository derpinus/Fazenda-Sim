// renderer.js

import { GameState } from "../managers/gameState.js";
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const DAY_LENGTH = 2000;

// =====================
// Sprites
// =====================

const ChickenSprites = {
    "front-right": new Image(),
    "front-left": new Image(),
    "back-right": new Image(),
    "back-left": new Image()
};

ChickenSprites["front-right"].src =
    "assets/game/chicken_front_right.png";

ChickenSprites["front-left"].src =
    "assets/game/chicken_front_left.png";

ChickenSprites["back-right"].src =
    "assets/game/chicken_back_right.png";

ChickenSprites["back-left"].src =
    "assets/game/chicken_back_left.png";

Object.entries(ChickenSprites).forEach(
    ([key, sprite]) => {

        sprite.onerror = () => {

            console.warn(
                `Erro carregando sprite da galinha: ${key}`
            );
        };
    }
);

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

        y: player.x + player.y,

        draw: () => {

            const { isoX, isoY } =
                toIso(player.x, player.y);

            drawShadow(
                ctx,
                isoX,
                isoY,
                14,
                7
            );

            const sprite =
                Sprites["farmer"];

            if (
                sprite &&
                sprite.complete &&
                sprite.naturalWidth > 0
            ) {

                const bounce =
                    player.isMoving
                        ? Math.abs(
                            Math.sin(
                                player.animTimer * 4
                            )
                        ) * 3
                        : 0;

                ctx.drawImage(
                    sprite,
                    isoX - 16,
                    isoY - 36 - bounce,
                    32,
                    36
                );

            } else {

                ctx.fillStyle =
                    "#0284c7";

                ctx.fillRect(
                    isoX - 8,
                    isoY - 24,
                    16,
                    16
                );
            }
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

    renderables.push({

        y: -10,

        draw: () => {

            drawMapObstacles(ctx);
        }
    });

    renderCropPlots(renderables);

    renderAnimals(renderables);

    renderPlayer(renderables);

    renderables.sort(
        (a, b) => a.y - b.y
    );

    renderables.forEach(
        r => r.draw()
    );

    const nightAlpha =
        Math.abs(
            Math.sin(
                (GameState.worldTime / DAY_LENGTH)
                * Math.PI
            )
        ) * 0.45;

    ctx.fillStyle =
        `rgba(15,23,42,${nightAlpha})`;

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );
}