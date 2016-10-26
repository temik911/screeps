let utils = require('Utils');

module.exports = {
    run() {
        if (Game.time % 50 != 0) {
            return;
        }

        let mineralsAmount = new Map();
        let mineralsNeeded = new Map();
        let roomsAmount = new Map();

        let neededMassive = [];
        let moreMassive = [];

        let rooms = Game.rooms;
        for (let roomName in rooms) {
            let room = rooms[roomName];
            let terminal = room.terminal;
            if (terminal != undefined) {
                let lab1Resource = Memory.rooms[roomName].lab1_resource;
                let lab2Resource = Memory.rooms[roomName].lab2_resource;

                if (lab1Resource != undefined) {
                    let resourceType = utils.getMineralTypeByChar(lab1Resource);
                    if (mineralsNeeded.has(resourceType)) {
                        mineralsNeeded.get(resourceType).push(room.name);
                    } else {
                        mineralsNeeded.set(resourceType, [room.name]);
                    }
                }
                if (lab2Resource != undefined) {
                    let resourceType = utils.getMineralTypeByChar(lab2Resource);
                    if (mineralsNeeded.has(resourceType)) {
                        mineralsNeeded.get(resourceType).push(room.name);
                    } else {
                        mineralsNeeded.set(resourceType, [room.name]);
                    }
                }

                let roomAmount = new Map();
                for (let resourceType in terminal.store) {
                    if (resourceType != RESOURCE_ENERGY) {
                        let currentAmount = mineralsAmount.get(resourceType);
                        let store = terminal.store[resourceType];
                        if (isNaN(currentAmount)) {
                            mineralsAmount.set(resourceType, store)
                        } else {
                            mineralsAmount.set(resourceType, currentAmount + store)
                        }
                        roomAmount.set(resourceType, store);
                        if (resourceType != lab1Resource && resourceType != lab2Resource) {
                            moreMassive.push([room.name, resourceType, store]);
                        }
                    }
                }
                roomsAmount.set(roomName, roomAmount);
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

            let roomAmount = roomsAmount.get(roomName);
            let currentRoomAmount = roomAmount.get(mineral);
            if (isNaN(currentRoomAmount)) {
                roomAmount.set(mineral, remainingAmount);
            } else {
                roomAmount.set(mineral, currentRoomAmount - remainingAmount)
            }
        }

        for (let entry of mineralsNeeded) {
            let mineral = entry[0];
            let roomNames = entry[1];
            let forEachRoom = 1.0 * mineralsAmount.get(mineral) / roomNames.length;
            for (let index in roomNames) {
                let roomName = roomNames[index];
                let currentAmount = roomsAmount.get(roomName).get(mineral);
                if (currentAmount == undefined) {
                    currentAmount = 0;
                }
                if (currentAmount < forEachRoom - 500) {
                    let needed = forEachRoom - currentAmount;
                    neededMassive.push([roomName, mineral, needed]);
                }
                if (currentAmount > forEachRoom + 500) {
                    let more = currentAmount - forEachRoom;
                    moreMassive.push([roomName, mineral, more]);
                }
            }
        }

        let terminalsSends = [];
        for (let index in neededMassive) {
            let needed = neededMassive[index];
            for (let index2 in moreMassive) {
                let more = moreMassive[index2];
                if (more[1] == needed[1]) {
                    if (needed[2] != 0) {
                        if (needed[2] <= more[2]) {
                            terminalsSends.push([more[0], more[1], needed[2], needed[0]]);
                            more[2] -= needed[2];
                            needed[2] = 0;
                        } else {
                            terminalsSends.push([more[0], more[1], more[2], needed[0]]);
                            needed[2] -= more[2];
                            more[2] = 0;
                        }
                    }
                }
            }
        }

        for (let index in terminalsSends) {
            let mas = terminalsSends[index];
            let amount = 5000;
            if (mas[2] < amount) {
                amount = mas[2];
            }
            Game.rooms[mas[0]].terminal.send(mas[1], amount, mas[3]);
        }

        let room = roomsAmount.get('E39S53');
        if (Memory.rooms['E39S53'].lab1_resource != RESOURCE_CATALYST && Memory.rooms['E39S53'].lab2_resource != RESOURCE_GHODIUM_ACID) {
            if (room.get(RESOURCE_CATALYST) >= 5500 && room.get(RESOURCE_GHODIUM_ACID) >= 5500) {
                Memory.rooms['E39S53'].lab1_resource = RESOURCE_CATALYST;
                Memory.rooms['E39S53'].lab2_resource = RESOURCE_GHODIUM_ACID;
            }
        }
    }
};