let creepsHandler = require('creepsHandler');
let globalPopulationProducer = require('GlobalPopulationProducer');
let roomStrategyHandler = require('RoomStrategyHandler');
let xgh2oTransfer = require('XGH2OTransfer');
let missionExecutor = require('MissionExecutor');

module.exports.loop = function () {
    console.log("************************* " + Game.time + " *************************")
    console.log("Starts with used cpu: " + Game.cpu.getUsed());
    for (let name in Memory.creeps) {
        if (!Game.creeps[name]) {
            delete Memory.creeps[name];
        }
    }

    try {
        // globalPopulationProducer.run(Game.spawns['E42S58-Spawn-1']);
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

    let beforeMissionExecutor = Game.cpu.getUsed();
    missionExecutor.run();
    let afterMissionExecutor = Game.cpu.getUsed();

    try {
        xgh2oTransfer.run();
    } catch (e) {
        console.log("GlobalPopulationProducer: " + e.stack);
    }

    let progress = Game.gcl.progress;
    let progressTotal = Game.gcl.progressTotal;

    console.log("Current progress is " + progress + " from " + progressTotal + ". Remaining: " + (progressTotal - progress));
    let total = Game.cpu.getUsed();
    Memory.total += total;
    Memory.ticks += 1;
    console.log("Used: " + total + "; bucket: " + Game.cpu.bucket);
    console.log("Average: " + (Memory.total / Memory.ticks) + " for " + Memory.ticks + " ticks");
    console.log("RoomsHandler used: " + (afterRoomsHandler - beforeRoomsHandler));
    console.log("CreepsHandler used: " + (afterCreepsHandler - beforeCreepsHandler));
    console.log("MissionExecutor used: " + (afterMissionExecutor - beforeMissionExecutor));

    if (Memory.ticks == 5000) {
        Game.notify("Average: " + (Memory.total / Memory.ticks) + " for " + Memory.ticks + " ticks");
        Memory.total = 0;
        Memory.ticks = 0;
    }

    console.log();
};