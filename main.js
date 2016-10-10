var creepsHandler = require('creepsHandler');
var roomPopulationProducer = require('RoomPopulationProducer');
var globalPopulationProducer = require('GlobalPopulationProducer');
var towersHandler = require('TowersHandler');

module.exports.loop = function () {
    for (var name in Memory.creeps) {
        if (!Game.creeps[name]) {
            delete Memory.creeps[name];
        }
    }

    globalPopulationProducer.run(Game.spawns.Base2);

    for (var spawnName in Game.spawns) {
        var spawn = Game.spawns[spawnName];
        roomPopulationProducer.run(spawn);
        towersHandler.run(spawn);
    }
    creepsHandler.run();
};