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

            if(withdrawalResult == ERR_NOT_IN_RANGE) {
                creep.moveTo(source, {maxRooms: 1});
            } else if (creep.carry.energy == creep.carryCapacity) {
                creep.memory.sourceId = false;
            }
        }
    },

    withdrawFromRoomStorage(creep) {
        let source = creep.room.storage;

        let withdrawResult = creep.withdraw(source, RESOURCE_ENERGY);

        if(withdrawResult == ERR_NOT_IN_RANGE) {
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
            if (creep.pos.findPathTo(pos.x, pos.y).length == 0) {
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

        if (creep.carry.energy >= 200) {
            let link = Game.getObjectById(creep.memory.linkId);
            if (creep.transfer(link, RESOURCE_ENERGY, 200) == ERR_NOT_IN_RANGE) {
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

    findNearest(pos, array) {
        let pathLength = 9999;
        let toReturn;
        for (let i = 0; i < array.length; i++) {
            let current = array[i];
            let length = pos.findPathTo(current.pos).length;
            if (pathLength > length) {
                toReturn = current;
                pathLength = length;
            }
        }
        return toReturn;
    }
};