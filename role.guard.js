require('RoomInfo');

module.exports = {
    run(creep) {
        if (creep.memory.guardRoomName == undefined) {
            for (let remoteRoomsName in Memory.rooms[creep.memory.from].remoteRooms) {
                let roomInfo = Memory.rooms[creep.memory.from].remoteRooms[remoteRoomsName];
                if (roomInfo.isDirty && !roomInfo.guardSended) {
                    creep.memory.guardRoomName = remoteRoomsName;
                    Memory.rooms[creep.memory.from].remoteRooms[remoteRoomsName].guardSended = true;
                    break;
                }
            }
        } else {
            if (creep.room.name == creep.memory.guardRoomName) {
                let target = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
                if (target) {
                    if (target.owner.username == 'Vervorris') {
                        // do nothing
                    } else {
                        if (creep.attack(target) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(target);
                        }
                    }
                } else {
                    creep.moveTo(25, 25);
                }
            } else {
                creep.moveTo(new RoomPosition(25, 25, creep.memory.guardRoomName));
            }
        }
    }
};