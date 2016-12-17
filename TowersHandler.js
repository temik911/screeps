let constants = require('Constants');

module.exports = {
    run(room) {
        let towers = room.find(FIND_MY_STRUCTURES, {
            filter: (structure) => structure.structureType == STRUCTURE_TOWER
        });

        for (let name in towers) {
            let tower = towers[name];
    
            if (tower) {
                let closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
                if(closestHostile) {
                    tower.attack(closestHostile);
                } else {
                    let toHeal = tower.room.find(FIND_MY_CREEPS, {
                        filter: creep => creep.hits < creep.hitsMax
                    });

                    if (toHeal.length > 0) {
                        tower.heal(toHeal[0]);
                    } else {
                        let targets = tower.room.find(FIND_STRUCTURES, {
                            filter: structure => structure.structureType == STRUCTURE_ROAD &&
                            structure.hits < structure.hitsMax / 2
                        });

                        if (targets.length == 0) {
                            targets = tower.room.find(FIND_STRUCTURES, {
                                filter: structure => structure.structureType == STRUCTURE_CONTAINER &&
                                structure.hits < structure.hitsMax / 2
                            });

                            if (targets.length == 0) {
                                targets = tower.room.find(FIND_STRUCTURES, {
                                    filter: structure => structure.structureType == STRUCTURE_RAMPART &&
                                    structure.hits < constants.RAMPART_HP_BARRIER &&
                                    (constants.RAMPART_HP_BARRIER - structure.hits < 1000 || structure.hits < 1000)
                                });
                            }
                        }

                        targets.sort((a, b) => a.hits - b.hits);

                        if (targets.length > 0) {
                            tower.repair(targets[0]);
                        }
                    }
                }
            }
        }
    }
};