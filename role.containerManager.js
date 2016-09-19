var harvest = require('HarvestUtils');

module.exports = {
    run(creep) {
        var deadTargets = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return structure.structureType == STRUCTURE_CONTAINER &&
                        structure.store[RESOURCE_ENERGY] > 0;
            }
        });
    }
};