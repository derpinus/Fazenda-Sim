import { MAP_SIZE } from "./config.js";

function createRandom(seed) {
    let value = seed >>> 0;
    return () => {
        value += 0x6D2B79F5;
        let result = value;
        result = Math.imul(result ^ (result >>> 15), result | 1);
        result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
        return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
    };
}

function hashSeed(seed) {
    let hash = 2166136261;
    for (const character of String(seed)) {
        hash ^= character.charCodeAt(0);
        hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
}

function distanceToSegment(x, y, start, end) {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const lengthSquared = dx * dx + dy * dy;
    const projection = Math.max(
        0,
        Math.min(
            1,
            ((x - start.x) * dx + (y - start.y) * dy) / lengthSquared
        )
    );
    return Math.hypot(
        x - (start.x + projection * dx),
        y - (start.y + projection * dy)
    );
}

export function generateWorld(seed) {
    const scale = MAP_SIZE / 24;
    const point = (x, y) => ({ x: x * scale, y: y * scale });
    const seedHash = hashSeed(seed);
    const random = createRandom(seedHash);
    const sample = (x, y, salt = 0) => {
        const value = Math.sin(x * 127.1 + y * 311.7 + salt * 74.7 + seedHash) * 43758.5453;
        return value - Math.floor(value);
    };
    const tiles = Array.from(
        { length: MAP_SIZE },
        () => Array(MAP_SIZE).fill("meadow")
    );
    const elevation = Array.from(
        { length: MAP_SIZE },
        () => Array(MAP_SIZE).fill(0)
    );
    const decorations = [];
    const clearingCenter = point(12, 13);
    const clearing = { ...clearingCenter, radius: 3.8 * scale };
    const pond = {
        x: (18 + Math.floor(random() * 2)) * scale,
        y: (7 + Math.floor(random() * 2)) * scale,
        radiusX: (1.7 + random() * 0.5) * scale,
        radiusY: (1.2 + random() * 0.4) * scale
    };
    const road = [
        point(11, 14),
        point(8, 11),
        point(5, 7)
    ];
    const field = { ...point(9, 10), width: 4 * scale, height: 3 * scale };
    const hills = [
        { x: 16, y: 9, radius: 3.2, peak: 3 },
        { x: 8, y: 17, radius: 3.5, peak: 3 },
        { x: 4, y: 4, radius: 3.2, peak: 5 },
        { x: 19, y: 4, radius: 3.7, peak: 5 },
        { x: 21, y: 12, radius: 3.3, peak: 4 },
        { x: 4, y: 19, radius: 3.4, peak: 4 },
        { x: 18, y: 20, radius: 3.6, peak: 5 },
        { x: 2, y: 12, radius: 2.5, peak: 4 }
    ];
    for (let hill = 0; hill < 22; hill++) {
        hills.push({
            x: 1.5 + random() * 21,
            y: 1.5 + random() * 21,
            radius: 1.3 + random() * 2.8,
            peak: 1 + Math.floor(random() * 4)
        });
    }
    const scaledHills = hills.map(hill => ({
        x: (hill.x + (random() - 0.5) * 0.9) * scale,
        y: (hill.y + (random() - 0.5) * 0.9) * scale,
        radius: (hill.radius + (random() - 0.5) * 0.9) * scale,
        peak: hill.peak
    }));
    const stream = [
        point(16, 4),
        point(17, 5),
        point(18, 6),
        { x: pond.x, y: pond.y }
    ];

    for (let x = 0; x < MAP_SIZE; x++) {
        for (let y = 0; y < MAP_SIZE; y++) {
            const edgeDistance = Math.min(
                x,
                y,
                MAP_SIZE - 1 - x,
                MAP_SIZE - 1 - y
            );
            const inClearing =
                Math.hypot(x - clearing.x, y - clearing.y) < clearing.radius;
            const hillHeight = inClearing
                ? 0
                : Math.max(
                    0,
                    ...scaledHills.map(hill =>
                        (1 - Math.hypot(x - hill.x, y - hill.y) / hill.radius) *
                        hill.peak
                    )
                );
            elevation[x][y] = Math.min(5, Math.floor(hillHeight + 0.6));

            const pondDistance =
                ((x - pond.x) / pond.radiusX) ** 2 +
                ((y - pond.y) / pond.radiusY) ** 2;
            const inStream = stream.slice(0, -1).some((start, index) =>
                distanceToSegment(x, y, start, stream[index + 1]) < 0.52 * scale
            );
            const onRoad =
                distanceToSegment(x, y, road[0], road[1]) < 0.72 * scale ||
                distanceToSegment(x, y, road[1], road[2]) < 0.72 * scale;

            const borderDepth = 4 + Math.floor(
                sample(Math.floor(x / 3), Math.floor(y / 3), 11) * 5
            );
            if (edgeDistance <= borderDepth) {
                tiles[x][y] = "cliff";
                elevation[x][y] = Math.min(
                    9,
                    2 + Math.floor((borderDepth - edgeDistance) * 0.9)
                );
                const mountain = edgeDistance <= 2 && sample(x, y, 12) > 0.58;
                const forest = edgeDistance > 1 && sample(x, y, 13) > 0.34;
                if (mountain) {
                    decorations.push({
                        type: "mountain",
                        x: x + 0.2 + random() * 0.6,
                        y: y + 0.2 + random() * 0.6,
                        variation: random(),
                        height: 1 + Math.floor(random() * 3)
                    });
                } else if (forest) {
                    decorations.push({
                        type: "tree",
                        x: x + 0.2 + random() * 0.6,
                        y: y + 0.2 + random() * 0.6,
                        variation: random(),
                        form: sample(x, y, 14) > 0.74 ? "bare" : "evergreen"
                    });
                } else if (sample(x, y, 15) > 0.35) {
                    decorations.push({
                        type: "rock",
                        x: x + 0.25 + random() * 0.5,
                        y: y + 0.25 + random() * 0.5,
                        variation: 0.78 + random() * 0.22
                    });
                }
                continue;
            }

            if (edgeDistance <= 3 && sample(x, y, 9) < 0.88) {
                tiles[x][y] = "cliff";
                elevation[x][y] = Math.max(elevation[x][y], 2 + edgeDistance);
                continue;
            }

            if (pondDistance <= 1 || inStream) {
                tiles[x][y] = "water";
                elevation[x][y] = 0;
                continue;
            }

            if (pondDistance <= 1.75) {
                tiles[x][y] = "shore";
            } else if (onRoad && !inClearing) {
                tiles[x][y] = "path";
                elevation[x][y] = 0;
            } else if (
                Math.hypot(x - field.x, y - field.y) < 3.4 * scale
            ) {
                tiles[x][y] = "field";
                elevation[x][y] = 0;
            } else if (elevation[x][y] >= 5) {
                tiles[x][y] = "highland";
            } else if (elevation[x][y] > 0) {
                tiles[x][y] = "hill";
            } else if (sample(x, y, 2) < 0.12) {
                tiles[x][y] = "wildflower";
            } else if (sample(x, y, 3) < 0.12) {
                tiles[x][y] = "meadow-light";
            } else {
                tiles[x][y] = "meadow";
            }

            const nearRoad = onRoad || tiles[x][y] === "field";
            const borderForest = edgeDistance <= 11;
            const forestDensity = borderForest ? 0.84 : inClearing ? 0.035 : 0.16;
            if (
                !["water", "field", "path", "highland"].includes(tiles[x][y]) &&
                !inClearing &&
                sample(x, y, 4) < (nearRoad ? 0.025 : forestDensity)
            ) {
                decorations.push({
                    type: sample(x, y, 5) < (borderForest ? 0.72 : 0.78) ? "tree" : "rock",
                    x: x + 0.25 + random() * 0.5,
                    y: y + 0.25 + random() * 0.5,
                    variation: random(),
                    form: sample(x, y, 8) > 0.86 ? "bare" :
                        sample(x, y, 8) > 0.7 ? "evergreen" : "broadleaf"
                });
            } else if (
                tiles[x][y] === "highland" &&
                sample(x, y, 7) < 0.4
            ) {
                decorations.push({
                    type: "rock",
                    x: x + 0.25 + random() * 0.5,
                    y: y + 0.25 + random() * 0.5,
                    variation: random()
                });
            } else if (
                tiles[x][y] === "wildflower" &&
                !nearRoad &&
                sample(x, y, 6) < 0.42
            ) {
                decorations.push({
                    type: "flower",
                    x: x + 0.3 + random() * 0.4,
                    y: y + 0.3 + random() * 0.4,
                    variation: random()
                });
            }
        }
    }

    const starterPenId = "starter-pen";
    const gateX = 10 * scale;
    for (let x = 7 * scale; x < 13 * scale; x++) {
        for (const y of [8 * scale, 12 * scale]) {
            decorations.push({
                type: y === 12 * scale && x === gateX ? "gate" : "fenceX",
                penId: starterPenId,
                x: x + 0.5,
                y,
                variation: 0.5,
                open: false
            });
        }
    }

    for (let y = 8 * scale; y < 12 * scale; y++) {
        for (const x of [7 * scale, 13 * scale]) {
            decorations.push({
                type: "fenceY",
                penId: starterPenId,
                x,
                y: y + 0.5,
                variation: 0.5
            });
        }
    }

    decorations.push(
        { type: "hay", x: 12.5 * scale, y: 10.2 * scale, variation: 0.7 },
        { type: "hay", x: 13 * scale, y: 10.6 * scale, variation: 0.3 },
        { type: "grass", x: 14.3 * scale, y: 15.2 * scale, variation: 0.8 },
        { type: "grass", x: 6.4 * scale, y: 14.1 * scale, variation: 0.2 }
    );

    return {
        seed: String(seed),
        tiles,
        elevation,
        decorations,
        clearing,
        pond
    };
}
