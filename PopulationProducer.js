var constants = require('Constants');

module.exports = {
    run() {
        for (var name in Memory.creeps) {
            if (!Game.creeps[name]) {
                delete Memory.creeps[name];
            }
        }

        var harvesterCount = 0;
        var upgraderCount = 0;
        var builderCount = 0;
        var baseEnergySupportCount = 0;
        var cargoCount = 0;
        var soldierCount = 0;
        for(var name in Game.creeps) {
            var creep = Game.creeps[name];
            if (creep.memory.role == constants.HARVESTER) {
                harvesterCount++;
            } else if (creep.memory.role == constants.UPGRADER) {
                upgraderCount++;
            } else if (creep.memory.role == constants.BUILDER) {
                builderCount++;
            } else if (creep.memory.role == constants.BASE_ENERGY_SUPPORT) {
                baseEnergySupportCount++;
            } else if (creep.memory.role == constants.CARGO) {
                cargoCount++;
            } else if (creep.memory.role == constants.SOLDIER) {
                soldierCount++;
            }
        }

        var bodies;

        if (baseEnergySupportCount < 2) {
            bodies = [MOVE, MOVE, CARRY, CARRY, CARRY, CARRY];
            createCreep(bodies, null, {role: constants.BASE_ENERGY_SUPPORT, isSupport: false});
        } else if (harvesterCount < 4) {
            var numb = Game.spawns.Base.memory.harvesterNumb;
            bodies = [WORK, WORK, WORK, MOVE, MOVE, CARRY, CARRY, CARRY];
            if (Game.spawns.Base.canCreateCreep(bodies, "harv-" + numb) == OK) {
                createCreep(bodies, "harv-" + numb, {role: constants.HARVESTER, numb: numb, isHarvest: true});
                Game.spawns.Base.memory.harvesterNumb++;
            }
        } else if (cargoCount < 2) {
            bodies = [MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY];
            createCreep(bodies, null, {role: constants.CARGO, isCargo: false});
        } else if (upgraderCount < 5) {
                bodies = [WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, 
                        MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY];
                createCreep(bodies, null, {role: constants.UPGRADER, isUpgrade: false});
        } else if (Game.spawns.Base.room.find(FIND_CONSTRUCTION_SITES).length > 0 && builderCount < 2) {
            bodies = [WORK, WORK, WORK, WORK, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY];
            createCreep(bodies, null, {role: constants.BUILDER, isBuild: false});
        } else if (soldierCount < 1) {
            bodies = [ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, MOVE, MOVE, MOVE, MOVE, MOVE];
            createCreep(bodies, null, {role: constants.SOLDIER});
        }
    }
};

var createCreep = function(modes, name, memory) {
    return Game.spawns.Base.createCreep(modes, name, memory);
};