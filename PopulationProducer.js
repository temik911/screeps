var constants = require('Constants');
require('RoomInfo');

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
        var claimerCount = 0;

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
            } else if (creep.memory.role == constants.CLAIMER) {
                claimerCount++;
            }
        }

        var bodies;

        if (baseEnergySupportCount < 2) {
            bodies = [MOVE, MOVE, CARRY, CARRY, CARRY, CARRY];
            createCreep(bodies, null, {role: constants.BASE_ENERGY_SUPPORT, isSupport: false});
        } else if (harvesterCount < Game.spawns.Base.room.stats().sources.length) {
            if (!Game.spawns.Base.memory.harvesterNumb) {
                Game.spawns.Base.memory.harvesterNumb = 0;
            }
            var harvesterNumb = Game.spawns.Base.memory.harvesterNumb;
            bodies = [WORK, WORK, WORK, WORK, WORK, MOVE, MOVE];
            if (Game.spawns.Base.canCreateCreep(bodies, "harv-" + harvesterNumb) == OK) {
                createCreep(bodies, "harv-" + harvesterNumb, {
                    role: constants.HARVESTER,
                    numb: harvesterNumb,
                    isHarvest: true
                });
                Game.spawns.Base.memory.harvesterNumb++;
            }
        } else if (cargoCount < 2) {
            bodies = [MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY];
            createCreep(bodies, null, {role: constants.CARGO, isCargo: false});
        } else if (upgraderCount < 2) {
            bodies = [WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK,
                MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY];
            createCreep(bodies, null, {role: constants.UPGRADER, isUpgrade: false});
        } else if (claimerCount < 3) {
            var claimerNumb = Game.spawns.Base.memory.claimerNumb;
            bodies = [WORK, WORK, WORK, WORK, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY];
            if (Game.spawns.Base.canCreateCreep(bodies, "claimer-" + claimerNumb) == OK) {
                createCreep(bodies, "claimer-" + claimerNumb, {role: constants.CLAIMER, numb: claimerNumb});
                Game.spawns.Base.memory.claimerNumb++;
            }
        } else if (Game.spawns.Base.room.find(FIND_CONSTRUCTION_SITES).length > 0 && builderCount < 2) {
            bodies = [WORK, WORK, WORK, WORK, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY];
            createCreep(bodies, null, {role: constants.BUILDER, isBuild: false});
        } else if (soldierCount < 0) {
            bodies = [ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, MOVE, MOVE, MOVE, MOVE, MOVE];
            createCreep(bodies, null, {role: constants.SOLDIER});
        }
    }
};

var createCreep = function(modes, name, memory) {
    return Game.spawns.Base.createCreep(modes, name, memory);
};