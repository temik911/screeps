var harvestUtils = require('HarvestUtils');

module.exports = {
    run(creep) {
        var isHarvest = creep.memory.isHarvest;

        if (isHarvest) {
            harvestUtils.harvestFromPredefineExtractor(creep);

            if (_.sum(creep.carry) == creep.carryCapacity) {
                creep.memory.isHarvest = false;
            }
        }
        else {
            var target = creep.room.storage;
            for(var resourceType in creep.carry) {
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