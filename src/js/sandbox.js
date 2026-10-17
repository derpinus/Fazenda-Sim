function spawnEntityOrStructure(type, x, y, animalsList, farmPlotsList) {
    const tileX = Math.floor(x);
    const tileY = Math.floor(y);

    if (tileX < 0 || tileX >= MAP_SIZE || tileY < 0 || tileY >= MAP_SIZE) return;

    if (type === 'cow' || type === 'sheep' || type === 'horse') {
        animalsList.push(new Animal(type, x, y));
        if (typeof playSound === 'function') playSound('animal');
    } else if (type === 'chicken') {
        // 25% de chance de nascer um galo vermelho ao colocar galinhas
        const isRooster = Math.random() < 0.25;
        const animalType = isRooster ? 'rooster' : 'chicken';
        
        animalsList.push(new Animal(animalType, x, y));
        if (typeof playSound === 'function') playSound('animal');
    } else if (type === 'market') {
        market.x = tileX;
        market.y = tileY;
        if (typeof mapGrid !== 'undefined') mapGrid[tileX][tileY] = { type: 'market', isSolid: true };
        if (typeof playSound === 'function') playSound('collect');
    } else if (type === 'cheesePress') {
        cheesePress.x = tileX;
        cheesePress.y = tileY;
        cheesePress.status = 'vazia';
        if (typeof mapGrid !== 'undefined') mapGrid[tileX][tileY] = { type: 'cheesePress', isSolid: true };
        if (typeof playSound === 'function') playSound('collect');
    } else if (type === 'plot') {
        farmPlotsList.push({ x: tileX, y: tileY, state: 'empty', timer: 0 });
        if (typeof playSound === 'function') playSound('collect');
    } else if (type === 'pasture') {
        pasturePlots.push({ x: tileX, y: tileY, state: 'ready', timer: 0 });
        if (typeof playSound === 'function') playSound('collect');
    } else if (type === 'corn') {
        cornPlots.push({ x: tileX, y: tileY, state: 'ready', timer: 0 });
        if (typeof playSound === 'function') playSound('collect');
    } else if (type === 'obstacle') {
        if (typeof mapObstacles !== 'undefined') mapObstacles.push({ x: x, y: y, radius: 0.4 });
        if (typeof playSound === 'function') playSound('collect');
    }
}

function removeObjectAt(x, y, animalsList, farmPlotsList) {
    const tileX = Math.floor(x);
    const tileY = Math.floor(y);

    const animalIndex = animalsList.findIndex(a => Math.hypot(a.x - x, a.y - y) < 0.8);
    if (animalIndex > -1) {
        animalsList.splice(animalIndex, 1);
        if (typeof playSound === 'function') playSound('collect');
        return;
    }

    const cornIndex = cornPlots.findIndex(c => c.x === tileX && c.y === tileY);
    if (cornIndex > -1) {
        cornPlots.splice(cornIndex, 1);
        if (typeof playSound === 'function') playSound('collect');
        return;
    }

    const plotIndex = farmPlotsList.findIndex(p => p.x === tileX && p.y === tileY);
    if (plotIndex > -1) {
        farmPlotsList.splice(plotIndex, 1);
        if (typeof playSound === 'function') playSound('collect');
        return;
    }

    const pastureIndex = pasturePlots.findIndex(p => p.x === tileX && p.y === tileY);
    if (pastureIndex > -1) {
        pasturePlots.splice(pastureIndex, 1);
        if (typeof playSound === 'function') playSound('collect');
        return;
    }

    const obsIndex = mapObstacles.findIndex(obs => Math.hypot(obs.x - x, obs.y - y) < 0.6);
    if (obsIndex > -1) {
        mapObstacles.splice(obsIndex, 1);
        if (typeof playSound === 'function') playSound('collect');
        return;
    }

    if (tileX >= 0 && tileX < MAP_SIZE && tileY >= 0 && tileY < MAP_SIZE) {
        if (mapGrid[tileX][tileY] !== null) {
            mapGrid[tileX][tileY] = null;
            if (typeof playSound === 'function') playSound('collect');
            return;
        }
    }
}