let harvestUtils = require('HarvestUtils');
require('RoomInfo');

module.exports = {
    run(creep) {
        if (creep.memory.targetId == undefined) {
            creep.memory.targetId = false;
        }

        let numb = creep.memory.numb;
        let flagPrefix = creep.memory.flagPrefix;
        let flags = [];
        for (let flagName in Game.flags) {
            if (flagName.startsWith(flagPrefix)) {
                let flagInfo = flagName.split('-');
                let sourcesCount = 0;
                for (let q in flagInfo) {
                    let info = flagInfo[q];
                    if (info.startsWith('sources')) {
                        sourcesCount = info.split(':')[1]
                    }
                }
                for (let i = 0; i < sourcesCount; i++) {
                    flags.push(Game.flags[flagName])
                }
            }
        }
        let flag = flags[numb % flags.length];

        if (creep.room == flag.room) {
            if (creep.memory.needEnergy == true) {
                harvestUtils.harvestFromNearestSource(creep);

                if (creep.carry.energy == creep.carryCapacity) {
                    creep.memory.needEnergy = false;
                }
            } else {
                let target = creep.pos.findClosestByRange(FIND_MY_CONSTRUCTION_SITES);
                if (target) {
                    if (creep.build(target) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(target, {maxRooms: 1});
                    }
                } else {
                    for (let container of creep.room.stats().containers) {
                        let containerInfo = new Map();
                        containerInfo.amount = container.store[RESOURCE_ENERGY];
                        containerInfo.pos = container.pos;
                        containerInfo.withdraw = 0;
                        Memory.rooms[creep.memory.from].remoteContainers[container.id] = containerInfo;
                    }

                    let controllerInfo = new Map();
                    let controller = creep.room.controller;
                    controllerInfo.pos = controller.pos;
                    controllerInfo.ticksToEnd = controller.reservation.ticksToEnd;
                    Memory.rooms[creep.memory.from].remoteControllers[controller.id] = controllerInfo;


                    // creep.suicide();
                    flag.remove()
                }

                if (creep.carry.energy == 0) {
                    creep.memory.needEnergy = true;
                }
            }
        } else {
            creep.moveTo(flag);
        }
    }
};