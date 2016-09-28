var constants = require('Constants');
var harvestUtils = require('HarvestUtils');

module.exports = {
    run(creep) {
        if (!creep.memory.inClaimedRoom) {
            if (creep.memory.currentStep == undefined) {
                creep.memory.currentStep = 0;
            }
            var currentStep = creep.memory.currentStep;
            var flag = Game.flags['Step' + currentStep];
            if (flag != undefined) {
                if (creep.pos.findPathTo(flag.pos).length == 0) {
                    creep.memory.currentStep++;
                } else {
                    creep.moveTo(flag);
                }
            } else {
                creep.memory.inClaimedRoom = true;
            }
        } else {
            var targets = creep.room.find(FIND_STRUCTURES, {
                filter: structure => structure.structureType == STRUCTURE_ROAD &&
                structure.hits < structure.hitsMax / 10
            });

            if (targets.length == 0) {
                targets = creep.room.find(FIND_STRUCTURES, {
                    filter: structure => structure.structureType == STRUCTURE_CONTAINER &&
                    structure.hits < structure.hitsMax / 2
                });
            }

            if (creep.room.find(FIND_CONSTRUCTION_SITES).length > 0 || targets.length > 0) {
                var isBuild = creep.memory.isBuild;

                if (!isBuild) {
                    harvestUtils.harvestFromNearestSource(creep);

                    if (creep.carry.energy == creep.carryCapacity) {
                        creep.memory.isBuild = true;
                    }
                }
                else {
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
                        creep.memory.isBuild = false;
                    }
                }
            } else {
                var isUpgrade = creep.memory.isUpgrade;

                if (!isUpgrade) {
                    harvestUtils.harvestFromNearestSource(creep);

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
        }
    }
};