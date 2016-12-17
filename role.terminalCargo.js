let harvestUtils = require('HarvestUtils');

module.exports = {
    run(creep) {
        let isCargo = creep.memory.isCargo;

        if (!isCargo) {
            let from = creep.room.terminal;
            let minAmount = 30000;
            if (creep.room.controller.level == 8) {
                if (creep.room.storage.store[RESOURCE_ENERGY] > 100000) {
                    from = creep.room.storage;
                    minAmount = 100000;
                }
            }
            harvestUtils.withdrawFromWithMinAmount(creep, from, minAmount);

            if (creep.carry.energy > 0) {
                creep.memory.isCargo = true;
            }
        } else {
            let to = creep.room.storage;
            if (creep.room.controller.level == 8) {
                if (creep.room.storage.store[RESOURCE_ENERGY] > 100000) {
                    to = creep.room.terminal;
                }
            }

            if (creep.transfer(to, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(to);
            }

            if (creep.carry.energy == 0) {
                creep.memory.isCargo = false;
            }
        }
    }
};