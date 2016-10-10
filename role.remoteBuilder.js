var harvestUtils = require('HarvestUtils');
require('RoomInfo');

module.exports = {
    run(creep) {
        if (creep.memory.targetId == undefined) {
            creep.memory.targetId = false;
        }

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
                if (!creep.memory.sourceId) {
                    var sources = creep.room.find(FIND_STRUCTURES, {
                        filter: (structure) => {
                            return structure.structureType == STRUCTURE_CONTAINER &&
                                structure.store.energy > 0;
                        }
                    });

                    sources.sort((a, b) => b.store.energy - a.store.energy);

                    if (sources.length > 0) {
                        creep.memory.sourceId = sources[0].id;
                    }
                }

                if (creep.memory.sourceId) {
                    var source = Game.getObjectById(creep.memory.sourceId);

                    if (source.store[RESOURCE_ENERGY] > 0) {
                        var withdrawalResult = creep.withdraw(source, RESOURCE_ENERGY);

                        if (withdrawalResult == ERR_NOT_IN_RANGE) {
                            creep.moveTo(source, {maxRooms: 1});
                        }
                    } else {
                        creep.moveTo(25, 25);
                    }
                }

                if (creep.carry.energy == creep.carryCapacity) {
                    creep.memory.needEnergy = false;
                    creep.memory.sourceId = false;
                }
            } else {
                if (creep.memory.targetId == false) {
                    var targets = creep.room.find(FIND_STRUCTURES, {
                        filter: structure => structure.structureType == STRUCTURE_ROAD &&
                        structure.hits < structure.hitsMax / 2
                    });

                    targets.sort((a, b) => a.hits - b.hits);

                    if (targets.length > 0) {
                        creep.memory.targetId = targets[0].id;
                    }
                }

                var target;
                if (creep.memory.targetId != false) {
                    target = Game.getObjectById(creep.memory.targetId);
                    if (creep.repair(target) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(target);
                    }

                    if (target.hits > target.hitsMax * 0.75) {
                        creep.memory.targetId = false;
                    }
                } else {
                    target = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES);
                    if (target) {
                        if (creep.build(target) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(target);
                        }
                    } else {
                        creep.moveTo(25, 25);
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