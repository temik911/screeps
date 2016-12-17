let constants = require('Constants');

module.exports = {
    run() {
        let remoteContainers = new Map();
        let remoteControllers = new Map();
        for (let roomName in Game.rooms) {
            let room = Game.rooms[roomName];
            let controller = room.controller;
            if (controller != undefined && controller.my) {
                for (let remoteRoomName in room.memory.remoteRooms) {
                    let remoteRoom = Game.rooms[remoteRoomName];
                    if (remoteRoom != undefined) {
                        let attackHostileCreeps = remoteRoom.stats().attackHostileCreeps;
                        if (attackHostileCreeps.length != 0) {
                            room.memory.remoteRooms[remoteRoomName].isDirty = true;
                            room.memory.remoteRooms[remoteRoomName].dirtyTime = attackHostileCreeps[0].ticksToLive;
                        } else {
                            room.memory.remoteRooms[remoteRoomName].isDirty = false;
                            room.memory.remoteRooms[remoteRoomName].dirtyTime = 0;
                            room.memory.remoteRooms[remoteRoomName].guardSended = false;
                        }
                    } else {
                        if (room.memory.remoteRooms[remoteRoomName].dirtyTime <= 0) {
                            room.memory.remoteRooms[remoteRoomName].isDirty = false;
                            room.memory.remoteRooms[remoteRoomName].dirtyTime = 0;
                            room.memory.remoteRooms[remoteRoomName].guardSended = false;
                        } else {
                            room.memory.remoteRooms[remoteRoomName].isDirty = true;
                            room.memory.remoteRooms[remoteRoomName].dirtyTime -= 1;
                        }
                    }
                }

                remoteContainers[roomName] = room.memory.remoteContainers;
                for (let containerId in room.memory.remoteContainers) {
                    let container = Game.getObjectById(containerId);
                    if (container != null) {
                        room.memory.remoteContainers[containerId].amount = container.store[RESOURCE_ENERGY];
                        room.memory.remoteContainers[containerId].isHarvest = false;
                    } else {
                        let containerRoom = Game.rooms[remoteContainers[roomName][containerId].pos.roomName];
                        if (containerRoom != undefined && containerRoom.controller != undefined) {
                            delete(room.memory.remoteContainers[containerId]);
                        }
                    }
                }

                remoteControllers[roomName] = room.memory.remoteControllers;
                for (let controllerId in room.memory.remoteControllers) {
                    let controller = Game.getObjectById(controllerId);
                    if (controller != null) {
                        if (controller.reservation != null) {
                            room.memory.remoteControllers[controllerId].ticksToEnd = controller.reservation.ticksToEnd;
                        } else {
                            room.memory.remoteControllers[controllerId].ticksToEnd = 0;
                        }
                    } else {
                        room.memory.remoteControllers[controllerId].ticksToEnd -= 1;
                    }
                    room.memory.remoteControllers[controllerId].busy = false;
                }
            }
        }

        let cargoTasks = new Map();


        for(let name in Game.creeps) {
            let creep = Game.creeps[name];
            if (creep.memory.role == constants.REMOTE_CARGO) {
                let from = creep.memory.from;
                if (cargoTasks[from] == undefined) {
                    cargoTasks[from] = new Map();
                }
                if (creep.memory.containerToGoId != undefined) {
                    if (creep.carry.energy < creep.carryCapacity) {
                        if (isNaN(cargoTasks[from][creep.memory.containerToGoId])) {
                            cargoTasks[from][creep.memory.containerToGoId] = 0;
                        }
                        cargoTasks[from][creep.memory.containerToGoId] += creep.carryCapacity;
                    }
                }
            } else if (creep.memory.role == constants.RESERVER_FOR_HARVEST) {
                let from = creep.memory.from;
                if (creep.memory.controllerToReserv != undefined) {
                    Game.rooms[from].memory.remoteControllers[creep.memory.controllerToReserv].busy = true;
                }
            } else if (creep.memory.role == constants.REMOTE_HARVEST) {
                let from = creep.memory.from;
                if (creep.memory.containerId != undefined) {
                    Game.rooms[from].memory.remoteContainers[creep.memory.containerId].isHarvest = true;
                }
            } else if (creep.memory.role == constants.GUARD) {
                let from = creep.memory.from;
                Game.rooms[from].memory.remoteRooms[creep.memory.guardRoomName].guardSended = true;
            }
        }

        for (let roomName in remoteContainers) {
            let room = Game.rooms[roomName];
            room.memory.neededCargo = 0;
            room.memory.neededRemoteHarvesters = 0;
            for (let containerId in remoteContainers[roomName]) {
                // remote cargo
                let realValue = 0;
                if (cargoTasks[roomName] != undefined && cargoTasks[roomName][containerId] != undefined) {
                    realValue = cargoTasks[roomName][containerId];
                }
                remoteContainers[roomName][containerId].withdraw = realValue;
                if (remoteContainers[roomName][containerId].amount - remoteContainers[roomName][containerId].withdraw > 500
                    && !room.memory.remoteRooms[remoteContainers[roomName][containerId].pos.roomName].isDirty) {
                    room.memory.neededCargo++;
                }

                // remote harvesters
                if (!remoteContainers[roomName][containerId].isHarvest &&
                    !room.memory.remoteRooms[remoteContainers[roomName][containerId].pos.roomName].isDirty) {
                    room.memory.neededRemoteHarvesters++;
                }
            }
        }

        for (let roomName in remoteControllers) {
            let room = Game.rooms[roomName];
            room.memory.neededReserver = 0;
            for (let controllerId in remoteControllers[roomName]) {
                if (remoteControllers[roomName][controllerId].ticksToEnd < 3000
                    && !remoteControllers[roomName][controllerId].busy
                    && !room.memory.remoteRooms[remoteControllers[roomName][controllerId].pos.roomName].isDirty) {
                    room.memory.neededReserver++;
                }
            }
        }

        for (let roomName in Game.rooms) {
            let room = Game.rooms[roomName];
            let controller = room.controller;
            if (controller != undefined && controller.my) {
                room.memory.neededGuards = 0;
                for (let remoteRoomName in room.memory.remoteRooms) {
                    if (room.memory.remoteRooms[remoteRoomName].isDirty && !room.memory.remoteRooms[remoteRoomName].guardSended) {
                        room.memory.neededGuards++;
                    }
                }
            }
        }

        // for (let roomName in Game.rooms) {
        //     let room = Game.rooms[roomName];
        //     let controller = room.controller;
        //     if (controller != undefined && controller.my) {
        //         console.log(roomName + " " + room.memory.neededGuards);
        //     }
        // }
    }
};