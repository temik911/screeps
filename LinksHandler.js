var constants = require('Constants');

module.exports = {
    run(room) {
        if (room.stats().links.length >= 3) {
            var links = room.stats().links;
            var storageLink = room.storage.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (structure) => structure.structureType == STRUCTURE_LINK
            });
            for (var i in links) {
                let link = links[i];
                if (!link.pos.isEqualTo(storageLink.pos)) {
                    if (link.energy >= 400) {
                        link.transferEnergy(storageLink, 400);
                    }
                }
            }
        }
    }
};