export class Engine {
    constructor({
        renderer,
        systems = []
    }) {
        this.renderer = renderer;
        this.systems = systems;

        this.lastTime = 0;
        this.running = false;
    }

    start() {
        this.running = true;
        requestAnimationFrame(this.loop.bind(this));
    }

    stop() {
        this.running = false;
    }

    loop(timestamp) {
        if (!this.running) return;

        const deltaTime =
            (timestamp - this.lastTime) / 1000;

        this.lastTime = timestamp;

        this.update(deltaTime);

        this.render();

        requestAnimationFrame(
            this.loop.bind(this)
        );
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