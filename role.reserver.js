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
            if(creep.room.controller) {
                if(creep.claimController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(creep.room.controller);
                }
            }
        }
    }
};