let creepsHandler = require('creepsHandler');
let roomPopulationProducer = require('RoomPopulationProducer');
let globalPopulationProducer = require('GlobalPopulationProducer');
let linksHandler = require('LinksHandler');
let towersHandler = require('TowersHandler');
let labsHandler = require('LabsHandler');
let terminalsHandler = require('TerminalsHandler');
let squadsHandler = require('SquadsHandler');

module.exports.loop = function () {
    for (let name in Memory.creeps) {
        if (!Game.creeps[name]) {
            delete Memory.creeps[name];
        }
    }

    let beforeTerminalsHandler = Game.cpu.getUsed();
    terminalsHandler.run();
    let afterTerminalsHandler = Game.cpu.getUsed();

    // globalPopulationProducer.run(Game.spawns['Base']);
    // globalPopulationProducer.run(Game.spawns['E36S51-Spawn-2']);
    // globalPopulationProducer.run(Game.spawns['Base2']);

    let rooms = Game.rooms;
    for (let roomName in rooms) {
        let room = rooms[roomName];
        if (room.memory.remoteContainers == undefined) {
            room.memory.remoteContainers = new Map();
        }
        labsHandler.run(room);
        roomPopulationProducer.run(room);
        linksHandler.run(room);
        towersHandler.run(room);
    }

    let beforeCreepsHandler = Game.cpu.getUsed();
    creepsHandler.run();
    let afterCreepsHandler = Game.cpu.getUsed();

    let progress = Game.gcl.progress;
    let progressTotal = Game.gcl.progressTotal;
    console.log("Current progress is " + progress + " from " + progressTotal + ". Remaining: " + (progressTotal - progress));
    console.log("Used: " + Game.cpu.getUsed() + "; bucket: " + Game.cpu.bucket);
    console.log("TerminalsHandler used: " + (afterTerminalsHandler - beforeTerminalsHandler));
    console.log("CreepsHandler used: " + (afterCreepsHandler - beforeCreepsHandler));
    console.log();
};