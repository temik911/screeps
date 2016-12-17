let harvestUtils = require('HarvestUtils');
require('RoomInfo');

module.exports = {
    run(creep) {
        if (creep.memory.targetId == undefined) {
            creep.memory.targetId = false;
        }
        if (Memory.rooms[creep.memory.from].currentContainerNumb == undefined) {
            Memory.rooms[creep.memory.from].currentContainerNumb = 0;
        }
        if (creep.memory.goToStorage == undefined) {
            creep.memory.goToStorage = true;
        }

        if (creep.memory.containerId == undefined) {
            let remoteContainers = Memory.rooms[creep.memory.from].remoteContainers;
            let containerIds = [];
            for (let containerId in remoteContainers) {
                containerIds.push(containerId);
            }

            creep.memory.containerId = containerIds[Memory.rooms[creep.memory.from].currentContainerNumb % containerIds.length];
            if (creep.memory.containerId != undefined) {
                if (Memory.rooms[creep.memory.from].remoteRooms[Memory.rooms[creep.memory.from].remoteContainers[creep.memory.containerId].pos.roomName].isDirty) {
                    creep.memory.containerId = undefined;
                }
            }
            Memory.rooms[creep.memory.from].currentContainerNumb += 1;
        } else if (!creep.memory.goToStorage) {
            if (creep.room.name != creep.memory.from) {
                if (creep.memory.needEnergy == true) {
                    if (!creep.memory.sourceId) {
                        let sources = creep.room.find(FIND_STRUCTURES, {
                            filter: (structure) => {
                                return structure.structureType == STRUCTURE_CONTAINER &&
                                    structure.store.energy > 0;
                            }
                        });

                        sources.sort((a, b) => b.store.energy - a.store.energy);

                        if (sources.length > 0) {
                            creep.memory.sourceId = sources[0].id;
                        }
                    }

                    if (creep.memory.sourceId) {
                        let source = Game.getObjectById(creep.memory.sourceId);

                        if (source.store[RESOURCE_ENERGY] > 0) {
                            if (creep.withdraw(source, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                                creep.moveTo(source, {maxRooms: 1});
                            }
                        }
                    }

                    if (creep.carry.energy == creep.carryCapacity) {
                        creep.memory.needEnergy = false;
                        creep.memory.sourceId = false;
                    }
                } else {
                    if (creep.memory.roadId == undefined) {
                        let structures = creep.room.lookForAt(LOOK_STRUCTURES, creep.pos);
                        let road = null;
                        for (let i in structures) {
                            if (structures[i].structureType == STRUCTURE_ROAD) {
                                road = structures[i];
                                break;
                            }
                        }

                        if (road != null && road.hits < road.hitsMax * 0.75) {
                            creep.memory.roadId = road.id;
                        }
                    }

                    if (creep.memory.roadId != undefined) {
                        let road = Game.getObjectById(creep.memory.roadId);
                        if (!creep.pos.isEqualTo(road.pos)) {
                            creep.moveTo(road.pos);
                        } else {
                            let constructionSites = creep.pos.findInRange(FIND_MY_CONSTRUCTION_SITES, 1);
                            if (constructionSites.length != 0) {
                                let constructionSite = constructionSites[0];
                                creep.build(constructionSite);
                            } else if (road.hits > road.hitsMax * 0.9) {
                                creep.memory.roadId = undefined;
                            } else {
                                creep.repair(road);
                            }
                        }
                    } else {
                        let container = Game.getObjectById(creep.memory.containerId);
                        if (container.pos.isNearTo(creep.pos)) {
                            creep.memory.goToStorage = true;
                        } else {
                            creep.moveTo(container);
                        }
                    }

                    if (creep.carry.energy == 0) {
                        creep.memory.needEnergy = true;
                    }
                }
            } else {
                let container = Game.getObjectById(creep.memory.containerId);
                creep.moveTo(container);
            }
        } else {
            let storage = Game.rooms[creep.memory.from].storage;
            let withdraw = creep.withdraw(storage, RESOURCE_ENERGY);
            if (withdraw == ERR_NOT_IN_RANGE) {
                creep.moveTo(storage);
            } else if (withdraw == OK || withdraw == ERR_FULL) {
                creep.memory.containerId = undefined;
                creep.memory.goToStorage = false;
                creep.memory.needEnergy = false;
            }
        }
    }
};