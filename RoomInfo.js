Room.prototype.stats = function() {
    return {
        creeps: this.find(FIND_MY_CREEPS),
        enemies: this.find(FIND_HOSTILE_CREEPS),
        sources: this.find(FIND_SOURCES),
        extractors: this.find(FIND_MY_STRUCTURES, {
            filter: (structure) => structure.structureType == STRUCTURE_EXTRACTOR
        }),
        containers: this.find(FIND_STRUCTURES, {
            filter: (structure) => structure.structureType == STRUCTURE_CONTAINER
        })
    };
};