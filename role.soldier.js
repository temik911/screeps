module.exports = {
    run(creep) {
        // creep.moveTo(37, 49);
        var target = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        // , {
        //     filter: structure => structure.structureType == STRUCTURE_EXTENSION
        // });
        // if(target) {
        //     console.log(creep.attack(target))
        //     if(creep.attack(target) == ERR_NOT_IN_RANGE) {
        //         creep.moveTo(target);
        //     }
        // }
    }
};