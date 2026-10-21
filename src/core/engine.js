export class Engine {
    constructor({
        renderer,
        systems = [],
        requestFrame = callback => requestAnimationFrame(callback),
        cancelFrame = frameId => cancelAnimationFrame(frameId)
    }) {
        this.renderer = renderer;
        this.systems = systems;
        this.requestFrame = requestFrame;
        this.cancelFrame = cancelFrame;

        this.fixedDelta = 1 / 60;
        this.maxFrameDelta = 0.1;
        this.maxStepsPerFrame = 6;
        this.accumulator = 0;
        this.lastTime = null;
        this.running = false;
        this.frameRequest = null;
        this.boundLoop = timestamp => this.loop(timestamp);
    }

    start() {
        if (this.running) return;
        this.running = true;
        this.lastTime = null;
        this.accumulator = 0;
        this.frameRequest = this.requestFrame(this.boundLoop);
    }

    stop() {
        this.running = false;
        if (this.frameRequest !== null) {
            this.cancelFrame(this.frameRequest);
            this.frameRequest = null;
        }
        this.lastTime = null;
        this.accumulator = 0;
    }

    loop(timestamp) {
        if (!this.running) return;
        this.frameRequest = null;

        if (this.lastTime === null) {
            this.lastTime = timestamp;
            this.render();
            this.frameRequest = this.requestFrame(this.boundLoop);
            return;
        }
        const frameDelta = Math.min(
            Math.max((timestamp - this.lastTime) / 1000, 0),
            this.maxFrameDelta
        );
        this.lastTime = timestamp;
        this.accumulator += frameDelta;

        let steps = 0;
        while (
            this.running &&
            this.accumulator + 1e-10 >= this.fixedDelta &&
            steps < this.maxStepsPerFrame
        ) {
            this.update(this.fixedDelta);
            if (!this.running) return;
            this.accumulator = Math.max(
                0,
                this.accumulator - this.fixedDelta
            );
            steps++;
        }

        this.render();
        if (this.running) {
            this.frameRequest = this.requestFrame(this.boundLoop);
        }
    }

    update(deltaTime) {
        for (const system of this.systems) {
            if (system?.update) {
                system.update(deltaTime);
            }
        }
    }

    render() {
        if (this.renderer?.render) {
            this.renderer.render();
        }
    }

    addSystem(system) {
        this.systems.push(system);
    }
}