let creepsHandler = require('creepsHandler');
let roomPopulationProducer = require('RoomPopulationProducer');
let globalPopulationProducer = require('GlobalPopulationProducer');
let linksHandler = require('LinksHandler');
let towersHandler = require('TowersHandler');
let labsHandler = require('LabsHandler');

module.exports.loop = function () {
    for (let name in Memory.creeps) {
        if (!Game.creeps[name]) {
            delete Memory.creeps[name];
        }
    }

    globalPopulationProducer.run(Game.spawns.Base2);

    let rooms = Game.rooms;
    for (let roomName in rooms) {
        let room = rooms[roomName];
        // if (roomName == 'E39S52') {
        //     room.memory.lab1_resource = 'U';
        //     room.memory.lab2_resource = 'L';
        // }
        labsHandler.run(room);
        roomPopulationProducer.run(room);
        linksHandler.run(room);
        towersHandler.run(room);
    }

    creepsHandler.run();
};