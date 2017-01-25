module.exports = {
    run() {
        if (Game.time % 5000 != 0) {
            return;
        }

        let transferRooms = new Map();
        let neededRooms = new Map();

        let rooms = Game.rooms;
        for (let roomName in rooms) {
            let room = rooms[roomName];
            if (room.controller != undefined && room.controller.my) {
                let terminal = room.terminal;
                if (terminal != undefined) {
                    let amount = get(terminal.store, RESOURCE_CATALYZED_GHODIUM_ACID, 0);

                    if (room.controller.level != 8 && amount < 15000) {
                        neededRooms[roomName] = amount;
                    } else if (room.controller.level == 8) {
                        transferRooms[roomName] = amount;
                    }
                }
            }
        }

        let orders = Game.market.orders;
        let myOrders = [];
        for (let orderName in orders) {
            let order = orders[orderName];
            let mineral = order.resourceType;
            if (order.type == ORDER_BUY || mineral != RESOURCE_CATALYZED_GHODIUM_ACID) {
                continue;
            }
            transferRooms[order.roomName] -= order.remainingAmount;
            myOrders.push(order);
        }

        for (let transferRoomName in transferRooms) {
            if (transferRooms[transferRoomName] >= 10000) {
                let neededRoomName = undefined;
                let minAmount = 999999;

                for (let roomName in neededRooms) {
                    if (neededRooms[roomName] < 15000) {
                        if (neededRooms[roomName] < minAmount) {
                            neededRoomName = roomName;
                            minAmount = neededRooms[roomName];
                        }
                    }
                }

                if (neededRoomName != undefined) {
                    Game.rooms[transferRoomName].terminal.send(RESOURCE_CATALYZED_GHODIUM_ACID, 10000, neededRoomName);
                    console.log(transferRoomName + " send to " + neededRoomName);
                    neededRooms[neededRoomName] += 10000;
                } else {
                    for (let i in myOrders) {
                        let order = myOrders[i];
                        if (order.roomName == transferRoomName && order.amount < 1000) {
                            Game.market.extendOrder(order.id, 10000);
                            break;
                        }
                    }
                }
            }
        }

    }
};

let get = function (from, key, defaultValue) {
    let value = from[key];
    if (isNaN(value) || value == undefined) {
        return defaultValue;
    }
    return value;
};