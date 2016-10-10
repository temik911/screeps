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
var reserverRole = require('role.reserver');
var reserverForHarvestRole = require('role.reserverForHarvest');
var remoteHarvestRole = require('role.remoteHarvest');
var remoteCargoRole = require('role.remoteCargo');
var remoteBuilderRole = require('role.remoteBuilder');
var remoteContainerBuilderRole = require('role.remoteContainerBuilder');
var guardRole = require('role.guard');
var constants = require('Constants');

module.exports = {
    run() {
        for(var name in Game.creeps) {
            var creep = Game.creeps[name];
            try {
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
                } else if (creep.memory.role == constants.RESERVER) {
                    reserverRole.run(creep);
                } else if (creep.memory.role == constants.RESERVER_FOR_HARVEST) {
                    reserverForHarvestRole.run(creep);
                } else if (creep.memory.role == constants.REMOTE_HARVEST) {
                    remoteHarvestRole.run(creep);
                } else if (creep.memory.role == constants.REMOTE_CARGO) {
                    remoteCargoRole.run(creep);
                } else if (creep.memory.role == constants.REMOTE_BUILDER) {
                    remoteBuilderRole.run(creep);
                } else if (creep.memory.role == constants.REMOTE_CONTAINER_BUILDER) {
                    remoteContainerBuilderRole.run(creep);
                } else if (creep.memory.role == constants.GUARD) {
                    guardRole.run(creep);
                }
            } catch (e) {
                console.log(creep.name + ": " + e.stack);
            }
        }
    }
};