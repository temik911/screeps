var harvestUtils = require('HarvestUtils');
var constants = require('Constants');

module.exports = {
    run(creep) {
        let isSupport = creep.memory.isSupport;
        
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
            let target = null;

            if (creep.memory.targetId != undefined) {
                let currentTarget = Game.getObjectById(creep.memory.targetId);
                if (currentTarget.energy == currentTarget.energyCapacity) {
                    creep.memory.targetId = undefined;
                } else {
                    target = currentTarget;
                }
            }

            if (target == null) {
                target = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
                    filter: (structure) => {
                        return structure.structureType == STRUCTURE_TOWER &&
                            structure.energy < 150;
                    }
                });

                if (target == null) {
                    target = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
                        filter: (structure) => {
                            return structure.structureType == STRUCTURE_EXTENSION &&
                                structure.energy < structure.energyCapacity;
                        }
                    });

                    if (target == null) {
                        target = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
                            filter: (structure) => {
                                return structure.structureType == STRUCTURE_SPAWN &&
                                    structure.energy < structure.energyCapacity;
                            }
                        });

                        if (target == null) {
                            target = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
                                filter: (structure) => {
                                    return structure.structureType == STRUCTURE_TOWER &&
                                        structure.energy < structure.energyCapacity;
                                }
                            });
                        }
                    }
                }

                if (target != null) {
                    creep.memory.targetId = target.id;
                }
            }

            if (target != null) {
                if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target);
                }

                if (creep.carry.energy == 0) {
                    creep.memory.isSupport = false;
                }
            } else {
                if (creep.room.storage) {
                    let storage = creep.room.storage;
                    if (creep.transfer(storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(storage);
                    }
                }
            }
        }
    }
};