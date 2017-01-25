let constants = require('Constants');

module.exports = {
    run(spawn) {
        if (spawn.memory.claimerNumb == undefined) {
            spawn.memory.claimerNumb = 0;
        }
        if (spawn.memory.reserverNumb == undefined) {
            spawn.memory.reserverNumb = 0;
        }

        if (spawn.spawning != null) {
            return;
        }

        let claimerCount = 0;
        let reserverCount = 0;

        for (let creepName in Game.creeps) {
            let creep = Game.creeps[creepName];
            if (creep.memory.role == constants.CLAIMER) {
                if (creep.ticksToLive > 300) {
                    claimerCount++;
                }
            } else if (creep.memory.role == constants.RESERVER) {
                reserverCount++;
            }
        }

        let bodies;
        let name;
        
        let maxReserverCount = 1;
        if (Game.rooms.E42S62 != undefined && Game.rooms.E42S62.controller != undefined && Game.rooms.E42S62.controller.my) {
            maxReserverCount = 0;
        }

        if (reserverCount < maxReserverCount) {
            let reserverNumb = spawn.memory.reserverNumb;
            bodies = [CLAIM, MOVE];
            name = "reserver-" + reserverNumb;
            if (spawn.canCreateCreep(bodies, name) == OK) {
                spawn.createCreep(bodies, name, {
                    role: constants.RESERVER,
                    numb: reserverNumb,
                    currentStep: 0
                });
                spawn.memory.reserverNumb++;
            }
        } else if (claimerCount < 4) {
            let claimerNumb = spawn.memory.claimerNumb;
            bodies = [WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK,
                      MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,
                      CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY];
            name = "claimer-" + claimerNumb;
            if (spawn.canCreateCreep(bodies, name) == OK) {
                spawn.createCreep(bodies, name, {
                    role: constants.CLAIMER,
                    numb: claimerNumb
                });
                spawn.memory.claimerNumb++;
            }
        }
    }
};