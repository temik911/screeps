let missionsUtils = require('MissionsUtils');
let constants = require('Constants');
let createStructuresForRemoteHarvestMission = require('Mission.Sub.CreateStructuresForRemoteHarvest');
let buildStructuresForRemoteHarvestMission = require('Mission.Sub.BuildStructuresForRemoteHarvest');
let reserveControllerMission = require('Mission.Sub.ReserveController');

module.exports = {
    run(missionNumb) {
        let mission = Memory.missions[missionNumb];

        if (mission.createMissionNumb == undefined) {
            mission.createMissionNumb = missionsUtils.createCreateStructuresForRemoteHarvestSubMission(mission.fromRoom, mission.harvestRoom);
        } else {
            let createMission = Memory.missions[mission.createMissionNumb];
            if (createMission.isDone != true) {
                createStructuresForRemoteHarvestMission.run(mission.createMissionNumb);
            } else {
                mission.roomsInPath = createMission.roomsInPath;
                if (mission.buildMissionNumb == undefined) {
                    mission.buildMissionNumb = missionsUtils.createBuildStructuresForRemoteHarvestSubMission(mission.fromRoom, mission.harvestRoom, mission.roomsInPath);
                } else {
                    let buildMission = Memory.missions[mission.buildMissionNumb];
                    if (buildMission.isDone != true) {
                        buildStructuresForRemoteHarvestMission.run(mission.buildMissionNumb);
                        if (mission.controllerId == undefined && buildMission.controllerId != undefined) {
                            mission.controllerId = buildMission.controllerId;
                            mission.controllerPos = buildMission.controllerPos;
                            mission.reserveTime = 0;
                        }

                        if (mission.reserveMissionNumb == undefined) {
                            if (mission.controllerId != undefined) {
                                let controller = Game.getObjectById(mission.controllerId);
                                if (controller != null) {
                                    if (controller.reservation != null) {
                                        mission.reserveTime = controller.reservation.ticksToEnd;
                                    } else {
                                        mission.reserveTime = 0;
                                    }
                                } else {
                                    mission.reserveTime -= 1;
                                }
                                if (mission.reserveTime <= 3000) {
                                    mission.reserveMissionNumb = missionsUtils.createReserveControllerMission(mission.fromRoom, mission.controllerId, mission.controllerPos);
                                }
                            }
                        } else {
                            let reserveMission = Memory.missions[mission.reserveMissionNumb];
                            if (reserveMission.isDone != true) {
                                reserveControllerMission.run(mission.reserveMissionNumb);
                            } else {
                                delete(Memory.missions[mission.reserveMissionNumb]);
                                mission.reserveMissionNumb = undefined;
                            }
                        }
                    } else {
                        mission.containers = buildMission.containers;
                        mission.isDone = true;
                        delete(Memory.missions[mission.createMissionNumb]);
                        delete(Memory.missions[mission.buildMissionNumb]);
                        if (mission.reserveMissionNumb != undefined) {
                            delete(Memory.missions[mission.reserveMissionNumb]);
                        }
                    }
                }
            }
        }
    }
};