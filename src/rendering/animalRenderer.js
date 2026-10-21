import { toIso, drawShadow } from "../core/isoUtils.js";

function drawChicken(ctx, x, y, gait = 0) {
    ctx.fillStyle = "#fff3da";
    ctx.strokeStyle = "#aa845e";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(x, y - 10, 11, 8, -0.18, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#e8d6b8";
    ctx.beginPath();
    ctx.ellipse(x - 3, y - 11, 6, 4.5, -0.3, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#fff3da";
    ctx.beginPath();
    ctx.arc(x + 7, y - 17, 5.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#d96f57";
    ctx.beginPath();
    ctx.arc(x + 5, y - 23, 2.2, 0, Math.PI * 2);
    ctx.arc(x + 8, y - 24, 2.4, 0, Math.PI * 2);
    ctx.arc(x + 11, y - 22, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#d99a50";
    ctx.beginPath();
    ctx.moveTo(x + 12, y - 17);
    ctx.lineTo(x + 18, y - 15);
    ctx.lineTo(x + 12, y - 13);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#51453a";
    ctx.beginPath();
    ctx.arc(x + 9, y - 18, 1, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#bf8750";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x - 2, y - 3);
    ctx.lineTo(x - 3, y + 1 + gait);
    ctx.moveTo(x + 4, y - 3);
    ctx.lineTo(x + 4, y + 1 - gait);
    ctx.stroke();
}

function drawCow(ctx, x, y, gait = 0) {
    ctx.fillStyle = "#f3e8d6";
    ctx.strokeStyle = "#85745f";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(x, y - 12, 15, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#6e5549";
    ctx.beginPath();
    ctx.ellipse(x - 7, y - 16, 4, 4, -0.4, 0, Math.PI * 2);
    ctx.ellipse(x + 3, y - 8, 4, 3, 0.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#f3e8d6";
    ctx.beginPath();
    ctx.ellipse(x + 12, y - 19, 6, 7, -0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#c78877";
    ctx.beginPath();
    ctx.ellipse(x + 16, y - 16, 5, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#e2c894";
    ctx.beginPath();
    ctx.moveTo(x + 8, y - 25);
    ctx.lineTo(x + 6, y - 29);
    ctx.lineTo(x + 11, y - 26);
    ctx.moveTo(x + 15, y - 25);
    ctx.lineTo(x + 20, y - 28);
    ctx.lineTo(x + 18, y - 23);
    ctx.fill();

    ctx.strokeStyle = "#8a6b51";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x - 9, y - 5);
    ctx.lineTo(x - 10, y + gait);
    ctx.moveTo(x - 3, y - 4);
    ctx.lineTo(x - 3, y - gait);
    ctx.moveTo(x + 7, y - 4);
    ctx.lineTo(x + 8, y + gait);
    ctx.stroke();
    ctx.fillStyle = "#51453a";
    ctx.beginPath();
    ctx.arc(x + 14, y - 21, 1, 0, Math.PI * 2);
    ctx.fill();
}

function drawSheep(ctx, x, y, gait = 0) {
    ctx.fillStyle = "#f0ead9";
    ctx.strokeStyle = "#b0a48b";
    ctx.lineWidth = 1.2;
    for (const [offsetX, offsetY, radius] of [
        [-8, -13, 7], [0, -17, 8], [8, -13, 7], [-2, -9, 8], [7, -7, 6]
    ]) {
        ctx.beginPath();
        ctx.arc(x + offsetX, y + offsetY, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
    }
    ctx.fillStyle = "#c28f7e";
    ctx.beginPath();
    ctx.ellipse(x + 12, y - 15, 5, 7, -0.25, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#51453a";
    ctx.beginPath();
    ctx.arc(x + 14, y - 17, 0.9, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#8a6b51";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x - 6, y - 3);
    ctx.lineTo(x - 6, y + gait);
    ctx.moveTo(x + 5, y - 3);
    ctx.lineTo(x + 5, y - gait);
    ctx.stroke();
}

function drawHorse(ctx, x, y, gait = 0) {
    ctx.fillStyle = "#9a6444";
    ctx.strokeStyle = "#654737";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(x - 1, y - 12, 13, 8, -0.12, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x + 6, y - 15);
    ctx.quadraticCurveTo(x + 12, y - 25, x + 11, y - 31);
    ctx.lineTo(x + 16, y - 32);
    ctx.quadraticCurveTo(x + 20, y - 23, x + 14, y - 16);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#513e37";
    ctx.beginPath();
    ctx.moveTo(x + 10, y - 31);
    ctx.lineTo(x + 8, y - 37);
    ctx.lineTo(x + 13, y - 32);
    ctx.lineTo(x + 17, y - 37);
    ctx.lineTo(x + 17, y - 31);
    ctx.fill();
    ctx.fillStyle = "#453b35";
    ctx.beginPath();
    ctx.ellipse(x - 12, y - 12, 3, 9, -0.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#654737";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x - 8, y - 6);
    ctx.lineTo(x - 9, y + gait);
    ctx.moveTo(x - 1, y - 5);
    ctx.lineTo(x - 1, y - gait);
    ctx.moveTo(x + 7, y - 7);
    ctx.lineTo(x + 8, y + gait);
    ctx.stroke();
    ctx.fillStyle = "#332b27";
    ctx.beginPath();
    ctx.arc(x + 16, y - 28, 1, 0, Math.PI * 2);
    ctx.fill();
}

export function drawAnimal(ctx, animal) {
    const { isoX, isoY } = toIso(animal.x, animal.y);
    const gait = animal.isMoving
        ? Math.sin(animal.animTimer) * 2.5
        : Math.sin(animal.animTimer * 0.8) * 0.5;
    const legGait = animal.isMoving
        ? Math.sin(animal.animTimer * 2) * 2
        : 0;

    drawShadow(ctx, isoX, isoY, 12, 6);

    ctx.save();
    if (animal.direction === "west") {
        ctx.translate(isoX * 2, 0);
        ctx.scale(-1, 1);
    }

    switch (animal.type) {
        case "cow":
            drawCow(ctx, isoX, isoY + gait, legGait);
            break;
        case "sheep":
            drawSheep(ctx, isoX, isoY + gait, legGait);
            break;
        case "horse":
            drawHorse(ctx, isoX, isoY + gait, legGait);
            break;
        default:
            drawChicken(ctx, isoX, isoY + gait, legGait);
    }
    ctx.restore();

    if (animal.ready) {
        ctx.fillStyle = "#f4d786";
        ctx.strokeStyle = "#725943";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(isoX + 11, isoY - 27, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "#725943";
        ctx.font = "bold 10px sans-serif";
        ctx.fillText("!", isoX + 8.5, isoY - 23.5);
    }
}
