let constants = require('Constants');
let utils = require('Utils');
let bodyUtils = require('BodyUtils');

module.exports = {
    run(missionNumb) {
        let mission = Memory.missions[missionNumb];

        if (mission == undefined) {
            return;
        }

        if (mission.fromMinerals == undefined) {
            mission.fromMinerals = utils.getComponentsToProduceMineral(mission.mineralType);
        }

        if (mission.creepId == undefined) {
            findCreep(mission, missionNumb);
        }

        if (mission.task == undefined) {
            mission.task = newTask(mission);
        }

        if (mission.creepId != undefined) {
            let creep = Game.getObjectById(mission.creepId);
            if (creep == null) {
                mission.creepId = undefined;
                mission.creepsIsRequested = undefined;
            } else {
                if (creep.ticksToLive < 50 && _.sum(creep.carry) == 0) {
                    creep.suicide();
                } else {
                    if (mission.task != undefined) {
                        if (creep.carry[mission.task.mineralType] == undefined) {
                            let from = Game.getObjectById(mission.task.from);
                            if (!creep.pos.isNearTo(from.pos)) {
                                creep.moveTo(from);
                            } else {
                                creep.withdraw(from, mission.task.mineralType);
                            }
                        } else {
                            let to = Game.getObjectById(mission.task.to);
                            if (!creep.pos.isNearTo(to.pos)) {
                                creep.moveTo(to);
                            } else {
                                if (creep.transfer(to, mission.task.mineralType) == OK) {
                                    mission.task = undefined;
                                }
                            }
                        }
                    }
                }
            }
        }

        let labs = Game.rooms[mission.fromRoom].stats().labs;
        if (mission.neededAmount <= 0) {
            mission.isDone = true;
        } else {
            let lab1 = Game.getObjectById(Game.rooms[mission.fromRoom].memory.lab1);
            let lab2 = Game.getObjectById(Game.rooms[mission.fromRoom].memory.lab2);

            if (lab1.mineralType == mission.fromMinerals[0] && lab1.mineralAmount > 0
                && lab2.mineralType == mission.fromMinerals[1] && lab2.mineralAmount > 0) {
                for (let labName in labs) {
                    let lab = labs[labName];
                    if (lab.id != lab1.id && lab.id != lab2.id && lab.id != Game.rooms[mission.fromRoom].memory.cgaBoostLabId) {
                        if (lab.cooldown == 0) {
                            if (lab.runReaction(lab1, lab2) == OK) {
                                mission.neededAmount -= 5;
                                break;
                            }
                        }
                    }
                }
            }
        }
    }
};

let newTask = function (mission) {
    let task = undefined;

    let labs = Game.rooms[mission.fromRoom].stats().labs;
    let terminal = Game.rooms[mission.fromRoom].terminal;

    let lab1 = Game.getObjectById(Game.rooms[mission.fromRoom].memory.lab1);
    let lab2 = Game.getObjectById(Game.rooms[mission.fromRoom].memory.lab2);

    for (let labName in labs) {
        let lab = labs[labName];
        if (lab.id != lab1.id && lab.id != lab2.id && lab.id != Game.rooms[mission.fromRoom].memory.cgaBoostLabId) {
            if (lab.mineralAmount > 250) {
                task = new Map();
                task.from = lab.id;
                task.to = terminal.id;
                task.mineralType = lab.mineralType;
                return task;
            }
        }
    }

    let amount1 = lab1.mineralAmount;
    let amount2 = lab2.mineralAmount;

    if (amount1 > 1500 && amount2 > 1500) {
        return undefined;
    }

    if (amount1 >= mission.neededAmount && amount2 >= mission.neededAmount) {
        return undefined;
    }

    let currentLabId = undefined;
    let currentMineralType = undefined;
    if (amount1 <= amount2) {
        currentLabId = lab1.id;
        currentMineralType = mission.fromMinerals[0];
    } else {
        currentLabId = lab2.id;
        currentMineralType = mission.fromMinerals[1];
    }

    if (currentLabId != undefined && currentMineralType != undefined) {
        task = new Map();
        task.from = terminal.id;
        task.to = currentLabId;
        task.mineralType = currentMineralType;
    }
    return task;
};

let findCreep = function (mission, missionNumb) {
    for(let name in Game.creeps) {
        let creep = Game.creeps[name];
        if (creep.memory.mission == constants.PRODUCE_MINERAL_MISSION && creep.memory.fromRoom == mission.fromRoom && creep.spawning == false) {
            mission.creepId = creep.id;
            break;
        }
    }

    if (mission.creepId == undefined && mission.creepsIsRequested == undefined) {
        let creepMemory = new Map();
        creepMemory.mission = constants.PRODUCE_MINERAL_MISSION;
        creepMemory.fromRoom = mission.fromRoom;
        let creepCreations = new Map();
        creepCreations.name = mission.fromRoom + '-' + constants.PRODUCE_MINERAL_MISSION;
        creepCreations.body = bodyUtils.createLabHelperBody();
        creepCreations.memory = creepMemory;
        Memory.rooms[mission.fromRoom].missionCreepsRequests[missionNumb] = creepCreations;
        mission.creepsIsRequested = true;
    }
};