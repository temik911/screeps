let constants = require('Constants');
let missionsUtils = require('MissionsUtils');
let terminalCargoMission = require('Mission.Sub.TerminalCargo');
let waitMineralMission = require('Mission.Sub.WaitMineral');
let utils = require('Utils');

module.exports = {
    run(missionNumb) {
        let mission = Memory.missions[missionNumb];

        let terminal = Game.rooms[mission.fromRoom].terminal;
        let storage = Game.rooms[mission.fromRoom].storage;
        if (terminal == undefined) {
            return;
        }

        if (mission.terminalCargo == undefined) {
            mission.terminalCargo = getTerminalCargoMission(mission);
        } else {
            let terminalCargo = Memory.missions[mission.terminalCargo];

            if (terminalCargo.isDone) {
                delete(Memory.missions[mission.terminalCargo]);
                mission.terminalCargo = undefined;
            } else {
                terminalCargoMission.run(mission.terminalCargo);
            }
        }

        if (!fillInternalMineralOrders(mission)) {
            if (storage.store[RESOURCE_ENERGY] > 400000) {
                if (!fillInternalEnergyOrders(mission)) {
                    if (!fillExternalMineralOrders(mission)) {
                        fillExternalEnergyOrders(mission);
                    }
                }
            } else {
                fillExternalMineralOrders(mission);
            }
        }

        if (get(storage.store, RESOURCE_ENERGY, 0) < 250000) {
            if (mission.waitEnergy == undefined) {
                if (get(terminal.store, RESOURCE_ENERGY, 0) < 55000) {
                    mission.waitEnergy = missionsUtils.createWaitMineralMission(mission.fromRoom, RESOURCE_ENERGY, 25000);
                }
            } else {
                let waitEnergy = Memory.missions[mission.waitEnergy];

                if (waitEnergy.isDone) {
                    delete(Memory.missions[mission.waitEnergy]);
                    mission.waitEnergy = undefined;
                } else {
                    waitMineralMission.run(mission.waitEnergy);
                }
            }
        }
    }
};

let getTerminalCargoMission = function (mission) {
    let room = Game.rooms[mission.fromRoom];
    if (get(room.storage.store, RESOURCE_ENERGY, 0) > 500000) {
        if (get(room.terminal.store, RESOURCE_ENERGY, 0) < 80000) {
            return missionsUtils.createTerminalCargoMission(mission.fromRoom, 5000, room.storage.id, room.terminal.id);
        }
    } else {
        if (get(room.storage.store, RESOURCE_ENERGY, 0) < 250000) {
            if (get(room.terminal.store, RESOURCE_ENERGY, 0) > 35000) {
                return missionsUtils.createTerminalCargoMission(mission.fromRoom, 5000, room.terminal.id, room.storage.id);
            }
        }
    }
    return undefined;
};

let fillExternalMineralOrders = function (mission) {
    let terminal = Game.rooms[mission.fromRoom].terminal;
    let energyAmount = get(terminal.store, RESOURCE_ENERGY, 0);
    for (let mineralType in terminal.store) {
        if (mineralType == RESOURCE_ENERGY || !utils.isBaseMineral(mineralType)) {
            continue;
        }

        if (terminal.store[mineralType] >= 125000) {
            let toSell = 1000;
            let orders = Game.market.getAllOrders({type: ORDER_BUY, resourceType: mineralType});

            let orderId = null;
            let maxProfit = 0;
            for (let k in orders) {
                let order = orders[k];
                let profit = toSell * order.price;
                let transactionCost = Game.market.calcTransactionCost(toSell, mission.fromRoom, order.roomName);
                if (order.amount >= toSell && energyAmount > transactionCost) {
                    if (profit > maxProfit && energyAmount > transactionCost) {
                        orderId = order.id;
                        maxProfit = profit;
                    }
                }
            }
            if (orderId != null) {
                Game.market.deal(orderId, toSell, mission.fromRoom);
                return true;
            }
        }
    }
    return false;
};

let fillExternalEnergyOrders = function (mission) {
    let terminal = Game.rooms[mission.fromRoom].terminal;
    let energyAmount = get(terminal.store, RESOURCE_ENERGY, 0);
    if (energyAmount >= 55000) {
        let toSell = energyAmount - 30000;
        let orders = Game.market.getAllOrders({type: ORDER_BUY, resourceType: RESOURCE_ENERGY});

        let orderId = null;
        let maxProfitFor1Energy = 0;
        let sellAmount = 0;
        let transactionCost = 0;
        for (let k in orders) {
            let order = orders[k];
            let costFor1K = 1000 + Game.market.calcTransactionCost(1000, mission.fromRoom, order.roomName);
            let amountToSell = (toSell / costFor1K) * 1000;
            let costForAmount = Game.market.calcTransactionCost(amountToSell, mission.fromRoom, order.roomName);
            if (order.amount >= amountToSell && energyAmount > costForAmount) {
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
            Game.market.deal(orderId, sellAmount, mission.fromRoom);
            return true;
        }
    }
    return false;
};

let fillInternalMineralOrders = function (mission) {
    let terminal = Game.rooms[mission.fromRoom].terminal;
    for (let i in Memory.marketSystem.orders) {
        let order = Memory.marketSystem.orders[i];
        if (order.roomName != mission.fromRoom && order.mineralType != RESOURCE_ENERGY && order.neededAmount > 0) {
            let amountCap = 0;
            if (utils.isBaseMineral(order.mineralType)) {
                amountCap = 10000;
            }
            let canSend = get(terminal.store, order.mineralType, 0) - amountCap;
            if (canSend >= 100) {
                let toSend = canSend >= order.neededAmount ? order.neededAmount : canSend;
                if (toSend < 100) {
                    toSend = 100;
                }
                let transactionCost = Game.market.calcTransactionCost(toSend, mission.fromRoom, order.roomName);
                if (transactionCost < get(terminal.store, RESOURCE_ENERGY, 0)) {
                    if (terminal.send(order.mineralType, toSend, order.roomName) == OK) {
                        Memory.marketSystem.orders[i].neededAmount -= toSend;
                        return true;
                    }
                }
            }
        }
    }
    return false;
};

let fillInternalEnergyOrders = function (mission) {
    let terminal = Game.rooms[mission.fromRoom].terminal;
    let energyAmount = get(terminal.store, RESOURCE_ENERGY, 0);
    if (energyAmount >= 55000) {
        for (let i in Memory.marketSystem.orders) {
            let order = Memory.marketSystem.orders[i];
            if (order.roomName != mission.fromRoom && order.mineralType == RESOURCE_ENERGY && order.neededAmount > 0) {
                let amountCap = 30000;
                let canSend = get(terminal.store, order.mineralType, 0) - amountCap;
                if (canSend >= 100) {
                    let toSend = canSend >= order.neededAmount ? order.neededAmount : canSend;
                    if (toSend < 100) {
                        toSend = 100;
                    }
                    while (toSend >= 100) {
                        let costFor1K = 1000 + Game.market.calcTransactionCost(1000, mission.fromRoom, order.roomName);
                        let cost = Math.ceil((toSend / 1000) * costFor1K);
                        if (cost < get(terminal.store, RESOURCE_ENERGY, 0)) {
                            if (terminal.send(order.mineralType, toSend, order.roomName) == OK) {
                                Memory.marketSystem.orders[i].neededAmount -= toSend;
                                return true;
                            }
                        }
                        toSend = Math.floor(toSend / 2);
                    }
                }
            }
        }
    }
    return false;
};

let get = function (from, key, defaultValue) {
    let value = from[key];
    if (isNaN(value) || value == undefined) {
        return defaultValue;
    }
    return value;
};