let harvestUtils = require('HarvestUtils');

module.exports = {
    run(creep) {
        let isUpgrade = creep.memory.isUpgrade;

        if (!isUpgrade) {
            if (creep.room.storage) {
                if (creep.room.storage.store[RESOURCE_ENERGY] > 5000) {
                    harvestUtils.withdrawFromRoomStorage(creep);
                }
            } else {
                harvestUtils.withdrawFromContainer(creep);
            }

            if (creep.carry.energy == creep.carryCapacity) {
                creep.memory.isUpgrade = true;
            }
        } else {
            if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller);
            }

            if (creep.carry.energy == 0) {
                creep.memory.isUpgrade = false;
            }
        }
    }
};