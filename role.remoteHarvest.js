require('RoomInfo');

module.exports = {
    run(creep) {
        let container;
        if (!creep.memory.sourceId || !creep.memory.containerId) {
            let numb = creep.memory.numb;
            let flagPrefix = creep.memory.flagPrefix;
            let sources = [];
            for (let flagName in Game.flags) {
                if (flagName.startsWith(flagPrefix)) {
                    Game.flags[flagName].room.stats().sources.forEach(source => sources.push(source));
                }
            }
            
            if (sources.length > 0) {
                let sourceToHarvest = sources[numb % sources.length];
                creep.memory.sourceId = sourceToHarvest.id;
                container = sourceToHarvest.pos.findClosestByRange(FIND_STRUCTURES, {
                    filter: (structure) => structure.structureType == STRUCTURE_CONTAINER
                });
                creep.memory.containerId = container.id;
            }
        }

        if (!creep.memory.onPosition && creep.memory.containerId != undefined) {
            container = Game.getObjectById(creep.memory.containerId);

            if (creep.pos.isEqualTo(container.pos)) {
                creep.memory.onPosition = true;
            } else {
                if (creep.room.name == container.room.name) {
                    creep.moveTo(container, {maxRooms: 1});
                } else {
                    creep.moveTo(container);
                }
            }
        } else if (creep.memory.containerId != undefined) {
            let source = Game.getObjectById(creep.memory.sourceId);
            container = Game.getObjectById(creep.memory.containerId);

            if (container.hits < container.hitsMax * 0.8 && creep.carry.energy > 0) {
                creep.repair(container);
            } else {
                creep.harvest(source);
                let fromRoomMemory = Game.rooms[creep.memory.from].memory;
                if (fromRoomMemory.remoteContainers[container.id] == undefined) {
                    let map = new Map();
                    map.pos = container.pos;
                    map.amount = container.store[RESOURCE_ENERGY];
                    fromRoomMemory.remoteContainers[container.id] = map;
                } else {
                    fromRoomMemory.remoteContainers[container.id].amount = container.store[RESOURCE_ENERGY];
                }
            }
        }
    }
};