var harvestUtils = require('HarvestUtils');

module.exports = {
    run(creep) {
        var isUpgrade = creep.memory.isUpgrade;

        if (!isUpgrade) {
            harvestUtils.withdrawFromRoomStorage(creep);

            if (creep.carry.energy == creep.carryCapacity) {
                creep.memory.isUpgrade = true;
            }
        }
        else {
            if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller);
            }

            if (creep.carry.energy == 0) {
                creep.memory.isUpgrade = false;
            }
        }
    }
};