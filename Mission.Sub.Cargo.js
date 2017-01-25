let constants = require('Constants');
let bodyUtils = require('BodyUtils');

module.exports = {
    run(missionNumb) {
        let mission = Memory.missions[missionNumb];

        if (mission == undefined) {
            return;
        }

        if (mission.ticks == undefined) {
            mission.ticks = 0;
        } else {
            mission.ticks += 1;
            if (mission.ticks > 1000) {
                mission.isDone = true;
            }
        }

        if (mission.isCargo == undefined) {
            mission.isCargo = false;
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
                if (!creep.spawning) {
                    if (!mission.isCargo) {
                        let container = Game.getObjectById(mission.containerId);
                        if (container != null) {
                            if (container.store[RESOURCE_ENERGY] < creep.carryCapacity - creep.carry[RESOURCE_ENERGY]) {
                                if (!creep.pos.inRangeTo(container, 3)) {
                                    creep.moveTo(container);
                                }
                            } else {
                                if (creep.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                                    creep.moveTo(container);
                                }
                            }

                            if (creep.carry.energy == creep.carryCapacity) {
                                mission.isCargo = true;
                            }
                        } else {
                            creep.moveTo(new RoomPosition(mission.containerPos.x, mission.containerPos.y, mission.containerPos.roomName));
                        }
                    } else {
                        let target = Game.rooms[mission.fromRoom].storage;
                        if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(target);
                        }

                        if (creep.pos.isNearTo(target.pos) && creep.carry.energy == 0) {
                            creep.memory.free = true;
                            mission.creepId = undefined;
                            mission.creepsIsRequested = undefined;
                            mission.isDone = true;
                        }
                    }
                }
            }
        }
    }
};

let findCreep = function (mission, missionNumb) {
    let minTTL = mission.timeToGo * 2 * 1.1;
    for(let name in Game.creeps) {
        let creep = Game.creeps[name];
        if (creep.memory.mission == constants.CARGO_MISSION && creep.memory.fromRoom == mission.fromRoom && creep.memory.free == true && creep.spawning == false) {
            if (creep.ticksToLive >= minTTL) {
                mission.creepId = creep.id;
                creep.memory.currentMissionNumb = missionNumb;
                creep.memory.free = false;
                break;
            }
        }
    }

    if (mission.creepId == undefined && mission.creepsIsRequested == undefined) {
        if (mission.waitUntilRequest == undefined) {
            mission.waitUntilRequest = 0;
        } else {
            mission.waitUntilRequest += 1;
            if (mission.waitUntilRequest > 25) {
                let creepMemory = new Map();
                creepMemory.mission = constants.CARGO_MISSION;
                creepMemory.free = true;
                creepMemory.fromRoom = mission.fromRoom;
                let creepCreations = new Map();
                creepCreations.name = mission.fromRoom + '-' + constants.CARGO_MISSION + '-' + missionNumb;
                creepCreations.body = bodyUtils.createCargoBody(mission.fromRoom);
                creepCreations.memory = creepMemory;
                Memory.rooms[mission.fromRoom].missionCreepsRequests[missionNumb] = creepCreations;
                mission.creepsIsRequested = true;
            }
        }
    }
};