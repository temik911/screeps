let creepsHandler = require('creepsHandler');
let globalPopulationProducer = require('GlobalPopulationProducer');
let terminalsHandler = require('TerminalsHandler');
let roomStrategyHandler = require('RoomStrategyHandler');
let remoteRoomsWatcher = require('RemoteRoomsWatcher');

module.exports.loop = function () {
    console.log("************************* " + Game.time + " *************************")
    for (let name in Memory.creeps) {
        if (!Game.creeps[name]) {
            delete Memory.creeps[name];
        }
    }

    let beforeTerminalsHandler = Game.cpu.getUsed();
    try {
        terminalsHandler.run();
    } catch (e) {
        console.log("TerminalHandler: " + e.stack);
    }
    let afterTerminalsHandler = Game.cpu.getUsed();

    try {
        // globalPopulationProducer.run(Game.spawns['Base']);
        // globalPopulationProducer.run(Game.spawns['E36S51-Spawn-2']);
        // globalPopulationProducer.run(Game.spawns['Base2']);
    } catch (e) {
        console.log("GlobalPopulationProducer: " + e.stack);
    }

    let beforeRoomsHandler = Game.cpu.getUsed();
    roomStrategyHandler.run();
    let afterRoomsHandler = Game.cpu.getUsed();

    let beforeCreepsHandler = Game.cpu.getUsed();
    creepsHandler.run();
    let afterCreepsHandler = Game.cpu.getUsed();

    let beforeRemoteRoomsWatcher = Game.cpu.getUsed();
    remoteRoomsWatcher.run();
    let afterRemoteRoomsWatcher = Game.cpu.getUsed();

    let progress = Game.gcl.progress;
    let progressTotal = Game.gcl.progressTotal;

    console.log("Current progress is " + progress + " from " + progressTotal + ". Remaining: " + (progressTotal - progress));
    let total = Game.cpu.getUsed();
    Memory.total += total;
    Memory.ticks += 1;
    console.log("Used: " + total + "; bucket: " + Game.cpu.bucket);
    console.log("Average: " + (Memory.total / Memory.ticks) + " for " + Memory.ticks + " ticks");
    console.log("TerminalsHandler used: " + (afterTerminalsHandler - beforeTerminalsHandler));
    console.log("RoomsHandler used: " + (afterRoomsHandler - beforeRoomsHandler));
    console.log("CreepsHandler used: " + (afterCreepsHandler - beforeCreepsHandler));
    console.log("RemoteRoomsWatcher used: " + (afterRemoteRoomsWatcher - beforeRemoteRoomsWatcher));

    if (Memory.ticks == 5000) {
        Game.notify("Average: " + (Memory.total / Memory.ticks) + " for " + Memory.ticks + " ticks");
        Memory.total = 0;
        Memory.ticks = 0;
    }

    console.log();
};