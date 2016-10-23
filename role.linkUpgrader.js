let harvestUtils = require('HarvestUtils');

module.exports = {
    run(creep) {
        if (creep.carry.energy > 0) {
            if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller);
            }
        } else {
            let controllerLink = creep.room.controller.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (structure) => structure.structureType == STRUCTURE_LINK
            });

            if (creep.withdraw(controllerLink, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(controllerLink);
            }
        }
    }
};