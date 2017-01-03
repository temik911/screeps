let defaultRoomStrategy = require('DefaultRoomStrategy');
let fastRoomStrategy = require('FastRoomStrategy');
let constants = require('Constants');

module.exports = {
    run() {
        // let fastStrategyRooms = _.map(_.filter(Game.flags, function(flag) {return flag.name.startsWith('FastRoomStrategy')}), 'room');

        let rooms = Game.rooms;
        for (let roomName in rooms) {
            let room = rooms[roomName];
            let controller = room.controller;
            if (controller != undefined && controller.my) {
                if (room.memory.remoteContainers == undefined) {
                    room.memory.remoteContainers = new Map();
                }
                if (room.memory.remoteControllers == undefined) {
                    room.memory.remoteControllers = new Map();
                }

                if (room.memory.remoteRooms == undefined) {
                    room.memory.remoteRooms = new Map();
                }

                // if (_.includes(fastStrategyRooms, room)) {
                //     if (room.controller.level == 8) {
                //         // for (let .)
                //     } else {
                //         fastRoomStrategy.run(room);
                //     }
                // } else {
                    defaultRoomStrategy.run(room);
                // }
            }
        }
    }
};