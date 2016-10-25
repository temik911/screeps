let utils = require('Utils');

module.exports = {
    run(creep) {
        let labs = creep.room.stats().labs;
        let lab1 = Game.getObjectById(creep.room.memory.lab1);
        let lab2 = Game.getObjectById(creep.room.memory.lab2);

        if (!creep.memory.needWithdraw) {
            for (let labName in labs) {
                let lab = labs[labName];
                if (lab.id != lab1.id && lab.id != lab2.id) {
                    if (lab.mineralAmount > 100) {
                        creep.memory.needWithdraw = true;
                        creep.memory.fromLabId = lab.id;
                        break;
                    }
                }
            }
        }

        let terminal = creep.room.terminal;
        if (creep.memory.needWithdraw) {
            if (_.sum(creep.carry) != 0) {
                for (let resourceType in creep.carry) {
                    let transfer = creep.transfer(terminal, resourceType);
                    if (transfer == ERR_NOT_IN_RANGE) {
                        creep.moveTo(terminal);
                    } else if (transfer == OK) {
                        creep.memory.needWithdraw = false;
                        creep.memory.fromLabId = undefined;
                    }
                }
            } else {
                let fromLab = Game.getObjectById(creep.memory.fromLabId);
                if (creep.withdraw(fromLab, fromLab.mineralType) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(fromLab);
                }
            }
        } else {
            let withResource = creep.memory.withResource;

            let amount1 = lab1.mineralAmount;
            let amount2 = lab2.mineralAmount;

            if (amount1 == undefined) {
                amount1 = 0;
            }
            if (amount2 == undefined) {
                amount2 = 0;
            }

            let currentLab;
            let currentMineral;
            if (amount1 <= amount2) {
                currentLab = lab1;
                currentMineral = utils.getMineralTypeByChar(creep.room.memory['lab1_resource']);
            } else {
                currentLab = lab2;
                currentMineral = utils.getMineralTypeByChar(creep.room.memory['lab2_resource']);
            }

            if (!withResource) {
                if (creep.carry[currentMineral] == undefined || creep.carry[currentMineral] < 100) {
                    if (creep.withdraw(terminal, currentMineral) != 0) {
                        creep.moveTo(terminal);
                    }
                } else {
                    creep.memory.withResource = true;
                }
            } else {
                if (creep.transfer(currentLab, currentMineral) != 0) {
                    creep.moveTo(currentLab);
                }

                if (creep.carry[currentMineral] == undefined || creep.carry[currentMineral] == 0) {
                    creep.memory.withResource = false;
                    creep.memory.iter++;
                }
            }
        }
    }
};