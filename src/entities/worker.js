import { Player } from "./player.js";

export class Worker extends Player {
    constructor(x = 0, y = 0) {
        super(x, y);
        this.order = null;
        this.state = "idle";
        this.blockedTime = 0;
        this.workTime = 0;
        this.path = null;
        this.pathIndex = 0;
        this.pathReplans = 0;
        this.isWorker = true;
    }

    serialize() {
        return {
            ...super.serialize(),
            order: this.order ? { ...this.order } : null,
            state: this.state,
            blockedTime: this.blockedTime,
            workTime: this.workTime
        };
    }

    static fromJSON(data) {
        const worker = new Worker(data.x, data.y);
        Object.assign(worker, data);
        worker.order = data.order ? { ...data.order } : null;
        return worker;
    }
}
