let harvestUtils = require('HarvestUtils');
require('RoomInfo');

module.exports = {
    run(creep) {
        let isHarvest = creep.memory.isHarvest;

        if (isHarvest) {
            harvestUtils.harvestFromPredefineExtractor(creep);

            if (_.sum(creep.carry) == creep.carryCapacity || creep.room.stats().mineral.mineralAmount == 0) {
                creep.memory.isHarvest = false;
            }
        }
        else {
            let target = creep.room.terminal != undefined ? creep.room.terminal : creep.room.storage;
            for(let resourceType in creep.carry) {
                if(creep.transfer(target, resourceType) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target);
                }
            }

            if (_.sum(creep.carry) == 0) {
                creep.memory.isHarvest = true;
            }
        }
    }
};