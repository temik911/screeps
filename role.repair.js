var harvestUtils = require('HarvestUtils');
var constants = require('Constants');

module.exports = {
    run(creep) {
        var isRepair = creep.memory.isRepair;

        if (!isRepair) {
            if (creep.room.storage) {
                harvestUtils.withdrawFromRoomStorage(creep);
            } else {
                harvestUtils.withdrawFromContainer(creep);
            }

            if (creep.carry.energy == creep.carryCapacity) {
                creep.memory.isRepair = true;
            }
        }
        else {
            var targets = creep.room.find(FIND_STRUCTURES, {
                filter: structure => structure.structureType == STRUCTURE_RAMPART &&
                structure.hits < structure.hitsMax / 100
            });

            if (targets.length == 0) {
                targets = creep.room.find(FIND_STRUCTURES, {
                    filter: structure => structure.structureType == STRUCTURE_WALL &&
                    structure.hits < structure.hitsMax / 3000
                });
            }

            if(targets.length > 0) {
                if(creep.repair(targets[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0]);
                }
            }

            if (creep.carry.energy == 0) {
                creep.memory.isRepair = false;
            }
        }
    }
};