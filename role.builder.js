let harvestUtils = require('HarvestUtils');

module.exports = {
    run(creep) {
        let isBuild = creep.memory.isBuild;
        
        if (!isBuild) {
            if (creep.room.storage) {
                if (creep.room.storage.store[RESOURCE_ENERGY] > 5000) {
                    harvestUtils.withdrawFromRoomStorage(creep);
                }
            } else {
                harvestUtils.withdrawFromContainer(creep);
            }
            
            if (creep.carry.energy == creep.carryCapacity) {
                creep.memory.isBuild = true;
            }
        }
        else {
            if (creep.memory.targetId == undefined) {
                let target = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES);
                if (target == null) {
                    creep.suicide();
                    return;
                }
                creep.memory.targetId = target.id;
            } else {
                let target = Game.getObjectById(creep.memory.targetId);
                if (target != null) {
                    if (creep.build(target) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(target);
                    }
                } else {
                    creep.memory.targetId = undefined;
                }
                if (creep.carry.energy == 0) {
                    creep.memory.isBuild = false;
                }
            }
        }
    }
};