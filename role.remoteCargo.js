require('RoomInfo');

module.exports = {
    run(creep) {
        var container;
        if (!creep.memory.containerId) {
            var numb = creep.memory.numb;
            var flagPrefix = creep.memory.flagPrefix;
            var sources = [];
            for (var flagName in Game.flags) {
                if (flagName.startsWith(flagPrefix)) {
                    Game.flags[flagName].room.stats().sources.forEach(source => sources.push(source));
                }
            }
            var source = sources[numb % sources.length];
            container = source.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (structure) => structure.structureType == STRUCTURE_CONTAINER
            });
            creep.memory.containerId = container.id;
        } else {
            var isCargo = creep.memory.isCargo;
            if (!isCargo) {
                container = Game.getObjectById(creep.memory.containerId);

                if (creep.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(container);
                }

                if (creep.carry.energy == creep.carryCapacity) {
                    creep.memory.isCargo = true;
                }
            }
            else {
                var target = Game.flags[creep.memory.from].room.storage;
                if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target);
                }

                if (creep.carry.energy == 0) {
                    creep.memory.isCargo = false;
                }
            }
        }
    }
};