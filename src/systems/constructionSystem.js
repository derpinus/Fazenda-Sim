import { GameState } from "../managers/gameState.js";
import { Building } from "../entities/building.js";
import { MAP_SIZE } from "../core/config.js";
import { toGrid } from "../core/isoUtils.js";

const BUILDING_COSTS = {
    barn: { wood: 12, stone: 4 },
    well: { wood: 8, stone: 4 },
    silo: { wood: 10, stone: 6 },
    farmhouse: { wood: 18, stone: 8 },
    cheesePress: { wood: 6, stone: 3 },
    chickenCoop: { wood: 10, stone: 2 },
    stable: { wood: 14, stone: 4 }
};

let selectedTool = null;
let dragStart = null;

function setStatus(message) {
    const status = document.getElementById("build-status");
    if (status) status.textContent = message;
    GameState.actionMessage = message;
}

function toGridPosition(event, canvas) {
    const bounds = canvas.getBoundingClientRect();
    const screenX = (event.clientX - bounds.left) * canvas.width / bounds.width;
    const screenY = (event.clientY - bounds.top) * canvas.height / bounds.height;
    return toGrid(screenX, screenY);
}

function spendResources(cost) {
    if (GameState.mode === "creative") return true;
    if (!Object.entries(cost).every(
        ([item, quantity]) => GameState.inventory?.has(item, quantity)
    )) {
        return false;
    }
    for (const [item, quantity] of Object.entries(cost)) {
        GameState.inventory.remove(item, quantity);
    }
    return true;
}

function validTile(x, y) {
    const tileX = Math.floor(x);
    const tileY = Math.floor(y);
    const inBounds = tileX >= 0 &&
        tileY >= 0 &&
        tileX < MAP_SIZE &&
        tileY < MAP_SIZE &&
        !["water", "ocean", "cliff", "highland"].includes(GameState.world.tiles[tileX][tileY]);
    return inBounds && (
        GameState.mode === "creative" ||
        !!GameState.exploredTiles?.[tileX]?.[tileY]
    );
}

function hasObstacle(x, y) {
    return GameState.world.decorations.some(
        decoration =>
            ["tree", "rock"].includes(decoration.type) &&
            Math.hypot(decoration.x - (x + 0.5), decoration.y - (y + 0.5)) < 0.55
    );
}

function buildStructure(type, position) {
    const cost = BUILDING_COSTS[type];
    if (!validTile(position.x, position.y)) {
        setStatus("Escolha um terreno livre da água e das falésias.");
        return;
    }
    if (GameState.buildings.some(
        building => Math.hypot(building.x - position.x, building.y - position.y) < 1.5
    ) || hasObstacle(Math.floor(position.x), Math.floor(position.y))) {
        setStatus("Esse local já está ocupado por uma construção.");
        return;
    }
    if (!spendResources(cost)) {
        setStatus(`Materiais insuficientes: ${cost.wood} madeira e ${cost.stone} pedra.`);
        return;
    }
    const building = new Building(type, position.x, position.y);
    building.constructionCost = { ...cost };
    GameState.buildings.push(building);
    setStatus(`${type === "cheesePress" ? "Queijaria" : type} construído.`);
}

function buildPen(start, end) {
    const minX = Math.min(Math.floor(start.x), Math.floor(end.x));
    const maxX = Math.max(Math.floor(start.x), Math.floor(end.x));
    const minY = Math.min(Math.floor(start.y), Math.floor(end.y));
    const maxY = Math.max(Math.floor(start.y), Math.floor(end.y));
    const width = maxX - minX + 1;
    const height = maxY - minY + 1;
    if (width < 2 || height < 2) {
        setStatus("O curral precisa ter no mínimo 2 tiles por lado.");
        return;
    }
    if (
        minX < 0 ||
        minY < 0 ||
        maxX >= MAP_SIZE ||
        maxY >= MAP_SIZE
    ) {
        setStatus("O curral precisa caber dentro do mapa.");
        return;
    }

    for (let x = minX; x <= maxX; x++) {
        for (let y = minY; y <= maxY; y++) {
            if (!validTile(x, y)) {
                setStatus("O curral precisa ficar dentro de terreno explorado e construível.");
                return;
            }
            if (hasObstacle(x, y)) {
                setStatus("Retire árvores e pedras do espaço do curral antes de construir.");
                return;
            }
        }
    }

    for (let x = minX; x <= maxX; x++) {
        if (!validTile(x, minY) || !validTile(x, maxY)) {
            setStatus("O perímetro do curral precisa ficar em terreno construível.");
            return;
        }
    }
    for (let y = minY; y <= maxY; y++) {
        if (!validTile(minX, y) || !validTile(maxX, y)) {
            setStatus("O perímetro do curral precisa ficar em terreno construível.");
            return;
        }
    }

    const cost = { wood: 2 * (width + height) * 2 };
    if (!spendResources(cost)) {
        setStatus(`Faltam materiais: este curral custa ${cost.wood} madeira.`);
        return;
    }

    const decorations = GameState.world.decorations;
    const gateX = minX + Math.floor(width / 2);
    const penId = crypto.randomUUID();
    for (let x = minX; x <= maxX; x++) {
        decorations.push({
            type: "fenceX",
            penId,
            x: x + 0.5,
            y: minY,
            variation: 0.5,
            woodCost: 2
        });
        decorations.push({
            type: x === gateX ? "gate" : "fenceX",
            penId,
            orientation: "x",
            x: x + 0.5,
            y: maxY + 1,
            variation: 0.5,
            open: false,
            woodCost: 2
        });
    }
    for (let y = minY; y <= maxY; y++) {
        decorations.push(
            {
                type: "fenceY",
                penId,
                x: minX,
                y: y + 0.5,
                variation: 0.5,
                woodCost: 2
            },
            {
                type: "fenceY",
                penId,
                x: maxX + 1,
                y: y + 0.5,
                variation: 0.5,
                woodCost: 2
            }
        );
    }
    setStatus(`Curral ${width} × ${height} construído. (-${cost.wood} madeira)`);
}

function buildFence(start, end, orientation) {
    const horizontal = orientation === "x";
    const fixed = Math.floor(horizontal ? start.y : start.x);
    const first = Math.floor(horizontal ? start.x : start.y);
    const last = Math.floor(horizontal ? end.x : end.y);
    const startIndex = Math.min(first, last);
    const endIndex = Math.max(first, last);
    const segments = [];

    for (let index = startIndex; index <= endIndex; index++) {
        const position = horizontal
            ? { x: index + 0.5, y: fixed }
            : { x: fixed, y: index + 0.5 };
        const adjacent = horizontal
            ? [validTile(position.x, position.y - 0.5), validTile(position.x, position.y + 0.5)]
            : [validTile(position.x - 0.5, position.y), validTile(position.x + 0.5, position.y)];
        if (!adjacent.every(Boolean)) {
            setStatus("Construa cercas somente entre tiles de terreno explorado e livre.");
            return;
        }
        if (hasObstacle(position.x, position.y)) {
            setStatus("Retire árvores e pedras antes de colocar a cerca.");
            return;
        }
        const duplicate = GameState.world.decorations.some(item =>
            ["fence", "fenceX", "fenceY", "gate"].includes(item.type) &&
            Math.hypot(item.x - position.x, item.y - position.y) < 0.2
        );
        if (duplicate) {
            setStatus("Já existe uma cerca ou porteira nesse trecho.");
            return;
        }
        segments.push({
            type: horizontal ? "fenceX" : "fenceY",
            ...position,
            variation: 0.5,
            woodCost: 2
        });
    }

    const cost = { wood: segments.length * 2 };
    if (!spendResources(cost)) {
        setStatus(`Faltam ${cost.wood} madeiras para construir essa cerca.`);
        return;
    }
    GameState.world.decorations.push(...segments);
    setStatus(`${segments.length} trechos de cerca construídos.`);
}

function buildGate(position, orientation) {
    const horizontal = orientation === "x";
    const gatePosition = horizontal
        ? { x: Math.floor(position.x) + 0.5, y: Math.round(position.y) }
        : { x: Math.round(position.x), y: Math.floor(position.y) + 0.5 };
    const adjacent = horizontal
        ? [validTile(gatePosition.x, gatePosition.y - 0.5), validTile(gatePosition.x, gatePosition.y + 0.5)]
        : [validTile(gatePosition.x - 0.5, gatePosition.y), validTile(gatePosition.x + 0.5, gatePosition.y)];
    if (!adjacent.every(Boolean)) {
        setStatus("Coloque a porteira entre dois tiles de terreno explorado e livre.");
        return;
    }
    const existing = GameState.world.decorations.find(item =>
        ["fence", "fenceX", "fenceY"].includes(item.type) &&
        Math.hypot(item.x - gatePosition.x, item.y - gatePosition.y) < 0.2
    );
    const occupied = GameState.world.decorations.some(item =>
        item.type === "gate" &&
        Math.hypot(item.x - gatePosition.x, item.y - gatePosition.y) < 0.2
    );
    if (occupied) {
        setStatus("Já existe uma porteira nesse trecho.");
        return;
    }
    if (!existing && hasObstacle(gatePosition.x, gatePosition.y)) {
        setStatus("Retire árvores e pedras antes de colocar a porteira.");
        return;
    }
    if (!spendResources({ wood: 4 })) {
        setStatus("A porteira custa 4 madeiras.");
        return;
    }

    if (existing) {
        GameState.world.decorations.splice(
            GameState.world.decorations.indexOf(existing),
            1
        );
    }
    GameState.world.decorations.push({
        type: "gate",
        orientation,
        ...gatePosition,
        variation: 0.5,
        open: false,
        woodCost: 4,
        ...(existing?.penId ? { penId: existing.penId } : {})
    });
    setStatus(existing ? "Trecho de cerca substituído por uma porteira." : "Porteira construída.");
}

function demolishAt(position) {
    const building = GameState.buildings.find(
        item => Math.hypot(item.x - position.x, item.y - position.y) < 1.25
    );
    if (building) {
        GameState.buildings.splice(GameState.buildings.indexOf(building), 1);
        const cost = building.constructionCost;
        if (cost && GameState.mode !== "creative") {
            GameState.inventory.add("wood", Math.floor(cost.wood / 2));
            GameState.inventory.add("stone", Math.floor(cost.stone / 2));
        }
        setStatus(`${building.type} demolido${cost ? "; metade dos materiais foi recuperada." : "."}`);
        return;
    }

    const fence = GameState.world.decorations.find(
        item =>
            ["fence", "fenceX", "fenceY", "gate"].includes(item.type) &&
            Math.hypot(item.x - position.x, item.y - position.y) < 0.8
    );
    if (!fence) {
        setStatus("Aproxime a ferramenta de demolição de uma construção ou cerca.");
        return;
    }
    const groupedPen = Boolean(fence.penId);
    const removed = groupedPen
        ? GameState.world.decorations.filter(item => item.penId === fence.penId)
        : [fence];
    GameState.world.decorations = GameState.world.decorations.filter(
        item => !removed.includes(item)
    );
    const materialCost = removed.reduce((total, item) => {
        if (item.penId === "starter-pen" && !Number.isFinite(item.woodCost)) {
            return total;
        }
        const fallbackCost = item.penId
            ? 2
            : item.type === "gate" ? 4 : 2;
        return total + (Number.isFinite(item.woodCost) ? item.woodCost : fallbackCost);
    }, 0);
    const refund = Math.floor(materialCost / 2);
    if (GameState.mode !== "creative") GameState.inventory.add("wood", refund);
    const removedLabel = groupedPen
        ? "Curral removido"
        : fence.type === "gate" ? "Porteira demolida" : "Trecho de cerca demolido";
    setStatus(`${removedLabel}; ${refund} madeiras recuperadas.`);
}

const canvas = document.getElementById("gameCanvas");
canvas.addEventListener("pointermove", event => {
    if (!["pen", "fenceX", "fenceY"].includes(selectedTool) || !dragStart) return;
    GameState.buildPreview = {
        start: dragStart,
        end: toGridPosition(event, canvas),
        tool: selectedTool
    };
});

canvas.addEventListener("pointerdown", event => {
    if (!selectedTool || !GameState.world) return;
    dragStart = toGridPosition(event, canvas);
    GameState.buildPreview = { start: dragStart, end: dragStart, tool: selectedTool };
    canvas.setPointerCapture(event.pointerId);
});

canvas.addEventListener("pointerup", event => {
    if (!selectedTool || !dragStart) return;
    const end = toGridPosition(event, canvas);
    const start = dragStart;
    dragStart = null;
    GameState.buildPreview = null;
    if (selectedTool === "demolish") {
        demolishAt(end);
    } else if (selectedTool === "pen") {
        buildPen(start, end);
    } else if (selectedTool === "fenceX" || selectedTool === "fenceY") {
        buildFence(start, end, selectedTool === "fenceX" ? "x" : "y");
    } else if (selectedTool === "gateX" || selectedTool === "gateY") {
        buildGate(end, selectedTool === "gateX" ? "x" : "y");
    } else {
        buildStructure(selectedTool, {
            x: Math.floor(end.x) + 0.5,
            y: Math.floor(end.y) + 0.5
        });
    }
});

window.toggleBuildMenu = () => {
    const menu = document.getElementById("build-menu");
    menu.hidden = !menu.hidden;
};

window.selectBuildTool = tool => {
    selectedTool = tool === "cancel" ? null : tool;
    GameState.buildPreview = null;
    if (tool === "cancel") {
        setStatus("Escolha uma construção.");
        return;
    }
    const descriptions = {
        pen: "Curral fechado rápido: arraste para definir o tamanho. Use cercas e porteiras para criar formatos abertos.",
        fenceX: "Arraste para construir trechos de cerca na direção ↗; cada trecho custa 2 madeiras.",
        fenceY: "Arraste para construir trechos de cerca na direção ↘; cada trecho custa 2 madeiras.",
        gateX: "Clique numa linha de cerca ↗ para instalar uma porteira. Espaço abre e fecha.",
        gateY: "Clique numa linha de cerca ↘ para instalar uma porteira. Espaço abre e fecha.",
        demolish: "Clique numa construção ou curral para demolir; metade dos materiais é recuperada.",
        barn: "Celeiro: 12 madeiras e 4 pedras.",
        well: "Poço: 8 madeiras e 4 pedras.",
        silo: "Silo: 10 madeiras e 6 pedras.",
        farmhouse: "Casa: 18 madeiras e 8 pedras.",
        cheesePress: "Queijaria: 6 madeiras e 3 pedras.",
        chickenCoop: "Galinheiro: 10 madeiras e 2 pedras.",
        stable: "Estábulo: 14 madeiras e 4 pedras."
    };
    setStatus(descriptions[tool] ?? "Ferramenta selecionada.");
};