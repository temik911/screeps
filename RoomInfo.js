Room.prototype.stats = function() {
    return {
        creeps: this.find(FIND_MY_CREEPS),
        enemies: this.find(FIND_HOSTILE_CREEPS),
        sources: this.find(FIND_SOURCES)
    };
};