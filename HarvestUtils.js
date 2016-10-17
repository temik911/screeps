require('RoomInfo');

module.exports = {
    harvestFromNearestSource(creep) {
        creep.memory.ticker++;
        if (creep.memory.ticker > 10) {
            creep.memory.sourceId = false;
        }
        if (!creep.memory.sourceId) {
            var sources = creep.room.find(FIND_SOURCES, {
                filter: (structure) => structure.energy > 0
            });

            var pathLength = 9999;

            for (var i = 0; i < sources.length; i++) {
                var currentSource = sources[i];
                var length = creep.pos.findPathTo(currentSource.pos).length;
                if (pathLength > length) {
                    creep.memory.sourceId = currentSource.id;
                    pathLength = length;
                }
            }

            if (creep.memory.sourceId) {
                creep.memory.ticker = 0;
            }
        }

        if (creep.memory.sourceId) {
            var source = Game.getObjectById(creep.memory.sourceId);

            var harvestResult = creep.harvest(source);

            if(harvestResult == ERR_NOT_IN_RANGE) {
                creep.moveTo(source, {maxRooms: 1});
            } else if (creep.carry.energy == creep.carryCapacity) {
                creep.memory.sourceId = false;
            }
        }
    },

    withdrawFromContainer(creep) {
        if (!creep.memory.sourceId) {
            var sources = creep.room.find(FIND_STRUCTURES, {
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
            var source = Game.getObjectById(creep.memory.sourceId);

            var withdrawalResult = creep.withdraw(source, RESOURCE_ENERGY);

            if(withdrawalResult == ERR_NOT_IN_RANGE) {
                creep.moveTo(source, {maxRooms: 1});
            } else if (creep.carry.energy == creep.carryCapacity) {
                creep.memory.sourceId = false;
            }
        }
    },

    withdrawFromRoomStorage(creep) {
        var source = creep.room.storage;

        var withdrawResult = creep.withdraw(source, RESOURCE_ENERGY);

        if(withdrawResult == ERR_NOT_IN_RANGE) {
            creep.moveTo(source);
        }
    },

    harvestFromPredefinedSource(creep) {
        var sources = creep.room.stats().sources;
        var storedSource = sources[creep.memory.numb % sources.length];
        var source = Game.getObjectById(storedSource.id);

        var harvestResult = creep.harvest(source);

        if(harvestResult == ERR_NOT_IN_RANGE) {
            creep.moveTo(source);
        }
    },

    harvestFromPredefinedSourceWithOutCarry(creep) {
        if (!creep.memory.sourceId) {
            var sourcesList = creep.room.stats().sources;
            var sourceToHarvest = sourcesList[creep.memory.numb % sourcesList.length];
            creep.memory.sourceId = sourceToHarvest.id;
            var container = sourceToHarvest.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (structure) => structure.structureType == STRUCTURE_CONTAINER
            });
            creep.memory.containerPos = container.pos;
        }

        if (!creep.memory.onPosition) {
            var pos = creep.memory.containerPos;
            if (creep.pos.findPathTo(pos.x, pos.y).length == 0) {
                creep.memory.onPosition = true;
            } else {
                creep.moveTo(pos.x, pos.y);
            }
        } else {
            var source = Game.getObjectById(creep.memory.sourceId);
            creep.harvest(source);
        }
    },

    harvestFromPredefinedSourceWithLink(creep) {
        if (!creep.memory.sourceId) {
            var sourcesList = creep.room.stats().sources;
            var sourceToHarvest = sourcesList[creep.memory.numb % sourcesList.length];
            creep.memory.sourceId = sourceToHarvest.id;
            var link = sourceToHarvest.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (structure) => structure.structureType == STRUCTURE_LINK
            });
            creep.memory.linkId = link.id;
        }

        if (creep.carry.energy >= 200) {
            var link = Game.getObjectById(creep.memory.linkId);
            if (creep.transfer(link, RESOURCE_ENERGY, 200) == ERR_NOT_IN_RANGE) {
                creep.moveTo(link);
            }
        } else {
            var source = Game.getObjectById(creep.memory.sourceId);
            if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
                creep.moveTo(source);
            }
        }
    },

    harvestFromPredefineExtractor(creep) {
        var extractors = creep.room.stats().extractors;
        var predefineExtractor = extractors[creep.memory.numb % extractors.length];
        var extractor = Game.getObjectById(predefineExtractor.id);
        var mineralSource = creep.room.find(FIND_MINERALS, {
            filter: (mineralSource) => mineralSource.pos = extractor.pos
        });

        var harvestResult = creep.harvest(mineralSource[0]);

        if(harvestResult == ERR_NOT_IN_RANGE) {
            creep.moveTo(mineralSource[0]);
        }
    },

    findNearest(pos, array) {
        var pathLength = 9999;
        var toReturn;
        for (var i = 0; i < array.length; i++) {
            var current = array[i];
            var length = pos.findPathTo(current.pos).length;
            if (pathLength > length) {
                toReturn = current;
                pathLength = length;
            }
        }
        return toReturn;
    }
};