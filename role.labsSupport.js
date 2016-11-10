let utils = require('Utils');

module.exports = {
    run(creep) {
        if (creep.ticksToLive < 25 && _.sum(creep.carry) == 0) {
            creep.suicide();
            return;
        }

        if (creep.room.memory.lab1 == undefined || creep.room.memory.lab2 == undefined) {
            return;
        }

        let labs = creep.room.stats().labs;
        let terminal = creep.room.terminal;

        if (creep.room.memory.clearLabs) {
            let fromLab = undefined;
            for (let labName in labs) {
                let lab = labs[labName];
                if (lab.id != creep.room.memory.cgaBoostLabId && lab.mineralAmount != 0) {
                    fromLab = lab;
                }
            }

            if (fromLab == undefined && _.sum(creep.carry) == 0) {
                creep.room.memory.clearLabs = false;
            } else {
                if (_.sum(creep.carry) != 0) {
                    for (let resourceType in creep.carry) {
                        let transfer = creep.transfer(terminal, resourceType);
                        if (transfer == ERR_NOT_IN_RANGE) {
                            creep.moveTo(terminal);
                        }
                    }
                } else {
                    if (creep.withdraw(fromLab, fromLab.mineralType) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(fromLab);
                    }
                }
            }

            return;
        }

        let lab1 = Game.getObjectById(creep.room.memory.lab1);
        let lab2 = Game.getObjectById(creep.room.memory.lab2);

        if (!creep.memory.needWithdraw) {
            for (let labName in labs) {
                let lab = labs[labName];
                if (lab.id != lab1.id && lab.id != lab2.id && lab.id != creep.room.memory.cgaBoostLabId) {
                    if (lab.mineralAmount > creep.carryCapacity) {
                        creep.memory.needWithdraw = true;
                        creep.memory.fromLabId = lab.id;
                        break;
                    }
                }
            }
        }

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
                let withdraw = creep.withdraw(fromLab, fromLab.mineralType);
                if (withdraw == ERR_NOT_IN_RANGE) {
                    creep.moveTo(fromLab);
                } else if (withdraw == ERR_INVALID_ARGS) {
                    creep.memory.needWithdraw = false;
                    creep.memory.fromLabId = undefined;
                }
            }
        } else {
            let withResource = creep.memory.withResource;

            let amount1 = lab1.mineralAmount;
            let amount2 = lab2.mineralAmount;

            if (amount1 == undefined || isNaN(amount1)) {
                amount1 = 0;
            }
            if (amount2 == undefined || isNaN(amount2)) {
                amount2 = 0;
            }

            if (amount1 > 1500 && amount2 > 1500) {
                return;
            }

            let currentLab;
            let currentMineral;
            if (amount1 <= amount2) {
                currentLab = lab1;
                currentMineral = creep.room.memory['lab1_resource'];
            } else {
                currentLab = lab2;
                currentMineral = creep.room.memory['lab2_resource'];
            }

            if (!withResource) {
                if (creep.carry[currentMineral] == undefined || creep.carry[currentMineral] < 100) {
                    let withdraw = creep.withdraw(terminal, currentMineral);
                    if (withdraw == ERR_NOT_IN_RANGE) {
                        creep.moveTo(terminal);
                    } else if (withdraw == ERR_NOT_ENOUGH_RESOURCES) {
                        creep.memory.withResource = true;
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
                }
            }
        }
    }
};