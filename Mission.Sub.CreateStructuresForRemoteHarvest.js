let constants = require('Constants');

module.exports = {
    run(missionNumb) {
        let mission = Memory.missions[missionNumb];

        if (mission == undefined) {
            return;
        }

        if (mission.nextTryTime == undefined) {
            mission.nextTryTime = 0;
        }

        if (mission.creepId == undefined) {
            for(let name in Game.creeps) {
                let creep = Game.creeps[name];
                if (creep.memory.mission == constants.CREATE_STRUCTURES_FOR_REMOTE_HARVEST_MISSION && creep.memory.missionNumb == missionNumb) {
                    mission.creepId = creep.id;
                }
            }

            if (mission.creepId == undefined && mission.creepsIsRequested == undefined) {
                let creepMemory = new Map();
                creepMemory.mission = constants.CREATE_STRUCTURES_FOR_REMOTE_HARVEST_MISSION;
                creepMemory.missionNumb = missionNumb;
                let creepCreations = new Map();
                creepCreations.name = mission.fromRoom + "-" + constants.CREATE_STRUCTURES_FOR_REMOTE_HARVEST_MISSION + "-" + missionNumb;
                creepCreations.body = [MOVE];
                creepCreations.memory = creepMemory;
                Memory.rooms[mission.fromRoom].missionCreepsRequests[missionNumb] = creepCreations;
                mission.creepsIsRequested = true;
            }
        } else {
            let creep = Game.getObjectById(mission.creepId);
            if (creep == null) {
                mission.creepId = undefined;
                mission.creepsIsRequested = undefined;
            } else {
                if (mission.flagCreates == undefined) {
                    if (creep.room.name == mission.harvestRoom) {
                        if (mission.nextTryTime <= Game.time) {
                            let roadsToBuild = [];
                            let containersToBuild = [];
                            let goals = _.map(creep.room.find(FIND_SOURCES), function (source) {
                                return {pos: source.pos, range: 1};
                            });

                            for (let g in goals) {
                                let ret = PathFinder.search(
                                    Game.rooms[mission.fromRoom].storage.pos, goals[g],
                                    {
                                        maxOps : 100000,
                                        plainCost: 3,
                                        swampCost: 6,
                                        roomCallback: function (roomName) {
                                            let room = Game.rooms[roomName];
                                            let costs = new PathFinder.CostMatrix;
                                            if (!room) {
                                                return false;
                                            } else {
                                                room.find(FIND_STRUCTURES).forEach(function (structure) {
                                                    if (structure.structureType === STRUCTURE_ROAD) {
                                                        costs.set(structure.pos.x, structure.pos.y, 1);
                                                    } else if (structure.structureType !== STRUCTURE_RAMPART || !structure.my) {
                                                        costs.set(structure.pos.x, structure.pos.y, 0xff);
                                                    }
                                                });
                                                for (let r in roadsToBuild) {
                                                    let posToRoad = roadsToBuild[r];
                                                    if (room.name == posToRoad.roomName) {
                                                        costs.set(posToRoad.x, posToRoad.y, 1);
                                                    }
                                                }
                                                for (let c in containersToBuild) {
                                                    let posToContainer = containersToBuild[c];
                                                    if (room.name == posToContainer.roomName) {
                                                        costs.set(posToContainer.x, posToContainer.y, 0xff);
                                                    }
                                                }
                                            }
                                            return costs;
                                        }
                                    }
                                );

                                if (ret.incomplete === false) {
                                    let containerPos = ret.path[ret.path.length - 1];
                                    containersToBuild.push(containerPos);
                                    for (let i in ret.path) {
                                        if (!ret.path[i].isEqualTo(containerPos)) {
                                            roadsToBuild.push(ret.path[i]);
                                        }
                                    }
                                } else {
                                    console.log("Cant find path for " + goals[g].pos);
                                    mission.nextTryTime = Game.time + 100;
                                    return;
                                }
                            }

                            let counter = 1;
                            let roomsInPath = [];
                            for (let c in containersToBuild) {
                                let posForContainer = containersToBuild[c];
                                posForContainer.createConstructionSite(STRUCTURE_CONTAINER);
                                // posForContainer.createFlag('flag' + counter, COLOR_RED);
                                counter++;
                                if (!_.includes(roomsInPath, posForContainer.roomName)) {
                                    roomsInPath.push(posForContainer.roomName);
                                }
                            }
                            for (let i in roadsToBuild) {
                                let pos = roadsToBuild[i];
                                if (pos.x == 0 || pos.x == 49 || pos.y == 0 || pos.y == 49) {
                                    continue;
                                }
                                let roadIsHere = false;
                                let lookFor = pos.lookFor(LOOK_STRUCTURES);
                                for (let i in lookFor) {
                                    if (lookFor[i].structureType == STRUCTURE_ROAD) {
                                        roadIsHere = true;
                                    }
                                }
                                if (!roadIsHere) {
                                    if (!_.includes(roomsInPath, pos.roomName)) {
                                        roomsInPath.push(pos.roomName);
                                    }
                                    pos.createConstructionSite(STRUCTURE_ROAD);
                                    // pos.createFlag('flag' + counter);
                                    counter++;
                                }
                            }

                            // mission.flagCreates = true;
                            mission.roomsInPath = roomsInPath;
                            mission.isDone = true;
                            creep.suicide();
                        }
                    } else {
                        creep.moveTo(new RoomPosition(25, 25, mission.harvestRoom));
                    }
                }
            }
        }
    }
};