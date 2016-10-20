require('RoomInfo');

module.exports = {
    run(creep) {
        let container;
        if (!creep.memory.containerId) {
            let numb = creep.memory.numb;
            let flagPrefix = creep.memory.flagPrefix;
            let sources = [];
            for (let flagName in Game.flags) {
                if (flagName.startsWith(flagPrefix)) {
                    Game.flags[flagName].room.stats().sources.forEach(source => sources.push(source));
                }
            }
            let source = sources[numb % sources.length];
            container = source.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (structure) => structure.structureType == STRUCTURE_CONTAINER
            });
            if (container != undefined) {
                creep.memory.containerId = container.id;
            }
        } else {
            if (creep.carry.energy == 0 && creep.ticksToLive < 50) {
                creep.suicide()
            } else {
                let isCargo = creep.memory.isCargo;
                if (!isCargo) {
                    container = Game.getObjectById(creep.memory.containerId);

                    let needToFull = creep.carryCapacity - _.sum(creep.carry) - 100;

                    if (creep.room != container.room) {
                        creep.moveTo(container);
                    } else if (container.store[RESOURCE_ENERGY] > needToFull) {
                        if (creep.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(container);
                        }
                    } else {
                        creep.moveTo(25, 25);
                    }

                    if (creep.carry.energy == creep.carryCapacity) {
                        creep.memory.isCargo = true;
                    }
                }
                else {
                    let target = Game.flags[creep.memory.from].room.storage;
                    if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(target);
                    }

                    if (creep.carry.energy == 0) {
                        creep.memory.isCargo = false;
                    }
                }
            }
        }
    }
};