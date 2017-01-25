let constants = require('Constants');

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
                    let controllerPos = mission.controllerPos;
                    if (creep.room.name == controllerPos.roomName) {
                        let controller = creep.room.controller;
                        let reserveController = creep.reserveController(controller);
                        if (reserveController == ERR_NOT_IN_RANGE) {
                            if (creep.memory.pos == undefined) {
                                let room = creep.room;
                                let controllerPos = controller.pos;
                                let pos;
                                let wall = true;
                                let structures = [];
                                let constructionSites = [];
                                for (let dx = -1; dx <= 1; dx++) {
                                    for (let dy = -1; dy <= 1; dy++) {
                                        pos = new RoomPosition(controllerPos.x + dx, controllerPos.y + dy, room.name);
                                        wall = Game.map.getTerrainAt(pos) == "wall";
                                        structures = pos.lookFor(LOOK_STRUCTURES);
                                        constructionSites = pos.lookFor(LOOK_CONSTRUCTION_SITES);
                                        if (!wall && structures.length == 0 && constructionSites.length == 0) {
                                            dy = 10;
                                        }
                                    }
                                    if (!wall && structures.length == 0 && constructionSites.length == 0) {
                                        dx = 10;
                                    }
                                }
                                creep.memory.pos = pos;
                            }
                            creep.moveTo(creep.memory.pos.x, creep.memory.pos.y, {maxRooms: 1});
                        }
                    } else {
                        creep.moveTo(new RoomPosition(controllerPos.x, controllerPos.y, controllerPos.roomName));
                    }
                }
            }
        }
    }
};

let findCreep = function (mission, missionNumb) {
    for(let name in Game.creeps) {
        let creep = Game.creeps[name];
        if (creep.memory.mission == constants.RESERVE_CONTROLLER_MISSION && creep.memory.missionNumb == missionNumb) {
            mission.creepId = creep.id;
        }
    }

    if (mission.creepId == undefined && mission.creepsIsRequested == undefined) {
        let creepMemory = new Map();
        creepMemory.mission = constants.RESERVE_CONTROLLER_MISSION;
        creepMemory.missionNumb = missionNumb;
        let creepCreations = new Map();
        creepCreations.name = mission.fromRoom + '-' + constants.RESERVE_CONTROLLER_MISSION + '-' + missionNumb;
        creepCreations.body = createCreepBody(mission.fromRoom);
        creepCreations.memory = creepMemory;
        Memory.rooms[mission.fromRoom].missionCreepsRequests[missionNumb] = creepCreations;
        mission.creepsIsRequested = true;
    }
};

let createCreepBody = function (roomName) {
    let bodies = [CLAIM, MOVE, CLAIM, MOVE];
    let currentCost = 1300;
    let currentBodiesPart = 4;
    let maxCost = Game.rooms[roomName].energyCapacityAvailable / 2;
    while ((currentCost + 650 <= maxCost) && (currentBodiesPart + 2 <= 10)) {
        bodies.push(CLAIM);
        bodies.push(MOVE);
        currentCost += 650;
        currentBodiesPart += 2;
    }
    return bodies;
};