let harvestUtils = require('HarvestUtils');
require('RoomInfo');

module.exports = {
    run(creep) {
        if (Game.cpu.bucket < 3000) {
            return;
        }

        if (!creep.memory.inClaimedRoom) {
            if (creep.memory.currentStep == undefined) {
                creep.memory.currentStep = 0;
            }
            let currentStep = creep.memory.currentStep;
            let flag = Game.flags['Step' + currentStep];
            if (flag != undefined) {
                if (creep.pos.isNearTo(flag.pos)) {
                    creep.memory.currentStep++;
                } else {
                    creep.moveTo(flag);
                }
            } else {
                creep.memory.inClaimedRoom = true;
            }
        } else {
            // if (!creep.memory.noHostileStructure) {
            //     let hostileStructures = creep.room.find(FIND_HOSTILE_STRUCTURES);
            //     if (hostileStructures.length > 0) {
            //         if (creep.dismantle(hostileStructures[0]) == ERR_NOT_IN_RANGE) {
            //             creep.moveTo(hostileStructures[0]);
            //         }
            //     } else {
            //         creep.memory.noHostileStructure = true;
            //     }
            //     return;
            // }

            if (!creep.memory.isWork) {
                if (creep.room.storage != undefined && !creep.room.storage.my && creep.room.storage.store[RESOURCE_ENERGY] != 0) {
                    if (creep.withdraw(creep.room.storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(creep.room.storage);
                    }
                } else if (creep.room.terminal != undefined && !creep.room.terminal.my && creep.room.terminal.store[RESOURCE_ENERGY] != 0) {
                    if (creep.withdraw(creep.room.terminal, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(creep.room.terminal);
                    }
                } else if (creep.room.storage != undefined && creep.room.storage.my && creep.room.storage.store[RESOURCE_ENERGY] > 25000) {
                    if (creep.withdraw(creep.room.storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(creep.room.storage);
                    }
                } else {
                    let containers = creep.room.stats().containers;
                    if (containers != undefined && containers.length > 0) {
                        let sum = 0;
                        containers.forEach(container => {
                            sum += container.store.energy;
                        });
                        if (sum > 250) {
                            harvestUtils.withdrawFromContainer(creep);
                        } else {
                            harvestUtils.harvestFromPredefinedSource(creep);
                        }
                    } else {
                        harvestUtils.harvestFromPredefinedSource(creep);
                    }
                }

                if (creep.carry.energy == creep.carryCapacity) {
                    creep.memory.isWork = true;
                }
            } else {
                if (creep.room.storage && creep.room.storage.my) {
                    if (creep.room.storage.store[RESOURCE_ENERGY] < 20000) {
                        if (creep.transfer(creep.room.storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(creep.room.storage);
                        }
                        
                        if (creep.carry.energy == 0) {
                            creep.memory.isWork = false;
                        }
                        
                        return;
                    }
                }

                let targets = creep.room.find(FIND_STRUCTURES, {
                    filter: structure => structure.structureType == STRUCTURE_ROAD &&
                    structure.hits < structure.hitsMax / 10
                });

                if (targets.length == 0) {
                    targets = creep.pos.findInRange(FIND_STRUCTURES, 3, {
                        filter: structure => structure.structureType == STRUCTURE_CONTAINER &&
                        structure.hits < structure.hitsMax / 2
                    });
                }

                if (creep.room.find(FIND_CONSTRUCTION_SITES).length > 0 || targets.length > 0) {
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
                } else {
                    if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(creep.room.controller);
                    }
                }

                if (creep.carry.energy == 0) {
                    creep.memory.isWork = false;
                }
            }
        }
    }
};