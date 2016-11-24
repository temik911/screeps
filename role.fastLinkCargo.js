module.exports = {
    run(creep) {
        let links = creep.room.stats().links;
        let storage = creep.room.storage;

        if (creep.memory.storageLinkId == undefined) {
            creep.memory.storageLinkId = storage.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (structure) => structure.structureType == STRUCTURE_LINK
            }).id;
        }
        if (creep.memory.controllerLinkId == undefined) {
            creep.memory.controllerLinkId = creep.room.controller.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (structure) => structure.structureType == STRUCTURE_LINK
            }).id;
        }

        if (links.length == 2) {
            if (creep.carry.energy > 0) {
                let storageLink = Game.getObjectById(creep.memory.storageLinkId);

                if (creep.transfer(storageLink, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(storageLink);
                }
            } else {
                if (storage.store.energy >= 5000) {
                    if (creep.withdraw(storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(storage);
                    }
                }
            }
        } else if (links.length == 4) {
            let storageLink = Game.getObjectById(creep.memory.storageLinkId);
            let controllerLink = Game.getObjectById(creep.memory.controllerLinkId);

            if (creep.carry.energy > 0) {
                if (storage.store.energy >= 5000) {
                    if (controllerLink.energy <= 400) {
                        if (creep.transfer(storageLink, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(storageLink);
                        }
                    } else {
                        if (creep.transfer(storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(storage);
                        }
                    }
                } else {
                    if (creep.transfer(storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(storage);
                    }
                }
            } else {
                if (storage.store.energy >= 5000) {
                    if (controllerLink.energy <= 400) {
                        if (creep.withdraw(storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(storage);
                        }
                    } else {
                        if (creep.withdraw(storageLink, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(storageLink);
                        }
                    }
                } else {
                    if (creep.withdraw(storageLink, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(storageLink);
                    }
                }
            }
        }
    }
};