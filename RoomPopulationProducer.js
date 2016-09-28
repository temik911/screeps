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
        if (spawn.memory.reserverForHarvestNumb == undefined) {
            spawn.memory.reserverForHarvestNumb = 0;
        }
        if (spawn.memory.remoteHarvestNumb == undefined) {
            spawn.memory.remoteHarvestNumb = 0;
        }
        if (spawn.memory.remoteCargoNumb == undefined) {
            spawn.memory.remoteCargoNumb = 0;
        }
        if (spawn.memory.remoteBuilderNumb == undefined) {
            spawn.memory.remoteBuilderNumb = 0;
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
        var repairCount = 0;
        var mineralHarvesterCount = 0;
        var reserverForHarvestCount = 0;
        var remoteHarvestCount = 0;
        var remoteCargoCount = 0;
        var remoteBuilderCount = 0;

        var creepName;
        var creep;

        // creeps in this room
        for (creepName in roomCreeps) {
            creep = roomCreeps[creepName];
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
            } else if (creep.memory.role == constants.REPAIR) {
                repairCount++;
            } else if (creep.memory.role == constants.MINERAL_HARVESTER) {
                mineralHarvesterCount++;
            }
        }

        // remote creeps from this room
        for (creepName in Game.creeps) {
            creep = Game.creeps[creepName];
            if (creep.memory.role == constants.RESERVER_FOR_HARVEST) {
                reserverForHarvestCount++;
            } else if (creep.memory.role == constants.REMOTE_HARVEST) {
                remoteHarvestCount++;
            } else if (creep.memory.role == constants.REMOTE_CARGO) {
                remoteCargoCount++;
            } else if (creep.memory.role == constants.REMOTE_BUILDER) {
                remoteBuilderCount++;
            }
        }

        var bodies;
        var name;

        // -------------------------------------------------------------
        var maxUpgraderCount;
        if (room.storage != undefined) {
            if (room.storage.store[RESOURCE_ENERGY] < 10000) {
                maxUpgraderCount = 1;
            } else if (room.storage.store[RESOURCE_ENERGY] < 25000) {
                maxUpgraderCount = 2;
            } else if (room.storage.store[RESOURCE_ENERGY] < 45000) {
                maxUpgraderCount = 4;
            } else if (room.storage.store[RESOURCE_ENERGY] < 70000) {
                maxUpgraderCount = 8;
            }
        } else {
            maxUpgraderCount = 4;
        }


        // -------------------------------------------------------------
        var maxBaseEnergySupportCount = 2;
        if (room.controller.level < 3) {
            maxBaseEnergySupportCount = 1;
        }

        // -------------------------------------------------------------
        var sites = room.find(FIND_CONSTRUCTION_SITES);
        var totalProgress = 0;
        sites.forEach(site => totalProgress += site.progressTotal - site.progress);
        var carryCount = 0;
        createBuilderBodies(room).forEach(body => {
            if (body == CARRY) {
                carryCount++;
            }
        });
        var maxBuilderCount = totalProgress / (carryCount * 50) / 20;
        if (sites.length > 0 && maxBuilderCount < 1) {
            maxBuilderCount = 1;
        }
        if (maxBuilderCount > 4) {
            maxBuilderCount = 4;
        }

        var flagPrefix = roomName + "-reserver";
        // -------------------------------------------------------------
        var maxReserverForHarvestCount = 0;
        for (var flagName in Game.flags) {
            if (flagName.startsWith(flagPrefix)) {
                maxReserverForHarvestCount++;
            }
        }

        // -------------------------------------------------------------
        var maxRemoteHarvestCount = 0;
        for (var flagName in Game.flags) {
            if (flagName.startsWith(flagPrefix)) {
                var room2 = Game.flags[flagName].room;
                if (room2 != undefined) {
                    room2.stats().sources.forEach(source => maxRemoteHarvestCount++);
                }
            }
        }

        if (baseEnergySupportCount < 2) {
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
        } else if (builderCount < maxBuilderCount) {
            var builderNumb = spawn.memory.builderNumb;
            bodies = createBuilderBodies(room);
            name = roomName + "-builder-" +builderNumb;
            if (spawn.canCreateCreep(bodies, name) == OK) {
                spawn.createCreep(bodies, name, {
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
        } else if (soldierCount < 2 && room.find(FIND_HOSTILE_CREEPS).length > 1) {
            bodies = [TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH,
                      TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH,
                      MOVE, MOVE, MOVE, MOVE, MOVE,
                      ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK];
            spawn.createCreep(bodies, null, {
                role: constants.SOLDIER
            });
        } else if (reserverForHarvestCount < maxReserverForHarvestCount) {
            var reserverForHarvestNumb = spawn.memory.reserverForHarvestNumb;
            name = roomName + "-RrsvrFHrv-" + reserverForHarvestNumb;
            bodies = [CLAIM, CLAIM, MOVE, MOVE];
            if (spawn.canCreateCreep(bodies, name) == OK) {
                spawn.createCreep(bodies, name, {
                    role: constants.RESERVER_FOR_HARVEST,
                    numb: reserverForHarvestNumb,
                    flagPrefix : roomName + "-reserver",
                    from: roomName
                });
                spawn.memory.reserverForHarvestNumb++;
            }
        } else if (remoteHarvestCount < maxRemoteHarvestCount) {
            var remoteHarvestNumb = spawn.memory.remoteHarvestNumb;
            name = roomName + "-RmtHrv-" + remoteHarvestNumb;
            bodies = [WORK, WORK, WORK, WORK, WORK, MOVE, MOVE, MOVE, MOVE, MOVE];
            if (spawn.canCreateCreep(bodies, name) == OK) {
                spawn.createCreep(bodies, name, {
                    role: constants.REMOTE_HARVEST,
                    numb: remoteHarvestNumb,
                    flagPrefix : roomName + "-reserver",
                    from: roomName
                });
                spawn.memory.remoteHarvestNumb++;
            }
        } else if (remoteCargoCount < maxRemoteHarvestCount * 2) {
            var remoteCargoNumb = spawn.memory.remoteCargoNumb;
            name = roomName + "-RmtCrg-" + remoteCargoNumb;
            bodies = [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,
                      CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY];
            if (spawn.canCreateCreep(bodies, name) == OK) {
                spawn.createCreep(bodies, name, {
                    role: constants.REMOTE_CARGO,
                    numb: remoteCargoNumb,
                    flagPrefix : roomName + "-reserver",
                    from: roomName
                });
                spawn.memory.remoteCargoNumb++;
            }
        } else if (remoteBuilderCount < maxReserverForHarvestCount * 2) {
            var remoteBuilderNumb = spawn.memory.remoteBuilderNumb;
            name = roomName + "-RmtBld-" + remoteBuilderNumb;
            bodies = [WORK, WORK,
                      MOVE, MOVE, MOVE, MOVE,
                      CARRY, CARRY, CARRY, CARRY];
            if (spawn.canCreateCreep(bodies, name) == OK) {
                spawn.createCreep(bodies, name, {
                    role: constants.REMOTE_BUILDER,
                    numb: remoteBuilderNumb,
                    flagPrefix : roomName + "-reserver",
                    from: roomName
                });
                spawn.memory.remoteBuilderNumb++;
            }
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