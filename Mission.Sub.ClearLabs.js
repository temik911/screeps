let constants = require('Constants');
let bodyUtils = require('BodyUtils');

module.exports = {
    run(missionNumb) {
        let mission = Memory.missions[missionNumb];

        if (mission == undefined) {
            return;
        }

        if (mission.creepId == undefined) {
            findCreep(mission, missionNumb);
        }

        if (mission.creepId != undefined) {
            let creep = Game.getObjectById(mission.creepId);
            if (creep == null) {
                mission.creepId = undefined;
                mission.creepsIsRequested = undefined;
            } else {
                if (creep.ticksToLive < 50 && _.sum(creep.carry) == 0) {
                    creep.suicide();
                } else {
                    if (_.sum(creep.carry) == 0) {
                        let labs = creep.room.stats().labs;
                        let fromLab = undefined;
                        for (let labName in labs) {
                            let lab = labs[labName];
                            if (lab.id != creep.room.memory.cgaBoostLabId && lab.mineralAmount != 0) {
                                fromLab = lab;
                            }
                        }

                        if (fromLab == undefined) {
                            mission.isDone = true;
                        } else {
                            if (!creep.pos.isNearTo(fromLab.pos)) {
                                creep.moveTo(fromLab);
                            } else {
                                creep.withdraw(fromLab, fromLab.mineralType)
                            }
                        }
                    } else {
                        let terminal = Game.rooms[mission.fromRoom].terminal;
                        if (!creep.pos.isNearTo(terminal.pos)) {
                            creep.moveTo(terminal);
                        } else {
                            for (let resourceType in creep.carry) {
                                creep.transfer(terminal, resourceType);
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
        if (creep.memory.mission == constants.PRODUCE_MINERAL_MISSION && creep.memory.fromRoom == mission.fromRoom && creep.spawning == false) {
            mission.creepId = creep.id;
            break;
        }
    }

    if (mission.creepId == undefined && mission.creepsIsRequested == undefined) {
        let creepMemory = new Map();
        creepMemory.mission = constants.PRODUCE_MINERAL_MISSION;
        creepMemory.fromRoom = mission.fromRoom;
        let creepCreations = new Map();
        creepCreations.name = mission.fromRoom + '-' + constants.PRODUCE_MINERAL_MISSION;
        creepCreations.body = bodyUtils.createLabHelperBody();
        creepCreations.memory = creepMemory;
        Memory.rooms[mission.fromRoom].missionCreepsRequests[missionNumb] = creepCreations;
        mission.creepsIsRequested = true;
    }
};