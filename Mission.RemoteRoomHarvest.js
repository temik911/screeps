let constants = require('Constants');
let bodyUtils = require('BodyUtils');
let missionsUtils = require('MissionsUtils');
let harvestMission = require('Mission.Sub.Harvest');
let reserveControllerMission = require('Mission.Sub.ReserveController');
let cargoMission = require('Mission.Sub.Cargo');
let defendRemoteRoomMission = require('Mission.Sub.DefendRemoteRoom');

module.exports = {
    run(missionNumb) {
        let mission = Memory.missions[missionNumb];

        if (mission.childMissions == undefined) {
            mission.childMissions = [];
        }

        if (mission.roomUnderAttack == undefined) {
            mission.roomUnderAttack = false;
            mission.ticksToEndAttack = 0;
        }

        if (mission.minCargoTTL == undefined) {
            mission.minCargoTTL = 9999;
        }

        for (let i in mission.containers) {
            mission.containers[i].currentCreepTTL = -1;
            mission.containers[i].currentCargoMissions = 0;
        }

        let needNewReserveControllerMission = true;
        let needNewDefendRemoteRoomMission = true;

        mission.childMissions = _.without(mission.childMissions, null);

        for (let i in mission.childMissions) {
            try {
                let missionId = mission.childMissions[i];

                if (missionId == null) {
                    continue;
                }

                let childMission = Memory.missions[missionId];

                if (childMission.isDone == true) {
                    if (childMission.name == constants.DEFEND_REMOTE_ROOM_MISSION) {
                        mission.roomUnderAttack = false;
                        mission.ticksToEndAttack = 0;
                    }
                    delete(Memory.missions[missionNumb].childMissions[i]);
                    delete(Memory.missions[missionId]);
                } else if (childMission.isFailed) {
                    if (childMission.name == constants.DEFEND_REMOTE_ROOM_MISSION) {
                        // todo: do something
                    }
                    delete(Memory.missions[missionNumb].childMissions[i]);
                    delete(Memory.missions[missionId]);
                } else {
                    if (childMission.name == constants.HARVEST_MISSION) {
                        harvestMission.run(missionId);
                        if (childMission.timeToGo != undefined) {
                            mission.containers[childMission.containerId].timeToGo += childMission.timeToGo;
                            mission.containers[childMission.containerId].times += 1;
                            childMission.timeToGo = undefined;
                        }
                        if (childMission.currentCreepTTL > mission.containers[childMission.containerId].currentCreepTTL) {
                            mission.containers[childMission.containerId].currentCreepTTL = childMission.currentCreepTTL;
                        }
                    } else if (childMission.name == constants.RESERVE_CONTROLLER_MISSION) {
                        reserveControllerMission.run(missionId);
                        needNewReserveControllerMission = false;
                    } else if (childMission.name == constants.CARGO_MISSION) {
                        cargoMission.run(missionId);
                        if (childMission.isCargo == false) {
                            mission.containers[childMission.containerId].currentCargoMissions += 1;
                        }
                    } else if (childMission.name == constants.DEFEND_REMOTE_ROOM_MISSION) {
                        defendRemoteRoomMission.run(missionId);
                        needNewDefendRemoteRoomMission = false;
                    }
                }
            } catch (e) {
                console.log(e.stack);
            }
        }

        checkAttacks(mission, needNewDefendRemoteRoomMission);
        if (!mission.roomUnderAttack) {
            checkReservation(mission, needNewReserveControllerMission);
            checkHarvesters(mission);
            checkCargo(mission);
        }
    }
};

let checkAttacks = function (mission, needNew) {
    let remoteRoom = Game.rooms[mission.targetRoom];
    if (remoteRoom != undefined) {
        let attackHostileCreeps = remoteRoom.find(FIND_HOSTILE_CREEPS, {
            filter: (creep) => creep.getActiveBodyparts(ATTACK) != 0 || creep.getActiveBodyparts(RANGED_ATTACK) != 0
        });
        if (attackHostileCreeps.length != 0) {
            mission.roomUnderAttack = true;
            mission.ticksToEndAttack = attackHostileCreeps[0].ticksToLive;
            if (needNew) {
                mission.childMissions.push(missionsUtils.createDefendRemoteRoomMission(mission.fromRoom, mission.targetRoom));
            }
        } else {
            mission.roomUnderAttack = false;
            mission.ticksToEndAttack = 0;
        }
    } else {
        if (mission.ticksToEndAttack <= 0) {
            mission.roomUnderAttack = false;
            mission.ticksToEndAttack = 0;
        } else {
            mission.roomUnderAttack = true;
            mission.ticksToEndAttack -= 1;
        }
    }
};

let checkCargo = function (mission) {
    let cargoAmountPerMission = 0;
    _.forEach(bodyUtils.createCargoBody(mission.fromRoom), function(body) {
        if (body == CARRY) {
            cargoAmountPerMission += 50;
        }
    });

    for (let i in mission.containers) {
        let containerInfo = mission.containers[i];

        if (containerInfo.currentAmount == undefined) {
            containerInfo.currentAmount = 0;
        }

        let container = Game.getObjectById(containerInfo.containerId);
        if (container != null) {
            containerInfo.currentAmount = container.store[RESOURCE_ENERGY];
        }

        let timeToGo = containerInfo.times == 0 ? 0 : containerInfo.timeToGo / containerInfo.times;

        if (containerInfo.times != 0) {
            if (mission.minCargoTTL > timeToGo * 2) {
                mission.minCargoTTL = timeToGo * 2;
            }
        }

        let availableAmount = containerInfo.currentAmount - cargoAmountPerMission * containerInfo.currentCargoMissions;
        if (availableAmount >= 0) {
            if (availableAmount + 12 * timeToGo >= cargoAmountPerMission) {
                mission.childMissions.push(missionsUtils.createCargoMission(mission.fromRoom, containerInfo, mission.minCargoTTL));
            }
        }
    }
};

let checkHarvesters = function (mission) {
    for (let i in mission.containers) {
        let containerInfo = mission.containers[i];

        if (containerInfo.timeToGo == undefined) {
            containerInfo.timeToGo = 0;
            containerInfo.times = 0;
        }

        let timeToCreateCreep = 30;
        let timeToGo = containerInfo.times == 0 ? 0 : containerInfo.timeToGo / containerInfo.times;
        if (containerInfo.currentCreepTTL <= (timeToCreateCreep + timeToGo)) {
            mission.childMissions.push(missionsUtils.createHarvestMission(mission.fromRoom, containerInfo));
        }
    }
};

let checkReservation = function (mission, needNew) {
    if (mission.reserveTime == undefined) {
        mission.reserveTime = 0;
    }

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

    if (mission.reserveTime <= 3000 && needNew) {
        mission.childMissions.push(missionsUtils.createReserveControllerMission(mission.fromRoom, mission.controllerId, mission.controllerPos));
    }
};
