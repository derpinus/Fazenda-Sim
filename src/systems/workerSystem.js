import { GameState } from "../managers/gameState.js";
import { Worker } from "../entities/worker.js";
import { canOccupy, moveWithCollision } from "../core/worldCollision.js";
import { findGridPath } from "../core/pathfinding.js";
import { MAP_SIZE } from "../core/config.js";
import { toGrid, toIso } from "../core/isoUtils.js";

const canvas = document.getElementById("gameCanvas");
const RESOURCE_TYPES = new Set(["tree", "rock"]);
const WALKABLE_TILES = new Set([
    "grass", "meadow", "meadow-light", "wildflower", "path", "shore",
    "field", "hill", "lowland", "forest"
]);

function exploredAt(x, y) {
    return !!GameState.exploredTiles?.[Math.floor(x)]?.[Math.floor(y)];
}

function visibleAt(x, y) {
    return !!GameState.visibleTiles?.[Math.floor(x)]?.[Math.floor(y)];
}

function getTile(x, y) {
    return GameState.world?.tiles?.[Math.floor(x)]?.[Math.floor(y)];
}

function samePosition(a, b) {
    return Math.abs(a.x - b.x) < 0.001 && Math.abs(a.y - b.y) < 0.001;
}

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

export class WorkerSystem {
    constructor() {
        this.canvasClick = event => this.handleCanvasClick(event);
        canvas?.addEventListener("click", this.canvasClick);
        this.panel = document.getElementById("worker-panel");
        this.panelSignature = null;
        this.panel?.addEventListener("click", event => {
            const action = event.target.closest("[data-worker-action]")?.dataset.workerAction;
            if (action) this.chooseCommand(action);
        });
    }

    createStartingWorkers() {
        GameState.workers = [
            new Worker(GameState.player.x + 1.15, GameState.player.y + 0.2),
            new Worker(GameState.player.x - 0.15, GameState.player.y + 1.15)
        ];
        GameState.selectedWorkerId = GameState.workers[0].id;
        GameState.workerCommand = null;
        this.updatePanel();
    }

    update(deltaTime = 1 / 60) {
        for (const worker of GameState.workers ?? []) {
            if (worker.state === "idle" || !worker.order) continue;
            if (!this.isOrderTargetValid(worker)) {
                this.cancelOrder(worker, "Alvo removido ou inválido; a ordem foi cancelada.");
                continue;
            }
            if (worker.state === "working") {
                worker.workTime += deltaTime;
                if (worker.workTime >= 0.7) this.completeOrder(worker);
                continue;
            }

            const goal = worker.order.kind === "move"
                ? { x: worker.order.x, y: worker.order.y }
                : { x: worker.order.goalX, y: worker.order.goalY };
            if (!worker.path) {
                worker.path = this.findPath(worker, goal);
                worker.pathIndex = 0;
                worker.pathReplans = 0;
                if (!worker.path) {
                    this.cancelOrder(worker, "Não foi possível encontrar um caminho até o destino.");
                    continue;
                }
            }
            const waypoint = worker.path[worker.pathIndex];
            if (!waypoint) {
                this.cancelOrder(worker, "A rota do trabalhador ficou inválida.");
                continue;
            }
            const dx = waypoint.x - worker.x;
            const dy = waypoint.y - worker.y;
            const distance = Math.hypot(dx, dy);
            if (distance < 0.13) {
                worker.x = waypoint.x;
                worker.y = waypoint.y;
                worker.pathIndex++;
                if (worker.pathIndex >= worker.path.length) {
                    worker.vx = 0;
                    worker.vy = 0;
                    worker.isMoving = false;
                    if (worker.order.kind === "move") {
                        this.finish(worker, `${worker.name ?? "Trabalhador"} chegou e está ocioso.`);
                    } else {
                        worker.state = "working";
                        worker.workTime = 0;
                    }
                }
                this.updatePanel();
                continue;
            }

            const step = Math.min(distance, worker.maxSpeed * 0.55 * deltaTime);
            const nextX = worker.x + dx / distance * step;
            const nextY = worker.y + dy / distance * step;
            if (GameState.mode !== "creative" &&
                (!exploredAt(nextX, worker.y) || !exploredAt(worker.x, nextY))) {
                this.cancelOrder(worker, "O trabalhador não pode avançar por terreno ainda não explorado.");
                continue;
            }
            const oldX = worker.x;
            const oldY = worker.y;
            const oldDistance = distance;
            const moved = moveWithCollision(worker, nextX, nextY, 0.22);
            const remainingDistance = Math.hypot(waypoint.x - worker.x, waypoint.y - worker.y);
            const madeProgress = moved && oldDistance - remainingDistance > 0.001;
            worker.isMoving = madeProgress;
            if (madeProgress) {
                worker.blockedTime = 0;
                worker.animTimer += deltaTime * 8;
                worker.direction = Math.abs(dx) > Math.abs(dy)
                    ? dx > 0 ? "east" : "west"
                    : dy > 0 ? "south" : "north";
            } else {
                worker.blockedTime += deltaTime;
                if (worker.blockedTime >= 1.5) {
                    const newPath = worker.pathReplans < 2
                        ? this.findPath(worker, goal)
                        : null;
                    if (newPath) {
                        worker.path = newPath;
                        worker.pathIndex = 0;
                        worker.pathReplans++;
                        worker.blockedTime = 0;
                    } else {
                        worker.x = oldX;
                        worker.y = oldY;
                        this.cancelOrder(worker, "Caminho bloqueado; escolha outro destino.");
                    }
                }
            }
        }
        this.updatePanel();
    }

    handleCanvasClick(event) {
        if (!GameState.player || !GameState.workers?.length) return;
        const bounds = canvas.getBoundingClientRect();
        const screenX = (event.clientX - bounds.left) * canvas.width / bounds.width;
        const screenY = (event.clientY - bounds.top) * canvas.height / bounds.height;
        const hitWorker = GameState.workers
            .map((worker, index) => ({ worker, index, depth: worker.x + worker.y }))
            .sort((a, b) => b.depth - a.depth || b.index - a.index)
            .map(entry => entry.worker)
            .find(worker => {
                if (!visibleAt(worker.x, worker.y)) return false;
                const point = toIso(worker.x, worker.y);
                return Math.hypot(point.isoX - screenX, point.isoY - screenY + 14) < 25;
            });
        if (hitWorker) {
            GameState.selectedWorkerId = hitWorker.id;
            GameState.workerCommand = null;
            this.updatePanel();
            return;
        }

        if (!GameState.workerCommand) return;
        const grid = toGrid(screenX, screenY);
        if (GameState.workerCommand === "move") {
            this.issueMove(grid);
        } else if (GameState.workerCommand === "collect") {
            this.issueCollect(grid);
        } else if (GameState.workerCommand === "harvest") {
            this.issueHarvest(grid);
        }
    }

    chooseCommand(action) {
        if (!this.getSelectedWorker()) {
            this.message("Selecione um trabalhador no mapa primeiro.");
            return;
        }
        GameState.workerCommand = action;
        const prompts = {
            move: "Clique em um terreno livre e explorado para mover.",
            collect: "Clique em uma árvore ou rocha visível para coletar.",
            harvest: "Clique em um canteiro pronto para colher."
        };
        this.message(prompts[action] ?? "");
        this.updatePanel();
    }

    issueMove(point) {
        const worker = this.getSelectedWorker();
        const x = Math.floor(point.x) + 0.5;
        const y = Math.floor(point.y) + 0.5;
        if (!worker || x < 0.5 || y < 0.5 || x >= MAP_SIZE || y >= MAP_SIZE) {
            this.message("Escolha um terreno dentro do mapa.");
            return;
        }
        if (GameState.mode !== "creative" && !exploredAt(x, y)) {
            this.message("Só é possível ordenar movimentos para terrenos explorados.");
            return;
        }
        if (!this.isWalkable(x, y)) {
            this.message("Esse terreno está bloqueado ou não pode ser atravessado.");
            return;
        }
        this.assignOrder(worker, { kind: "move", x, y });
    }

    issueCollect(point) {
        const candidates = (GameState.world?.decorations ?? [])
            .filter(item => RESOURCE_TYPES.has(item.type) &&
                Math.hypot(item.x - point.x, item.y - point.y) <= 0.95 &&
                visibleAt(item.x, item.y) &&
                (GameState.mode === "creative" || exploredAt(item.x, item.y)));
        const target = candidates.sort((a, b) =>
            Math.hypot(a.x - point.x, a.y - point.y) -
            Math.hypot(b.x - point.x, b.y - point.y)
        )[0];
        if (!target) {
            this.message("Nenhuma árvore ou rocha válida nesse local visível.");
            return;
        }
        const worker = this.getSelectedWorker();
        const goal = this.findApproachPoint(worker, target, 0.78);
        if (!goal) {
            this.message("Não há espaço acessível junto a esse recurso.");
            return;
        }
        if (!target.id) target.id = crypto.randomUUID();
        this.assignOrder(worker, {
            kind: "collect",
            targetId: target.id,
            targetType: target.type,
            targetX: target.x,
            targetY: target.y,
            goalX: goal.x,
            goalY: goal.y
        });
    }

    issueHarvest(point) {
        const plot = (GameState.cropPlots ?? [])
            .filter(item => item.state === "ready" && item.ready &&
                Math.hypot(item.x - point.x, item.y - point.y) <= 0.85 &&
                visibleAt(item.x, item.y) &&
                (GameState.mode === "creative" || exploredAt(item.x, item.y)))
            .sort((a, b) =>
                Math.hypot(a.x - point.x, a.y - point.y) -
                Math.hypot(b.x - point.x, b.y - point.y)
            )[0];
        if (!plot) {
            this.message("Só é possível colher um canteiro pronto e visível.");
            return;
        }
        const worker = this.getSelectedWorker();
        if (!plot.id) plot.id = crypto.randomUUID();
        const goal = this.findApproachPoint(worker, plot, 0.62);
        if (!goal) {
            this.message("Não há espaço acessível junto a esse canteiro.");
            return;
        }
        this.assignOrder(worker, {
            kind: "harvest",
            targetId: plot.id,
            targetType: "cropPlot",
            targetX: plot.x,
            targetY: plot.y,
            goalX: goal.x,
            goalY: goal.y
        });
    }

    findApproachPoint(worker, target, radius) {
        if (!worker) return null;
        let best = null;
        for (let ring = 0; ring < 2; ring++) {
            const candidateRadius = radius + ring * 0.18;
            for (let index = 0; index < 16; index++) {
                const angle = index * Math.PI / 8;
                const x = target.x + Math.cos(angle) * candidateRadius;
                const y = target.y + Math.sin(angle) * candidateRadius;
                if (!this.isWalkable(x, y)) continue;
                if (GameState.mode !== "creative" && !exploredAt(x, y)) continue;
                const distance = Math.hypot(worker.x - x, worker.y - y);
                if (!best || distance < best.distance) best = { x, y, distance };
            }
            if (best) return best;
        }
        return null;
    }

    isWalkable(x, y) {
        const tile = getTile(x, y);
        if (!tile || !WALKABLE_TILES.has(tile)) return false;
        return canOccupy(x, y, 0.22);
    }

    findPath(worker, goal) {
        const size = MAP_SIZE;
        const buckets = Array.from({ length: size * size }, () => []);
        const spatialBuckets = Array.from({ length: size * size }, () => []);
        const addToBuckets = (item, minX, minY, maxX, maxY) => {
            const firstX = Math.max(0, Math.ceil(minX - 0.5));
            const firstY = Math.max(0, Math.ceil(minY - 0.5));
            const lastX = Math.min(size - 1, Math.floor(maxX - 0.5));
            const lastY = Math.min(size - 1, Math.floor(maxY - 0.5));
            for (let x = firstX; x <= lastX; x++) {
                for (let y = firstY; y <= lastY; y++) {
                    buckets[x * size + y].push(item);
                }
            }
        };
        const addToSpatialBucket = (item, x, y) => {
            const cellX = Math.floor(x);
            const cellY = Math.floor(y);
            if (cellX >= 0 && cellY >= 0 && cellX < size && cellY < size) {
                spatialBuckets[cellX * size + cellY].push(item);
            }
        };

        for (const decoration of GameState.world?.decorations ?? []) {
            if (
                decoration.type === "gate" && decoration.open
            ) {
                continue;
            }
            if (["fenceX", "fenceY", "gate"].includes(decoration.type)) {
                addToSpatialBucket(decoration, decoration.x, decoration.y);
                const horizontal = decoration.type === "fenceX" ||
                    decoration.type === "gate" && decoration.orientation !== "y";
                const margin = 0.26;
                addToBuckets(
                    decoration,
                    decoration.x - (horizontal ? 0.5 + margin : margin),
                    decoration.y - (horizontal ? margin : 0.5 + margin),
                    decoration.x + (horizontal ? 0.5 + margin : margin),
                    decoration.y + (horizontal ? margin : 0.5 + margin)
                );
            } else if (["tree", "rock", "mountain"].includes(decoration.type)) {
                addToSpatialBucket(decoration, decoration.x, decoration.y);
                const radius = (decoration.type === "tree" ? 0.42 : 0.3) + 0.22;
                addToBuckets(
                    decoration,
                    decoration.x - radius,
                    decoration.y - radius,
                    decoration.x + radius,
                    decoration.y + radius
                );
            }
        }

        for (const building of GameState.buildings ?? []) {
            const radius = 0.42 + 0.22;
            const obstacle = { kind: "building", object: building };
            addToSpatialBucket(obstacle, building.x, building.y);
            addToBuckets(
                obstacle,
                building.x - radius,
                building.y - radius,
                building.x + radius,
                building.y + radius
            );
        }

        const walkable = new Uint8Array(size * size);
        const elevation = GameState.world?.elevation;
        for (let x = 0; x < size; x++) {
            for (let y = 0; y < size; y++) {
                const tile = getTile(x + 0.5, y + 0.5);
                if (
                    !tile || !WALKABLE_TILES.has(tile) ||
                    GameState.mode !== "creative" && !exploredAt(x + 0.5, y + 0.5)
                ) {
                    continue;
                }
                const centerX = x + 0.5;
                const centerY = y + 0.5;
                const blocked = buckets[x * size + y].some(candidate => {
                    const item = candidate.object ?? candidate;
                    if (
                        item.type === "fenceX" ||
                        item.type === "fenceY" ||
                        item.type === "gate"
                    ) {
                        const horizontal = item.type === "fenceX" ||
                            item.type === "gate" && item.orientation !== "y";
                        return distanceToSegment(
                            centerX,
                            centerY,
                            item.x - (horizontal ? 0.5 : 0),
                            item.y - (horizontal ? 0 : 0.5),
                            item.x + (horizontal ? 0.5 : 0),
                            item.y + (horizontal ? 0 : 0.5)
                        ) < 0.26;
                    }
                    if (candidate.kind === "building") {
                        return Math.hypot(item.x - centerX, item.y - centerY) < 0.64;
                    }
                    return Math.hypot(item.x - centerX, item.y - centerY) <
                        (item.type === "tree" ? 0.42 : 0.3) + 0.22;
                });
                if (!blocked) walkable[x * size + y] = 1;
            }
        }

        const startX = Math.floor(worker.x);
        const startY = Math.floor(worker.y);
        if (startX >= 0 && startY >= 0 && startX < size && startY < size) {
            walkable[startX * size + startY] = 1;
        }
        const isGridWalkable = (x, y) => walkable[x * size + y] === 1;
        const elevationAt = (x, y) => elevation?.[x]?.[y] ?? 0;
        const isPointWalkable = (x, y) => {
            if (
                x < 0.22 || y < 0.22 ||
                x > size - 0.22 || y > size - 0.22
            ) {
                return false;
            }
            const cellX = Math.floor(x);
            const cellY = Math.floor(y);
            const tile = getTile(x, y);
            if (
                !tile || !WALKABLE_TILES.has(tile) ||
                GameState.mode !== "creative" && !exploredAt(x, y)
            ) {
                return false;
            }
            for (
                let obstacleX = Math.max(0, cellX - 1);
                obstacleX <= Math.min(size - 1, cellX + 1);
                obstacleX++
            ) {
                for (
                    let obstacleY = Math.max(0, cellY - 1);
                    obstacleY <= Math.min(size - 1, cellY + 1);
                    obstacleY++
                ) {
                    for (const candidate of spatialBuckets[obstacleX * size + obstacleY]) {
                        const item = candidate.object ?? candidate;
                        if (
                            item.type === "fenceX" ||
                            item.type === "fenceY" ||
                            item.type === "gate"
                        ) {
                            const horizontal = item.type === "fenceX" ||
                                item.type === "gate" && item.orientation !== "y";
                            if (distanceToSegment(
                                x,
                                y,
                                item.x - (horizontal ? 0.5 : 0),
                                item.y - (horizontal ? 0 : 0.5),
                                item.x + (horizontal ? 0.5 : 0),
                                item.y + (horizontal ? 0 : 0.5)
                            ) < 0.26) {
                                return false;
                            }
                        } else if (candidate.kind === "building") {
                            if (Math.hypot(item.x - x, item.y - y) < 0.64) return false;
                        } else if (
                            Math.hypot(item.x - x, item.y - y) <
                            (item.type === "tree" ? 0.42 : 0.3) + 0.22
                        ) {
                            return false;
                        }
                    }
                }
            }
            return true;
        };
        const canTraversePoint = (fromX, fromY, toX, toY) => {
            const distance = Math.hypot(toX - fromX, toY - fromY);
            const steps = Math.ceil(distance / 0.15);
            let previousElevation = elevationAt(
                Math.floor(fromX),
                Math.floor(fromY)
            );
            for (let step = 1; step <= steps; step++) {
                const fraction = step / steps;
                const x = fromX + (toX - fromX) * fraction;
                const y = fromY + (toY - fromY) * fraction;
                if (!isPointWalkable(x, y)) return false;
                const currentElevation = elevationAt(
                    Math.floor(x),
                    Math.floor(y)
                );
                if (Math.abs(currentElevation - previousElevation) > 1) {
                    return false;
                }
                previousElevation = currentElevation;
            }
            return true;
        };
        const canTraverse = (fromX, fromY, toX, toY) => {
            const startX = fromX + 0.5;
            const startY = fromY + 0.5;
            const cornerX = toX + 0.5;
            const cornerY = fromY + 0.5;
            return canTraversePoint(startX, startY, cornerX, cornerY) &&
                canTraversePoint(cornerX, cornerY, toX + 0.5, toY + 0.5);
        };
        return findGridPath(
            worker.x,
            worker.y,
            goal.x,
            goal.y,
            size,
            isGridWalkable,
            elevationAt,
            canTraverse,
            canTraversePoint
        );
    }

    isOrderTargetValid(worker) {
        const order = worker.order;
        if (order.kind === "move") {
            return this.isWalkable(order.x, order.y) &&
                (GameState.mode === "creative" || exploredAt(order.x, order.y));
        }
        if (order.kind === "collect") {
            const target = (GameState.world?.decorations ?? []).find(item =>
                item.id === order.targetId ||
                (!item.id && item.type === order.targetType &&
                    samePosition(item, { x: order.targetX, y: order.targetY }))
            );
            return !!target && target.type === order.targetType &&
                RESOURCE_TYPES.has(target.type) &&
                (GameState.mode === "creative" || exploredAt(target.x, target.y));
        }
        if (order.kind === "harvest") {
            const plot = (GameState.cropPlots ?? []).find(item =>
                item.id === order.targetId ||
                (!item.id && samePosition(item, { x: order.targetX, y: order.targetY }))
            );
            return !!plot && plot.state === "ready" && plot.ready &&
                (GameState.mode === "creative" || exploredAt(plot.x, plot.y));
        }
        return false;
    }

    completeOrder(worker) {
        const order = worker.order;
        if (!order) return;
        if (order.kind === "collect") {
            const resources = GameState.world?.decorations ?? [];
            const target = resources.find(item => item.id === order.targetId ||
                (!item.id && item.type === order.targetType &&
                    samePosition(item, { x: order.targetX, y: order.targetY })));
            if (!target) {
                this.cancelOrder(worker, "O recurso não existe mais; a ordem foi cancelada.");
                return;
            }
            resources.splice(resources.indexOf(target), 1);
            const wood = target.type === "tree";
            GameState.inventory?.add(wood ? "wood" : "stone", wood ? 4 : 2);
            this.finish(worker, `${wood ? "Madeira +4" : "Pedra +2"} coletada.`);
            return;
        }
        if (order.kind === "harvest") {
            const plot = GameState.cropPlots?.find(item =>
                item.id === order.targetId ||
                (!item.id && samePosition(item, { x: order.targetX, y: order.targetY }))
            );
            if (!plot || plot.state !== "ready" || !plot.ready) {
                this.cancelOrder(worker, "O canteiro deixou de estar pronto; a ordem foi cancelada.");
                return;
            }
            const cropItem = plot.type === "corn" ? "corn" : "wheat";
            const cropName = cropItem === "corn" ? "milho" : "trigo";
            plot.state = "empty";
            plot.growth = 0;
            plot.ready = false;
            GameState.inventory?.add(cropItem, 1);
            this.finish(worker, `Colheita concluída: +1 ${cropName}.`);
        }
    }

    assignOrder(worker, order) {
        if (!worker) return;
        const goal = order.kind === "move"
            ? { x: order.x, y: order.y }
            : { x: order.goalX, y: order.goalY };
        const path = this.findPath(worker, goal);
        if (!path) {
            this.message("Não há um caminho acessível até esse destino.");
            return;
        }
        worker.order = order;
        worker.state = "moving";
        worker.path = path;
        worker.pathIndex = 0;
        worker.pathReplans = 0;
        worker.blockedTime = 0;
        worker.workTime = 0;
        GameState.workerCommand = null;
        this.message(order.kind === "move"
            ? "Ordem de movimento recebida."
            : "Ordem recebida; trabalhador a caminho.");
        this.updatePanel();
    }

    finish(worker, message) {
        worker.order = null;
        worker.state = "idle";
        worker.path = null;
        worker.pathIndex = 0;
        worker.blockedTime = 0;
        worker.workTime = 0;
        this.message(message);
        this.updatePanel();
    }

    cancelOrder(worker, message) {
        worker.order = null;
        worker.state = "idle";
        worker.path = null;
        worker.pathIndex = 0;
        worker.blockedTime = 0;
        worker.workTime = 0;
        this.message(message);
        this.updatePanel();
    }

    getSelectedWorker() {
        const worker = GameState.workers?.find(candidate =>
            candidate.id === GameState.selectedWorkerId
        );
        return worker && visibleAt(worker.x, worker.y) ? worker : null;
    }

    message(text) {
        GameState.actionMessage = text;
    }

    updatePanel() {
        if (!this.panel) return;
        const selected = this.getSelectedWorker();
        if (!selected && GameState.workerCommand) {
            GameState.workerCommand = null;
        }
        const signature = [
            GameState.selectedWorkerId,
            GameState.workerCommand,
            ...(GameState.workers ?? []).map(worker =>
                `${worker.id}:${worker.state}:${worker.order?.kind ?? ""}:${visibleAt(worker.x, worker.y)}`
            )
        ].join("|");
        if (signature === this.panelSignature) return;
        this.panelSignature = signature;
        const list = this.panel.querySelector("#worker-list");
        if (list) {
            list.innerHTML = (GameState.workers ?? []).map((worker, index) =>
                `<button type="button" class="worker-select${worker.id === selected?.id ? " selected" : ""}" data-worker-id="${worker.id}"${visibleAt(worker.x, worker.y) ? "" : " disabled"}>Trabalhador ${index + 1} · ${visibleAt(worker.x, worker.y) ? this.stateLabel(worker) : "fora de vista"}</button>`
            ).join("");
            list.querySelectorAll("[data-worker-id]").forEach(button => {
                button.addEventListener("click", () => {
                    const worker = GameState.workers.find(candidate =>
                        candidate.id === button.dataset.workerId
                    );
                    if (!worker || !visibleAt(worker.x, worker.y)) return;
                    GameState.selectedWorkerId = worker.id;
                    GameState.workerCommand = null;
                    this.updatePanel();
                });
            });
        }
        const state = this.panel.querySelector("#worker-status");
        if (state) {
            state.textContent = selected
                ? `${this.stateLabel(selected)}${GameState.workerCommand ? " · escolha o alvo no mapa" : ""}`
                : "Selecione um trabalhador no mapa.";
        }
        this.panel.querySelectorAll("[data-worker-action]").forEach(button => {
            button.classList.toggle("active", button.dataset.workerAction === GameState.workerCommand);
            button.disabled = !selected;
        });
    }

    stateLabel(worker) {
        return worker.state === "moving" ? "em movimento"
            : worker.state === "working" ? "trabalhando"
                : "ocioso";
    }
}
