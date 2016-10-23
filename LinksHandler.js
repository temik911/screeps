module.exports = {
    run(room) {
        let links = room.stats().links;
        if (links.length == 3) {
            let storageLink = room.storage.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (structure) => structure.structureType == STRUCTURE_LINK
            });

            let storageLinkEnergy = storageLink.energy;

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
        } else if (links.length == 4) {
            let storageLink = room.storage.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (structure) => structure.structureType == STRUCTURE_LINK
            });
            let controllerLink = room.controller.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (structure) => structure.structureType == STRUCTURE_LINK
            });

            let storageLinkEnergy = storageLink.energy;
            let controllerLinkEnergy = controllerLink.energy;

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
    }
};