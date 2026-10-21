const DIRECTIONS = [
    [-1, -1, Math.SQRT2], [-1, 0, 1], [-1, 1, Math.SQRT2],
    [0, -1, 1], [0, 1, 1],
    [1, -1, Math.SQRT2], [1, 0, 1], [1, 1, Math.SQRT2]
];

function heuristic(x, y, targetX, targetY) {
    const dx = Math.abs(targetX - x);
    const dy = Math.abs(targetY - y);
    return Math.max(dx, dy) + (Math.SQRT2 - 1) * Math.min(dx, dy);
}

function push(queue, entry) {
    let index = queue.length;
    queue.push(entry);
    while (index > 0) {
        const parent = Math.floor((index - 1) / 2);
        if (queue[parent].score <= entry.score) break;
        queue[index] = queue[parent];
        index = parent;
    }
    queue[index] = entry;
}

function pop(queue) {
    const first = queue[0];
    const last = queue.pop();
    if (queue.length > 0) {
        let index = 0;
        while (true) {
            const left = index * 2 + 1;
            const right = left + 1;
            if (left >= queue.length) break;
            const child = right < queue.length &&
                queue[right].score < queue[left].score ? right : left;
            if (queue[child].score >= last.score) break;
            queue[index] = queue[child];
            index = child;
        }
        queue[index] = last;
    }
    return first;
}

export function findGridPath(
    startX,
    startY,
    targetX,
    targetY,
    size,
    isWalkable,
    elevationAt,
    canTraverse,
    canTraversePoint
) {
    const sourceX = Math.floor(startX);
    const sourceY = Math.floor(startY);
    const destinationX = Math.floor(targetX);
    const destinationY = Math.floor(targetY);
    if (
        sourceX < 0 || sourceY < 0 || sourceX >= size || sourceY >= size ||
        destinationX < 0 || destinationY < 0 ||
        destinationX >= size || destinationY >= size ||
        !isWalkable(destinationX, destinationY)
    ) {
        return null;
    }

    const source = sourceX * size + sourceY;
    const destination = destinationX * size + destinationY;
    const total = size * size;
    const costs = new Float64Array(total);
    costs.fill(Infinity);
    const parents = new Int32Array(total);
    parents.fill(-1);
    const closed = new Uint8Array(total);
    const queue = [];
    costs[source] = 0;
    push(queue, {
        index: source,
        score: heuristic(sourceX, sourceY, destinationX, destinationY)
    });

    while (queue.length > 0) {
        const current = pop(queue);
        if (closed[current.index]) continue;
        if (current.index === destination) break;
        closed[current.index] = 1;

        const x = Math.floor(current.index / size);
        const y = current.index % size;
        for (const [dx, dy, movementCost] of DIRECTIONS) {
            const nextX = x + dx;
            const nextY = y + dy;
            if (
                nextX < 0 || nextY < 0 || nextX >= size || nextY >= size ||
                !isWalkable(nextX, nextY) ||
                Math.abs(elevationAt(nextX, nextY) - elevationAt(x, y)) > 1
            ) {
                continue;
            }

            if (
                dx !== 0 && dy !== 0 &&
                (
                    !isWalkable(x + dx, y) ||
                    !isWalkable(x, y + dy) ||
                    Math.abs(
                        elevationAt(x + dx, y) - elevationAt(x, y)
                    ) > 1 ||
                    Math.abs(
                        elevationAt(nextX, nextY) - elevationAt(x + dx, y)
                    ) > 1
                )
            ) {
                continue;
            }
            if (canTraverse && !canTraverse(x, y, nextX, nextY)) continue;

            const next = nextX * size + nextY;
            if (closed[next]) continue;
            const nextCost = costs[current.index] + movementCost;
            if (nextCost >= costs[next]) continue;
            costs[next] = nextCost;
            parents[next] = current.index;
            push(queue, {
                index: next,
                score: nextCost + heuristic(nextX, nextY, destinationX, destinationY)
            });
        }
    }

    if (source !== destination && parents[destination] === -1) return null;

    const indices = [];
    for (let index = destination; index !== source; index = parents[index]) {
        if (index < 0) return null;
        indices.push(index);
    }
    indices.reverse();
    const path = indices.map(index => ({
        x: Math.floor(index / size) + 0.5,
        y: index % size + 0.5
    }));
    if (canTraversePoint) {
        let previous = { x: startX, y: startY };
        for (const point of path) {
            if (!canTraversePoint(previous.x, previous.y, point.x, point.y)) {
                return null;
            }
            previous = point;
        }
        if (!canTraversePoint(previous.x, previous.y, targetX, targetY)) {
            return null;
        }
    }
    path.push({ x: targetX, y: targetY });
    return path;
}
