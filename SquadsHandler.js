let constants = require('Constants');
let squadMain = require('SquadMain');

module.exports = {
    run() {
        for(let name in Game.creeps) {
            let creep = Game.creeps[name];
            try {
                if (creep.memory.squad_role == constants.SQUAD_ROLE_MAIN) {
                    squadMain.run(creep);
                }

                Game.getObjectById('580541916402874c619e0182').createCreep([MOVE, MOVE, MOVE, MOVE, MOVE,
                    MOVE, MOVE, MOVE, MOVE, MOVE,
                    MOVE, MOVE, MOVE, MOVE, MOVE,
                    MOVE, MOVE, MOVE, MOVE, MOVE,
                    MOVE, MOVE, MOVE, MOVE, MOVE,
                    ATTACK, ATTACK, ATTACK, ATTACK, ATTACK,
                    ATTACK, ATTACK, ATTACK, ATTACK, ATTACK,
                    ATTACK, ATTACK, ATTACK, ATTACK, ATTACK,
                    ATTACK, ATTACK, ATTACK, ATTACK, ATTACK,
                    ATTACK, ATTACK, ATTACK, ATTACK, ATTACK], "Squad-1-attack", {squad_role:'squadRoleMain', roomName: 'E39S52', squad_numb: 1, squad_alg: 'x3', role: 'squadAttack'});

                Game.getObjectById('5817049c30f0d0351371cbe6').createCreep([MOVE, MOVE, MOVE, MOVE, MOVE,
                    MOVE, MOVE, MOVE, MOVE, MOVE,
                    MOVE, MOVE, MOVE, MOVE, MOVE,
                    MOVE, MOVE, MOVE, MOVE, MOVE,
                    MOVE, MOVE, MOVE, MOVE, MOVE,
                    HEAL, HEAL, HEAL, HEAL, HEAL,
                    HEAL, HEAL, HEAL, HEAL, HEAL,
                    HEAL, HEAL, HEAL, HEAL, HEAL,
                    HEAL, HEAL, HEAL, HEAL, HEAL,
                    HEAL, HEAL, HEAL, HEAL, HEAL], "Squad-1-healer", {roomName: 'E39S52', squad_numb: 1, squad_alg: 'x3', role: 'squadHealer'});

                Game.getObjectById('57d83c9b3b13abc675e9f277').createCreep([MOVE, MOVE, MOVE, MOVE, MOVE,
                    MOVE, MOVE, MOVE, MOVE, MOVE,
                    MOVE, MOVE, MOVE, MOVE, MOVE,
                    MOVE, MOVE, MOVE, MOVE, MOVE,
                    MOVE, MOVE, MOVE, MOVE, MOVE,
                    HEAL, HEAL, HEAL, HEAL, HEAL,
                    HEAL, HEAL, HEAL, HEAL, HEAL,
                    HEAL, HEAL, HEAL, HEAL, HEAL,
                    HEAL, HEAL, HEAL, HEAL, HEAL,
                    HEAL, HEAL, HEAL, HEAL, HEAL], "Squad-1-healer2", {roomName: 'E39S52', squad_numb: 1, squad_alg: 'x3', role: 'squadHealer'});





            } catch (e) {
                console.log(creep.name + ": " + e.stack);
            }
        }
    }
};