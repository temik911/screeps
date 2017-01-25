let constants = require('Constants');
let harvestUtils = require('HarvestUtils');

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
            } else {
                if (!creep.spawning) {
                    if (!creep.memory.goHome) {
                        if (creep.memory.needEnergy == true) {
                            if (creep.room.storage != undefined) {
                                harvestUtils.withdrawFromRoomStorage(creep);
                            } else {
                                harvestUtils.withdrawFromContainer(creep);
                            }

                            if (creep.carry.energy == creep.carryCapacity) {
                                creep.memory.needEnergy = false;
                                creep.memory.sourceId = false;
                            }
                        } else {
                            if (creep.memory.roadId == undefined) {
                                let structures = creep.room.lookForAt(LOOK_STRUCTURES, creep.pos);
                                let road = null;
                                for (let i in structures) {
                                    if (structures[i].structureType == STRUCTURE_ROAD) {
                                        road = structures[i];
                                        break;
                                    }
                                }

                                if (road != null && road.hits < road.hitsMax * 0.75) {
                                    creep.memory.roadId = road.id;
                                }
                            }

                            if (creep.memory.roadId != undefined) {
                                let road = Game.getObjectById(creep.memory.roadId);
                                if (!creep.pos.isEqualTo(road.pos)) {
                                    creep.moveTo(road.pos);
                                } else {
                                    let constructionSites = creep.pos.findInRange(FIND_MY_CONSTRUCTION_SITES, 1);
                                    if (constructionSites.length != 0) {
                                        let constructionSite = constructionSites[0];
                                        creep.build(constructionSite);
                                    } else if (road.hits > road.hitsMax * 0.9) {
                                        creep.memory.roadId = undefined;
                                    } else {
                                        creep.repair(road);
                                    }
                                }
                            } else {
                                let pos = new RoomPosition(mission.pos.x, mission.pos.y, mission.pos.roomName);
                                if (pos.isNearTo(creep.pos)) {
                                    creep.memory.goHome = true;
                                } else {
                                    creep.moveTo(pos);
                                }
                            }

                            if (creep.carry.energy == 0) {
                                creep.memory.needEnergy = true;
                            }
                        }
                    } else {
                        let storage = Game.rooms[mission.fromRoom].storage;
                        let withdraw = creep.withdraw(storage, RESOURCE_ENERGY);
                        if (withdraw == ERR_NOT_IN_RANGE) {
                            creep.moveTo(storage);
                        } else if (withdraw == OK || withdraw == ERR_FULL) {
                            creep.memory.goHome = false;
                            creep.memory.needEnergy = false;
                            mission.isDone = true;
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
        if (creep.memory.mission == constants.REPAIR_ROADS_MISSION && creep.memory.fromRoom == mission.fromRoom && creep.spawning == false) {
            mission.creepId = creep.id;
        }
    }

    if (mission.creepId == undefined && mission.creepsIsRequested == undefined) {
        let creepMemory = new Map();
        creepMemory.mission = constants.REPAIR_ROADS_MISSION;
        creepMemory.fromRoom = mission.fromRoom;
        creepMemory.needEnergy = true;
        creepMemory.goHome = false;
        let creepCreations = new Map();
        creepCreations.name = mission.fromRoom + '-' + constants.REPAIR_ROADS_MISSION;
        creepCreations.body = [WORK, WORK, WORK, WORK, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY];
        creepCreations.memory = creepMemory;
        Memory.rooms[mission.fromRoom].missionCreepsRequests[missionNumb] = creepCreations;
        mission.creepsIsRequested = true;
    }
};