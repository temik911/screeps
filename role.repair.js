let harvestUtils = require('HarvestUtils');
let constants = require('Constants');

module.exports = {
    run(creep) {
        let isRepair = creep.memory.isRepair;

        if (!isRepair) {
            if (creep.room.storage) {
                harvestUtils.withdrawFromRoomStorage(creep);
            } else {
                harvestUtils.withdrawFromContainer(creep);
            }

            if (creep.carry.energy == creep.carryCapacity) {
                creep.memory.isRepair = true;
            }
        } else {
            let repairId = creep.memory.repairId;
            if (repairId == undefined) {
                let targets = creep.room.find(FIND_STRUCTURES, {
                    filter: structure => structure.structureType == STRUCTURE_RAMPART || structure.structureType == STRUCTURE_WALL
                });

                if (targets.length != 0) {
                    let toRepair = undefined;
                    let min = 999999999;
                    for (let i in targets) {
                        let target = targets[i];
                        if (min > target.hits && target.hits < target.hitsMax) {
                            min = target.hits;
                            toRepair = target;
                        }
                    }
                    if (toRepair != undefined) {
                        creep.memory.repairId = toRepair.id;
                        creep.memory.stopRepair = toRepair.hits + 50000 < toRepair.hitsMax ? toRepair.hits + 50000 : toRepair.hitsMax;
                    }
                }
            } else {
                let toRepair = Game.getObjectById(repairId);
                if (toRepair.hits < creep.memory.stopRepair) {
                    if (creep.repair(toRepair) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(toRepair);
                    }
                } else {
                    creep.memory.repairId = undefined;
                    creep.memory.stopRepair = undefined;
                }

                if (creep.carry.energy == 0) {
                    creep.memory.isRepair = false;
                }
            }
        }
    }
};