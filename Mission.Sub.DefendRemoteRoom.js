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
                if (mission.currentCreepTTL > 10) {
                    mission.isFailed = true;
                }
            } else {
                if (!creep.spawning) {
                    mission.currentCreepTTL = creep.ticksToLive;
                    if (creep.room.name != mission.targetRoom) {
                        creep.moveTo(new RoomPosition(25, 25, mission.targetRoom));
                    } else {
                        let targets = creep.room.find(FIND_HOSTILE_CREEPS);
                        if (targets.length == 0) {
                            mission.isDone = true;
                            creep.memory.free = true;
                        } else if (targets.length > 0) {
                            let target = targets[0];
                            let range = creep.pos.getRangeTo(target.pos);
                            if (range <= 3) {
                                creep.rangedAttack(target);
                            }

                            if (range > 3) {
                                creep.moveTo(target);
                            } else if (range != 3) {
                                let oppositeDirection = getOppositeDirection(creep.pos.getDirectionTo(target.pos));
                                let newPos = null;
                                let p = getPositionToMove(creep.pos, oppositeDirection);
                                let terrain = p.lookFor(LOOK_TERRAIN);
                                if (p.x != 0 && p.x != 49 && p.y != 0 && p.y != 49 && terrain != 'wall') {
                                    newPos = p;
                                }
                                if (newPos == null) {
                                    let possibleDirectionsToMove = _.shuffle(getNearestDirections(oppositeDirection));
                                    for (let i in possibleDirectionsToMove) {
                                        let possibleDirection = possibleDirectionsToMove[i];
                                        p = getPositionToMove(creep.pos, possibleDirection);
                                        terrain = p.lookFor(LOOK_TERRAIN);
                                        if (p.x != 0 && p.x != 49 && p.y != 0 && p.y != 49 && terrain != 'wall') {
                                            newPos = p;
                                            break;
                                        }
                                    }
                                }
                                if (newPos != null) {
                                    creep.moveTo(newPos);
                                }
                            }
                        }

                        if (creep.hits < creep.hitsMax) {
                            creep.heal(creep);
                        }
                    }
                }
            }
        }
    }
};

let findCreep = function (mission, missionNumb) {
    for (let name in Game.creeps) {
        let creep = Game.creeps[name];
        if (creep.memory.mission == constants.DEFEND_REMOTE_ROOM_MISSION && creep.memory.free == true && creep.memory.fromRoom == mission.fromRoom && creep.spawning == false) {
            mission.creepId = creep.id;
            creep.memory.free = false;
            break;
        }
    }

    if (mission.creepId == undefined && mission.creepsIsRequested == undefined) {
        let creepMemory = new Map();
        creepMemory.mission = constants.DEFEND_REMOTE_ROOM_MISSION;
        creepMemory.fromRoom = mission.fromRoom;
        creepMemory.free = true;
        let creepCreations = new Map();
        creepCreations.name = mission.fromRoom + '-' + constants.DEFEND_REMOTE_ROOM_MISSION + '-' + missionNumb;
        creepCreations.body = [TOUGH, TOUGH, TOUGH, TOUGH, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,
            RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, MOVE, HEAL];
        creepCreations.memory = creepMemory;
        Memory.rooms[mission.fromRoom].missionCreepsRequests[missionNumb] = creepCreations;
        mission.creepsIsRequested = true;
    }
};

let getOppositeDirection = function (direction) {
    switch (direction) {
        case TOP_LEFT :
            return BOTTOM_RIGHT;
        case TOP :
            return BOTTOM;
        case TOP_RIGHT :
            return BOTTOM_LEFT;
        case LEFT :
            return RIGHT;
        case RIGHT :
            return LEFT;
        case BOTTOM_LEFT :
            return TOP_RIGHT;
        case BOTTOM :
            return TOP;
        case BOTTOM_RIGHT :
            return TOP_LEFT;
    }
};

let getPositionToMove = function (pos, direction) {
    switch (direction) {
        case TOP_LEFT :
            return new RoomPosition(pos.x + 1, pos.y + 1, pos.roomName);
        case TOP :
            return new RoomPosition(pos.x + 1, pos.y, pos.roomName);
        case TOP_RIGHT :
            return new RoomPosition(pos.x + 1, pos.y - 1, pos.roomName);
        case LEFT :
            return new RoomPosition(pos.x, pos.y + 1, pos.roomName);
        case RIGHT :
            return new RoomPosition(pos.x, pos.y - 1, pos.roomName);
        case BOTTOM_LEFT :
            return new RoomPosition(pos.x - 1, pos.y + 1, pos.roomName);
        case BOTTOM :
            return new RoomPosition(pos.x - 1, pos.y, pos.roomName);
        case BOTTOM_RIGHT :
            return new RoomPosition(pos.x - 1, pos.y - 1, pos.roomName);
    }
};

let getNearestDirections = function (direction) {
    switch (direction) {
        case TOP_LEFT :
            return [LEFT, TOP_LEFT, TOP];
        case TOP :
            return [TOP_LEFT, TOP, TOP_RIGHT];
        case TOP_RIGHT :
            return [TOP, TOP_RIGHT, RIGHT];
        case LEFT :
            return [TOP_LEFT, LEFT, BOTTOM_LEFT];
        case RIGHT :
            return [TOP_RIGHT, RIGHT, BOTTOM_RIGHT];
        case BOTTOM_LEFT :
            return [LEFT, BOTTOM_LEFT, BOTTOM];
        case BOTTOM :
            return [BOTTOM_LEFT, BOTTOM, BOTTOM_RIGHT];
        case BOTTOM_RIGHT :
            return [BOTTOM, BOTTOM_RIGHT, RIGHT];
    }
};
