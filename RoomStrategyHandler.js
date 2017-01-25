let defaultRoomStrategy = require('DefaultRoomStrategy');

module.exports = {
    run() {
        let rooms = Game.rooms;
        for (let roomName in rooms) {
            let room = rooms[roomName];
            let controller = room.controller;
            if (controller != undefined && controller.my) {
                defaultRoomStrategy.run(room);
            }
        }
    }
};