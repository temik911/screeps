module.exports = {
    run(creep) {
        if (creep.memory.currentStep == undefined) {
            creep.memory.currentStep = 0;
        }
        let currentStep = creep.memory.currentStep;
        let flag = Game.flags['Step' + currentStep];
        if (flag != undefined) {
            if (creep.pos.findPathTo(flag.pos).length == 2) {
                creep.memory.currentStep++;
            } else {
                creep.moveTo(flag);
            }
        } else {
            let target = creep.pos.findClosestByRange(FIND_MY_CREEPS, {
                filter: function(object) {
                    return object.hits < object.hitsMax;
                }
            });
            if(target) {
                if(creep.heal(target) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target);
                }
            } else {
                let parking = Game.flags['Parking'];
                if (parking != undefined) {
                    creep.moveTo(parking);
                } else {
                    creep.moveTo(25, 25);
                }
            }
        }
    }
};