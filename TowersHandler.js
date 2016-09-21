module.exports = {
    run(spawn) {
        var towers = spawn.room.find(FIND_MY_STRUCTURES, {
            filter: (structure) => structure.structureType == STRUCTURE_TOWER
        });
        
        for (var name in towers) {
            var tower = towers[name];
    
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
                    }
    
                    targets.sort((a, b) => a.hits - b.hits);
    
                    if (targets.length > 0) {
                        tower.repair(targets[0]);
                    }
                }
            }
        }
    }
};