module.exports = {
    run(creep) {
        if (creep.memory.currentStep == undefined) {
            creep.memory.currentStep = 0;
        }
        var currentStep = creep.memory.currentStep;
        var flag = Game.flags['Step' + currentStep];
        if (flag != undefined) {
            if (creep.pos.findPathTo(flag.pos).length == 0) {
                creep.memory.currentStep++;
            } else {
                creep.moveTo(flag);
            }
        } else {
            var target = creep.pos.findClosestByRange(FIND_HOSTILE_SPAWNS);
            if (target) {
                if(creep.attack(target) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target);
                }
            } else {
                target = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
                if (target) {
                    if (creep.attack(target) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(target);
                    }
                } else {
                    creep.moveTo(30, 15);
                }
            }
        }
    }
};