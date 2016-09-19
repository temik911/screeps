module.exports = {
    run() {
        var tower = Game.getObjectById('57d9b752739bab402d46868f');

        if(tower) {
            var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
            if(closestHostile) {
                tower.attack(closestHostile);
            } else {
                var targets = tower.room.find(FIND_STRUCTURES, {
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
                            structure.hits < structure.hitsMax / 150
                        });

                        if (targets.length == 0) {
                            targets = tower.room.find(FIND_STRUCTURES, {
                                filter: structure => structure.structureType == STRUCTURE_WALL &&
                                structure.hits < structure.hitsMax / 10000
                            });
                        }
                    }
                }

                targets.sort((a, b) => a.hits - b.hits);

                if (targets.length > 0) {
                    tower.repair(targets[0]);
                }
            }
        }
    }
};