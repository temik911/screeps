let prepareRemoteHarvestMission = require('Mission.PrepareRemoteHarvest');
let remoteRoomHarvestMission = require('Mission.RemoteRoomHarvest');
let selfRoomHarvestMission = require('Mission.SelfRoomHarvest');
let repairRoadsMission = require('Mission.Sub.RepairRoads');
let constants = require('Constants');
let missionsUtils = require('MissionsUtils');

module.exports = {
    run(missionNumb) {
        let mission = Memory.missions[missionNumb];

        if (mission.childMissions == undefined) {
            mission.childMissions = [];
        }

        if (mission.containers == undefined) {
            mission.containers = [];
        }

        if (mission.selfRoomHarvestMission == undefined) {
            mission.selfRoomHarvestMission = missionsUtils.createSelfRoomHarvestMission(mission.fromRoom);
        }

        if (mission.currentContainerNumb == undefined) {
            mission.currentContainerNumb = 0;
        }

        if (mission.minCargoTTL == undefined) {
            mission.minCargoTTL = 9999;
        }

        mission.childMissions = _.without(mission.childMissions, null);
        mission.containers = _.without(mission.containers, null);

        let newRepairMissionNeeded = true;
        for (let i in mission.childMissions) {
            let missionId = mission.childMissions[i];

            if (missionId == null) {
                continue;
            }

            let childMission = Memory.missions[missionId];

            if (childMission.isDone) {
                if (childMission.name == constants.PREPARE_REMOTE_HARVEST_MISSION) {
                    mission.childMissions.push(missionsUtils.createRemoteRoomHarvestMission(mission.fromRoom, childMission.containers, childMission.controllerId, childMission.controllerPos));
                    for (let i in childMission.containers) {
                        mission.containers.push(childMission.containers[i]);
                    }
                }
                delete(Memory.missions[missionNumb].childMissions[i]);
                delete(Memory.missions[missionId]);
            } else {
                if (childMission.name === constants.PREPARE_REMOTE_HARVEST_MISSION) {
                    prepareRemoteHarvestMission.run(missionId);
                } else if (childMission.name == constants.REMOTE_ROOM_HARVEST_MISSION) {
                    // if (childMission.targetRoom == 'E41S61') {
                    //     console.log(missionNumb);
                    //     for (let containerId in childMission.containers) {
                    //         for (let i in mission.containers) {
                    //             if (mission.containers[i].containerId == containerId) {
                    //                 delete(Memory.missions[missionNumb].containers[i]);
                    //             }
                    //         }
                    //     }
                    //     for (let i in childMission.childMissions) {
                    //         delete(Memory.missions[childMission.childMissions[i]]);
                    //     }
                    //     delete(Memory.missions[missionId]);
                    //     delete(Memory.missions[missionNumb].childMissions[i])
                    // } else {
                        remoteRoomHarvestMission.run(missionId);
                        if (mission.minCargoTTL > childMission.minCargoTTL) {
                            mission.minCargoTTL = childMission.minCargoTTL;
                        }
                    // }
                } else if (childMission.name == constants.REPAIR_ROADS_MISSION) {
                    repairRoadsMission.run(missionId);
                    newRepairMissionNeeded = false;
                }
            }
        }

        if (mission.selfRoomHarvestMission != undefined) {
            selfRoomHarvestMission.run(mission.selfRoomHarvestMission);
        }

        if (newRepairMissionNeeded) {
            if (mission.containers.length > 0) {
                mission.childMissions.push(missionsUtils.createRepairRoadsMission(mission.fromRoom, mission.containers[mission.currentContainerNumb % mission.containers.length].containerPos));
                mission.currentContainerNumb += 1;
            }
        }

        if (Game.time % 50 == 0) {
            for(let name in Game.creeps) {
                let creep = Game.creeps[name];
                if (creep.memory.mission == constants.CARGO_MISSION && creep.memory.fromRoom == mission.fromRoom && creep.memory.free == true && creep.spawning == false) {
                    if (creep.ticksToLive <= mission.minCargoTTL) {
                        creep.suicide();
                    }
                }
            }
        }
    }
};