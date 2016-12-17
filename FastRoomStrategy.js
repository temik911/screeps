let fastRoomPopulationProducer = require('FastRoomPopulationProducer');
let fastLinksHandler = require('FastLinksHandler');
let towersHandler = require('TowersHandler');

module.exports = {
    run(room) {
        try {
            // console.log(room.name);

            let beforeRoomPopulationProducer = Game.cpu.getUsed();
            fastRoomPopulationProducer.run(room);
            let afterRoomPopulationProducer = Game.cpu.getUsed();

            let beforeFastLinksHandler = Game.cpu.getUsed();
            fastLinksHandler.run(room);
            let afterFastLinksHandler = Game.cpu.getUsed();

            let beforeTowersHandler = Game.cpu.getUsed();
            towersHandler.run(room);
            let afterTowersHandler = Game.cpu.getUsed();

            // console.log("   FastRoomPopulationProducer used: " + (afterRoomPopulationProducer - beforeRoomPopulationProducer));
            // console.log("   FastLinksHandler used: " + (afterFastLinksHandler - beforeFastLinksHandler));
            // console.log("   TowersHandler used: " + (afterTowersHandler - beforeTowersHandler));
        } catch (e) {
            console.log(room.name + ": " + e.stack);
        }
    }
};