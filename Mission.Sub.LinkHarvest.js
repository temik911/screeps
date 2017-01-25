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
                    if (mission.sourceId == undefined) {
                        let link = Game.getObjectById(mission.linkId);
                        mission.sourceId = link.pos.findInRange(FIND_SOURCES, 1)[0].id;
                    }
                    if (!creep.memory.onPosition) {
                        let position = Game.getObjectById(mission.sourceId).pos;
                        if (creep.pos.isNearTo(position)) {
                            creep.memory.onPosition = true;
                            mission.timeToGo = creep.memory.timeToGo;
                        } else {
                            if (creep.moveTo(position) == OK) {
                                creep.memory.timeToGo += 1;
                            }
                        }
                    } else {
                        if (creep.carry.energy >= creep.carryCapacity * 0.75) {
                            let link = Game.getObjectById(mission.linkId);
                            if (creep.transfer(link, RESOURCE_ENERGY, creep.carry.energy) == ERR_NOT_IN_RANGE) {
                                creep.moveTo(link);
                            }
                        } else {
                            let source = Game.getObjectById(mission.sourceId);
                            if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
                                creep.moveTo(source);
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
        if (creep.memory.mission == constants.LINK_HARVEST_MISSION && creep.memory.missionNumb == missionNumb) {
            mission.creepId = creep.id;
        }
    }

    if (mission.creepId == undefined && mission.creepsIsRequested == undefined) {
        let creepMemory = new Map();
        creepMemory.mission = constants.LINK_HARVEST_MISSION;
        creepMemory.missionNumb = missionNumb;
        creepMemory.onPosition = false;
        creepMemory.timeToGo = 0;
        let creepCreations = new Map();
        creepCreations.name = mission.fromRoom + '-' + constants.LINK_HARVEST_MISSION + '-' + missionNumb;
        creepCreations.body = [WORK, WORK, WORK, WORK, WORK, WORK, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY];
        creepCreations.memory = creepMemory;
        Memory.rooms[mission.fromRoom].missionCreepsRequests[missionNumb] = creepCreations;
        mission.creepsIsRequested = true;
    }
};