module.exports = {
    run(missionNumb) {
        let mission = Memory.missions[missionNumb];

        if (mission == undefined) {
            return;
        }

        if (Game.rooms[mission.fromRoom].terminal.store[RESOURCE_ENERGY] > mission.availableEnergy) {
            let orders = Game.market.getAllOrders({type: ORDER_BUY, resourceType: mission.mineralType});

            let orderId = null;
            let maxProfitFor1Energy = 0;
            let sellAmount = 0;
            let transactionCost = 0;
            for (let k in orders) {
                let order = orders[k];
                let costFor1K = 1000 + Game.market.calcTransactionCost(1000, mission.fromRoom, order.roomName);
                let amountToSell = (mission.availableEnergy / costFor1K) * 1000;
                let costForAmount = Game.market.calcTransactionCost(amountToSell, mission.fromRoom, order.roomName);
                if (order.amount >= amountToSell && mission.availableEnergy > costForAmount) {
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
                mission.isDone = true;
                Game.notify("Sell from " + mission.fromRoom + " mineral " + mineralType + " " + sellAmount + " with transactionCost " + transactionCost + " with profitFor1Energy " + maxProfitFor1Energy);
            }
        }
    }
};

let placeOrder = function (mission) {
    let orderId = Memory.marketSystem.currentOrderId;

    Memory.marketSystem.orders[orderId] = new Map();
    Memory.marketSystem.orders[orderId].roomName = mission.fromRoom;
    Memory.marketSystem.orders[orderId].mineralType = mission.mineralType;
    Memory.marketSystem.orders[orderId].neededAmount = mission.neededAmount;
    Memory.marketSystem.currentOrderId += 1;

    return orderId;
};

let awaitCompleteOrder = function(mission) {
    return Memory.marketSystem.processedOrders[mission.orderId] != undefined;
};