var creepsHandler = require('creepsHandler');
var roomPopulationProducer = require('RoomPopulationProducer');
var globalPopulationProducer = require('GlobalPopulationProducer');
var linksHandler = require('LinksHandler');
var towersHandler = require('TowersHandler');

module.exports.loop = function () {
    for (let name in Memory.creeps) {
        if (!Game.creeps[name]) {
            delete Memory.creeps[name];
        }
    }

    // globalPopulationProducer.run(Game.spawns.Base2);

    let rooms = Game.rooms;
    for (let roomName in rooms) {
        let room = rooms[roomName];
        roomPopulationProducer.run(room);
        linksHandler.run(room);
        towersHandler.run(room);
    }

    creepsHandler.run();
};