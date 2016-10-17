var constants = require('Constants');
require('RoomInfo');

module.exports = {
    run(room) {
        if (room.memory.claimerNumb == undefined) {
            room.memory.claimerNumb = 0;
        }
        if (room.memory.harvesterNumb == undefined) {
            room.memory.harvesterNumb = 0;
        }
        if (room.memory.repairNumb == undefined) {
            room.memory.repairNumb = 0;
        }
        if (room.memory.upgraderNumb == undefined) {
            room.memory.upgraderNumb = 0;
        }
        if (room.memory.mineralHarvesterNumb == undefined) {
            room.memory.mineralHarvesterNumb = 0;
        }
        if (room.memory.builderNumb == undefined) {
            room.memory.builderNumb = 0;
        }
        if (room.memory.reserverForHarvestNumb == undefined) {
            room.memory.reserverForHarvestNumb = 0;
        }
        if (room.memory.remoteHarvestNumb == undefined) {
            room.memory.remoteHarvestNumb = 0;
        }
        if (room.memory.remoteCargoNumb == undefined) {
            room.memory.remoteCargoNumb = 0;
        }
        if (room.memory.remoteBuilderNumb == undefined) {
            room.memory.remoteBuilderNumb = 0;
        }
        if (room.memory.remoteContainerBuilderNumb == undefined) {
            room.memory.remoteContainerBuilderNumb = 0;
        }
        if (room.memory.guardNumb == undefined) {
            room.memory.guardNumb = 0;
        }

        var roomStats = room.stats();
        var roomCreeps = roomStats.creeps;
        var roomSources = roomStats.sources;
        var roomExtractors = roomStats.extractors;
        var spawns = roomStats.spawns;
        var roomName = room.name;

        if (spawns.length == 0) {
            return;
        }

        var harvesterCount = 0;
        var harvesterWithLinkCount = 0;
        var upgraderCount = 0;
        var builderCount = 0;
        var baseEnergySupportCount = 0;
        var cargoCount = 0;
        var linkCargoCount = 0;
        var soldierCount = 0;
        var repairCount = 0;
        var mineralHarvesterCount = 0;
        var reserverForHarvestCount = 0;
        var remoteHarvestCount = 0;
        var remoteCargoCount = 0;
        var remoteBuilderCount = 0;
        var remoteContainerBuilderCount = 0;
        var guardCount = 0;

        var creepName;
        var creep;

        let allBusy = true;
        for (let spawnName in spawns) {
            let spawn = spawns[spawnName];

            if (spawn.spawning != null) {
                let currentSpawnRole = spawn.memory.currentSpawnRole;

                if (currentSpawnRole != undefined) {
                    if (currentSpawnRole == constants.HARVESTER) {
                        harvesterCount++;
                    } else if (currentSpawnRole == constants.HARVESTER_WITH_LINK) {
                        harvesterWithLinkCount++;
                    } else if (currentSpawnRole == constants.UPGRADER) {
                        upgraderCount++;
                    } else if (currentSpawnRole == constants.BUILDER) {
                        builderCount++;
                    } else if (currentSpawnRole == constants.BASE_ENERGY_SUPPORT) {
                        baseEnergySupportCount++;
                    } else if (currentSpawnRole == constants.CARGO) {
                        cargoCount++;
                    } else if (currentSpawnRole == constants.LINK_CARGO) {
                        linkCargoCount++;
                    } else if (currentSpawnRole == constants.SOLDIER) {
                        soldierCount++;
                    } else if (currentSpawnRole == constants.REPAIR) {
                        repairCount++;
                    } else if (currentSpawnRole == constants.MINERAL_HARVESTER) {
                        mineralHarvesterCount++;
                    } else if (currentSpawnRole == constants.RESERVER_FOR_HARVEST) {
                        reserverForHarvestCount++;
                    } else if (currentSpawnRole == constants.REMOTE_HARVEST) {
                        remoteHarvestCount++;
                    } else if (currentSpawnRole == constants.REMOTE_CARGO) {
                        remoteCargoCount++;
                    } else if (currentSpawnRole == constants.REMOTE_BUILDER) {
                        remoteBuilderCount++;
                    } else if (currentSpawnRole == constants.REMOTE_CONTAINER_BUILDER) {
                        remoteContainerBuilderCount++;
                    } else if (currentSpawnRole == constants.GUARD) {
                        guardCount++;
                    }
                }
            } else {
                allBusy = false;
            }
        }

        if (allBusy) {
            return;
        }

        // creeps in this room
        for (creepName in roomCreeps) {
            let creepRole = roomCreeps[creepName].memory.role;

            if (creepRole == constants.HARVESTER) {
                harvesterCount++;
            } else if (creepRole == constants.HARVESTER_WITH_LINK) {
                harvesterWithLinkCount++;
            } else if (creepRole == constants.UPGRADER) {
                upgraderCount++;
            } else if (creepRole == constants.BUILDER) {
                builderCount++;
            } else if (creepRole == constants.BASE_ENERGY_SUPPORT) {
                baseEnergySupportCount++;
            } else if (creepRole == constants.CARGO) {
                cargoCount++;
            } else if (creepRole == constants.LINK_CARGO) {
                linkCargoCount++;
            } else if (creepRole == constants.SOLDIER) {
                soldierCount++;
            } else if (creepRole == constants.REPAIR) {
                repairCount++;
            } else if (creepRole == constants.MINERAL_HARVESTER) {
                mineralHarvesterCount++;
            }
        }

        // remote creeps from this room
        for (creepName in Game.creeps) {
            creep = Game.creeps[creepName];
            if (creep.memory.from == roomName) {
                if (creep.memory.role == constants.RESERVER_FOR_HARVEST) {
                    reserverForHarvestCount++;
                } else if (creep.memory.role == constants.REMOTE_HARVEST) {
                    remoteHarvestCount++;
                } else if (creep.memory.role == constants.REMOTE_CARGO) {
                    remoteCargoCount++;
                } else if (creep.memory.role == constants.REMOTE_BUILDER) {
                    remoteBuilderCount++;
                } else if (creep.memory.role == constants.REMOTE_CONTAINER_BUILDER) {
                    remoteContainerBuilderCount++;
                } else if (creep.memory.role == constants.GUARD) {
                    guardCount++;
                }
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
            } else {
                maxUpgraderCount = 1;
            }
        } else {
            maxUpgraderCount = 4;
        }


        // -------------------------------------------------------------
        var maxBaseEnergySupportCount = 3;
        if (room.controller.level < 2) {
            maxBaseEnergySupportCount = 1;
        } else if (room.controller.level < 3) {
            maxBaseEnergySupportCount = 2;
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

        var builderFlagPrefix = roomName + "-build";
        var flagPrefix = roomName + "-reserver";
        // -------------------------------------------------------------
        var maxRemoteContainerBuilderCount = 0;
        for (var flagName in Game.flags) {
            if (flagName.startsWith(builderFlagPrefix)) {
                var flagInfo = flagName.split('-');
                var sourcesCount = 0;
                for (var q in flagInfo) {
                    var info = flagInfo[q];
                    if (info.startsWith('sources')) {
                        sourcesCount = info.split(':')[1]
                    }
                }
                for (var i = 0; i < sourcesCount; i++) {
                    maxRemoteContainerBuilderCount++;
                }
            }
        }

        // -------------------------------------------------------------
        var maxReserverForHarvestCount = 0;
        for (var flagName in Game.flags) {
            if (flagName.startsWith(flagPrefix)) {
                maxReserverForHarvestCount++;
            }
        }

        // -------------------------------------------------------------
        var maxGuardCount = 0;
        for (var flagName in Game.flags) {
            if (flagName.startsWith(flagPrefix)) {
                maxGuardCount++;
            }
        }

        // -------------------------------------------------------------
        var maxRemoteHarvestCount = 0;
        for (var flagName in Game.flags) {
            if (flagName.startsWith(flagPrefix)) {
                var room2 = Game.flags[flagName].room;
                if (room2 != undefined) {
                    room2.stats().containers.forEach(container => maxRemoteHarvestCount++);
                }
            }
        }

        for (let spawnName in spawns) {
            let spawn = spawns[spawnName];

            if (spawn.spawning != null) {
                continue;
            }

            let role = undefined;

            if (baseEnergySupportCount < maxBaseEnergySupportCount) {
                bodies = [MOVE, MOVE, CARRY, CARRY, CARRY, CARRY];
                role = constants.BASE_ENERGY_SUPPORT;
                spawn.createCreep(bodies, null, {
                    role: role,
                    isSupport: false
                });
                baseEnergySupportCount++;
            } else if (harvesterCount + harvesterWithLinkCount < roomSources.length) {
                let harvesterNumb = room.memory.harvesterNumb;
                if (room.stats().links.length < 3) {
                    bodies = createHarvesterBodies(room);
                    name = roomName + "-harv-" + harvesterNumb;
                    if (spawn.canCreateCreep(bodies, name) == OK) {
                        role = constants.HARVESTER;
                        spawn.createCreep(bodies, name, {
                            role: role,
                            numb: harvesterNumb,
                            isHarvest: true
                        });
                        room.memory.harvesterNumb++;
                        harvesterCount++;
                    }
                } else {
                    bodies = [MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, WORK, WORK, WORK, WORK, WORK, WORK];
                    name = roomName + "-linkHarv-" + harvesterNumb;
                    if (spawn.canCreateCreep(bodies, name) == OK) {
                        role = constants.HARVESTER_WITH_LINK;
                        spawn.createCreep(bodies, name, {
                            role: role,
                            numb: harvesterNumb,
                        });
                        room.memory.harvesterNumb++;
                        harvesterWithLinkCount++;
                    }
                }
            } else if (room.storage && cargoCount < 3 && room.stats().links.length < 3) {
                bodies = [MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY];
                role = constants.CARGO;
                spawn.createCreep(bodies, null, {
                    role: role,
                    isCargo: false
                });
                cargoCount++;
            } else if (room.storage && linkCargoCount < 1 && room.stats().links.length >= 3) {
                bodies = [MOVE, CARRY, CARRY, CARRY, CARRY];
                role = constants.LINK_CARGO;
                spawn.createCreep(bodies, roomName + "-linkCargo", {
                    role: role,
                });
                linkCargoCount++;
            } else if (mineralHarvesterCount < roomExtractors.length) {
                let mineralHarvesterNumb = room.memory.mineralHarvesterNumb;
                bodies = [WORK, WORK, MOVE, MOVE, CARRY, CARRY];
                name = roomName + "-mineral-" + mineralHarvesterNumb;
                if (spawn.canCreateCreep(bodies, name) == OK) {
                    role = constants.MINERAL_HARVESTER;
                    spawn.createCreep(bodies, name, {
                        role: role,
                        numb: mineralHarvesterNumb,
                        isHarvest: true
                    });
                    room.memory.mineralHarvesterNumb++;
                    mineralHarvesterCount++;
                }
            } else if (upgraderCount < maxUpgraderCount) {
                let upgraderNumb = room.memory.upgraderNumb;
                bodies = createUpgraderBodies(room);
                name = roomName + "-upg-" + upgraderNumb;
                if (spawn.canCreateCreep(bodies, name) == OK) {
                    role = constants.UPGRADER;
                    spawn.createCreep(bodies, name, {
                        role: role,
                        numb: upgraderNumb,
                        isUpgrade: false
                    });
                    room.memory.upgraderNumb++;
                    upgraderCount++;
                }
            } else if (builderCount < maxBuilderCount) {
                let builderNumb = room.memory.builderNumb;
                bodies = createBuilderBodies(room);
                name = roomName + "-builder-" + builderNumb;
                if (spawn.canCreateCreep(bodies, name) == OK) {
                    role = constants.BUILDER;
                    spawn.createCreep(bodies, name, {
                        role: role,
                        isBuild: false
                    });
                    room.memory.builderNumb++;
                    builderCount++;
                }
            } else if (repairCount < 1) {
                let repairNumb = room.memory.repairNumb;
                name = roomName + "-repair-" + repairNumb;
                bodies = [WORK, WORK, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY];
                if (spawn.canCreateCreep(bodies, name) == OK) {
                    role = constants.REPAIR;
                    spawn.createCreep(bodies, name, {
                        role: role,
                        numb: repairNumb,
                        isRepair: false
                    });
                    room.memory.repairNumb++;
                    repairCount++;
                }
            } else if (soldierCount < 2 && room.find(FIND_HOSTILE_CREEPS).length > 1) {
                bodies = [TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH,
                    TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH,
                    MOVE, MOVE, MOVE, MOVE, MOVE,
                    ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK];
                role = constants.SOLDIER;
                spawn.createCreep(bodies, null, {
                    role: role
                });
                soldierCount++;
            } else if (reserverForHarvestCount < maxReserverForHarvestCount) {
                let reserverForHarvestNumb = room.memory.reserverForHarvestNumb;
                name = roomName + "-RrsvrFHrv-" + reserverForHarvestNumb;
                bodies = [CLAIM, CLAIM, MOVE, MOVE];
                if (spawn.canCreateCreep(bodies, name) == OK) {
                    role = constants.RESERVER_FOR_HARVEST;
                    spawn.createCreep(bodies, name, {
                        role: role,
                        numb: reserverForHarvestNumb,
                        flagPrefix: roomName + "-reserver",
                        from: roomName
                    });
                    room.memory.reserverForHarvestNumb++;
                    reserverForHarvestCount++;
                }
            } else if (remoteHarvestCount < maxRemoteHarvestCount) {
                let remoteHarvestNumb = room.memory.remoteHarvestNumb;
                name = roomName + "-RmtHrv-" + remoteHarvestNumb;
                bodies = [WORK, WORK, WORK, WORK, WORK, WORK, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY];
                if (spawn.canCreateCreep(bodies, name) == OK) {
                    role = constants.REMOTE_HARVEST;
                    spawn.createCreep(bodies, name, {
                        role: role,
                        numb: remoteHarvestNumb,
                        flagPrefix: roomName + "-reserver",
                        from: roomName
                    });
                    room.memory.remoteHarvestNumb++;
                    remoteHarvestCount++;
                }
            } else if (remoteCargoCount < maxRemoteHarvestCount * 2) {
                let remoteCargoNumb = room.memory.remoteCargoNumb;
                name = roomName + "-RmtCrg-" + remoteCargoNumb;
                bodies = [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,
                    CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
                    CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY];
                if (spawn.canCreateCreep(bodies, name) == OK) {
                    role = constants.REMOTE_CARGO;
                    spawn.createCreep(bodies, name, {
                        role: role,
                        numb: remoteCargoNumb,
                        flagPrefix: roomName + "-reserver",
                        from: roomName
                    });
                    room.memory.remoteCargoNumb++;
                    remoteCargoCount++;
                }
            } else if (remoteBuilderCount < maxReserverForHarvestCount) {
                let remoteBuilderNumb = room.memory.remoteBuilderNumb;
                name = roomName + "-RmtBld-" + remoteBuilderNumb;
                bodies = [WORK, WORK, WORK, WORK,
                    MOVE, MOVE, MOVE, MOVE,
                    CARRY, CARRY, CARRY, CARRY];
                if (spawn.canCreateCreep(bodies, name) == OK) {
                    role = constants.REMOTE_BUILDER;
                    spawn.createCreep(bodies, name, {
                        role: role,
                        numb: remoteBuilderNumb,
                        flagPrefix: roomName + "-reserver",
                        from: roomName
                    });
                    room.memory.remoteBuilderNumb++;
                    remoteBuilderCount++;
                }
            } else if (remoteContainerBuilderCount < maxRemoteContainerBuilderCount) {
                let remoteContainerBuilderNumb = room.memory.remoteContainerBuilderNumb;
                name = roomName + "-RmtCntBld-" + remoteContainerBuilderNumb;
                bodies = [WORK, WORK, WORK, WORK,
                    MOVE, MOVE, MOVE, MOVE,
                    CARRY, CARRY, CARRY, CARRY];
                if (spawn.canCreateCreep(bodies, name) == OK) {
                    role = constants.REMOTE_CONTAINER_BUILDER;
                    spawn.createCreep(bodies, name, {
                        role: role,
                        numb: remoteContainerBuilderNumb,
                        flagPrefix: roomName + "-build",
                        from: roomName
                    });
                    room.memory.remoteContainerBuilderNumb++;
                    remoteBuilderCount++;
                }
            } else if (guardCount < maxGuardCount) {
                let guardNumb = room.memory.guardNumb;
                name = roomName + "-RmtGuard-" + guardNumb;
                bodies = [TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH,
                    MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,
                    ATTACK, ATTACK, ATTACK, ATTACK, ATTACK];
                if (spawn.canCreateCreep(bodies, name) == OK) {
                    role = constants.GUARD;
                    spawn.createCreep(bodies, name, {
                        role: role,
                        numb: guardNumb,
                        flagPrefix: roomName + "-reserver",
                        from: roomName
                    });
                    room.memory.guardNumb++;
                    guardCount++;
                }
            }

            spawn.memory.currentSpawnRole = role;
        }
    }
};

var createBaseEnergySupportBodies = function(room) {
    var bodies = [MOVE, CARRY, CARRY, MOVE, CARRY, CARRY];
    if (room.controller > 4) {
        var currentCost = 300;
        var currentBodiesPart = 6;
        var maxCost = room.energyCapacityAvailable / 2;
        while ((currentCost + 150 < maxCost) && (currentBodiesPart + 3 < 17)) {
            bodies.push(MOVE);
            bodies.push(CARRY);
            bodies.push(CARRY);
            currentCost += 150;
            currentBodiesPart += 3;
        }
    }
    return bodies;
};

var createUpgraderBodies = function(room) {
    var bodies = [];
    var currentCost = 0;
    var currentBodiesPart = 0;
    var maxCost = room.energyCapacityAvailable;
    while ((currentCost + 200 < maxCost) && (currentBodiesPart + 3 < 31)) {
        bodies.push(MOVE);
        bodies.push(CARRY);
        bodies.push(WORK);
        currentCost += 200;
        currentBodiesPart += 3;
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