let constants = require('Constants');
let bodyUtils = require('BodyUtils');
require('RoomInfo');

module.exports = {
    run(missionNumb) {
        let mission = Memory.missions[missionNumb];

        if (mission == undefined) {
            return;
        }

        if (mission.isReadyToUpgrade == undefined) {
            mission.isReadyToUpgrade = false;
        }

        if (mission.currentCreepTTL == undefined) {
            mission.currentCreepTTL = 1500;
        }

        if (mission.ticks == undefined) {
            mission.ticks = 0;
        } else {
            mission.ticks += 1;
            if (mission.ticks > 2500) {
                mission.isDone = true;
            }
        }

        if (mission.creepId == undefined) {
            findCreep(mission, missionNumb);
        }

        if (mission.creepId != undefined) {
            let creep = Game.getObjectById(mission.creepId);
            if (creep == null) {
                mission.creepId = undefined;
                mission.creepsIsRequested = undefined;
                mission.isDone = true;
            } else {
                mission.currentCreepTTL = creep.ticksToLive;
                creep.memory.timeToGo += 1;
                if (mission.isReadyToUpgrade == true) {
                    if (creep.carry.energy < creep.getActiveBodyparts(WORK)) {
                        let link = Game.getObjectById(mission.linkId);
                        if (creep.withdraw(link, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(link);
                        }
                    } else {
                        if (mission.timeToGo == undefined && mission.timeIsStored == undefined) {
                            mission.timeToGo = creep.memory.timeToGo;
                            mission.timeIsStored = true;
                        }
                        let controller = Game.getObjectById(mission.controllerId);
                        if (creep.upgradeController(controller) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(controller);
                        }
                    }
                } else {
                    let workBodyParts = creep.getActiveBodyparts(WORK);
                    let resourceNeeded = workBodyParts * 30;
                    let energyNeeded = workBodyParts * 20;
                    let room = Game.rooms[mission.fromRoom];
                    if (room.memory.cgaBoostLabId == undefined) {
                        if (room.terminal.store[RESOURCE_CATALYZED_GHODIUM_ACID] < resourceNeeded) {
                            mission.isReadyToUpgrade = true;
                        } else {
                            let labs = room.stats().labs;
                            for (let index in labs) {
                                let lab = labs[index];
                                if (lab.id != room.memory.lab1 && lab.id != room.memory.lab2) {
                                    if (lab.energy >= energyNeeded) {
                                        room.memory.cgaBoostLabId = lab.id;
                                        break;
                                    }
                                }
                            }
                            if (room.memory.cgaBoostLabId == undefined) {
                                mission.isReadyToUpgrade = true;
                            }
                        }
                    } else {
                        let lab = Game.getObjectById(room.memory.cgaBoostLabId);
                        let terminal = room.terminal;

                        if (lab.energy < energyNeeded) {
                            mission.isReadyToUpgrade = true;
                            room.memory.cgaBoostLabId = undefined;
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
                                        mission.isReadyToUpgrade = true;
                                        room.memory.cgaBoostLabId = undefined
                                    }
                                } else {
                                    if (creep.transfer(lab, RESOURCE_CATALYZED_GHODIUM_ACID) == ERR_NOT_IN_RANGE) {
                                        creep.moveTo(lab);
                                    }
                                }
                            } else {
                                if (lab.boostCreep(creep, workBodyParts) == OK) {
                                    mission.isReadyToUpgrade = true;
                                    room.memory.cgaBoostLabId = undefined
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
        }
    }
};

let findCreep = function (mission, missionNumb) {
    for(let name in Game.creeps) {
        let creep = Game.creeps[name];
        if (creep.memory.mission == constants.BOOSTED_LINK_CONTROLLER_UPGRADE_MISSION && creep.memory.missionNumb == missionNumb && creep.spawning == false) {
            mission.creepId = creep.id;
        }
    }

    if (mission.creepId == undefined && mission.creepsIsRequested == undefined) {
        let creepMemory = new Map();
        creepMemory.mission = constants.BOOSTED_LINK_CONTROLLER_UPGRADE_MISSION;
        creepMemory.missionNumb = missionNumb;
        creepMemory.timeToGo = 0;
        let creepCreations = new Map();
        creepCreations.name = mission.fromRoom + '-' + constants.BOOSTED_LINK_CONTROLLER_UPGRADE_MISSION + '-' + missionNumb;
        creepCreations.body = bodyUtils.createSimpleLinkControllerUpgraderBody(mission.fromRoom);
        creepCreations.memory = creepMemory;
        Memory.rooms[mission.fromRoom].missionCreepsRequests[missionNumb] = creepCreations;
        mission.creepsIsRequested = true;
    }
};