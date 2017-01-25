let constants = require('Constants');
let bodyUtils = require('BodyUtils');

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
                if (creep.carry.energy < creep.getActiveBodyparts(WORK)) {
                    let link = Game.getObjectById(mission.linkId);
                    if (creep.withdraw(link, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(link);
                        creep.memory.timeToGo += 1;
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
            }
        }
    }
};

let findCreep = function (mission, missionNumb) {
    for(let name in Game.creeps) {
        let creep = Game.creeps[name];
        if (creep.memory.mission == constants.SIMPLE_LINK_CONTROLLER_UPGRADE_MISSION && creep.memory.missionNumb == missionNumb && creep.spawning == false) {
            mission.creepId = creep.id;
        }
    }

    if (mission.creepId == undefined && mission.creepsIsRequested == undefined) {
        let creepMemory = new Map();
        creepMemory.mission = constants.SIMPLE_LINK_CONTROLLER_UPGRADE_MISSION;
        creepMemory.missionNumb = missionNumb;
        creepMemory.timeToGo = 0;
        let creepCreations = new Map();
        creepCreations.name = mission.fromRoom + '-' + constants.SIMPLE_LINK_CONTROLLER_UPGRADE_MISSION + '-' + missionNumb;
        creepCreations.body = bodyUtils.createSimpleLinkControllerUpgraderBody(mission.fromRoom);
        creepCreations.memory = creepMemory;
        Memory.rooms[mission.fromRoom].missionCreepsRequests[missionNumb] = creepCreations;
        mission.creepsIsRequested = true;
    }
};