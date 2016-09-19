var harvestUtils = require('HarvestUtils');

module.exports = {
    run(creep) {
        var isCargo = creep.memory.isCargo;

        if (!isCargo) {
            harvestUtils.withdrawFromContainer(creep);

            if (creep.carry.energy == creep.carryCapacity) {
                creep.memory.isCargo = true;
            }
        }
        else {
            var target = creep.room.storage;
            if(creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target);
            }

            if (creep.carry.energy == 0) {
                creep.memory.isCargo = false;
            }
        }
    }
};