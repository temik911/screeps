let constants = require('Constants');

module.exports = {
    run(missionNumb) {
        let mission = Memory.missions[missionNumb];

        if (mission == undefined) {
            return;
        }

        if (mission.currentCreepTTL == undefined) {
            mission.currentCreepTTL = 1500;
        }

        if (mission.ticks == undefined) {
            mission.ticks = 0;
        } else {
            mission.ticks += 1;
            if (mission.ticks > 2000) {
                mission.isDone = true;
                if (mission.creepId != undefined) {
                    let creep = Game.getObjectById(mission.creepId);
                    if (creep == null) {
                        creep.suicide();
                    }
                }
                return;
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
                if (!creep.spawning) {
                    mission.currentCreepTTL = creep.ticksToLive;
                    if (!creep.memory.onPosition) {
                        let position = new RoomPosition(mission.containerPos.x, mission.containerPos.y, mission.containerPos.roomName);
                        if (creep.pos.isEqualTo(position)) {
                            creep.memory.onPosition = true;
                            mission.timeToGo = creep.memory.timeToGo;
                        } else {
                            if (creep.moveTo(position) == OK) {
                                creep.memory.timeToGo += 1;
                            }
                        }
                    } else {
                        let container = Game.getObjectById(mission.containerId);
                        if (mission.sourceId == undefined) {
                            mission.sourceId = container.pos.findInRange(FIND_SOURCES, 1)[0].id;
                        }
                        let source = Game.getObjectById(mission.sourceId);

                        if (container.hits < container.hitsMax * 0.8 && creep.carry.energy > 0) {
                            creep.repair(container);
                        } else {
                            if (_.sum(container.store) + creep.getActiveBodyparts(WORK) * 2 < container.storeCapacity || creep.carry.energy < creep.carryCapacity) {
                                creep.harvest(source);
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
        if (creep.memory.mission == constants.HARVEST_MISSION && creep.memory.missionNumb == missionNumb) {
            mission.creepId = creep.id;
        }
    }

    if (mission.creepId == undefined && mission.creepsIsRequested == undefined) {
        let creepMemory = new Map();
        creepMemory.mission = constants.HARVEST_MISSION;
        creepMemory.missionNumb = missionNumb;
        creepMemory.onPosition = false;
        creepMemory.timeToGo = 0;
        let creepCreations = new Map();
        creepCreations.name = mission.fromRoom + '-' + constants.HARVEST_MISSION + '-' + missionNumb;
        creepCreations.body = [WORK, WORK, WORK, WORK, WORK, WORK, MOVE, MOVE, MOVE, CARRY];
        creepCreations.memory = creepMemory;
        Memory.rooms[mission.fromRoom].missionCreepsRequests[missionNumb] = creepCreations;
        mission.creepsIsRequested = true;
    }
};