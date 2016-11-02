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

    let progress = Game.gcl.progress;
    let progressTotal = Game.gcl.progressTotal;
    console.log("Current progress is " + progress + " from " + progressTotal + ". Remaining: " + (progressTotal - progress));

    terminalsHandler.run();

    globalPopulationProducer.run(Game.spawns['Base']);
    // globalPopulationProducer.run(Game.spawns['E36S51-Spawn-2']);
    // globalPopulationProducer.run(Game.spawns['Base2']);

    let rooms = Game.rooms;
    for (let roomName in rooms) {
        let room = rooms[roomName];
        // if (roomName == 'E39S53') {
        //     room.memory.lab1_resource = 'GH';
        //     room.memory.lab2_resource = 'OH';
        // }
        labsHandler.run(room);
        roomPopulationProducer.run(room);
        linksHandler.run(room);
        towersHandler.run(room);
    }

    creepsHandler.run();
};