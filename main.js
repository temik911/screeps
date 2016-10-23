let creepsHandler = require('creepsHandler');
let roomPopulationProducer = require('RoomPopulationProducer');
let globalPopulationProducer = require('GlobalPopulationProducer');
let linksHandler = require('LinksHandler');
let towersHandler = require('TowersHandler');

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
        roomPopulationProducer.run(room);
        linksHandler.run(room);
        towersHandler.run(room);
    }

    creepsHandler.run();
};