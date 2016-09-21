var creepsHandler = require('creepsHandler');
var populationProducer = require('PopulationProducer');
var towersHandler = require('TowersHandler');

module.exports.loop = function () {
    for (var name in Memory.creeps) {
        if (!Game.creeps[name]) {
            delete Memory.creeps[name];
        }
    }

    for (var spawnName in Game.spawns) {
        var spawn = Game.spawns[spawnName];
        populationProducer.run(spawn);
        towersHandler.run(spawn);
    }
    creepsHandler.run();
};