let constants = require('Constants');
require('RoomInfo');

module.exports = {
    run(room) {
        if (room.memory.harvesterNumb == undefined) {
            room.memory.harvesterNumb = 0;
        }
        if (room.memory.repairNumb == undefined) {
            room.memory.repairNumb = 0;
        }
        if (room.memory.upgraderNumb == undefined) {
            room.memory.upgraderNumb = 0;
        }
        if (room.memory.linkUpgraderNumb == undefined) {
            room.memory.linkUpgraderNumb = 0;
        }
        if (room.memory.mineralHarvesterNumb == undefined) {
            room.memory.mineralHarvesterNumb = 0;
        }
        if (room.memory.mineralCargoNumb == undefined) {
            room.memory.mineralCargoNumb = 0;
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
        if (room.memory.terminalCargoNumb == undefined) {
            room.memory.terminalCargoNumb = 0;
        }

        let roomStats = room.stats();
        let roomCreeps = roomStats.creeps;
        let roomSources = roomStats.sources;
        let roomExtractors = roomStats.extractors;
        let spawns = roomStats.spawns;
        let mineral = roomStats.mineral;
        let roomName = room.name;

        if (spawns.length == 0) {
            return;
        }

        let harvesterCount = 0;
        let harvesterWithLinkCount = 0;
        let upgraderCount = 0;
        let linkUpgraderCount = 0;
        let builderCount = 0;
        let baseEnergySupportCount = 0;
        let cargoCount = 0;
        let terminalCargoCount = 0;
        let fastLinkCargoCount = 0;
        let soldierCount = 0;
        let repairCount = 0;
        let mineralHarvesterCount = 0;
        let mineralHarvesterWithOutCarryCount = 0;
        let mineralCargoCount = 0;
        let reserverForHarvestCount = 0;
        let remoteHarvestCount = 0;
        let remoteCargoCount = 0;
        let remoteBuilderCount = 0;
        let remoteContainerBuilderCount = 0;
        let guardCount = 0;
        let labsSupportCount = 0;

        let creepName;
        let creep;

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
                    } else if (currentSpawnRole == constants.FAST_LINK_CARGO) {
                        fastLinkCargoCount++;
                    } else if (currentSpawnRole == constants.TERMINAL_CARGO) {
                        terminalCargoCount++;
                    } else if (currentSpawnRole == constants.SOLDIER) {
                        soldierCount++;
                    } else if (currentSpawnRole == constants.REPAIR) {
                        repairCount++;
                    } else if (currentSpawnRole == constants.MINERAL_HARVESTER) {
                        mineralHarvesterCount++;
                    } else if (currentSpawnRole == constants.MINERAL_HARVESTER_WITHOUT_CARRY) {
                        mineralHarvesterWithOutCarryCount++;
                    } else if (currentSpawnRole == constants.MINERAL_CARGO) {
                        mineralCargoCount++;
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
                    } else if (currentSpawnRole == constants.LINK_UPGRADER) {
                        linkUpgraderCount++;
                    } else if (currentSpawnRole == constants.LABS_SUPPORT) {
                        labsSupportCount++;
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
            } else if (creepRole == constants.FAST_LINK_CARGO) {
                fastLinkCargoCount++;
            } else if (creepRole == constants.TERMINAL_CARGO) {
                terminalCargoCount++;
            } else if (creepRole == constants.SOLDIER) {
                soldierCount++;
            } else if (creepRole == constants.REPAIR) {
                repairCount++;
            } else if (creepRole == constants.MINERAL_HARVESTER) {
                mineralHarvesterCount++;
            } else if (creepRole == constants.MINERAL_HARVESTER_WITHOUT_CARRY) {
                mineralHarvesterWithOutCarryCount++;
            } else if (creepRole == constants.MINERAL_CARGO) {
                mineralCargoCount++;
            } else if (creepRole == constants.LINK_UPGRADER) {
                linkUpgraderCount++;
            } else if (creepRole == constants.LABS_SUPPORT) {
                labsSupportCount++;
            }
        }

        // remote creeps from this room
        for (creepName in Game.creeps) {
            creep = Game.creeps[creepName];
            if (creep.memory.from == roomName) {
                if (creep.memory.role == constants.REMOTE_HARVEST) {
                    remoteHarvestCount++;
                } else if (creep.memory.role == constants.REMOTE_BUILDER) {
                    remoteBuilderCount++;
                } else if (creep.memory.role == constants.REMOTE_CONTAINER_BUILDER) {
                    remoteContainerBuilderCount++;
                } else if (creep.memory.role == constants.GUARD) {
                    guardCount++;
                }
            }
        }

        let bodies;
        let name;

        // -------------------------------------------------------------
        let maxUpgraderCount = 0;
        let maxLinkUpgraderCount = 0;
        if (room.stats().links.length >= 2) {
            // link upgraders
            if (room.controller.level == 8) {
                maxLinkUpgraderCount = 1;
            } else {
                if (room.storage.store.energy < 10000) {
                    maxLinkUpgraderCount = 1;
                } else if (room.storage.store.energy < 75000) {
                    maxLinkUpgraderCount = 2;
                } else {
                    maxLinkUpgraderCount = 4;
                }
            }
        } else {
            // default upgraders
            if (room.storage != undefined) {
                if (room.storage.store.energy < 10000) {
                    maxUpgraderCount = 1;
                } else if (room.storage.store.energy < 25000) {
                    maxUpgraderCount = 2;
                } else if (room.storage.store.energy < 45000) {
                    maxUpgraderCount = 4;
                } else {
                    maxUpgraderCount = 8;
                }
            } else {
                maxUpgraderCount = 4;
            }
        }


        // -------------------------------------------------------------
        let maxBaseEnergySupportCount = 2;
        if (room.controller.level < 4) {
            maxBaseEnergySupportCount = 1;
        }

        // -------------------------------------------------------------
        let sites = room.find(FIND_CONSTRUCTION_SITES);
        let totalProgress = 0;
        sites.forEach(site => totalProgress += site.progressTotal - site.progress);
        let carryCount = 0;
        createBuilderBodies(room).forEach(body => {
            if (body == CARRY) {
                carryCount++;
            }
        });
        let maxBuilderCount = totalProgress / (carryCount * 50) / 20;
        if (sites.length > 0 && maxBuilderCount < 1) {
            maxBuilderCount = 1;
        }
        if (maxBuilderCount > 4) {
            maxBuilderCount = 4;
        }

        let builderFlagPrefix = roomName + "-build";
        let flagPrefix = roomName + "-reserver";
        // -------------------------------------------------------------
        let maxRemoteContainerBuilderCount = 0;
        for (let flagName in Game.flags) {
            if (flagName.startsWith(builderFlagPrefix)) {
                let flagInfo = flagName.split('-');
                let sourcesCount = 0;
                for (let q in flagInfo) {
                    let info = flagInfo[q];
                    if (info.startsWith('sources')) {
                        sourcesCount = info.split(':')[1]
                    }
                }
                for (let i = 0; i < sourcesCount; i++) {
                    maxRemoteContainerBuilderCount++;
                }
            }
        }

        // -------------------------------------------------------------
        let maxReserverForHarvestCount = 0;
        for (let flagName in Game.flags) {
            if (flagName.startsWith(flagPrefix)) {
                maxReserverForHarvestCount++;
            }
        }

        // -------------------------------------------------------------
        let maxGuardCount = 0;
        for (let flagName in Game.flags) {
            if (flagName.startsWith(flagPrefix)) {
                maxGuardCount++;
            }
        }

        // -------------------------------------------------------------
        let maxRemoteHarvestCount = 0;
        for (let flagName in Game.flags) {
            if (flagName.startsWith(flagPrefix)) {
                let room2 = Game.flags[flagName].room;
                if (room2 != undefined) {
                    room2.stats().containers.forEach(container => maxRemoteHarvestCount++);
                }
            }
        }

        // --------------------------------------------------------------
        let maxMineralHarvesterCount = 0;
        let maxMineralHarvesterWithOutCarry = 0;
        let maxMineralCargo = 0;
        if (roomExtractors.length != 0 && mineral.mineralAmount > 0) {
            if (mineral.pos.findInRange(FIND_STRUCTURES, 1,
                    {filter: (structure) => structure.structureType == STRUCTURE_CONTAINER}).length == 1) {
                maxMineralHarvesterWithOutCarry = 1;
                maxMineralCargo = 1;
            } else {
                maxMineralHarvesterCount = 1
            }
        }

        // --------------------------------------------------------------
        let maxTerminalCargoCount = 0;
        if (room.terminal != undefined) {
            if (room.controller.level != 8) {
                if (room.terminal.store[RESOURCE_ENERGY] > 30000 + 1000) {
                    maxTerminalCargoCount = 1;
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
                bodies = createBaseEnergySupportBodies(room);
                role = constants.BASE_ENERGY_SUPPORT;
                spawn.createCreep(bodies, null, {
                    role: role,
                    isSupport: false
                });
                baseEnergySupportCount++;
            } else if (harvesterCount + harvesterWithLinkCount < roomSources.length) {
                let harvesterNumb = room.memory.harvesterNumb;
                if (room.stats().links.length < 4) {
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
                    bodies = [MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, WORK, WORK, WORK, WORK, WORK, WORK];
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
            } else if (room.storage && cargoCount < 2 && room.stats().links.length < 4) {
                bodies = [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,
                    CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY];
                role = constants.CARGO;
                spawn.createCreep(bodies, null, {
                    role: role,
                    isCargo: false
                });
                cargoCount++;
            } else if (room.storage && fastLinkCargoCount < 1 && room.stats().links.length >= 2) {
                bodies = [MOVE, CARRY, CARRY, CARRY, CARRY];
                role = constants.FAST_LINK_CARGO;
                spawn.createCreep(bodies, roomName + "-fastLinkCargo", {
                    role: role,
                });
                fastLinkCargoCount++;
            } else if (terminalCargoCount < maxTerminalCargoCount) {
                let terminalCargoNumb = room.memory.terminalCargoNumb;
                bodies = [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,
                    CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
                    CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY];
                name = roomName + "-terminalCrg-" + terminalCargoNumb;
                if (spawn.canCreateCreep(bodies, name) == OK) {
                    role = constants.TERMINAL_CARGO;
                    spawn.createCreep(bodies, name, {
                        role: role,
                        numb: terminalCargoNumb
                    });
                    room.memory.terminalCargoNumb++;
                    terminalCargoCount++;
                }
            } else if (mineralHarvesterCount < maxMineralHarvesterCount) {
                let mineralHarvesterNumb = room.memory.mineralHarvesterNumb;
                bodies = [WORK, WORK, WORK, WORK, WORK,
                    MOVE, MOVE, MOVE, MOVE, MOVE,
                    CARRY, CARRY, CARRY, CARRY, CARRY];
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
            } else if (mineralHarvesterWithOutCarryCount < maxMineralHarvesterWithOutCarry) {
                let mineralHarvesterNumb = room.memory.mineralHarvesterNumb;
                bodies = createMineralHarvesterWithOutCarryBodies(room);
                name = roomName + "-mnrlWOCarry-" + mineralHarvesterNumb;
                if (spawn.canCreateCreep(bodies, name) == OK) {
                    role = constants.MINERAL_HARVESTER_WITHOUT_CARRY;
                    spawn.createCreep(bodies, name, {
                        role: role,
                        numb: mineralHarvesterNumb
                    });
                    room.memory.mineralHarvesterNumb++;
                    mineralHarvesterWithOutCarryCount++;
                }
            } else if (mineralCargoCount < maxMineralCargo) {
                let mineralCargoNumb = room.memory.mineralCargoNumb;
                bodies = [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,
                    CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY];
                name = roomName + "-mnrlCargo-" + mineralCargoNumb;
                if (spawn.canCreateCreep(bodies, name) == OK) {
                    role = constants.MINERAL_CARGO;
                    spawn.createCreep(bodies, name, {
                        role: role,
                        numb: mineralCargoNumb
                    });
                    room.memory.mineralCargoNumb++;
                    mineralCargoCount++;
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
            } else if (linkUpgraderCount < maxLinkUpgraderCount) {
                let linkUpgraderNumb = room.memory.linkUpgraderNumb;
                bodies = createLinkUpgraderBodies(room);
                name = roomName + "-linkUpg-" + linkUpgraderNumb;
                let isReadyToUpgrade = room.terminal == undefined ? true : room.storage.store[RESOURCE_ENERGY] < 10000 * maxLinkUpgraderCount;
                if (spawn.canCreateCreep(bodies, name) == OK) {
                    role = constants.LINK_UPGRADER;
                    spawn.createCreep(bodies, name, {
                        role: role,
                        numb: linkUpgraderNumb,
                        isReadyToUpgrade: isReadyToUpgrade
                    });
                    room.memory.linkUpgraderNumb++;
                    linkUpgraderCount++;
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
            } else if (room.controller.level >= 4 && repairCount < 1) {
                let repairNumb = room.memory.repairNumb;
                name = roomName + "-repair-" + repairNumb;
                bodies = [WORK, WORK, WORK, WORK, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY];
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
            } else if (reserverForHarvestCount < room.memory.neededReserver) {
                let reserverForHarvestNumb = room.memory.reserverForHarvestNumb;
                name = roomName + "-RsrvFHrv-" + reserverForHarvestNumb;
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
            } else if (remoteCargoCount < room.memory.neededCargo) {
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
                    remoteContainerBuilderCount++;
                }
            } else if (guardCount < maxGuardCount) {
                let guardNumb = room.memory.guardNumb;
                name = roomName + "-RmtGuard-" + guardNumb;
                bodies = [TOUGH, TOUGH, TOUGH, TOUGH, TOUGH,
                    MOVE, MOVE, MOVE, MOVE, MOVE,
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

let createBaseEnergySupportBodies = function(room) {
    let bodies = [MOVE, CARRY, CARRY, MOVE, CARRY, CARRY];
    if (room.storage != undefined) {
        let currentCost = 300;
        let currentBodiesPart = 6;
        let maxCost = room.energyCapacityAvailable / 2;
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

let createUpgraderBodies = function(room) {
    let bodies = [];
    let currentCost = 0;
    let currentBodiesPart = 0;
    let maxCost = room.energyCapacityAvailable;
    while ((currentCost + 200 < maxCost) && (currentBodiesPart + 3 < 31)) {
        bodies.push(MOVE);
        bodies.push(CARRY);
        bodies.push(WORK);
        currentCost += 200;
        currentBodiesPart += 3;
    }
    return bodies;
};

let createLinkUpgraderBodies = function(room) {
    let bodies = [CARRY, CARRY, CARRY, CARRY];
    let currentCost = 200;
    let currentBodiesPart = 4;
    let maxCost = room.energyCapacityAvailable;
    while ((currentCost + 250 < maxCost) && (currentBodiesPart + 3 < 35)) {
        bodies.push(WORK);
        bodies.push(WORK);
        bodies.push(MOVE);
        currentCost += 250;
        currentBodiesPart += 3;
    }
    return bodies;
};

let createBuilderBodies = function(room) {
    let bodies = [MOVE, MOVE];
    let currentCost = 100;
    let currentBodiesPart = 2;
    let maxCost = room.energyCapacityAvailable;
    while ((currentCost + 150 < maxCost) && (currentBodiesPart + 2 < 14)) {
        bodies.push(CARRY);
        bodies.push(WORK);
        currentCost += 150;
        currentBodiesPart += 2;
    }
    return bodies;
};

let createHarvesterBodies = function(room) {
    let bodies = [MOVE];
    let currentCost = 50;
    let currentBodiesPart = 1;
    let maxCost = room.energyCapacityAvailable;
    while ((currentCost + 100 < maxCost) && (currentBodiesPart + 1 < 8)) {
        bodies.push(WORK);
        currentCost += 100;
        currentBodiesPart += 1;
    }
    if (currentCost + 100 < maxCost) {
        bodies.push(MOVE);
        bodies.push(MOVE);
    }
    return bodies;
};

let createMineralHarvesterWithOutCarryBodies = function(room) {
    let bodies = [];
    let currentCost = 0;
    let currentBodiesPart = 0;
    let maxCost = room.energyCapacityAvailable;
    while ((currentCost + 250 < maxCost) && (currentBodiesPart + 3 < 50)) {
        bodies.push(WORK);
        bodies.push(WORK);
        bodies.push(MOVE);
        currentCost += 250;
        currentBodiesPart += 3;
    }
    if (currentBodiesPart == 48 && currentCost + 150 < maxCost) {
        bodies.push(WORK);
        bodies.push(MOVE);
    }
    return bodies;
};