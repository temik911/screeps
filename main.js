var creepsHandler = require('creepsHandler');
var populationProducer = require('PopulationProducer');
var towersHandler = require('TowersHandler');

module.exports.loop = function () {
    populationProducer.run();
    creepsHandler.run();
    towersHandler.run();
};