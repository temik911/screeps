let utils = require('Utils');
let constants = require('Constants');

module.exports = {
    run(missionNumb) {
        let mission = Memory.missions[missionNumb];

        if (mission.isDone == true) {
            let creep = Game.getObjectById(mission.creepId);
            if (creep != null) {
                creep.suicide();
            }
            delete(Memory.missions[missionNumb]);
            return;
        }

        if (mission.creepId == undefined) {
            for(let name in Game.creeps) {
                let creep = Game.creeps[name];
                if (creep.memory.mission == constants.DISMANTLE_ROOM_MISSION && creep.memory.missionNumb == missionNumb) {
                    mission.creepId = creep.id;
                }
            }

            if (mission.creepId == undefined && mission.creepsIsRequested == undefined) {
                let creepMemory = new Map();
                creepMemory.mission = constants.DISMANTLE_ROOM_MISSION;
                creepMemory.missionNumb = missionNumb;
                let creepCreations = new Map();
                creepCreations.name = mission.fromRoom + "-" + constants.DISMANTLE_ROOM_MISSION + "-" + missionNumb;
                creepCreations.body = [MOVE, RANGED_ATTACK, MOVE, RANGED_ATTACK, MOVE, RANGED_ATTACK, MOVE, RANGED_ATTACK, MOVE, RANGED_ATTACK,
                    MOVE, RANGED_ATTACK, MOVE, RANGED_ATTACK, MOVE, RANGED_ATTACK, MOVE, RANGED_ATTACK, MOVE, RANGED_ATTACK,
                    MOVE, RANGED_ATTACK, MOVE, RANGED_ATTACK, MOVE, RANGED_ATTACK, MOVE, RANGED_ATTACK, MOVE, RANGED_ATTACK,
                    MOVE, RANGED_ATTACK, MOVE, RANGED_ATTACK, MOVE, RANGED_ATTACK, MOVE, RANGED_ATTACK, MOVE, RANGED_ATTACK,
                    MOVE, RANGED_ATTACK, MOVE, RANGED_ATTACK, MOVE, RANGED_ATTACK, MOVE, RANGED_ATTACK, MOVE, RANGED_ATTACK];
                creepCreations.memory = creepMemory;
                Memory.rooms[mission.fromRoom].missionCreepsRequests[missionNumb] = creepCreations;
                mission.creepsIsRequested = true;
            }
        } else {
            let creep = Game.getObjectById(mission.creepId);
            if (creep == null) {
                mission.creepId = undefined;
                mission.creepsIsRequested = undefined;
                mission.targetId = undefined;
            } else {
                if (creep.room.name == mission.dismantleRoom) {
                    if (mission.preparedData == undefined) {
                        mission.preparedData = new Map();
                        let flagPrefix = mission.name + "-" + missionNumb + "-remove";
                        for (let flagName in Game.flags) {
                            if (flagName.startsWith(flagPrefix)) {
                                let flag = Game.flags[flagName];
                                mission.preparedData[flagName] = flag.pos;
                                flag.remove();
                            }
                        }
                    }

                    if (mission.targetId == undefined) {
                        let targetId = undefined;

                        for (let i in mission.preparedData) {
                            let position = mission.preparedData[i];
                            let targets = new RoomPosition(position.x, position.y, position.roomName).lookFor(LOOK_STRUCTURES);
                            if (targets.length != 0) {
                                let possibleTarget = targets[0];
                                if (creep.pos.findPathTo(possibleTarget).length != 0) {
                                    targetId = possibleTarget.id;
                                    break;
                                }
                            }
                        }

                        let attacker = creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS, {
                            filter: function(object) {
                                return ((object.getActiveBodyparts(ATTACK) + object.getActiveBodyparts(RANGED_ATTACK)) != 0);
                            }
                        });
                        if (attacker != null) {
                            targetId = attacker.id;
                        }

                        if (targetId == undefined) {
                            let worker = creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS);
                            if (worker != null) {
                                targetId = worker.id;
                            }
                        }

                        if (targetId == undefined) {

                            let found = creep.pos.findClosestByPath(FIND_HOSTILE_CONSTRUCTION_SITES, {
                                filter: function(object) {
                                    let lookFor = object.pos.lookFor(LOOK_STRUCTURES);
                                    for (let i in lookFor) {
                                        if (lookFor[i].structureType == STRUCTURE_RAMPART) {
                                            return false;
                                        }
                                    }
                                    return true;
                                }
                            });
                            
                            if (found == null) {
                            found = creep.pos.findClosestByPath(FIND_HOSTILE_SPAWNS, {
                                filter: function(object) {
                                    let lookFor = object.pos.lookFor(LOOK_STRUCTURES);
                                    for (let i in lookFor) {
                                        if (lookFor[i].structureType == STRUCTURE_RAMPART) {
                                            return false;
                                        }
                                    }
                                    return true;
                                }
                            });
                            }
                            
                            if (found == null) {
                                found = creep.pos.findClosestByPath(FIND_HOSTILE_STRUCTURES, {
                                    filter: function(object) {
                                        let lookFor = object.pos.lookFor(LOOK_STRUCTURES);
                                        for (let i in lookFor) {
                                            if (lookFor[i].structureType == STRUCTURE_RAMPART) {
                                                return false;
                                            } else if (lookFor[i].structureType == STRUCTURE_CONTROLLER) {
                                                return false;
                                            }
                                        }
                                        return true;
                                    }
                                });
                            }

                            if (found == null && mission.dismantleWalls == true) {
                                found = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                                    filter: function(object) {
                                        return object.structureType == STRUCTURE_WALL;
                                    }
                                });
                            }
                            
                            if(found != null) {
                                targetId = found.id;
                            }
                        }

                        if (targetId == undefined) {
                            console.log("Can't find any targets. Complete mission and suicide creep.");
                            creep.moveTo(new RoomPosition(25, 25, mission.dismantleRoom));
                            mission.isDone = true;
                            creep.suicide();
                            delete(Memory.missions[missionNumb]);
                        } else {
                            mission.targetId = targetId;
                        }
                    } else {
                        let target = Game.getObjectById(mission.targetId);
                        if (target == null) {
                            mission.targetId = undefined;
                        } else {
                            if (target instanceof ConstructionSite) {
                                creep.moveTo(target);
                            } else {
                                let result = creep.rangedAttack(target);
                                if (result == ERR_NOT_IN_RANGE) {
                                    creep.moveTo(target);
                                } else if (result == ERR_NO_PATH) {
                                    mission.targetId = undefined;
                                }
                            }
                        }
                    }
                } else {
                    creep.moveTo(new RoomPosition(25, 25, mission.dismantleRoom));
                }
            }
        }
    }
};