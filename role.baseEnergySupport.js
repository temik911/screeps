let harvestUtils = require('HarvestUtils');
require('RoomInfo');

module.exports = {
    run(creep) {
        if (creep.memory.waitForTime == undefined) {
            creep.memory.waitForTime = 0;
        }

        let isSupport = creep.memory.isSupport;
        
        if (Game.time % 20 == 0) {
            creep.memory.targetId = undefined;
        }
        
        if (!isSupport) {
            if (creep.room.storage) {
                harvestUtils.withdrawFromRoomStorage(creep);
            } else {
                harvestUtils.withdrawFromContainer(creep);
            }
            
            if (creep.carry.energy == creep.carryCapacity) {
                creep.memory.isSupport = true;
            }
        } else {
            let target = null;

            if (creep.memory.targetId != undefined) {
                let currentTarget = Game.getObjectById(creep.memory.targetId);
                if (currentTarget.energy == currentTarget.energyCapacity) {
                    creep.memory.targetId = undefined;
                } else {
                    target = currentTarget;
                }
            }

            if (target == null && creep.memory.waitForTime <= Game.time) {
                if (creep.room.energyAvailable > creep.room.energyCapacityAvailable / 2) {
                    target = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
                        filter: (structure) => {
                            return structure.structureType == STRUCTURE_TOWER &&
                                structure.energy < 150;
                        }
                    });
                }

                if (target == null) {
                    target = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
                        filter: (structure) => {
                            return structure.structureType == STRUCTURE_EXTENSION &&
                                structure.energy < structure.energyCapacity;
                        }
                    });

                    if (target == null) {
                        target = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
                            filter: (structure) => {
                                return structure.structureType == STRUCTURE_SPAWN &&
                                    structure.energy < structure.energyCapacity;
                            }
                        });

                        if (target == null) {
                            target = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
                                filter: (structure) => {
                                    return structure.structureType == STRUCTURE_TOWER &&
                                        structure.energy < 500;
                                }
                            });
                            
                            if (target == null) {
                                if (creep.room.storage && creep.room.storage.store.energy > 5000) {
                                    let labs = creep.room.stats().labs;
                                    for (let index in labs) {
                                        if (target == null) {
                                            let lab = labs[index];
                                            if (lab.energy < lab.energyCapacity) {
                                                target = lab;
                                            }
                                        }
                                    }

                                    if (target == null) {
                                        let terminalMaxCapacity = creep.room.controller.level == 8
                                        && creep.room.storage.store.energy > 50000 ? 60000 : 30000;
                                        if (creep.room.terminal != undefined && creep.room.terminal.store.energy <= terminalMaxCapacity) {
                                            target = creep.room.terminal;
                                        }
                                    }

                                    if (target == null) {
                                        if (creep.room.storage.store.energy > 35000) {
                                            let nuker = creep.room.stats().nuker;
                                            if (nuker.length != 0) {
                                                if (nuker[0].energy < nuker[0].energyCapacity) {
                                                    target = nuker[0];
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                if (target != null) {
                    creep.memory.targetId = target.id;
                } else {
                    creep.memory.waitForTime = Game.time + 10;
                }
            }

            if (target != null) {
                if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target);
                }

                if (creep.carry.energy == 0) {
                    creep.memory.isSupport = false;
                }
            } else {
                if (creep.room.storage) {
                    let storage = creep.room.storage;
                    if (creep.transfer(storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(storage);
                    }
                }
            }
        }
    }
};