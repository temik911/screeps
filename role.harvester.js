let harvestUtils = require('HarvestUtils');

module.exports = {
    run(creep) {
        let isHarvest = creep.memory.isHarvest;

        if (isHarvest) {
            harvestUtils.harvestFromPredefinedSource(creep);

            if (creep.carry.energy == creep.carryCapacity) {
                creep.memory.isHarvest = false;
            }
        }
        else {
            let containers = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return structure.structureType == STRUCTURE_CONTAINER &&
                        structure.store.energy < structure.storeCapacity;
                }
            });

            let nearestContainer;
            let pathLength = 9999;

            for (let i = 0; i < containers.length; i++) {
                let currentContainer = containers[i];
                let length = creep.pos.findPathTo(currentContainer.pos).length;
                if (pathLength > length) {
                    nearestContainer = currentContainer;
                    pathLength = length;
                }
            }

            if(nearestContainer) {
                if(creep.transfer(nearestContainer, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(nearestContainer);
                }
            }

            if (creep.carry.energy == 0) {
                creep.memory.isHarvest = true;
            }
        }
    }
};