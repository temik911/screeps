module.exports = {
    run(missionNumb) {
        let mission = Memory.missions[missionNumb];

        if (mission == undefined) {
            return;
        }

        if (mission.orderId == undefined) {
            mission.orderId = placeOrder(mission);
        } else {
            if (awaitCompleteOrder(mission)) {
                mission.isDone = true;
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
    let order = Memory.marketSystem.orders[mission.orderId];
    if (order == undefined) {
        return Memory.marketSystem.processedOrders[mission.orderId] != undefined;
    } else {
        return order.neededAmount <= 0;
    }
};