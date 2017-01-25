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

        if (mission.amount <= 0) {
            mission.isDone = true;
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
                if (creep.carry.energy > 0) {
                    let to = Game.getObjectById(mission.toId);
                    let energy = creep.carry.energy;
                    let transfer = creep.transfer(to, RESOURCE_ENERGY);
                    if (transfer == ERR_NOT_IN_RANGE) {
                        creep.moveTo(to);
                    } else if (transfer == OK) {
                        mission.amount -= energy;
                    }
                } else {
                    let from = Game.getObjectById(mission.fromId);
                    if (creep.withdraw(from, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(from);
                    }
                }
            }
        }
    }
};

let findCreep = function (mission, missionNumb) {
    for(let name in Game.creeps) {
        let creep = Game.creeps[name];
        if (creep.memory.mission == constants.TERMINAL_CARGO_MISSION && creep.memory.fromRoom == mission.fromRoom && creep.spawning == false) {
            mission.creepId = creep.id;
            break;
        }
    }

    if (mission.creepId == undefined && mission.creepsIsRequested == undefined) {
        let creepMemory = new Map();
        creepMemory.mission = constants.TERMINAL_CARGO_MISSION;
        creepMemory.fromRoom = mission.fromRoom;
        let creepCreations = new Map();
        creepCreations.name = mission.fromRoom + '-' + constants.TERMINAL_CARGO_MISSION;
        creepCreations.body = bodyUtils.createTerminalCargoBody(mission.fromRoom);
        creepCreations.memory = creepMemory;
        Memory.rooms[mission.fromRoom].missionCreepsRequests[missionNumb] = creepCreations;
        mission.creepsIsRequested = true;
    }
};