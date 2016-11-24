let roomPopulationProducer = require('RoomPopulationProducer');
let linksHandler = require('LinksHandler');
let towersHandler = require('TowersHandler');
let labsHandler = require('LabsHandler');

module.exports = {
    run(room) {
        try {
            console.log(room.name);
            let beforeLabsHandler = Game.cpu.getUsed();
            labsHandler.run(room);
            let afterLabsHandler = Game.cpu.getUsed();

            let beforeRoomPopulationProducer = Game.cpu.getUsed();
            roomPopulationProducer.run(room);
            let afterRoomPopulationProducer = Game.cpu.getUsed();

            let beforeLinksHandler = Game.cpu.getUsed();
            linksHandler.run(room);
            let afterLinksHandler = Game.cpu.getUsed();

            let beforeTowersHandler = Game.cpu.getUsed();
            towersHandler.run(room);
            let afterTowersHandler = Game.cpu.getUsed();

            console.log("   LabsHandler used: " + (afterLabsHandler - beforeLabsHandler));
            console.log("   RoomPopulationProducer used: " + (afterRoomPopulationProducer - beforeRoomPopulationProducer));
            console.log("   LinksHandler used: " + (afterLinksHandler - beforeLinksHandler));
            console.log("   TowersHandler used: " + (afterTowersHandler - beforeTowersHandler));
        } catch (e) {
            console.log(room.name + ": " + e.stack);
        }
    }
};