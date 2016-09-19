module.exports = {
    createQueueInMemory(memoryName) {
        this.memoryName = memoryName;
        this.queue = this.init();

        this.push = function (value) {
            this.queue.push(value);
            Game.spawns['Base'].room.memory[this.memoryName] = this.queue;
        };

        this.pop = function () {
            var toReturn = this.queue.shift();
            Game.spawns['Base'].room.memory[this.memoryName] = this.queue;
            return toReturn;
        };

        this.peek = function() {
            return this.queue[0];
        };

        this.init = function () {
            var currentValue = Game.spawns['Base'].room.memory[this.memoryName];
            if (currentValue) {
                this.queue = currentValue;
            } else {
                this.queue = [];
            }
        };

        return this;
    }
};