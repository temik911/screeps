let linksUtils = require('LinksUtils');

module.exports = {
    run(room) {
        if (room.controller == undefined || room.controller.owner == undefined) {
            return;
        }
        let links = room.stats().links;
        if (links.length == 3) {
            linksUtils.sourceSourceStorage(room);
        } else if (links.length == 4) {
            linksUtils.sourceSourceStorageController(room);
        }
    }
};