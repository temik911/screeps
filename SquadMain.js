let constants = require('Constants');
let x1 = require('SquadX1');
let x2 = require('SquadX2');
let x3 = require('SquadX3');

module.exports = {
    run(creep) {
        let squad = [];
        let squadNumb = creep.memory.squad_numb;
        let squadAlg = creep.memory.squad_alg;
        for(let name in Game.creeps) {
            let anotherCreep = Game.creeps[name];
            if (anotherCreep.memory.squad_numb == squadNumb) {
                squad.push(anotherCreep);
            }
        }


        if (squadAlg == 'x1') {
            x1.run(squad);
        } else if (squadAlg == 'x2') {
            x2.run(squad);
        } else if (squadAlg == 'x3') {
            x3.run(squad);
        }
    }
};
