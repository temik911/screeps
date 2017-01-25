require('RoomInfo');

module.exports = {
    harvestFromNearestSource(creep) {
        creep.memory.ticker++;
        if (creep.memory.ticker > 10) {
            creep.memory.sourceId = false;
        }
        if (!creep.memory.sourceId) {
            let source = creep.pos.findClosestByPath(FIND_SOURCES, {
                filter: (structure) => structure.energy > 0
            });

            if (source != undefined) {
                creep.memory.sourceId = source.id;
                creep.memory.ticker = 0;
            }
        }

        if (creep.memory.sourceId) {
            let source = Game.getObjectById(creep.memory.sourceId);

            let harvestResult = creep.harvest(source);

            if(harvestResult == ERR_NOT_IN_RANGE) {
                creep.moveTo(source, {maxRooms: 1});
            } else if (creep.carry.energy == creep.carryCapacity) {
                creep.memory.sourceId = false;
            }
        }
    },

    withdrawFromContainer(creep) {
        if (creep.memory.shouldWait > Game.time) {
            creep.moveTo(25, 25);
        } else {
            let sources = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return structure.structureType == STRUCTURE_CONTAINER &&
                        structure.store.energy > 0;
                }
            });

            sources.sort((a, b) => b.store.energy - a.store.energy);

            if (sources.length > 0) {
                let source = sources[0];

                let withdrawalResult = creep.withdraw(source, RESOURCE_ENERGY);

                if (withdrawalResult == ERR_NOT_IN_RANGE) {
                    let moveTo = creep.moveTo(source, {maxRooms: 1});
                    if (moveTo == ERR_NO_PATH) {
                        creep.memory.shouldWait = Game.time + 5;
                    }
                } else if (creep.carry.energy == creep.carryCapacity) {
                    creep.memory.sourceId = false;
                }
            }
        }
    },

    withdrawFromWithMinAmount(creep, from, minAmount) {
        if (from != undefined) {
            let amount = from.store[RESOURCE_ENERGY] - minAmount;

            if (amount > 0) {
                let amountToWithdraw = amount >= creep.carryCapacity ? creep.carryCapacity : amount;
                if (creep.withdraw(from, RESOURCE_ENERGY, amountToWithdraw) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(from);
                }
            }
        }
    },

    withdrawFromRoomStorage(creep) {
        let source = creep.room.storage;

        if(creep.withdraw(source, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            creep.moveTo(source);
        }
    },

    harvestFromPredefinedSource(creep) {
        let sources = creep.room.stats().sources;
        let storedSource = sources[creep.memory.numb % sources.length];
        let source = Game.getObjectById(storedSource.id);

        let harvestResult = creep.harvest(source);

        if(harvestResult == ERR_NOT_IN_RANGE) {
            creep.moveTo(source);
        }
    },

    harvestFromPredefinedSourceWithOutCarry(creep) {
        if (!creep.memory.sourceId) {
            let sourcesList = creep.room.stats().sources;
            let sourceToHarvest = sourcesList[creep.memory.numb % sourcesList.length];
            creep.memory.sourceId = sourceToHarvest.id;
            let container = sourceToHarvest.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (structure) => structure.structureType == STRUCTURE_CONTAINER
            });
            creep.memory.containerPos = container.pos;
        }

        if (!creep.memory.onPosition) {
            let pos = creep.memory.containerPos;
            if (creep.pos.isEqualTo(new RoomPosition(pos.x, pos.y, pos.roomName))) {
                creep.memory.onPosition = true;
            } else {
                creep.moveTo(pos.x, pos.y);
            }
        } else {
            let source = Game.getObjectById(creep.memory.sourceId);
            creep.harvest(source);
        }
    },

    harvestFromPredefinedSourceWithLink(creep) {
        if (!creep.memory.sourceId) {
            let sourcesList = creep.room.stats().sources;
            let sourceToHarvest = sourcesList[creep.memory.numb % sourcesList.length];
            creep.memory.sourceId = sourceToHarvest.id;
            let link = sourceToHarvest.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (structure) => structure.structureType == STRUCTURE_LINK
            });
            creep.memory.linkId = link.id;
        }

        if (creep.carry.energy >= creep.carryCapacity * 0.75) {
            let link = Game.getObjectById(creep.memory.linkId);
            if (creep.transfer(link, RESOURCE_ENERGY, creep.carry.energy) == ERR_NOT_IN_RANGE) {
                creep.moveTo(link);
            }
        } else {
            let source = Game.getObjectById(creep.memory.sourceId);
            if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
                creep.moveTo(source);
            }
        }
    },

    harvestFromPredefineExtractor(creep) {
        let extractors = creep.room.stats().extractors;
        let predefineExtractor = extractors[creep.memory.numb % extractors.length];
        let extractor = Game.getObjectById(predefineExtractor.id);
        let mineralSource = creep.room.find(FIND_MINERALS, {
            filter: (mineralSource) => mineralSource.pos = extractor.pos
        });

        let harvestResult = creep.harvest(mineralSource[0]);

        if(harvestResult == ERR_NOT_IN_RANGE) {
            creep.moveTo(mineralSource[0]);
        }
    },

    harvestFromPredefineExtractorWithOutCarry(creep) {
        if (!creep.memory.mineralId || !creep.memory.containerId) {
            let mineral = creep.room.stats().mineral;
            creep.memory.mineralId = mineral.id;
            let container = mineral.pos.findInRange(FIND_STRUCTURES, 1, {
                filter: (structure) => structure.structureType == STRUCTURE_CONTAINER
            })[0];
            creep.memory.containerId = container.id;
        }

        if (!creep.memory.onPosition) {
            let pos = Game.getObjectById(creep.memory.containerId).pos;
            if (creep.pos.inRangeTo(pos, 0)) {
                creep.memory.onPosition = true;
            } else {
                creep.moveTo(pos);
            }
        } else {
            let mineral = Game.getObjectById(creep.memory.mineralId);
            let container = Game.getObjectById(creep.memory.containerId);
            if (_.sum(container.store) + creep.getActiveBodyparts(CARRY) < container.storeCapacity) {
                creep.harvest(mineral);
            }
        }
    }
};