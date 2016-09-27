var harvesterWithOutCarryRole = require('role.harvesterWithOutCarry');
var upgraderRole = require('role.upgrader');
var builderRole = require('role.builder');
var baseEnergySupportRole = require('role.baseEnergySupport');
var cargoRole = require('role.cargo');
var soldierRole = require('role.soldier');
var claimerRole = require('role.claimer');
var repairRole = require('role.repair');
var mineralHarvesterRole = require('role.mineralHarvester');
var invaderRole = require('role.invader');
var constants = require('Constants');

module.exports = {
    run() {
        for(var name in Game.creeps) {
            var creep = Game.creeps[name];
            if (creep.memory.role == constants.HARVESTER) {
                harvesterWithOutCarryRole.run(creep);
            } else if (creep.memory.role == constants.BASE_ENERGY_SUPPORT) {
                baseEnergySupportRole.run(creep);
            } else if (creep.memory.role == constants.UPGRADER) {
                upgraderRole.run(creep);
            } else if (creep.memory.role == constants.BUILDER) {
                builderRole.run(creep);
            } else if (creep.memory.role == constants.CARGO) {
                cargoRole.run(creep);
            } else if (creep.memory.role == constants.SOLDIER) {
                soldierRole.run(creep);
            } else if (creep.memory.role == constants.CLAIMER) {
                claimerRole.run(creep);
            } else if (creep.memory.role == constants.REPAIR) {
                repairRole.run(creep);
            } else if (creep.memory.role == constants.MINERAL_HARVESTER) {
                mineralHarvesterRole.run(creep);
            } else if (creep.memory.role == constants.INVADER) {
                invaderRole.run(creep);
            }
        }
    }
};