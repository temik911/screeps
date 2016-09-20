module.exports = {
    run(creep) {
        // creep.moveTo(12, 49);
        var target = creep.pos.findClosestByRange(FIND_HOSTILE_SPAWNS);
        if(target) {
            if(creep.attack(target) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target);
            }
        }
    }
};