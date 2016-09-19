var harvestUtils = require('HarvestUtils');
var constants = require('Constants');

module.exports = {
    run(creep) {
        var isBuild = creep.memory.isBuild;
        
        if (!isBuild) {
            harvestUtils.withdrawFromRoomStorage(creep);
            
            if (creep.carry.energy == creep.carryCapacity) {
                creep.memory.isBuild = true;
            }
        }
        else {
            var targets = creep.room.find(FIND_STRUCTURES, {
                filter: structure => structure.structureType == STRUCTURE_ROAD &&
                                        structure.hits < structure.hitsMax / 10
            });

            targets.sort((a,b) => a.hits - b.hits);

            if(targets.length > 0) {
                if(creep.repair(targets[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0]);
                }
            } else {
                var target = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES);
                if (target) {
                    if (creep.build(target) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(target);
                    }
                } else {
                    var flag = Game.flags[constants.PARKING];
                    creep.moveTo(flag);
                }
            }
            if (creep.carry.energy == 0) {
                creep.memory.isBuild = false;
            }
        }
    }
};