var harvesterRole = require('role.harvester');
var upgraderRole = require('role.upgrader');
var builderRole = require('role.builder');
var baseEnergySupportRole = require('role.baseEnergySupport');
var cargoRole = require('role.cargo');
var soldierRole = require('role.soldier');
var constants = require('Constants');

module.exports = {
    run() {
        for(var name in Game.creeps) {
            var creep = Game.creeps[name];
            if (creep.memory.role == constants.HARVESTER) {
                harvesterRole.run(creep);
            } else if (creep.memory.role == "baseEnergySupport") {
                baseEnergySupportRole.run(creep);
            } else if (creep.memory.role == constants.UPGRADER) {
                upgraderRole.run(creep);
            } else if (creep.memory.role == constants.BUILDER) {
                builderRole.run(creep);
            } else if (creep.memory.role == constants.CARGO) {
                cargoRole.run(creep);
            } else if (creep.memory.role == constants.SOLDIER) {
                soldierRole.run(creep);
            }
        }
    }
};