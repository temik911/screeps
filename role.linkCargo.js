module.exports = {
    run(creep) {
        let links = creep.room.stats().links;
        let storage = creep.room.storage;
        if (links.length == 3) {
            if (creep.carry.energy > 0) {
                if (creep.transfer(storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(storage);
                }
            } else {
                let link = storage.pos.findClosestByRange(FIND_STRUCTURES, {
                    filter: (structure) => structure.structureType == STRUCTURE_LINK
                });

                if (creep.withdraw(link, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(link);
                }
            }
        } else if (links.length == 4) {
            let storageLink = storage.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (structure) => structure.structureType == STRUCTURE_LINK
            });
            let controllerLink = creep.room.controller.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (structure) => structure.structureType == STRUCTURE_LINK
            });

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