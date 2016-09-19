var creepsHandler = require('creepsHandler');
var populationProducer = require('PopulationProducer');
var roadHandler = require('roadHandler');
var towersHandler = require('TowersHandler');

module.exports.loop = function () {
    populationProducer.run();
    // roadHandler.run();
    creepsHandler.run();
    towersHandler.run();
};