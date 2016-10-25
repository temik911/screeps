let harvestUtils = require('HarvestUtils');
require('RoomInfo');

module.exports = {
    run(creep) {
        if (!creep.memory.inClaimedRoom) {
            if (creep.memory.currentStep == undefined) {
                creep.memory.currentStep = 0;
            }
            let currentStep = creep.memory.currentStep;
            let flag = Game.flags['Step' + currentStep];
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
            if (creep.room.storage) {
                if (creep.room.storage.store[RESOURCE_ENERGY] < 1000) {
                    if (creep.carry[RESOURCE_ENERGY] < 200) {
                        let containers = creep.room.stats().containers;
                        if (containers != undefined && containers.length > 0) {
                            let sum = 0;
                            containers.forEach(container => {
                                sum += container.store.energy;
                            });
                            if (sum > 0) {
                                harvestUtils.withdrawFromContainer(creep);
                            } else {
                                harvestUtils.harvestFromPredefinedSource(creep);
                            }
                        } else {
                            harvestUtils.harvestFromPredefinedSource(creep);
                        }
                    } else {
                        if(creep.transfer(creep.room.storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(creep.room.storage);
                        }
                    }
                    return;
                }
            }
            
            
            let targets = creep.room.find(FIND_STRUCTURES, {
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
                let isBuild = creep.memory.isBuild;

                if (!isBuild) {
                    let containers = creep.room.stats().containers;
                    if (containers != undefined && containers.length > 0) {
                        let sum = 0;
                        containers.forEach(container => {
                            sum += container.store.energy;
                        });
                        if (sum > 0) {
                            harvestUtils.withdrawFromContainer(creep);
                        } else {
                            harvestUtils.harvestFromPredefinedSource(creep);
                        }
                    } else {
                        harvestUtils.harvestFromPredefinedSource(creep);
                    }


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
                        let target = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
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
                let isUpgrade = creep.memory.isUpgrade;

                if (!isUpgrade) {
                    let containers = creep.room.stats().containers;
                    if (containers != undefined && containers.length > 0) {
                        let sum = 0;
                        containers.forEach(container => {
                            sum += container.store.energy;
                        });
                        if (sum > 0) {
                            harvestUtils.withdrawFromContainer(creep);
                        } else {
                            harvestUtils.harvestFromPredefinedSource(creep);
                        }
                    } else {
                        harvestUtils.harvestFromPredefinedSource(creep);
                    }

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