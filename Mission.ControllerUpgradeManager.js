let simpleLinkControllerUpgradeMission = require('Mission.Sub.SimpleLinkControllerUpgrade');
let boostedLinkControllerUpgradeMission = require('Mission.Sub.BoostedLinkControllerUpgrade');
let constants = require('Constants');
let missionsUtils = require('MissionsUtils');
let bodyUtils = require('BodyUtils');
require('RoomInfo');

module.exports = {
    run(missionNumb) {
        let mission = Memory.missions[missionNumb];

        if (mission.childMissions == undefined) {
            mission.childMissions = [];
        }

        if (mission.containers == undefined) {
            mission.containers = [];
        }

        if (mission.currentContainerNumb == undefined) {
            mission.currentContainerNumb = 0;
        }

        if (mission.timeToGoSimple == undefined) {
            mission.timeToGoSimple = 0;
            mission.timesSimple = 0;
        }

        if (mission.timeToGoBoosted == undefined) {
            mission.timeToGoBoosted = 0;
            mission.timesBoosted = 0;
        }

        if (mission.controllerId == undefined) {
            mission.controllerId = Game.rooms[mission.fromRoom].controller.id;
        }

        if (mission.linkId == undefined) {
            mission.linkId = Game.getObjectById(mission.controllerId).pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (structure) => structure.structureType == STRUCTURE_LINK
            }).id;
        }

        mission.childMissions = _.without(mission.childMissions, null);

        mission.simpleCreepTTL = [];
        mission.boostedCreepTTL = [];
        let simpleCount = 0;
        let boostedCount = 0;
        for (let i in mission.childMissions) {
            let missionId = mission.childMissions[i];

            if (missionId == null) {
                continue;
            }

            let childMission = Memory.missions[missionId];

            if (childMission == undefined) {
                delete(Memory.missions[missionNumb].childMissions[i]);
                continue;
            }

            if (childMission.isDone) {
                delete(Memory.missions[missionNumb].childMissions[i]);
                delete(Memory.missions[missionId]);
            } else {
                if (childMission.name === constants.SIMPLE_LINK_CONTROLLER_UPGRADE_MISSION) {
                    if (childMission.timeToGo != undefined) {
                        mission.timeToGoSimple += childMission.timeToGo;
                        mission.timesSimple += 1;
                        childMission.timeToGo = undefined;
                    }
                    mission.simpleCreepTTL.push(childMission.currentCreepTTL);
                    simpleCount++;
                    simpleLinkControllerUpgradeMission.run(missionId);
                } else if (childMission.name === constants.BOOSTED_LINK_CONTROLLER_UPGRADE_MISSION) {
                    if (childMission.timeToGo != undefined) {
                        mission.timeToGoBoosted += childMission.timeToGo;
                        mission.timesBoosted += 1;
                        childMission.timeToGo = undefined;
                    }
                    mission.boostedCreepTTL.push(childMission.currentCreepTTL);
                    boostedCount++;
                    boostedLinkControllerUpgradeMission.run(missionId);
                }
            }
        }

        // console.log(simpleCount + " " + boostedCount);

        checkSimple(mission, simpleCount, boostedCount);
    }
};

let checkSimple = function (mission, simpleCount, boostedCount) {
    let room = Game.rooms[mission.fromRoom];
    if (room.controller.level == 8) {
        if (simpleCount == 1) {
            let timeToCreateCreep = 81;
            let timeToGo = mission.timesSimple == 0 ? 0 : mission.timeToGoSimple / mission.timesSimple;
            if (mission.simpleCreepTTL[0] <= (timeToCreateCreep + timeToGo)) {
                mission.childMissions.push(missionsUtils.createSimpleLinkControllerUpgradeMission(mission.fromRoom, mission.controllerId, mission.linkId));
            }
        } else if (simpleCount == 0) {
            mission.childMissions.push(missionsUtils.createSimpleLinkControllerUpgradeMission(mission.fromRoom, mission.controllerId, mission.linkId));
        }
    } else {
        let maxCount = 1;
        if (room.storage.store[RESOURCE_ENERGY] != undefined) {
            if (room.storage.store[RESOURCE_ENERGY] < 15000) {
                maxCount = 1;
            } else if (room.storage.store[RESOURCE_ENERGY] < 35000) {
                maxCount = 2;
            } else if (room.storage.store[RESOURCE_ENERGY] < 60000) {
                maxCount = 3;
            } else {
                maxCount = 4;
            }
        }
        let timeToCreateCreep = bodyUtils.createSimpleLinkControllerUpgraderBody(mission.fromRoom).length * 3;
        if (room.terminal == undefined || room.stats().labs.length < 1) {
            if (simpleCount < maxCount) {
                mission.childMissions.push(missionsUtils.createSimpleLinkControllerUpgradeMission(mission.fromRoom, mission.controllerId, mission.linkId));
            } else if (simpleCount == maxCount) {
                let timeToGo = mission.timesSimple == 0 ? 0 : mission.timeToGoSimple / mission.timesSimple;
                for (let i in mission.simpleCreepTTL) {
                    if (mission.simpleCreepTTL[i] <= (timeToCreateCreep + timeToGo)) {
                        mission.childMissions.push(missionsUtils.createSimpleLinkControllerUpgradeMission(mission.fromRoom, mission.controllerId, mission.linkId));
                    }
                }
            }
        } else {
            if (boostedCount < maxCount) {
                mission.childMissions.push(missionsUtils.createBoostedLinkControllerUpgradeMission(mission.fromRoom, mission.controllerId, mission.linkId));
            } else if (boostedCount == maxCount) {
                let timeToGo = mission.timesBoosted == 0 ? 0 : mission.timeToGoBoosted / mission.timesBoosted;
                for (let i in mission.boostedCreepTTL) {
                    if (mission.boostedCreepTTL[i] <= (timeToCreateCreep + timeToGo)) {
                        mission.childMissions.push(missionsUtils.createBoostedLinkControllerUpgradeMission(mission.fromRoom, mission.controllerId, mission.linkId));
                    }
                }
            }
        }
    }
};