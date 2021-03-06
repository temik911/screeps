let harvestUtils = require('HarvestUtils');
require('RoomInfo');

module.exports = {
    run(creep) {
        let isReadyToUpgrade = creep.memory.isReadyToUpgrade == undefined ? true : creep.memory.isReadyToUpgrade;
        if (creep.memory.boostedCount == undefined) {
            creep.memory.boostedCount = 0;
        }
        if (creep.memory.controllerLinkId == undefined) {
            creep.memory.controllerLinkId = creep.room.controller.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (structure) => structure.structureType == STRUCTURE_LINK
            }).id;
        }

        if (isReadyToUpgrade) {
            if (creep.carry.energy > 0) {
                if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(creep.room.controller);
                }
            } else {
                let controllerLink = Game.getObjectById(creep.memory.controllerLinkId);

                if (creep.withdraw(controllerLink, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(controllerLink);
                }
            }
        } else {
            let workBodyParts = creep.getActiveBodyparts(WORK);
            let resourceNeeded = workBodyParts * 30;
            let energyNeeded = workBodyParts * 20;
            if (creep.room.memory.cgaBoostLabId == undefined) {
                if (creep.room.terminal.store[RESOURCE_CATALYZED_GHODIUM_ACID] < resourceNeeded) {
                    creep.memory.isReadyToUpgrade = true;
                } else {
                    let labs = creep.room.stats().labs;
                    for (let index in labs) {
                        let lab = labs[index];
                        if (lab.id != creep.room.memory.lab1 && lab.id != creep.room.memory.lab2) {
                            if (lab.energy >= energyNeeded) {
                                creep.room.memory.cgaBoostLabId = lab.id;
                                break;
                            }
                        }
                    }
                    if (creep.room.memory.cgaBoostLabId == undefined) {
                        creep.memory.isReadyToUpgrade = true;
                    }
                }
            } else {
                let lab = Game.getObjectById(creep.room.memory.cgaBoostLabId);
                let terminal = creep.room.terminal;

                if (lab.energy < energyNeeded) {
                    creep.memory.isReadyToUpgrade = true;
                    creep.room.memory.cgaBoostLabId = undefined;
                    return;
                }

                if (lab.mineralType == null && _.sum(creep.carry) != 0 && creep.carry[RESOURCE_CATALYZED_GHODIUM_ACID] == undefined) {
                    for (let resource in creep.carry) {
                        if (creep.transfer(terminal, resource) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(terminal);
                        }
                    }
                } else if ((lab.mineralType == null && lab.mineralAmount == 0) || (lab.mineralType == RESOURCE_CATALYZED_GHODIUM_ACID)) {
                    if (lab.mineralAmount < resourceNeeded) {
                        if (creep.carry[RESOURCE_CATALYZED_GHODIUM_ACID] == undefined) {
                            let needed = resourceNeeded - lab.mineralAmount;
                            if (terminal.store[RESOURCE_CATALYZED_GHODIUM_ACID] >= needed) {
                                let toWithdraw = needed <= creep.carryCapacity ? needed : creep.carryCapacity;
                                if (creep.withdraw(terminal, RESOURCE_CATALYZED_GHODIUM_ACID, toWithdraw) == ERR_NOT_IN_RANGE) {
                                    creep.moveTo(terminal);
                                }
                            } else {
                                creep.memory.isReadyToUpgrade = true;
                                creep.room.memory.cgaBoostLabId = undefined
                            }
                        } else {
                            if (creep.transfer(lab, RESOURCE_CATALYZED_GHODIUM_ACID) == ERR_NOT_IN_RANGE) {
                                creep.moveTo(lab);
                            }
                        }
                    } else {
                        if (lab.boostCreep(creep, workBodyParts) == OK) {
                            creep.memory.isReadyToUpgrade = true;
                            creep.room.memory.cgaBoostLabId = undefined
                        }
                    }
                } else {
                    if (creep.withdraw(lab, lab.mineralType) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(lab);
                    }
                }
            }
        }
    }
};