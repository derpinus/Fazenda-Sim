import { Entity } from "./entity.js";

import {
    toIso,
    drawShadow
}
from "../core/isoUtils.js";

export class Building extends Entity {

    constructor(
        type,
        x,
        y
    ) {

        super(x, y);

        this.type = type;

        this.status = "idle";

        this.productionTimer = 0;

        this.productionTime = 0;

        this.ready = false;
    }

    draw(ctx) {
        const { isoX, isoY } = toIso(this.x, this.y);
        drawShadow(ctx, isoX + 5, isoY + 8, 42, 16);

        if (["barn", "farmhouse", "market", "chickenCoop", "stable"].includes(this.type)) {
            this.drawHouse(ctx, isoX, isoY);
        } else if (this.type === "well") {
            this.drawWell(ctx, isoX, isoY);
        } else if (this.type === "silo") {
            this.drawSilo(ctx, isoX, isoY);
        } else if (this.type === "cheesePress") {
            this.drawCheesePress(ctx, isoX, isoY);
        } else {
            this.drawHouse(ctx, isoX, isoY);
        }

        if (this.ready) {
            ctx.font = "16px sans-serif";
            ctx.fillText("✦", isoX + 30, isoY - 45);
        }
    }

    drawHouse(ctx, x, y) {
        const palettes = {
            farmhouse: { wall: "#e7d0a0", side: "#b98b5a", roof: "#a94f36", roofLight: "#d4774c", trim: "#71432f", door: "#684632" },
            barn: { wall: "#c87552", side: "#984a3a", roof: "#75433d", roofLight: "#9f5848", trim: "#633a31", door: "#704631" },
            market: { wall: "#f0dfba", side: "#cba574", roof: "#d18a4e", roofLight: "#f0bd68", trim: "#77543a", door: "#71492f" },
            chickenCoop: { wall: "#e4c18b", side: "#b48353", roof: "#a94f36", roofLight: "#cf7650", trim: "#704630", door: "#69462f" },
            stable: { wall: "#cba77a", side: "#92714f", roof: "#665449", roofLight: "#88705a", trim: "#5c4535", door: "#654532" }
        };
        const colors = palettes[this.type] ?? palettes.barn;
        const width = this.type === "barn" || this.type === "stable" ? 44 : 38;
        const depth = width * 0.48;
        const height = this.type === "barn" ? 43 : 38;
        const peak = this.type === "barn" ? 30 : 27;
        const north = { x, y: y - depth };
        const east = { x: x + width, y };
        const south = { x, y: y + depth };
        const west = { x: x - width, y };
        const lift = point => ({ x: point.x, y: point.y - height });
        const northTop = lift(north);
        const eastTop = lift(east);
        const southTop = lift(south);
        const westTop = lift(west);
        const ridgeWest = { x: x - width * 0.55, y: y - height - peak };
        const ridgeEast = { x: x + width * 0.55, y: y - height - peak };
        const roofWest = { x: x - width - 8, y: y - height - 2 };
        const roofSouth = { x, y: y - height + depth + 4 };
        const roofEast = { x: x + width + 8, y: y - height - 2 };
        const roofNorth = { x, y: y - height - depth - 4 };
        const polygon = (points, fill, stroke = colors.trim) => {
            ctx.beginPath();
            ctx.moveTo(points[0].x, points[0].y);
            for (const point of points.slice(1)) ctx.lineTo(point.x, point.y);
            ctx.closePath();
            ctx.fillStyle = fill;
            ctx.fill();
            ctx.strokeStyle = stroke;
            ctx.lineWidth = 1.8;
            ctx.lineJoin = "round";
            ctx.stroke();
        };

        ctx.fillStyle = "#887454";
        ctx.beginPath();
        ctx.ellipse(x, y + 8, width + 8, depth * 0.72, 0, 0, Math.PI * 2);
        ctx.fill();
        polygon([north, west, westTop, northTop], colors.side);
        polygon([west, south, southTop, westTop], colors.wall);
        polygon([south, east, eastTop, southTop], colors.side);
        polygon([north, east, eastTop, northTop], colors.wall, "#876342");

        polygon([ridgeWest, ridgeEast, roofEast, roofSouth, roofWest], colors.roof);
        polygon([ridgeWest, ridgeEast, roofEast, roofNorth, roofWest], colors.roofLight);
        ctx.strokeStyle = "rgba(255, 221, 164, 0.58)";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(ridgeWest.x, ridgeWest.y);
        ctx.lineTo(ridgeEast.x, ridgeEast.y);
        ctx.stroke();

        if (this.type === "barn" || this.type === "stable") {
            polygon(
                [
                    { x: x - 15, y: y + depth * 0.35 },
                    { x: x + 7, y: y + depth * 0.35 + 11 },
                    { x: x + 7, y: y - height + 10 },
                    { x: x - 15, y: y - height - 1 }
                ],
                colors.door,
                "#e0b57c"
            );
            ctx.strokeStyle = "#d2a16a";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(x - 4, y + depth * 0.35 + 5);
            ctx.lineTo(x - 4, y - height + 5);
            ctx.moveTo(x - 15, y - 10);
            ctx.lineTo(x + 7, y + 1);
            ctx.stroke();
            ctx.fillStyle = "#d7ad71";
            ctx.beginPath();
            ctx.arc(x + 1, y - 12, 2, 0, Math.PI * 2);
            ctx.fill();
        } else {
            polygon(
                [
                    { x: x - 12, y: y + depth * 0.35 },
                    { x: x + 3, y: y + depth * 0.35 + 7 },
                    { x: x + 3, y: y - height + 8 },
                    { x: x - 12, y: y - height + 1 }
                ],
                colors.door,
                "#e4c18b"
            );
            ctx.fillStyle = "#f1d38e";
            ctx.beginPath();
            ctx.arc(x - 1, y - 14, 1.8, 0, Math.PI * 2);
            ctx.fill();
        }

        const window = (wx, wy) => {
            ctx.fillStyle = "#4d6d69";
            ctx.beginPath();
            ctx.ellipse(wx, wy, 5.5, 8, -0.45, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = "#f1dfbb";
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.strokeStyle = "#f1dfbb";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(wx, wy - 6);
            ctx.lineTo(wx, wy + 6);
            ctx.stroke();
        };
        if (this.type !== "barn" && this.type !== "stable") {
            window(x + width * 0.55, y - height * 0.55);
            if (this.type === "farmhouse") window(x - width * 0.55, y - height * 0.62);
        }

        if (this.type === "market") {
            ctx.strokeStyle = "#f7e8c3";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(x - 25, y - height + 4);
            ctx.lineTo(x + 28, y - height + 4);
            ctx.stroke();
            for (let stripe = 0; stripe < 5; stripe++) {
                ctx.fillStyle = stripe % 2 ? "#f1d59c" : "#c85f42";
                ctx.fillRect(x - 23 + stripe * 10, y - height + 5, 9, 9);
            }
        }

        if (this.type === "farmhouse") {
            ctx.fillStyle = "#574736";
            ctx.fillRect(x - width * 0.55, y - height - 5, 8, 27);
            ctx.fillStyle = "#b75b42";
            ctx.beginPath();
            ctx.moveTo(x - width * 0.63, y - height - 5);
            ctx.lineTo(x - width * 0.47, y - height - 5);
            ctx.lineTo(x - width * 0.47, y - height - 14);
            ctx.lineTo(x - width * 0.63, y - height - 14);
            ctx.closePath();
            ctx.fill();
        }
    }

    drawWell(ctx, x, y) {
        ctx.fillStyle = "#827960";
        ctx.beginPath();
        ctx.ellipse(x, y + 3, 20, 10, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#c5b28b";
        ctx.beginPath();
        ctx.ellipse(x, y - 8, 17, 9, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#477f80";
        ctx.beginPath();
        ctx.ellipse(x, y - 9, 11, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#75553b";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(x - 18, y - 9);
        ctx.lineTo(x - 18, y - 39);
        ctx.moveTo(x + 18, y - 9);
        ctx.lineTo(x + 18, y - 39);
        ctx.moveTo(x - 21, y - 39);
        ctx.lineTo(x + 21, y - 39);
        ctx.stroke();
        ctx.strokeStyle = "#d09a5a";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x, y - 37);
        ctx.lineTo(x, y - 12);
        ctx.stroke();
        ctx.fillStyle = "#d09a5a";
        ctx.fillRect(x - 7, y - 42, 14, 4);
    }

    drawSilo(ctx, x, y) {
        ctx.fillStyle = "#8b7859";
        ctx.beginPath();
        ctx.ellipse(x, y + 2, 21, 10, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#d1c19b";
        ctx.fillRect(x - 17, y - 45, 34, 46);
        ctx.fillStyle = "#a89978";
        ctx.fillRect(x + 7, y - 43, 10, 43);
        ctx.fillStyle = "#e3d5b2";
        ctx.beginPath();
        ctx.ellipse(x, y - 45, 17, 8, 0, Math.PI, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#9d5945";
        ctx.beginPath();
        ctx.moveTo(x - 20, y - 44);
        ctx.lineTo(x, y - 61);
        ctx.lineTo(x + 20, y - 44);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#866b4b";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x - 10, y - 36);
        ctx.lineTo(x - 10, y - 4);
        ctx.moveTo(x, y - 36);
        ctx.lineTo(x, y - 4);
        ctx.stroke();
    }

    drawCheesePress(ctx, x, y) {
        ctx.fillStyle = "#715039";
        ctx.beginPath();
        ctx.moveTo(x - 20, y - 1);
        ctx.lineTo(x + 18, y - 1);
        ctx.lineTo(x + 12, y + 8);
        ctx.lineTo(x - 15, y + 8);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "#c38b57";
        ctx.fillRect(x - 18, y - 30, 36, 6);
        ctx.fillRect(x - 14, y - 27, 5, 26);
        ctx.fillRect(x + 9, y - 27, 5, 26);
        ctx.fillStyle = "#e7d4ae";
        ctx.beginPath();
        ctx.ellipse(x, y - 32, 13, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#9e754a";
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = "#bc8e56";
        ctx.fillRect(x - 2, y - 40, 4, 9);
        ctx.fillStyle = "#a56e42";
        ctx.fillRect(x - 12, y - 43, 24, 4);
        ctx.fillStyle = "#f4e4bd";
        ctx.beginPath();
        ctx.ellipse(x, y - 6, 7, 3, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    serialize() {

        return {

            ...super.serialize(),

            type: this.type,

            status: this.status,

            productionTimer:
                this.productionTimer,

            productionTime:
                this.productionTime,

            ready: this.ready,

            constructionCost: this.constructionCost
        };
    }

    static fromJSON(data) {

        const building =
            new Building(
                data.type,
                data.x,
                data.y
            );

        Object.assign(
            building,
            data
        );

        return building;
    }
}