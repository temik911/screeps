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
        if (spawn.memory.upgraderNumb == undefined) {
            spawn.memory.upgraderNumb = 0;
        }
        if (spawn.memory.mineralHarvesterNumb == undefined) {
            spawn.memory.mineralHarvesterNumb = 0;
        }
        if (spawn.memory.builderNumb == undefined) {
            spawn.memory.builderNumb = 0;
        }

        if (spawn.spawning != null) {
            return;
        }

        var room = spawn.room;
        var roomStats = room.stats();
        var roomCreeps = roomStats.creeps;
        var roomSources = roomStats.sources;
        var roomExtractors = roomStats.extractors;
        var roomName = room.name;

        var harvesterCount = 0;
        var upgraderCount = 0;
        var builderCount = 0;
        var baseEnergySupportCount = 0;
        var cargoCount = 0;
        var soldierCount = 0;
        var claimerCount = 0;
        var repairCount = 0;
        var mineralHarvesterCount = 0;

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
            } else if (creep.memory.role == constants.MINERAL_HARVESTER) {
                mineralHarvesterCount++;
            }
        }

        var bodies;
        var name;

        var maxUpgraderCount;
        if (creep.room.storage) {
            if (creep.room.storage.store[RESOURCE_ENERGY] < 10000) {
                maxUpgraderCount = 1;
            } else if (creep.room.storage.store[RESOURCE_ENERGY] < 25000) {
                maxUpgraderCount = 2;
            } else if (creep.room.storage.store[RESOURCE_ENERGY] < 45000) {
                maxUpgraderCount = 4;
            } else if (creep.room.storage.store[RESOURCE_ENERGY] < 70000) {
                maxUpgraderCount = 8;
            }
        } else {
            maxUpgraderCount = 4;
        }

        var maxBaseEnergySupportCount = 2;
        if (room.controller.level < 3) {
            maxBaseEnergySupportCount = 1;
        }

        if (baseEnergySupportCount < maxBaseEnergySupportCount) {
            bodies = [MOVE, MOVE, CARRY, CARRY, CARRY, CARRY];
            spawn.createCreep(bodies, null, {
                role: constants.BASE_ENERGY_SUPPORT,
                isSupport: false
            });
        } else if (harvesterCount < roomSources.length) {
            var harvesterNumb = spawn.memory.harvesterNumb;
            bodies = createHarvesterBodies(room);
            name = roomName + "-harv-" + harvesterNumb;
            if (spawn.canCreateCreep(bodies, name) == OK) {
                spawn.createCreep(bodies, name, {
                    role: constants.HARVESTER,
                    numb: harvesterNumb,
                    isHarvest: true
                });
                spawn.memory.harvesterNumb++;
            }
        } else if (room.storage && cargoCount < 3) {
            bodies = [MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY];
            spawn.createCreep(bodies, null, {
                role: constants.CARGO,
                isCargo: false
            });
        } else if (mineralHarvesterCount < roomExtractors.length) {
            var mineralHarvesterNumb = spawn.memory.mineralHarvesterNumb;
            bodies = [WORK, WORK, MOVE, MOVE, CARRY, CARRY];
            name = roomName + "-mineral-" + mineralHarvesterNumb;
            if (spawn.canCreateCreep(bodies, name) == OK) {
                spawn.createCreep(bodies, name, {
                    role: constants.MINERAL_HARVESTER,
                    numb: mineralHarvesterNumb,
                    isHarvest: true
                });
                spawn.memory.mineralHarvesterNumb++;
            }
        } else if (upgraderCount < maxUpgraderCount) {
            var upgraderNumb = spawn.memory.upgraderNumb;
            bodies = createUpgraderBodies(room);
            name = roomName + "-upg-" + upgraderNumb;
            if (spawn.canCreateCreep(bodies, name) == OK) {
                spawn.createCreep(bodies, name, {
                    role: constants.UPGRADER,
                    numb: upgraderNumb,
                    isUpgrade: false
                });
                spawn.memory.upgraderNumb++;
            }
        } else if (room.find(FIND_CONSTRUCTION_SITES).length > 0 && builderCount < 2) {
            var builderNumb = spawn.memory.builderNumb;
            bodies = createBuilderBodies(room);
            name = roomName + "-builder-" +builderNumb;
            if (spawn.canCreateCreep(bodies, name) == OK) {
                spawn.createCreep(bodies, null, {
                    role: constants.BUILDER,
                    isBuild: false
                });
                spawn.memory.builderNumb++;
            }
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
        } else if (soldierCount < 2 && room.find(FIND_HOSTILE_CREEPS).length > 0) {
            bodies = [TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH,
                      TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH,
                      MOVE, MOVE, MOVE, MOVE, MOVE, 
                      ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK];
            spawn.createCreep(bodies, null, {
                role: constants.SOLDIER
            });
        }
    }
};

var createUpgraderBodies = function(room) {
    var bodies = [MOVE, MOVE];
    var currentCost = 100;
    var currentBodiesPart = 2;
    var maxCost = room.energyCapacityAvailable;
    while ((currentCost + 150 < maxCost) && (currentBodiesPart + 2 < 24)) {
        bodies.push(CARRY);
        bodies.push(WORK);
        currentCost += 150;
        currentBodiesPart += 2;
    }
    return bodies;
};

var createBuilderBodies = function(room) {
    var bodies = [MOVE, MOVE];
    var currentCost = 100;
    var currentBodiesPart = 2;
    var maxCost = room.energyCapacityAvailable;
    while ((currentCost + 150 < maxCost) && (currentBodiesPart + 2 < 14)) {
        bodies.push(CARRY);
        bodies.push(WORK);
        currentCost += 150;
        currentBodiesPart += 2;
    }
    return bodies;
};

var createHarvesterBodies = function(room) {
    var bodies = [MOVE];
    var currentCost = 50;
    var currentBodiesPart = 1;
    var maxCost = room.energyCapacityAvailable;
    while ((currentCost + 100 < maxCost) && (currentBodiesPart + 1 < 8)) {
        bodies.push(WORK);
        currentCost += 100;
        currentBodiesPart += 1;
    }
    return bodies;
};