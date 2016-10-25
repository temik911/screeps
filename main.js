let creepsHandler = require('creepsHandler');
let roomPopulationProducer = require('RoomPopulationProducer');
let globalPopulationProducer = require('GlobalPopulationProducer');
let linksHandler = require('LinksHandler');
let towersHandler = require('TowersHandler');
let labsHandler = require('LabsHandler');
let terminalsHandler = require('TerminalsHandler');

module.exports.loop = function () {
    for (let name in Memory.creeps) {
        if (!Game.creeps[name]) {
            delete Memory.creeps[name];
        }
    }

    terminalsHandler.run();

    // globalPopulationProducer.run(Game.spawns['E37S53-Spawn-1']);
    // globalPopulationProducer.run(Game.spawns['E36S51-Spawn-2']);
    // globalPopulationProducer.run(Game.spawns['Base2']);

    let rooms = Game.rooms;
    for (let roomName in rooms) {
        let room = rooms[roomName];
        // if (roomName == 'E39S53') {
        //     room.memory.lab1_resource = 'K';
        //     room.memory.lab2_resource = 'Z';
        // }
        labsHandler.run(room);
        roomPopulationProducer.run(room);
        linksHandler.run(room);
        towersHandler.run(room);
    }

    creepsHandler.run();
};