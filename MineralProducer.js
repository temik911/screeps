let utils = require('Utils');

module.exports = {
    run(room) {
        let labs = room.stats().labs;
        if (labs.length < 6) {
            return;
        }

        if (room.memory.target_mineral_amount == undefined) {
            room.memory.target_mineral_amount = 1000;
        }

        if (room.memory.lab1 == undefined || room.memory.lab2 == undefined) {
            return;
        }

        let mineralsAmount = new Map();

        let rooms = Game.rooms;
        for (let roomName in rooms) {
            let room = rooms[roomName];
            let terminal = room.terminal;
            if (terminal != undefined) {
                for (let resourceType in terminal.store) {
                    if (resourceType != RESOURCE_ENERGY) {
                        let currentAmount = mineralsAmount.get(resourceType);
                        let store = terminal.store[resourceType];
                        if (isNaN(currentAmount)) {
                            mineralsAmount.set(resourceType, store)
                        } else {
                            mineralsAmount.set(resourceType, currentAmount + store)
                        }
                    }
                }
            }
        }

        let orders = Game.market.orders;
        for (let orderName in orders) {
            let order = orders[orderName];
            let mineral = order.resourceType;
            let roomName = order.roomName;
            let remainingAmount = order.remainingAmount;

            let currentAmount = mineralsAmount.get(mineral);
            if (isNaN(currentAmount)) {
                mineralsAmount.set(mineral, remainingAmount);
            } else {
                mineralsAmount.set(mineral, currentAmount - remainingAmount)
            }
        }




        let lab1 = Game.getObjectById(room.memory.lab1);
        let lab2 = Game.getObjectById(room.memory.lab2);

        let mineral1 = room.memory.lab1_resource;
        let mineral2 = room.memory.lab2_resource;

        let targetMineral = room.memory.target_mineral;
        let targetMineralAmount = room.memory.target_mineral_amount;

        if (mineral1 != lab1.mineralType || mineral2 != lab2.mineralType) {
            for (let labName in labs) {
                let lab = labs[labName];
                if ((lab1.id == lab.id && mineral1 == lab1.mineralType) ||
                    (lab2.id == lab.id && mineral2 == lab2.mineralType)) {
                    continue;
                }
                if (lab.mineralAmount != 0) {
                    room.memory.clearLabs = true;
                    return;
                }
            }
        }


        if (lab1.mineralAmount > 0 && lab2.mineralAmount > 0) {
            for (let labName in labs) {
                let lab = labs[labName];
                if (lab.id != lab1.id && lab.id != lab2.id) {
                    if (lab.cooldown == 0) {
                        lab.runReaction(lab1, lab2);
                    }
                }
            }
        }
    }
};