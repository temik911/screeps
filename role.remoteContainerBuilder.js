let harvestUtils = require('HarvestUtils');
require('RoomInfo');

module.exports = {
    run(creep) {
        if (creep.memory.flagName == undefined) {
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
            creep.memory.flagName = flags[numb % flags.length].name;
        }

        let flag = Game.flags[creep.memory.flagName];

        if (flag == undefined) {
            creep.suicide();
            return;
        }

        if (creep.room == flag.room) {
            if (!creep.memory.roomInfoStored) {
                if (Memory.rooms[creep.memory.from].remoteRooms[creep.room.name] == undefined) {
                    let roomInfo = new Map();
                    roomInfo.isDirty = false;
                    roomInfo.dirtyTime = 0;
                    roomInfo.guardSended = false;
                    Memory.rooms[creep.memory.from].remoteRooms[creep.room.name] = roomInfo;
                }

                let controller = creep.room.controller;
                if (Memory.rooms[creep.memory.from].remoteControllers[controller.id] == undefined) {
                    let controllerInfo = new Map();
                    controllerInfo.pos = controller.pos;
                    controllerInfo.ticksToEnd = 0;
                    controllerInfo.busy = false;
                    Memory.rooms[creep.memory.from].remoteControllers[controller.id] = controllerInfo;
                }

                creep.memory.roomInfoStored = true;
            }


            if (creep.memory.needEnergy == true) {
                let containers = creep.room.stats().containers;
                if (containers != undefined && containers.length > 0) {
                    let sum = 0;
                    containers.forEach(container => {
                        sum += container.store.energy;
                    });
                    if (sum > 250) {
                        harvestUtils.withdrawFromContainer(creep);
                    } else {
                        harvestUtils.harvestFromNearestSource(creep);
                    }
                } else {
                    harvestUtils.harvestFromNearestSource(creep);
                }

                if (creep.carry.energy == creep.carryCapacity) {
                    creep.memory.needEnergy = false;
                }
            } else {
                if (creep.memory.targetId != undefined) {
                    let target = Game.getObjectById(creep.memory.targetId);
                    if (creep.memory.action == 'build') {
                        if (target != null) {
                            if (creep.build(target) == ERR_NOT_IN_RANGE) {
                                creep.moveTo(target);
                            }
                        } else {
                            creep.memory.targetId = undefined;
                            creep.memory.action = undefined;
                        }
                    } else if (creep.memory.action == 'repair') {
                        if (target.hits < target.hitsMax * 0.9) {
                            if (creep.repair(target) == ERR_NOT_IN_RANGE) {
                                creep.moveTo(target);
                            }
                        } else {
                            creep.memory.targetId = undefined;
                            creep.memory.action = undefined;
                        }
                    }
                } else {
                    let toRepair = creep.room.find(FIND_STRUCTURES, {
                        filter: structure => structure.structureType == STRUCTURE_CONTAINER &&
                        structure.hits < structure.hitsMax / 2
                    });

                    if (toRepair.length != 0) {
                        creep.memory.targetId = toRepair[0].id;
                        creep.memory.action = 'repair';
                    } else {
                        let target = creep.pos.findClosestByRange(FIND_MY_CONSTRUCTION_SITES);
                        if (target) {
                            creep.memory.targetId = target.id;
                            creep.memory.action = 'build';
                        } else {
                            for (let container of creep.room.stats().containers) {
                                if (Memory.rooms[creep.memory.from].remoteContainers[container.id] == undefined) {
                                    let containerInfo = new Map();
                                    containerInfo.amount = container.store[RESOURCE_ENERGY];
                                    containerInfo.pos = container.pos;
                                    containerInfo.withdraw = 0;
                                    containerInfo.isHarvest = false;
                                    Memory.rooms[creep.memory.from].remoteContainers[container.id] = containerInfo;
                                }
                            }
                            flag.remove();
                            creep.suicide();
                        }
                    }
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