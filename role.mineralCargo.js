let harvestUtils = require('HarvestUtils');

module.exports = {
    run(creep) {
        if (creep.ticksToLive < 50) {
            if (creep.carry.energy == 0) {
                creep.suicide();
            } else {
                let to;
                if (creep.room.terminal != undefined) {
                    to = creep.room.terminal;
                } else {
                    to = creep.room.storage;
                }
                if (creep.transfer(to, creep.memory.mineralType) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(to);
                }
            }
            return;
        }

        if (!creep.memory.containerId) {
            let mineral = creep.room.stats().mineral;
            let container = mineral.pos.findInRange(FIND_STRUCTURES, 1, {
                filter: (structure) => structure.structureType == STRUCTURE_CONTAINER
            })[0];
            creep.memory.mineralType = mineral.mineralType;
            creep.memory.containerId = container.id;
        }

        let isCargo = creep.memory.isCargo;

        if (!isCargo) {
            let from;
            if (creep.room.terminal != undefined && creep.room.storage != undefined && getMineralAmount(creep) != 0) {
                from = creep.room.storage;
            } else {
                from = Game.getObjectById(creep.memory.containerId);
            }

            if(creep.withdraw(from, creep.memory.mineralType) == ERR_NOT_IN_RANGE) {
                creep.moveTo(from);
            }

            if (_.sum(creep.carry) == creep.carryCapacity) {
                creep.memory.isCargo = true;
            }
        } else {
            let to;
            if (creep.room.terminal != undefined) {
                to = creep.room.terminal;
            } else {
                to = creep.room.storage;
            }
            if(creep.transfer(to, creep.memory.mineralType) == ERR_NOT_IN_RANGE) {
                creep.moveTo(to);
            }

            if (_.sum(creep.carry) == 0) {
                creep.memory.isCargo = false;
            }
        }
    }
};

getMineralAmount = function(creep) {
    let amount = creep.room.storage.store[creep.memory.mineralType];
    return amount == undefined ? 0 : amount;
};