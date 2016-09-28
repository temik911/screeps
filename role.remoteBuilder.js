var harvestUtils = require('HarvestUtils');
require('RoomInfo');

module.exports = {
    run(creep) {
        var numb = creep.memory.numb;
        var flagPrefix = creep.memory.flagPrefix;
        var flags = [];
        for (var flagName in Game.flags) {
            if (flagName.startsWith(flagPrefix)) {
                flags.push(Game.flags[flagName])
            }
        }
        var flag = flags[numb % flags.length];

        if (creep.room == flag.room) {
            if (creep.memory.needEnergy == true) {
                harvestUtils.withdrawFromContainer(creep)

                if (creep.carry.energy == creep.carryCapacity) {
                    creep.memory.needEnergy = false;
                }
            } else {
                var targets = creep.room.find(FIND_STRUCTURES, {
                    filter: structure => structure.structureType == STRUCTURE_ROAD &&
                    structure.hits < structure.hitsMax / 2
                });

                if (targets.length == 0) {
                    targets = creep.room.find(FIND_STRUCTURES, {
                        filter: structure => structure.structureType == STRUCTURE_CONTAINER &&
                        structure.hits < structure.hitsMax / 2
                    });
                }

                targets.sort((a, b) => a.hits - b.hits);

                if (targets.length > 0) {
                    if (creep.repair(targets[0]) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(targets[0]);
                    }
                } else {
                    var target = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES);
                    if (target) {
                        if (creep.build(target) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(target);
                        }
                    }
                }

                if (creep.carry.energy == 0) {
                    creep.memory.needEnergy = true;
                }
            }
        } else {
            creep.moveTo(flag);
        }
    }
};