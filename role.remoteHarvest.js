require('RoomInfo');

module.exports = {
    run(creep) {
        var container;
        if (!creep.memory.sourceId) {
            var numb = creep.memory.numb;
            var flagPrefix = creep.memory.flagPrefix;
            var sources = [];
            for (var flagName in Game.flags) {
                if (flagName.startsWith(flagPrefix)) {
                    Game.flags[flagName].room.stats().sources.forEach(source => sources.push(source));
                }
            }
            var sourceToHarvest = sources[numb % sources.length];
            creep.memory.sourceId = sourceToHarvest.id;
            container = sourceToHarvest.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (structure) => structure.structureType == STRUCTURE_CONTAINER
            });
            creep.memory.containerId = container.id;
        }

        if (!creep.memory.onPosition) {
            container = Game.getObjectById(creep.memory.containerId);

            if (creep.pos.findPathTo(container.pos).length == 0) {
                creep.memory.onPosition = true;
            } else {
                creep.moveTo(container);
            }
        } else {
            var source = Game.getObjectById(creep.memory.sourceId);
            creep.harvest(source);
        }
    }
};