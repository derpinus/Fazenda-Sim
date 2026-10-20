import {
    TILE_WIDTH,
    TILE_HEIGHT
} from "./config.js";

export function toIso(x, y) {

    const offsetX = 800;

    const offsetY = 120;

return {

    isoX:
        ((x - y) *
        (TILE_WIDTH / 2))
        + offsetX,

    isoY:
        ((x + y) *
        (TILE_HEIGHT / 2))
        + offsetY
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