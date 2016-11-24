require('RoomInfo');

module.exports = {
    run(creep) {
        if (creep.memory.controllerToReserv == undefined) {
            let remoteControllers = Memory.rooms[creep.memory.from].remoteControllers;
            let minAmount = 999999;
            let id = undefined;
            let pos = undefined;
            for (let controllerId in remoteControllers) {
                let controllerInfo = remoteControllers[controllerId];
                if (controllerInfo.ticksToEnd < minAmount
                    && !controllerInfo.busy
                    && !Memory.rooms[creep.memory.from].remoteRooms[controllerInfo.pos.roomName].isDirty) {
                    minAmount = controllerInfo.ticksToEnd;
                    id = controllerId;
                    pos = controllerInfo.pos;
                }
            }

            if (id != undefined) {
                creep.memory.controllerToReserv = id;
                creep.memory.posToGo = pos;
                Memory.rooms[creep.memory.from].remoteControllers[creep.memory.controllerToReserv].busy = true;
            }
        }

        let controllerPos = creep.memory.posToGo;
        if (creep.room.name == controllerPos.roomName) {
            let controller = creep.room.controller;
            if(controller) {
                let reserveController = creep.reserveController(controller);
                if(reserveController == ERR_NOT_IN_RANGE) {
                    if (creep.memory.pos == undefined) {
                        let room = creep.room;
                        let controllerPos = controller.pos;
                        let pos;
                        let wall = true;
                        for (let dx = -1; dx <= 1; dx++) {
                            for (let dy = -1; dy <= 1; dy++) {
                                pos = new RoomPosition(controllerPos.x + dx, controllerPos.y + dy, room.name);
                                wall = Game.map.getTerrainAt(pos) == "wall";
                                if (!wall) {
                                    dy = 10;
                                }
                            }
                            if (!wall) {
                                dx = 10;
                            }
                        }
                        creep.memory.pos = pos;
                    }
                    creep.moveTo(creep.memory.pos.x, creep.memory.pos.y, {maxRooms: 1});
                }
            }
        } else {
            creep.moveTo(new RoomPosition(controllerPos.x, controllerPos.y, controllerPos.roomName));
        }
    }
};