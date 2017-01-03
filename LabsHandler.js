let utils = require('Utils');
let constants = require('Constants');

module.exports = {
    run(room) {
        
        if (Game.cpu.bucket < 2500) {
            return;
        }
        
        let labs = room.stats().labs;
        if (labs.length < 3) {
            return;
        }

        if (room.memory.labsTask == undefined) {
            room.memory.labsTask = new Map();
            room.memory.labsTask.isDone = true;
        }

        if (room.memory.clearLabs == undefined) {
            room.memory.clearLabs = false;
        }

        if (room.memory.nextTaskAssign == undefined) {
            room.memory.nextTaskAssign = 0;
        }

        if (room.memory.lab1 == undefined) {
            let lab = getLab(room, 1);
            if (lab != undefined) {
                room.memory.lab1 = lab.id;
            } else {
                return;
            }
        }
        if (room.memory.lab2 == undefined) {
            let lab = getLab(room, 2);
            if (lab != undefined) {
                room.memory.lab2 = lab.id;
            } else {
                return;
            }
        }

        if (room.memory.labsTask.isDone) {
            if (room.memory.nextTaskAssign <= Game.time) {
                let needed = getProducedMineralAndAmount(room);

                if (needed == undefined) {
                    room.memory.nextTaskAssign = Game.time + 250;
                    return;
                }

                if (utils.isBaseMineral(needed[0])) {
                    room.memory.labsTask.type = 'WAIT_FOR_BASE';
                    room.memory.labsTask.nextCheck = Game.time + 100;
                    room.memory.labsTask.orderId = Memory.marketSystem.currentOrderId;

                    Memory.marketSystem.orders[Memory.marketSystem.currentOrderId] = new Map();
                    Memory.marketSystem.orders[Memory.marketSystem.currentOrderId].roomName = room.name;
                    Memory.marketSystem.orders[Memory.marketSystem.currentOrderId].mineralType = needed[0];
                    Memory.marketSystem.orders[Memory.marketSystem.currentOrderId].neededAmount = needed[2];
                    Memory.marketSystem.currentOrderId += 1;
                } else {
                    room.memory.labsTask.type = 'PRODUCE';
                    room.memory.labsTask.nextCheck = Game.time + 500;

                    room.memory.lab1_resource = utils.getComponentsToProduceMineral(needed[0])[0];
                    room.memory.lab2_resource = utils.getComponentsToProduceMineral(needed[0])[1];
                }

                room.memory.labsTask.mineralType = needed[0];
                room.memory.labsTask.mineralAmount = needed[1];
                room.memory.labsTask.isDone = false;
            }
            room.memory.clearLabs = true;
        } else {
            if (room.memory.labsTask.type == 'WAIT_FOR_BASE') {
                if (Memory.marketSystem.processedOrders[room.memory.labsTask.orderId] != undefined) {
                    room.memory.labsTask = new Map();
                    room.memory.labsTask.isDone = true;
                }
            } else if (room.memory.labsTask.type == 'PRODUCE') {
                if (room.memory.clearLabs == true) {
                    return;
                }

                if (room.memory.labsTask.nextCheck <= Game.time) {
                    let needed = getProducedMineralAndAmount(room);

                    if (needed == undefined) {
                        room.memory.labsTask = new Map();
                        room.memory.labsTask.isDone = true;
                        return;
                    }

                    if (room.memory.labsTask.mineralType != needed[0] || room.memory.labsTask.mineralAmount != needed[1]) {
                        room.memory.labsTask = new Map();
                        room.memory.labsTask.isDone = true;
                        return;
                    } else {
                        room.memory.labsTask.nextCheck = Game.time + 500;
                    }
                }

                if (room.memory.labsTask.mineralAmount <= 0) {
                    room.memory.labsTask = new Map();
                    room.memory.labsTask.isDone = true;
                } else {
                    let lab1 = Game.getObjectById(room.memory.lab1);
                    let lab2 = Game.getObjectById(room.memory.lab2);

                    if (lab1.mineralType == room.memory.lab1_resource && lab1.mineralAmount > 0
                            && lab2.mineralType == room.memory.lab2_resource && lab2.mineralAmount > 0) {
                        for (let labName in labs) {
                            let lab = labs[labName];
                            if (lab.id != lab1.id && lab.id != lab2.id && lab.id != room.memory.cgaBoostLabId) {
                                if (lab.cooldown == 0) {
                                    if (lab.runReaction(lab1, lab2) == OK) {
                                        room.memory.labsTask.mineralAmount -= 5;
                                        return;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
};

let getLab = function(room, numb) {
    let labFlagName = room.name + "-Lab-center-" + numb;
    for (let flagName in Game.flags) {
        if (flagName.startsWith(labFlagName)) {
            let labFlag = Game.flags[flagName];
            let labPosition = labFlag.pos;
            let lab = room.lookForAt(LOOK_STRUCTURES, labPosition);
            labFlag.remove();
            return lab[0];
        }
    }
    return undefined;
};

let getProducedMineralAndAmount = function(room) {
    let currentAmount = calcRoomAmount(room);
    let neededToProduce = 10000;
    let neededMineral = aaa(currentAmount, 'XGH2O', neededToProduce, true);

    if (neededMineral == undefined) {
        return undefined;
    } else {
        if (utils.isBaseMineral(neededMineral[0])) {
            let current = currentAmount.get(neededMineral[0]);
            if (isNaN(current)) {
                return [neededMineral[0], neededMineral[1], neededMineral[1]];
            } else {
                return [neededMineral[0], current + neededMineral[1], neededMineral[1]];
            }
        } else {
            return neededMineral;
        }
    }
};

let calcRoomAmount = function (room) {
    let currentAmount = new Map();
    for (let type in room.terminal.store) {
        currentAmount.set(type, room.terminal.store[type])
    }

    let labs = room.stats().labs;
    for (let name in labs) {
        let lab = labs[name];
        if (lab.mineralType != undefined && lab.mineralAmount != 0) {
            let current = currentAmount.get(lab.mineralType);
            if (isNaN(current)) {
                currentAmount.set(lab.mineralType, lab.mineralAmount)
            } else {
                currentAmount.set(lab.mineralType, current + lab.mineralAmount)
            }
        }
    }

    let creeps = room.stats().creeps;
    for (let name in creeps) {
        let creep = creeps[name];
        if (creep.memory.role == constants.LABS_SUPPORT) {
            if (_.sum(creep.carry) != 0) {
                for (let type in creep.carry) {
                    let current = currentAmount.get(type);
                    if (isNaN(current)) {
                        currentAmount.set(type, creep.carry[type]);
                    } else {
                        currentAmount.set(type, current + creep.carry[type]);
                    }
                }
            }
        }
    }

    let orders = Game.market.orders;
    for (let orderName in orders) {
        let order = orders[orderName];
        if (order.type == ORDER_BUY) {
            continue;
        }
        if (order.roomName == room.name) {
            let mineral = order.resourceType;
            let remainingAmount = order.remainingAmount;

            let current = currentAmount.get(mineral);
            if (isNaN(current)) {
                currentAmount.set(mineral, 0);
            } else {
                currentAmount.set(mineral, current - remainingAmount)
            }
        }
    }

    return currentAmount;
};

let aaa = function (currentAmount, resourceType, amount, target) {
    let roomAmount = currentAmount.get(resourceType);

    if (isNaN(roomAmount)) {
        roomAmount = 0;
    }

    if (roomAmount >= amount) {
        return undefined;
    }

    if (utils.isBaseMineral(resourceType)) {
        return [resourceType, amount - roomAmount];
    } else {
        let first = aaa(currentAmount, utils.getComponentsToProduceMineral(resourceType)[0], amount - roomAmount, false);
        let second = aaa(currentAmount, utils.getComponentsToProduceMineral(resourceType)[1], amount - roomAmount, false);
        if (first != undefined) {
            return first;
        } else if (second != undefined) {
            return second;
        } else {
            return [resourceType, amount - roomAmount];
        }
    }
};