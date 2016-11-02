module.exports = {
    run(creep) {
        if (creep.memory.currentStep == undefined) {
            creep.memory.currentStep = 0;
        }
        let currentStep = creep.memory.currentStep;
        let flag = Game.flags['Step' + currentStep];
        if (flag != undefined) {
            if (creep.pos.findPathTo(flag.pos).length == 0) {
                creep.memory.currentStep++;
            } else {
                creep.moveTo(flag);
            }
        } else {
            if (creep.room.controller) {
                let claimController = creep.claimController(creep.room.controller);
                if(claimController == ERR_NOT_IN_RANGE) {
                    creep.moveTo(creep.room.controller);
                } else if (claimController == ERR_GCL_NOT_ENOUGH) {
                    if (creep.reserveController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(creep.room.controller);
                    }
                } else {
                    creep.moveTo(25, 25);
                }
            }
        }
    }
};