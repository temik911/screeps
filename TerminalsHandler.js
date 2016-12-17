let utils = require('Utils');
let constants = require('Constants');

module.exports = {
    run() {
        if (Game.time % 50 != 0) {
            return;
        }
        if (Game.cpu.bucket < 2500) {
            return;
        }

        let terminalsIsBusy = new Map();

        let rooms = Game.rooms;
        let roomsWithExtraEnergy = [];
        let roomsNeededEnergy = [];
        for (let roomName in rooms) {
            let room = rooms[roomName];
            if (room.terminal != undefined) {
                if (room.controller.level == 8) {
                    if (room.storage.store[RESOURCE_ENERGY] > 100000 && room.terminal.store[RESOURCE_ENERGY] > 55000) {
                        roomsWithExtraEnergy.push(room);
                    } else if (room.storage.store[RESOURCE_ENERGY] < 50000 && _.sum(room.terminal.store) < 275000) {
                        roomsNeededEnergy.push(room);
                    }
                } else {
                    if (room.storage.store[RESOURCE_ENERGY] < 100000 && _.sum(room.terminal.store) < 275000) {
                        roomsNeededEnergy.push(room);
                    }
                }
            }
        }

        let buyEnergyOrders = null;
        for (let i in roomsWithExtraEnergy) {
            let room = roomsWithExtraEnergy[i];
            if (!get(terminalsIsBusy, room.name, false)) {
                let roomWithMinEnergy = undefined;
                let minEnergy = 999999999;
                for (let j in roomsNeededEnergy) {
                    let roomToSend = roomsNeededEnergy[j];
                    let energyAmount = roomToSend.terminal.store[RESOURCE_ENERGY] + roomToSend.storage.store[RESOURCE_ENERGY];
                    if (energyAmount < minEnergy) {
                        roomWithMinEnergy = roomToSend;
                        minEnergy = energyAmount;
                    }
                }
                if (roomWithMinEnergy != undefined) {
                    let costFor1K = 1000 + Game.market.calcTransactionCost(1000, room.name, roomWithMinEnergy.name);
                    let amountToSend = (25000 / costFor1K) * 1000;
                    if (amountToSend >= 10000) {
                        room.terminal.send(RESOURCE_ENERGY, amountToSend, roomWithMinEnergy.name);
                    }
                } else {
                    let orderId = null;
                    let maxProfit = 0;
                    let sellAmount = 0;
                    if (buyEnergyOrders == null) {
                        buyEnergyOrders = Game.market.getAllOrders({type: ORDER_BUY, resourceType: RESOURCE_ENERGY});
                    }
                    for (let k in buyEnergyOrders) {
                        let order = buyEnergyOrders[k];
                        let costFor1K = 1000 + Game.market.calcTransactionCost(1000, room.name, order.roomName);
                        let amountToSell = (25000 / costFor1K) * 1000;
                        if (order.amount >= amountToSell) {
                            let profit = amountToSell * order.price;
                            if (profit > maxProfit) {
                                orderId = order.id;
                                maxProfit = profit;
                                sellAmount = amountToSell;
                            }
                        }
                    }
                    if (orderId != null) {
                        let result = Game.market.deal(orderId, sellAmount, room.name);
                        console.log(room.name + " " + result);
                    }
                }
            }
        }
    }
};

let get = function (map, key, defaultValue) {
    let value = map.get(key);
    if (isNaN(value) || value == undefined) {
        return defaultValue;
    }
    return value;
};