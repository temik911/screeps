let utils = require('Utils');
let constants = require('Constants');
require('RoomInfo');

module.exports = {
    run() {
        let before = Game.cpu.getUsed();

        if (Memory.nextBaseMineralTransfer <= Game.time && Game.cpu.bucket > 2500) {
            let stateChanged = false;

            let eachRoomMineralAmountCap = 10000;
            let maxRoomMineralAmount = 125000;
            let maxEnergyAvailable = 25000;
            let maxTransactionPerRoom = 1;
            let maxOrderPerMineralType = 1;
            let orderAmount = 1000;
            let energyPerOrder = 2500;

            let maxPrice = new Map();
            maxPrice[RESOURCE_HYDROGEN] = 0.8;
            maxPrice[RESOURCE_OXYGEN] = 0.55;
            maxPrice[RESOURCE_UTRIUM] = 0.20;
            maxPrice[RESOURCE_LEMERGIUM] = 0.20;
            maxPrice[RESOURCE_KEANIUM] = 0.30;
            maxPrice[RESOURCE_ZYNTHIUM] = 0.20;
            maxPrice[RESOURCE_CATALYST] = 0.70;
            // total price = 3.75

            let roomWithExceededAmount = new Map();
            let transferAmount = new Map();

            let terminalIsBusy = new Map();

            let rooms = Game.rooms;
            for (let roomName in rooms) {
                let room = rooms[roomName];
                if (room.controller != undefined && room.controller.my) {
                    let terminal = room.terminal;
                    if (terminal != undefined) {
                        transferAmount[room.name] = new Map();
                        let mineralType = room.stats().mineral.mineralType;
                        let amount = get(terminal.store, mineralType, 0);

                        if (amount > maxRoomMineralAmount && terminal.store[RESOURCE_ENERGY] > maxEnergyAvailable) {
                            let roomInfo = new Map();
                            roomInfo.mineralType = mineralType;
                            roomInfo.amount = amount;
                            roomInfo.availableEnergy = maxEnergyAvailable;
                            roomInfo.availableTransaction = maxTransactionPerRoom;
                            roomWithExceededAmount[room.name] = roomInfo;
                            console.log(room.name + " " + mineralType + " " + amount)
                        }
                    }
                }
            }

            for (let roomName in rooms) {
                let room = rooms[roomName];
                if (room.controller != undefined && room.controller.my) {
                    let terminal = room.terminal;
                    if (terminal != undefined) {
                        for (let roomNameWithExceededAmount in roomWithExceededAmount) {
                            let roomInfo = roomWithExceededAmount[roomNameWithExceededAmount];
                            if (roomInfo.availableEnergy > 0 && roomInfo.availableTransaction > 0) {
                                let mineralType = roomInfo.mineralType;
                                let neededAmount = eachRoomMineralAmountCap - get(terminal.store, mineralType, 0) - get(transferAmount[room.name], mineralType, 0);
                                if (neededAmount > 0 && neededAmount < 100) {
                                    neededAmount = 100;
                                }
                                if (neededAmount >= 100) {
                                    let calcTransactionCost = Game.market.calcTransactionCost(neededAmount, room.name, roomNameWithExceededAmount);
                                    if (calcTransactionCost < roomInfo.availableEnergy) {
                                        rooms[roomNameWithExceededAmount].terminal.send(mineralType, neededAmount, room.name);
                                        roomInfo.availableEnergy -= calcTransactionCost;
                                        roomInfo.availableTransaction -= 1;
                                        roomInfo.amount -= neededAmount;
                                        transferAmount[room.name][mineralType] += neededAmount;
                                        terminalIsBusy[roomNameWithExceededAmount] = true;
                                        stateChanged = true;
                                        console.log("Send from " + roomNameWithExceededAmount + " to " + room.name + " mineral " + mineralType + " " + neededAmount + " with cost " + calcTransactionCost);
                                    }
                                }
                            }
                        }
                    }
                }
            }

            let marketOrders = new Map();
            for (let i in Memory.marketSystem.orders) {
                let order = Memory.marketSystem.orders[i];

                if (order.filledPart == undefined) {
                    order.filledPart = 0;
                }
                if (order.transactionCost == undefined) {
                    order.transactionCost = 0;
                }
                if (order.cost == undefined) {
                    order.cost = 0;
                }

                let neededAmount = order.neededAmount - order.filledPart;
                if (neededAmount < 100) {
                    neededAmount = 100;
                }
                for (let roomName in rooms) {
                    let room = rooms[roomName];
                    if (room.controller != undefined && room.controller.my && !terminalIsBusy[roomName] && !order.isDone) {
                        if (room.terminal != undefined) {
                            let terminal = room.terminal;
                            if (terminal.store[order.mineralType] != undefined && terminal.store[order.mineralType] >= eachRoomMineralAmountCap + neededAmount) {
                                let transactionCost = Game.market.calcTransactionCost(neededAmount, roomName, order.roomName);
                                if (terminal.store[RESOURCE_ENERGY] >= transactionCost) {
                                    if (terminal.send(order.mineralType, neededAmount, order.roomName) == OK) {
                                        order.isDone = true;
                                        console.log("Send from " + roomName + " to " + order.roomName + " mineral " + order.mineralType + " " + neededAmount + " with cost " + transactionCost);

                                        Memory.marketSystem.processedOrders[i] = new Map();
                                        Memory.marketSystem.processedOrders[i].roomName = order.roomName;
                                        Memory.marketSystem.processedOrders[i].mineralType = order.mineralType;
                                        Memory.marketSystem.processedOrders[i].neededAmount = order.neededAmount;
                                        Memory.marketSystem.processedOrders[i].filledPart = order.filledPart + neededAmount;
                                        Memory.marketSystem.processedOrders[i].transactionCost = order.transactionCost + transactionCost;
                                        Memory.marketSystem.processedOrders[i].cost = order.cost;
                                        Memory.marketSystem.processedOrders[i].isDone = order.isDone;
                                        delete(Memory.marketSystem.orders[i]);

                                        terminalIsBusy[roomName] = true;
                                        stateChanged = true;
                                    }
                                }
                            }
                        }
                    }
                }

                if (Game.market.credits > 100000) {
                    if (!order.isDone) {
                        let room = Game.rooms[order.roomName];
                        if (room.terminal != undefined) {
                            if (room.terminal.store[RESOURCE_ENERGY] >= energyPerOrder) {
                                if (marketOrders[order.mineralType] == undefined) {
                                    let sellOrders = Game.market.getAllOrders({
                                        type: ORDER_SELL,
                                        resourceType: order.mineralType
                                    });
                                    marketOrders[order.mineralType] = sellOrders;
                                    let orderId = null;
                                    let minPrice = 999999;
                                    let minCostForMinPrice = 999999;
                                    for (let i in sellOrders) {
                                        let sellOrder = sellOrders[i];
                                        if (sellOrder.amount >= orderAmount) {
                                            let transactionCost = Game.market.calcTransactionCost(orderAmount, order.roomName, sellOrder.roomName);
                                            if (transactionCost <= energyPerOrder && sellOrder.price <= maxPrice[order.mineralType]) {
                                                if (sellOrder.price < minPrice || (sellOrder.price == minPrice && transactionCost < minCostForMinPrice)) {
                                                    orderId = sellOrder.id;
                                                    minPrice = sellOrder.price;
                                                    minCostForMinPrice = transactionCost;
                                                }
                                            }
                                        }
                                    }
                                    if (orderId != null) {
                                        if (Game.market.deal(orderId, orderAmount, order.roomName) == OK) {
                                            order.cost += minPrice * orderAmount;
                                            order.transactionCost += minCostForMinPrice;
                                            order.filledPart += orderAmount;

                                            console.log("Buy " + orderAmount + " " + order.mineralType + " to " +
                                                order.roomName + " was needed " + neededAmount + " with cost " + (minPrice * orderAmount) +
                                                " with transactionCost " + minCostForMinPrice);

                                            stateChanged = true;

                                            if (order.filledPart >= order.neededAmount) {
                                                order.isDone = true;

                                                Memory.marketSystem.processedOrders[i] = new Map();
                                                Memory.marketSystem.processedOrders[i].roomName = order.roomName;
                                                Memory.marketSystem.processedOrders[i].mineralType = order.mineralType;
                                                Memory.marketSystem.processedOrders[i].neededAmount = order.neededAmount;
                                                Memory.marketSystem.processedOrders[i].filledPart = order.filledPart;
                                                Memory.marketSystem.processedOrders[i].transactionCost = order.transactionCost;
                                                Memory.marketSystem.processedOrders[i].cost = order.cost;
                                                Memory.marketSystem.processedOrders[i].isDone = order.isDone;
                                                delete(Memory.marketSystem.orders[i]);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }

            let orders = new Map();
            for (let roomNameWithExceededAmount in roomWithExceededAmount) {
                let room = rooms[roomNameWithExceededAmount];
                let roomInfo = roomWithExceededAmount[roomNameWithExceededAmount];
                let orderId = null;
                let maxProfitFor1Energy = 0;
                let sellAmount = 0;
                let transactionCost = 0;
                if (roomInfo.availableEnergy > 0 && roomInfo.availableTransaction > 0 && !terminalIsBusy[roomNameWithExceededAmount]) {
                    let mineralType = roomInfo.mineralType;
                    if (orders[mineralType] == undefined) {
                        orders[mineralType] = Game.market.getAllOrders({type: ORDER_BUY, resourceType: mineralType});
                    }
                    for (let k in orders[mineralType]) {
                        let order = orders[mineralType][k];
                        let costFor1K = 1000 + Game.market.calcTransactionCost(1000, room.name, order.roomName);
                        let amountToSell = (roomInfo.availableEnergy / costFor1K) * 1000;
                        let costForAmount = Game.market.calcTransactionCost(amountToSell, room.name, order.roomName);
                        if (order.amount >= amountToSell && roomInfo.availableEnergy > costForAmount) {
                            let profitFor1Energy = amountToSell * order.price / costForAmount;
                            if (profitFor1Energy > 0.05 && profitFor1Energy > maxProfitFor1Energy) {
                                orderId = order.id;
                                maxProfitFor1Energy = profitFor1Energy;
                                sellAmount = amountToSell;
                                transactionCost = costForAmount;
                            }
                        }
                    }
                    if (orderId != null) {
                        Game.market.deal(orderId, sellAmount, room.name);
                        roomInfo.availableEnergy -= transactionCost;
                        roomInfo.availableTransaction -= 1;
                        roomInfo.amount -= sellAmount;
                        stateChanged = true;
                        console.log("Sell from " + roomNameWithExceededAmount + " mineral " + mineralType + " " + sellAmount + " with cost " + transactionCost);
                    }
                }
            }

            if (!stateChanged) {
                Memory.nextBaseMineralTransfer = Game.time + 150;
            }
        }

        let after = Game.cpu.getUsed();
        console.log("Cpu for base: " + (after - before));
    }
};

let get = function (from, key, defaultValue) {
    let value = from[key];
    if (isNaN(value) || value == undefined) {
        return defaultValue;
    }
    return value;
};