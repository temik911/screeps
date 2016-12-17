let utils = require('Utils');

module.exports = {
    run(creep) {
        if (Game.cpu.bucket < 2500) {
            return;
        }
        
        if (creep.memory.task == undefined) {
            creep.memory.task = new Map();
            creep.memory.task.isDone = true;
        }

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
            if (_.sum(creep.carry) == 0) {
                let fromLab = undefined;
                for (let labName in labs) {
                    let lab = labs[labName];
                    if (lab.id != creep.room.memory.cgaBoostLabId && lab.mineralAmount != 0) {
                        fromLab = lab;
                    }
                }

                if (fromLab == undefined) {
                    creep.room.memory.clearLabs = false;
                    creep.memory.task = new Map();
                    creep.memory.task.isDone = true;
                } else {
                    if (!creep.pos.isNearTo(fromLab.pos)) {
                        creep.moveTo(fromLab);
                    } else {
                        creep.withdraw(fromLab, fromLab.mineralType)
                    }
                }
            } else {
                if (!creep.pos.isNearTo(terminal.pos)) {
                    creep.moveTo(terminal);
                } else {
                    for (let resourceType in creep.carry) {
                        creep.transfer(terminal, resourceType);
                    }
                }
            }
        } else {
            let lab1 = Game.getObjectById(creep.room.memory.lab1);
            let lab2 = Game.getObjectById(creep.room.memory.lab2);

            if (creep.memory.task.isDone == true) {
                for (let labName in labs) {
                    let lab = labs[labName];
                    if (lab.id != lab1.id && lab.id != lab2.id && lab.id != creep.room.memory.cgaBoostLabId) {
                        if (lab.mineralAmount > creep.carryCapacity) {
                            creep.memory.task.from = lab.id;
                            creep.memory.task.to = terminal.id;
                            creep.memory.task.mineralType = lab.mineralType;
                            creep.memory.task.isDone = false;
                            return;
                        }
                    }
                }

                let amount1 = lab1.mineralAmount;
                let amount2 = lab2.mineralAmount;

                if (amount1 > 1500 && amount2 > 1500) {
                    return;
                }

                let currentLabId = undefined;
                let currentMineralType = undefined;
                if (amount1 <= amount2) {
                    currentLabId = lab1.id;
                    currentMineralType = creep.room.memory['lab1_resource'];
                } else {
                    currentLabId = lab2.id;
                    currentMineralType = creep.room.memory['lab2_resource'];
                }

                if (currentLabId != undefined && currentMineralType != undefined && terminal.store[currentMineralType] != undefined) {
                    creep.memory.task.from = terminal.id;
                    creep.memory.task.to = currentLabId;
                    creep.memory.task.mineralType = currentMineralType;
                    creep.memory.task.isDone = false;
                }
            } else {
                if (creep.carry[creep.memory.task.mineralType] == undefined) {
                    let from = Game.getObjectById(creep.memory.task.from);
                    if (!creep.pos.isNearTo(from.pos)) {
                        creep.moveTo(from);
                    } else {
                        creep.withdraw(from, creep.memory.task.mineralType);
                    }
                } else {
                    let to = Game.getObjectById(creep.memory.task.to);
                    if (!creep.pos.isNearTo(to.pos)) {
                        creep.moveTo(to);
                    } else {
                        if (creep.transfer(to, creep.memory.task.mineralType) == OK) {
                            creep.memory.task = new Map();
                            creep.memory.task.isDone = true;
                        }
                    }
                }
            }
        }
    }
};