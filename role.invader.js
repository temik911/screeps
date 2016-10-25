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
            let target = creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS);
            if (target) {
                if(creep.attack(target) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target);
                }
            } else {
                target = creep.pos.findClosestByPath(FIND_HOSTILE_SPAWNS);
                if (target) {
                    if (creep.attack(target) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(target);
                    }
                } else {
                    target = creep.pos.findClosestByPath(FIND_HOSTILE_STRUCTURES, {
                        filter: structure => structure.structureType != STRUCTURE_RAMPART &&
                            structure.structureType != STRUCTURE_WALL &&
                            structure.structureType != STRUCTURE_ROAD &&
                            structure.structureType != STRUCTURE_CONTROLLER
                    });
                    if (target) {
                        if (creep.attack(target) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(target);
                        }
                    } else {
                        target = creep.pos.findClosestByPath(FIND_HOSTILE_CONSTRUCTION_SITES);
                        if (target) {
                            if (creep.attack(target) == ERR_NOT_IN_RANGE) {
                                creep.moveTo(target);
                            }
                        } else {
                            let parking = Game.flags['Parking'];
                            // if (parking != undefined) {
                            //     creep.moveTo(parking);
                            // } else {
                                creep.moveTo(25, 25);
                            // }
                        }
                    }
                }
            }
        }
    }
};