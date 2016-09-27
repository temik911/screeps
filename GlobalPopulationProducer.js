var constants = require('Constants');

module.exports = {
    run(spawn) {
        if (spawn.memory.invaderNumb == undefined) {
            spawn.memory.invaderNumb = 0;
        }
        if (spawn.memory.claimerNumb == undefined) {
            spawn.memory.claimerNumb = 0;
        }
        if (spawn.memory.reserverNumb == undefined) {
            spawn.memory.reserverNumb = 0;
        }

        if (spawn.spawning != null) {
            return;
        }

        var invaderCount = 0;
        var claimerCount = 0;
        var reserverCount = 0;

        for (var creepName in Game.creeps) {
            var creep = Game.creeps[creepName];
            if (creep.memory.role == constants.INVADER) {
                invaderCount++;
            } else if (creep.memory.role == constants.CLAIMER) {
                claimerCount++;
            } else if (creep.memory.role == constants.RESERVER) {
                reserverCount++;
            }
        }

        var bodies;
        var name;

        if (invaderCount < 0) {
            var invaderNumb = spawn.memory.invaderNumb;
            bodies = [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,
                      ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK];
            name = "invader-" + invaderNumb;
            if (spawn.canCreateCreep(bodies, name) == OK) {
                spawn.createCreep(bodies, name, {
                    role: constants.INVADER,
                    currentStep: 0
                });
                spawn.memory.invaderNumb++;
            }
        } else if (claimerCount < 0) {
            var claimerNumb = spawn.memory.claimerNumb;
            bodies = [WORK, WORK, WORK, WORK, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY];
            name = "claimer-" + claimerNumb;
            if (spawn.canCreateCreep(bodies, name) == OK) {
                spawn.createCreep(bodies, name, {
                    role: constants.CLAIMER,
                    numb: claimerNumb
                });
                spawn.memory.claimerNumb++;
            }
        } else if (reserverCount < 1) {
            var reserverNumb = spawn.memory.reserverNumb;
            bodies = [CLAIM, CLAIM, MOVE, MOVE];
            name = "reserver-" + reserverNumb;
            if (spawn.canCreateCreep(bodies, name) == OK) {
                spawn.createCreep(bodies, name, {
                    role: constants.RESERVER,
                    numb: reserverNumb,
                    currentStep: 0
                });
                spawn.memory.reserverNumb++;
            }
        }
    }
};