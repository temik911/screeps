var harvestUtils = require('HarvestUtils');
var constants = require('Constants');

module.exports = {
    run(creep) {
        var isBuild = creep.memory.isBuild;
        
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
            var target = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES);
            if (target) {
                if (creep.build(target) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target);
                }
            }
            if (creep.carry.energy == 0) {
                creep.memory.isBuild = false;
            }
        }
    }
};