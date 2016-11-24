require('RoomInfo');

module.exports = {
    run(creep) {
        if (creep.ticksToLive < 50 || creep.hits < creep.hitsMax) {
            if (creep.memory.containerToGoId) {
                if (creep.carry.energy != creep.carryCapacity) {
                    Memory.rooms[creep.memory.from].remoteContainers[creep.memory.containerToGoId].withdraw -= creep.carryCapacity;
                }
                creep.memory.posToGo = undefined;
                creep.memory.containerToGoId = undefined;
            }

            if (creep.carry.energy == 0 && creep.hits == creep.hitsMax) {
                creep.suicide();
            } else {
                let target = Game.flags[creep.memory.from].room.storage;
                let transfer = creep.transfer(target, RESOURCE_ENERGY);
                if (transfer == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target);
                } else if (transfer == OK) {
                    creep.suicide();
                }
            }
            return;
        }

        if (!creep.memory.containerToGoId) {
            let remoteContainers = Memory.rooms[creep.memory.from].remoteContainers;
            let maxAmount = 0;
            let id = undefined;
            let pos = undefined;
            for (let containerId in remoteContainers) {
                let containerInfo = remoteContainers[containerId];
                if (containerInfo.amount - containerInfo.withdraw > maxAmount
                    && !Memory.rooms[creep.memory.from].remoteRooms[containerInfo.pos.roomName].isDirty) {
                    maxAmount = containerInfo.amount - containerInfo.withdraw;
                    id = containerId;
                    pos = containerInfo.pos;
                }
            }

            if (id != undefined) {
                creep.memory.containerToGoId = id;
                creep.memory.posToGo = pos;
                Memory.rooms[creep.memory.from].remoteContainers[creep.memory.containerToGoId].withdraw += creep.carryCapacity;
            }
        } else {
            let isCargo = creep.memory.isCargo;
            if (!isCargo) {
                let container = Game.getObjectById(creep.memory.containerToGoId);
                if (container != null) {
                    if (creep.room != container.room) {
                        creep.moveTo(container);
                    } else {
                        if (container.store[RESOURCE_ENERGY] < creep.carryCapacity - creep.carry[RESOURCE_ENERGY]) {
                            if (creep.pos.getRangeTo(container) > 3) {
                                creep.moveTo(container);
                            }
                        } else {
                            if (creep.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                                creep.moveTo(container);
                            }
                        }
                    }

                    if (creep.carry.energy == creep.carryCapacity) {
                        Memory.rooms[creep.memory.from].remoteContainers[creep.memory.containerToGoId].withdraw -= creep.carryCapacity;
                        creep.memory.isCargo = true;
                    }
                } else {
                    creep.moveTo(new RoomPosition(creep.memory.posToGo.x, creep.memory.posToGo.y, creep.memory.posToGo.roomName));
                }
            } else {
                let target = Game.flags[creep.memory.from].room.storage;
                if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target);
                }

                if (creep.carry.energy == 0) {
                    creep.memory.isCargo = false;
                    creep.memory.posToGo = undefined;
                    creep.memory.containerToGoId = undefined;
                }
            }
        }
    }
};