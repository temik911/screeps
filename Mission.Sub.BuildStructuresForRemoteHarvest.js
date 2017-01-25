let harvestUtils = require('HarvestUtils');
let constants = require('Constants');
require('RoomInfo');

module.exports = {
    run(missionNumb) {
        let mission = Memory.missions[missionNumb];

        if (mission == undefined) {
            return;
        }

        if (mission.roomsIsDone == undefined) {
            mission.roomsIsDone = [];
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
                if (mission.currentRoomName == undefined) {
                    for (let i in mission.roomsInPath) {
                        let roomName = mission.roomsInPath[i];
                        if (roomName != mission.harvestRoom) {
                            if (!_.includes(mission.roomsIsDone, roomName)) {
                                mission.currentRoomName = roomName;
                                break;
                            }
                        }
                    }

                    if (mission.currentRoomName == undefined) {
                        if (!_.includes(mission.roomsIsDone, mission.harvestRoom)) {
                            mission.currentRoomName = mission.harvestRoom;
                        }
                    }

                    if (mission.currentRoomName == undefined) {
                        creep.suicide();
                        mission.isDone = true;
                    }
                } else {
                    if (creep.room.name == mission.currentRoomName) {
                        if (creep.room.name == mission.harvestRoom && !mission.roomInfoStored) {
                            let controller = creep.room.controller;
                            mission.controllerId = controller.id;
                            mission.controllerPos = controller.pos;
                            mission.roomInfoStored = true;
                        }

                        if (creep.memory.needEnergy == true) {
                            let containers = creep.room.stats().containers;
                            if (containers != undefined && containers.length > 0) {
                                let sum = 0;
                                containers.forEach(container => {
                                    sum += container.store.energy;
                                });
                                if (sum > 250) {
                                    harvestUtils.withdrawFromContainer(creep);
                                } else {
                                    harvestUtils.harvestFromNearestSource(creep);
                                }
                            } else {
                                harvestUtils.harvestFromNearestSource(creep);
                            }

                            if (creep.carry.energy == creep.carryCapacity) {
                                creep.memory.needEnergy = false;
                            }
                        } else {
                            if (creep.memory.targetId != undefined) {
                                let target = Game.getObjectById(creep.memory.targetId);
                                if (creep.memory.action == 'build') {
                                    if (target != null) {
                                        if (creep.build(target) == ERR_NOT_IN_RANGE) {
                                            creep.moveTo(target, {maxRooms: 1});
                                        }
                                    } else {
                                        creep.memory.targetId = undefined;
                                        creep.memory.action = undefined;
                                    }
                                } else if (creep.memory.action == 'repair') {
                                    if (target.hits < target.hitsMax * 0.9) {
                                        if (creep.repair(target) == ERR_NOT_IN_RANGE) {
                                            creep.moveTo(target, {maxRooms: 1});
                                        }
                                    } else {
                                        creep.memory.targetId = undefined;
                                        creep.memory.action = undefined;
                                    }
                                }
                            } else {
                                let toRepair = creep.room.find(FIND_STRUCTURES, {
                                    filter: structure => structure.structureType == STRUCTURE_CONTAINER &&
                                    structure.hits < structure.hitsMax / 2
                                });

                                if (toRepair.length != 0) {
                                    creep.memory.targetId = toRepair[0].id;
                                    creep.memory.action = 'repair';
                                } else {
                                    let target = creep.pos.findClosestByRange(FIND_MY_CONSTRUCTION_SITES);
                                    if (target) {
                                        creep.memory.targetId = target.id;
                                        creep.memory.action = 'build';
                                    } else {
                                        if (creep.room.name == mission.harvestRoom) {
                                            mission.containers = new Map();
                                            for (let container of creep.room.stats().containers) {
                                                let containerInfo = new Map();
                                                containerInfo.containerPos = container.pos;
                                                containerInfo.containerId = container.id;
                                                mission.containers[container.id] = containerInfo;
                                            }
                                        }
                                        mission.roomsIsDone.push(mission.currentRoomName);
                                        mission.currentRoomName = undefined;
                                    }
                                }
                            }

                            if (creep.carry.energy == 0) {
                                creep.memory.needEnergy = true;
                            }
                        }
                    } else {
                        creep.moveTo(new RoomPosition(25, 25, mission.currentRoomName));
                    }
                }
            }
        }
    }
};

let findCreep = function (mission, missionNumb) {
    for(let name in Game.creeps) {
        let creep = Game.creeps[name];
        if (creep.memory.mission == constants.BUILD_STRUCTURES_FOR_REMOTE_HARVEST_MISSION && creep.memory.missionNumb == missionNumb) {
            mission.creepId = creep.id;
        }
    }

    if (mission.creepId == undefined && mission.creepsIsRequested == undefined) {
        let creepMemory = new Map();
        creepMemory.mission = constants.BUILD_STRUCTURES_FOR_REMOTE_HARVEST_MISSION;
        creepMemory.missionNumb = missionNumb;
        creepMemory.needEnergy = true;
        let creepCreations = new Map();
        creepCreations.name = mission.fromRoom + "-" + constants.BUILD_STRUCTURES_FOR_REMOTE_HARVEST_MISSION + "-" + missionNumb;
        creepCreations.body = [MOVE, WORK, CARRY, MOVE, WORK, CARRY, MOVE, WORK, CARRY, MOVE, WORK, CARRY, MOVE, WORK, CARRY,
            MOVE, WORK, CARRY, MOVE, WORK, CARRY, MOVE, WORK, CARRY, MOVE, WORK, CARRY];
        creepCreations.memory = creepMemory;
        Memory.rooms[mission.fromRoom].missionCreepsRequests[missionNumb] = creepCreations;
        mission.creepsIsRequested = true;
    }
};