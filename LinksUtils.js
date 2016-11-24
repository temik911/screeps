require('RoomInfo');

module.exports = {
    storageController(room) {
        let controllerLink = room.controller.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (structure) => structure.structureType == STRUCTURE_LINK
        });

        let controllerLinkEnergy = controllerLink.energy;

        let links = room.stats().links;
        for (let i in links) {
            let link = links[i];
            if (link.cooldown == 0) {
                if (!link.pos.isEqualTo(controllerLink.pos)) {
                    if (link.energy > 0) {
                        if (controllerLinkEnergy < controllerLink.energyCapacity) {
                            let needed = controllerLink.energyCapacity - controllerLinkEnergy;
                            link.transferEnergy(controllerLink, needed >= link.energy ? link.energy : needed);
                        }
                    }
                }
            }
        }
    },

    sourceSourceStorage(room) {
        let storageLink = room.storage.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (structure) => structure.structureType == STRUCTURE_LINK
        });

        let storageLinkEnergy = storageLink.energy;

        let links = room.stats().links;
        for (let i in links) {
            let link = links[i];
            if (link.cooldown == 0) {
                if (!link.pos.isEqualTo(storageLink.pos)) {
                    if (link.energy >= 400) {
                        if (storageLinkEnergy <= 400) {
                            link.transferEnergy(storageLink, 400);
                            storageLinkEnergy += 400;
                        }
                    }
                }
            }
        }
    },

    sourceSourceStorageController(room) {
        let storageLink = room.storage.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (structure) => structure.structureType == STRUCTURE_LINK
        });
        let controllerLink = room.controller.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (structure) => structure.structureType == STRUCTURE_LINK
        });

        let storageLinkEnergy = storageLink.energy;
        let controllerLinkEnergy = controllerLink.energy;

        let links = room.stats().links;
        for (let i in links) {
            let link = links[i];
            if (link.cooldown == 0) {
                if (!link.pos.isEqualTo(controllerLink.pos)) {
                    if (!link.pos.isEqualTo(storageLink.pos)) {
                        // source link
                        if (link.energy >= 400) {
                            if (room.storage.store.energy >= 5000) {
                                if (controllerLinkEnergy <= 400) {
                                    link.transferEnergy(controllerLink, 400);
                                    controllerLinkEnergy += 400;
                                } else if (storageLinkEnergy <= 400) {
                                    link.transferEnergy(storageLink, 400);
                                    storageLinkEnergy += 400;
                                }
                            } else {
                                if (storageLinkEnergy <= 400) {
                                    link.transferEnergy(storageLink, 400);
                                    storageLinkEnergy += 400;
                                }
                            }
                        }
                    } else {
                        // storage link
                        if (room.storage.store.energy >= 5000) {
                            if (link.energy >= 400) {
                                if (controllerLinkEnergy <= 400) {
                                    link.transferEnergy(controllerLink, 400);
                                    controllerLinkEnergy += 400;
                                }
                            }
                        }
                    }
                }
            }
        }
    }
};