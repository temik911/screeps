var harvestUtils = require('HarvestUtils');
var constants = require('Constants');

module.exports = {
    run(creep) {
        if (creep.memory.shouldWork) {
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
        } else {
            var flag = Game.flags[constants.UPGRADERS_FLAG];
            creep.moveTo(flag);
            if (creep.pos.findPathTo(flag.pos).length <= 1) {
                creep.memory.shouldWork = true;
            }
        }
    }
};