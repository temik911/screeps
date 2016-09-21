var constants = require('Constants');
require('RoomInfo');

module.exports = {
    run(spawn) {
        if (spawn.memory.claimerNumb == undefined) {
            spawn.memory.claimerNumb = 0;
        }
        if (spawn.memory.harvesterNumb == undefined) {
            spawn.memory.harvesterNumb = 0;
        }
        if (spawn.memory.repairNumb == undefined) {
            spawn.memory.repairNumb = 0;
        }

        if (spawn.spawning != null) {
            return;
        }

        var room = spawn.room;
        var roomStats = room.stats();
        var roomCreeps = roomStats.creeps;
        var roomSources = roomStats.sources;
        var roomName = room.name;

        var harvesterCount = 0;
        var upgraderCount = 0;
        var builderCount = 0;
        var baseEnergySupportCount = 0;
        var cargoCount = 0;
        var soldierCount = 0;
        var claimerCount = 0;
        var repairCount = 0;

        for (var creepName in roomCreeps) {
            var creep = roomCreeps[creepName];
            if (creep.memory.role == constants.HARVESTER) {
                harvesterCount++;
            } else if (creep.memory.role == constants.UPGRADER) {
                upgraderCount++;
            } else if (creep.memory.role == constants.BUILDER) {
                builderCount++;
            } else if (creep.memory.role == constants.BASE_ENERGY_SUPPORT) {
                baseEnergySupportCount++;
            } else if (creep.memory.role == constants.CARGO) {
                cargoCount++;
            } else if (creep.memory.role == constants.SOLDIER) {
                soldierCount++;
            } else if (creep.memory.role == constants.CLAIMER) {
                claimerCount++;
            } else if (creep.memory.role == constants.REPAIR) {
                repairCount++;
            }
        }

        var bodies;
        var name;

        var maxUpgraderCount;
        if (roomName == 'E39S53') {
            maxUpgraderCount = 6;
        } else {
            maxUpgraderCount = 2;
        }

        if (baseEnergySupportCount < 2) {
            bodies = [MOVE, MOVE, CARRY, CARRY, CARRY, CARRY];
            spawn.createCreep(bodies, null, {
                role: constants.BASE_ENERGY_SUPPORT,
                isSupport: false
            });
        } else if (harvesterCount < roomSources.length) {
            var harvesterNumb = spawn.memory.harvesterNumb;
            bodies = [WORK, WORK, WORK, WORK, WORK, MOVE, MOVE];
            name = roomName + "-harv-" + harvesterNumb;
            if (spawn.canCreateCreep(bodies, name) == OK) {
                spawn.createCreep(bodies, name, {
                    role: constants.HARVESTER,
                    numb: harvesterNumb,
                    isHarvest: true
                });
                spawn.memory.harvesterNumb++;
            }
        } else if (room.storage && cargoCount < 2) {
            bodies = [MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY];
            spawn.createCreep(bodies, null, {
                role: constants.CARGO,
                isCargo: false
            });
        } else if (upgraderCount < maxUpgraderCount) {
            bodies = createUpgraderBodies(room);
            spawn.createCreep(bodies, null, {
                role: constants.UPGRADER,
                isUpgrade: false
            });
        } else if (claimerCount < 0) {
            var claimerNumb = spawn.memory.claimerNumb;
            bodies = [WORK, WORK, WORK, WORK, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY];
            name = roomName + "-claimer-" + claimerNumb;
            if (spawn.canCreateCreep(bodies, name) == OK) {
                spawn.createCreep(bodies, name, {
                    role: constants.CLAIMER,
                    numb: claimerNumb
                });
                spawn.memory.claimerNumb++;
            }
        } else if (room.find(FIND_CONSTRUCTION_SITES).length > 0 && builderCount < 2) {
            bodies = [WORK, WORK, WORK, WORK, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY];
            spawn.createCreep(bodies, null, {
                role: constants.BUILDER,
                isBuild: false
            });
        } else if (repairCount < 1) {
            var repairNumb = spawn.memory.repairNumb;
            name = roomName + "-repair-" + repairNumb;
            bodies = [WORK, WORK, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY];
            if (spawn.canCreateCreep(bodies, name) == OK) {
                spawn.createCreep(bodies, name, {
                    role: constants.REPAIR,
                    numb: repairNumb,
                    isRepair: false
                });
                spawn.memory.repairNumb++;
            }
        } else if (soldierCount < 0) {
            bodies = [ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, MOVE, MOVE, MOVE, MOVE, MOVE];
            spawn.createCreep(bodies, null, {
                role: constants.SOLDIER
            });
        }
    }
};

var createUpgraderBodies = function(room) {
    var bodies = [MOVE, MOVE];
    var currentCost = 100;
    var maxCost = room.energyCapacityAvailable;
    while (currentCost + 150 < maxCost) {
        bodies.push(CARRY);
        bodies.push(WORK);
        currentCost += 150;
    }
    return bodies;
};