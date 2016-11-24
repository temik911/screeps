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
        }),
        links: this.find(FIND_STRUCTURES, {
            filter: (structure) => structure.structureType == STRUCTURE_LINK
        }),
        labs: this.find(FIND_STRUCTURES, {
            filter: (structure) => structure.structureType == STRUCTURE_LAB
        }),
        spawns: this.find(FIND_MY_SPAWNS),
        mineral: this.find(FIND_MINERALS)[0],
        nuker: this.find(FIND_STRUCTURES, {
            filter: (structure) => structure.structureType == STRUCTURE_NUKER
        }),
        hostilesCreeps: this.find(FIND_HOSTILE_CREEPS),
        attackHostileCreeps: this.find(FIND_HOSTILE_CREEPS, {
            filter: (creep) => creep.getActiveBodyparts(ATTACK) != 0 || creep.getActiveBodyparts(RANGED_ATTACK) != 0
        })
    };
};