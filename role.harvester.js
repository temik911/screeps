var harvestUtils = require('HarvestUtils');

module.exports = {
    run(creep) {
        var isHarvest = creep.memory.isHarvest;

        if (isHarvest) {
            harvestUtils.harvestFromPredefinedSource(creep);

            if (creep.carry.energy == creep.carryCapacity) {
                creep.memory.isHarvest = false;
            }
        }
        else {
            var containers = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return structure.structureType == STRUCTURE_CONTAINER &&
                        structure.store.energy < structure.storeCapacity;
                }
            });

            var nearestContainer;
            var pathLength = 9999;

            for (var i = 0; i < containers.length; i++) {
                var currentContainer = containers[i];
                var length = creep.pos.findPathTo(currentContainer.pos).length;
                if (pathLength > length) {
                    nearestContainer = currentContainer;
                    pathLength = length;
                }
            }

            if(nearestContainer) {
                if(creep.transfer(nearestContainer, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(nearestContainer);
                }
            } else {
                creep.moveTo(Game.spawns.Base);
            }

            if (creep.carry.energy == 0) {
                creep.memory.isHarvest = true;
            }
        }
    }
};