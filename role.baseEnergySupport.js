var harvestUtils = require('HarvestUtils');
var constants = require('Constants');

module.exports = {
    run(creep) {
        var isSupport = creep.memory.isSupport;
        
        if (!isSupport) {
            if (creep.room.storage) {
                harvestUtils.withdrawFromRoomStorage(creep);
            } else {
                harvestUtils.withdrawFromContainer(creep);
            }
            
            if (creep.carry.energy == creep.carryCapacity) {
                creep.memory.isSupport = true;
            }
        } else {
            var targets = creep.room.find(FIND_MY_STRUCTURES, {
                filter: (structure) => {
                    return structure.structureType == STRUCTURE_TOWER &&
                            structure.energy < 150;
                }
            });
                    
            
            if (targets.length == 0) {
                targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return structure.structureType == STRUCTURE_EXTENSION &&
                            structure.energy < structure.energyCapacity;
                    }
                });

                if(targets.length == 0) {
                    targets = creep.room.find(FIND_STRUCTURES, {
                        filter: (structure) => {
                            return structure.structureType == STRUCTURE_SPAWN &&
                                structure.energy < structure.energyCapacity;
                        }
                    });

                    if(targets.length == 0) {
                        targets = creep.room.find(FIND_MY_STRUCTURES, {
                            filter: (structure) => {
                                return structure.structureType == STRUCTURE_TOWER &&
                                        structure.energy < structure.energyCapacity;
                            }
                        });

                        targets.sort((a, b) => a.energy - b.energy);
                    }
                }
            }

            if(targets.length > 0) {
                if(creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0]);
                }
            }

            if (creep.carry.energy == 0) {
                creep.memory.isSupport = false;
            }
        }
    }
};