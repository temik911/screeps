let harvesterWithOutCarryRole = require('role.harvesterWithOutCarry');
let harvesterWithLinkRole = require('role.harvesterWithLink');
let upgraderRole = require('role.upgrader');
let linkUpgraderRole = require('role.linkUpgrader');
let builderRole = require('role.builder');
let baseEnergySupportRole = require('role.baseEnergySupport');
let cargoRole = require('role.cargo');
let linkCargoRole = require('role.linkCargo');
let fastLinkCargoRole = require('role.fastLinkCargo');
let terminalCargoRole = require('role.terminalCargo');
let soldierRole = require('role.soldier');
let claimerRole = require('role.claimer');
let repairRole = require('role.repair');
let mineralHarvesterRole = require('role.mineralHarvester');
let mineralHarvesterWithOutCarryRole = require('role.mineralHarvesterWithOutCarry');
let mineralCargoRole = require('role.mineralCargo');
let invaderRole = require('role.invader');
let reserverRole = require('role.reserver');
let reserverForHarvestRole = require('role.reserverForHarvest');
let remoteHarvestRole = require('role.remoteHarvest');
let remoteCargoRole = require('role.remoteCargo');
let remoteBuilderRole = require('role.remoteBuilder');
let remoteContainerBuilderRole = require('role.remoteContainerBuilder');
let guardRole = require('role.guard');
let labsSupportRole = require('role.labsSupport');
let healerRole = require('role.healer');
let removerRole = require('role.remover');
let squadMain = require('SquadMain');
let constants = require('Constants');

module.exports = {
    run() {
        for(let name in Game.creeps) {
            let creep = Game.creeps[name];
            try {
                if (creep.memory.role == constants.HARVESTER) {
                    harvesterWithOutCarryRole.run(creep);
                } else if (creep.memory.role == constants.HARVESTER_WITH_LINK) {
                    harvesterWithLinkRole.run(creep);
                } else if (creep.memory.role == constants.BASE_ENERGY_SUPPORT) {
                    baseEnergySupportRole.run(creep);
                } else if (creep.memory.role == constants.UPGRADER) {
                    upgraderRole.run(creep);
                } else if (creep.memory.role == constants.BUILDER) {
                    builderRole.run(creep);
                } else if (creep.memory.role == constants.CARGO) {
                    cargoRole.run(creep);
                } else if (creep.memory.role == constants.LINK_CARGO) {
                    linkCargoRole.run(creep);
                } else if (creep.memory.role == constants.FAST_LINK_CARGO) {
                    fastLinkCargoRole.run(creep);
                } else if (creep.memory.role == constants.TERMINAL_CARGO) {
                    terminalCargoRole.run(creep);
                } else if (creep.memory.role == constants.SOLDIER) {
                    soldierRole.run(creep);
                } else if (creep.memory.role == constants.CLAIMER) {
                    claimerRole.run(creep);
                } else if (creep.memory.role == constants.REPAIR) {
                    repairRole.run(creep);
                } else if (creep.memory.role == constants.MINERAL_HARVESTER) {
                    mineralHarvesterRole.run(creep);
                } else if (creep.memory.role == constants.MINERAL_HARVESTER_WITHOUT_CARRY) {
                    mineralHarvesterWithOutCarryRole.run(creep);
                } else if (creep.memory.role == constants.MINERAL_CARGO) {
                    mineralCargoRole.run(creep);
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
                } else if (creep.memory.role == constants.LINK_UPGRADER) {
                    linkUpgraderRole.run(creep);
                } else if (creep.memory.role == constants.LABS_SUPPORT) {
                    labsSupportRole.run(creep);
                } else if (creep.memory.role == constants.HEALER) {
                    healerRole.run(creep);
                } else if (creep.memory.role == constants.REMOVER) {
                    removerRole.run(creep);
                } else if (creep.memory.squad_role == constants.SQUAD_ROLE_MAIN) {
                    squadMain.run(creep);
                }
            } catch (e) {
                console.log(creep.name + ": " + e.stack);
            }
        }
    }
};