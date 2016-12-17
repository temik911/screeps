require('RoomInfo');

module.exports = {
    run(creep) {
        if (creep.memory.timeToGo == undefined) {
            creep.memory.timeToGo = 0;
        }
        if (creep.memory.dataSaved == undefined) {
            creep.memory.dataSaved = false;
        }

        if (!creep.spawning && !creep.memory.dataSaved) {
            if (!creep.memory.onPosition) {
                creep.memory.timeToGo++;
            } else {
                let containerInfo = Memory.rooms[creep.memory.from].remoteContainers[creep.memory.containerId];
                if (containerInfo.timeToGo == undefined || containerInfo.times == undefined) {
                    containerInfo.timeToGo = 0;
                    containerInfo.times = 0;
                }

                containerInfo.timeToGo += creep.memory.timeToGo;
                containerInfo.times += 1;
                creep.memory.dataSaved = true;
            }
        }

        if (!creep.memory.containerId) {
            let remoteContainers = Memory.rooms[creep.memory.from].remoteContainers;
            for (let containerId in remoteContainers) {
                let containerInfo = remoteContainers[containerId];
                if (!containerInfo.isHarvest && !Memory.rooms[creep.memory.from].remoteRooms[containerInfo.pos.roomName].isDirty) {
                    creep.memory.containerId = containerId;
                    creep.memory.posToGo = containerInfo.pos;
                    Memory.rooms[creep.memory.from].remoteContainers[containerId].isHarvest = true;
                    break;
                }
            }
        } else if (!creep.memory.onPosition) {
            let container = Game.getObjectById(creep.memory.containerId);
            if (container != null) {
                if (creep.pos.isEqualTo(container.pos)) {
                    creep.memory.onPosition = true;
                } else {
                    creep.moveTo(container.pos);
                }
            } else {
                creep.moveTo(new RoomPosition(creep.memory.posToGo.x, creep.memory.posToGo.y, creep.memory.posToGo.roomName));
            }
        } else if (!creep.memory.sourceId) {
            let source = creep.pos.findClosestByRange(FIND_SOURCES);
            if (source != null) {
                creep.memory.sourceId = source.id;
            }
        } else {
            let source = Game.getObjectById(creep.memory.sourceId);
            let container = Game.getObjectById(creep.memory.containerId);

            if (container.hits < container.hitsMax * 0.8 && creep.carry.energy > 0) {
                creep.repair(container);
            } else {
                creep.harvest(source);
            }
        }
    }
};