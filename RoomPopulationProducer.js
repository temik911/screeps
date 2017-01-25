let constants = require('Constants');
require('RoomInfo');

module.exports = {
    run(room) {
        if (room.memory.repairNumb == undefined) {
            room.memory.repairNumb = 0;
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
        if (room.memory.missionCreepsRequests == undefined) {
            room.memory.missionCreepsRequests = new Map();
        }

        let roomStats = room.stats();
        let roomCreeps = roomStats.creeps;
        let roomExtractors = roomStats.extractors;
        let spawns = roomStats.spawns;
        let mineral = roomStats.mineral;
        let roomName = room.name;

        if (spawns.length == 0) {
            return;
        }

        let builderCount = 0;
        let baseEnergySupportCount = 0;
        let fastLinkCargoCount = 0;
        let soldierCount = 0;
        let repairCount = 0;
        let mineralHarvesterCount = 0;
        let mineralHarvesterWithOutCarryCount = 0;
        let mineralCargoCount = 0;

        let creepName;
        let creep;

        let allBusy = true;
        for (let spawnName in spawns) {
            let spawn = spawns[spawnName];

            if (spawn.spawning != null) {
                let currentSpawnRole = spawn.memory.currentSpawnRole;
                if (currentSpawnRole != undefined) {
                    if (currentSpawnRole == constants.BUILDER) {
                        builderCount++;
                    } else if (currentSpawnRole == constants.BASE_ENERGY_SUPPORT) {
                        baseEnergySupportCount++;
                    } else if (currentSpawnRole == constants.FAST_LINK_CARGO) {
                        fastLinkCargoCount++;
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

            if (creepRole == constants.BUILDER) {
                builderCount++;
            } else if (creepRole == constants.BASE_ENERGY_SUPPORT) {
                baseEnergySupportCount++;
            } else if (creepRole == constants.FAST_LINK_CARGO) {
                fastLinkCargoCount++;
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
            }
        }

        let bodies;
        let name;

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
        createUpgraderOrBuilderBodies(room).forEach(body => {
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
        if (maxBuilderCount > 1 && room.storage.store[RESOURCE_ENERGY] < 10000) {
            maxBuilderCount = 1;
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
            } else if (room.storage && fastLinkCargoCount < 1 && room.stats().links.length >= 2) {
                bodies = [MOVE, CARRY, CARRY, CARRY, CARRY];
                role = constants.FAST_LINK_CARGO;
                spawn.createCreep(bodies, roomName + "-fastLinkCargo", {
                    role: role,
                });
                fastLinkCargoCount++;
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
            } else if (builderCount < maxBuilderCount) {
                let builderNumb = room.memory.builderNumb;
                bodies = createUpgraderOrBuilderBodies(room);
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
            } else if (room.controller.level == 8 && repairCount < 1) {
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
            } else {
                let creepCreates = false;
                for (let i in room.memory.missionCreepsRequests) {
                    if (Memory.missions[i] != undefined) {
                        if (!creepCreates) {
                            let request = room.memory.missionCreepsRequests[i];
                            if (request.isProcessed != true) {
                                if (spawn.canCreateCreep(request.body, request.name) == OK) {
                                    let result = spawn.createCreep(request.body, request.name, request.memory);
                                    request.isProcessed = true;
                                    delete(room.memory.missionCreepsRequests[i]);
                                    creepCreates = true;
                                }
                            }
                        }
                    } else {
                        console.log(room.name + " request for undefined mission: " + i);
                        delete(room.memory.missionCreepsRequests[i]);
                    }
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

let createCargoBodies = function(room) {
    let bodies = [MOVE, CARRY, CARRY, MOVE, CARRY, CARRY];
    if (room.storage != undefined) {
        let currentCost = 300;
        let currentBodiesPart = 6;
        let maxCost = room.energyCapacityAvailable;
        while ((currentCost + 150 < maxCost) && (currentBodiesPart + 3 < 31)) {
            bodies.push(MOVE);
            bodies.push(CARRY);
            bodies.push(CARRY);
            currentCost += 150;
            currentBodiesPart += 3;
        }
    }
    return bodies;
};

let createUpgraderOrBuilderBodies = function(room) {
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

let createTerminalCargoBodies = function(room) {
    let bodies = [];
    let currentCost = 0;
    let currentBodiesPart = 0;
    let maxCost = room.energyCapacityAvailable;
    let maxBodiesPart = 16;
    if (room.controller.level == 8 && room.storage.store[RESOURCE_ENERGY] > 150000
            || room.controller.level != 8 && room.terminal.store[RESOURCE_ENERGY] > 75000) {
        maxBodiesPart = 31;
    }
    while ((currentCost + 150 < maxCost) && (currentBodiesPart + 3 < maxBodiesPart)) {
        bodies.push(MOVE);
        bodies.push(CARRY);
        bodies.push(CARRY);
        currentCost += 150;
        currentBodiesPart += 3;
    }
    return bodies;
};