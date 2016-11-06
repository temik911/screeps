let utils = require('Utils');
let constants = require('Constants');

module.exports = {
    run() {
        if (Game.time % 10 != 0) {
            return;
        }
        if (Game.cpu.bucket < 250) {
            return;
        }

        let roomsRequiredAmount = new Map();
        let roomsFreeAmount = new Map();
        let terminalsAmount = new Map();
        let labsAmount = new Map();
        let terminalsIsBusy = new Map();
        let terminalsSend = [];

        let rooms = Game.rooms;
        for (let roomName in rooms) {
            let room = rooms[roomName];

            if (room.memory.target_mineral_amount == undefined) {
                room.memory.target_mineral_amount = 1000;
            } else if (room.memory.target_mineral == 'XGH2O' || room.memory.target_mineral == 'OH') {
                if (room.stats().labs.length < 6) {
                    room.memory.target_mineral_amount = 1000;
                } else {
                    room.memory.target_mineral_amount = 10000;
                }
            }

            let terminal = room.terminal;
            if (terminal != undefined) {
                let terminalAmount = new Map();
                for (let resourceType in terminal.store) {
                    if (resourceType != RESOURCE_ENERGY) {
                        terminalAmount.set(resourceType, terminal.store[resourceType]);
                    }
                }

                let labs = room.stats().labs;
                let labAmount = new Map();
                for (let index in labs) {
                    let lab = labs[index];
                    let mineralType = lab.mineralType;
                    let mineralAmount = lab.mineralAmount;
                    if (mineralType != undefined && mineralAmount != 0) {
                        let currentAmount = labAmount.get(mineralType);
                        if (isNaN(currentAmount)) {
                            labAmount.set(mineralType, mineralAmount);
                        } else {
                            labAmount.set(mineralType, currentAmount + mineralAmount);
                        }
                    }
                }

                let roomCreeps = room.stats().creeps;
                for (let index in roomCreeps) {
                    let creep = roomCreeps[index];
                    if (creep.memory.role == constants.LABS_SUPPORT) {
                        if (_.sum(creep.carry) != 0) {
                            for (let type in creep.carry) {
                                let currentAmount = labAmount.get(type);
                                if (isNaN(currentAmount)) {
                                    labAmount.set(type, creep.carry[type]);
                                } else {
                                    labAmount.set(type, currentAmount + creep.carry[type]);
                                }
                            }
                        }
                    }
                }

                labsAmount.set(roomName, labAmount);
                terminalsAmount.set(roomName, terminalAmount);
                terminalsIsBusy.set(roomName, false);
            }
        }

        let orders = Game.market.orders;
        for (let orderName in orders) {
            let order = orders[orderName];
            let mineral = order.resourceType;
            let roomName = order.roomName;
            let remainingAmount = order.remainingAmount;
            if (order.type == ORDER_BUY) {
                continue;
            }

            let roomAmount = terminalsAmount.get(roomName);
            let currentRoomAmount = roomAmount.get(mineral);
            if (isNaN(currentRoomAmount)) {
                roomAmount.set(mineral, 0);
            } else {
                roomAmount.set(mineral, currentRoomAmount - remainingAmount)
            }
        }

        for (let roomName in rooms) {
            let room = rooms[roomName];
            if (room.terminal == undefined) {
                continue;
            }

            let roomFreeAmount = new Map();
            let requiredAmount = new Map();
            if (room.memory.target_mineral != undefined && room.memory.target_mineral_amount != undefined) {
                console.log("!!!!!!!!!!!!!!!!!!!!!!!!!" + roomName + "!!!!!!!!!!!!!!!!!!!!!!!!!");
                let terminalAmount = terminalsAmount.get(roomName);
                let labAmount = labsAmount.get(roomName);
                for (let a of terminalAmount) {
                    roomFreeAmount.set(a[0], a[1]);
                }
                for (let a of labAmount) {
                    roomFreeAmount.set(a[0], a[1] + get(roomFreeAmount, a[0], 0))
                }

                calcRequiredMineralsMap(room.memory.target_mineral, room.memory.target_mineral_amount, roomFreeAmount,
                    requiredAmount, true);
            }

            roomsFreeAmount.set(roomName, roomFreeAmount);
            roomsRequiredAmount.set(roomName, requiredAmount);
        }

        for (let roomName in rooms) {
            let room = rooms[roomName];
            if (room.terminal != undefined) {
                let targetMineral = room.memory.target_mineral;
                let targetMineralAmount = room.memory.target_mineral_amount;
                if (targetMineral != undefined && targetMineralAmount != undefined) {
                    console.log("!!! " + room.name + " " + targetMineral + " " + targetMineralAmount + " !!!");
                    let labAmount = labsAmount.get(roomName);
                    let terminalAmount = terminalsAmount.get(roomName);

                    let neededAmount = targetMineralAmount - get(terminalAmount, targetMineral, 0) - get(labAmount, targetMineral, 0);

                    func(room, roomsFreeAmount, terminalsAmount, labsAmount, targetMineral, neededAmount, terminalsIsBusy, terminalsSend);
                }
            }
        }

        let aaa = new Map();
        for (let index in terminalsSend) {
            let send = terminalsSend[index];
            if (!get(aaa, send[3], false)) {
                let terminal = Game.rooms[send[0]].terminal;
                console.log("From " + send[0] + " " + send[1] + " " + send[2] + " to " + send[3]);
                let result = terminal.send(send[1], send[2], send[3]);
                console.log("Result: " + result);
                aaa.set(send[3], true);
            }
        }

        for (let entry of roomsRequiredAmount) {
            console.log("Room " + entry[0] + " needed minerals:");
            for (let a of entry[1]) {
                console.log("    " + a[0] + " " + a[1]);
            }
        }

        console.log("\n");

        // for (let entry of roomsFreeAmount) {
        //     console.log("Room " + entry[0] + " free minerals:");
        //     for (let a of entry[1]) {
        //         console.log("    " + a[0] + " " + a[1]);
        //     }
        // }
        //
        // console.log("\n");
    }
};

let getRequiredMineral = function (target, targetAmount, terminalAmount, labAmount) {
    let components = utils.getComponentsToProduceMineral(target);
    let mineral1 = components[0];
    let mineral2 = components[1];
    let mineral1Amount = get(terminalAmount, mineral1, 0) + get(labAmount, mineral1, 0);
    let mineral2Amount = get(terminalAmount, mineral2, 0) + get(labAmount, mineral2, 0);
    let neededAmount;
    if (mineral1Amount < targetAmount) {
        neededAmount = targetAmount - mineral1Amount;
        return [mineral1, neededAmount];
    } else if (mineral2Amount < targetAmount) {
        neededAmount = targetAmount - mineral2Amount;
        return [mineral2, neededAmount];
    }
    return undefined;
};

let get = function (map, key, defaultValue) {
    let value = map.get(key);
    if (isNaN(value) || value == undefined) {
        return defaultValue;
    }
    return value;
};

let func = function (room, roomsFreeAmount, terminalsAmount, labsAmount, targetMineral, targetMineralAmount, terminalsIsBusy, terminalsSend) {
    if (utils.isBaseMineral(targetMineral)) {
        return true;
    }
    // console.log("Func from " + room.name + " " + targetMineral + " " + targetMineralAmount);

    let terminalAmount = terminalsAmount.get(room.name);
    let labAmount = labsAmount.get(room.name);
    if (targetMineralAmount > 0) {
        let requiredMineral = getRequiredMineral(targetMineral, targetMineralAmount, terminalAmount, labAmount);
        if (requiredMineral == undefined) {
            let components = utils.getComponentsToProduceMineral(targetMineral);
            // console.log("Room " + room.name + " now produce " + targetMineral + " from " + components[0] + " and " + components[1]);
            room.memory.lab1_resource = components[0];
            room.memory.lab2_resource = components[1];
            return true;
        } else {
            let neededMineral = requiredMineral[0];
            let neededMineralAmount = requiredMineral[1];
            // console.log("Func from " + room.name + " " + targetMineral + " " + targetMineralAmount + " is needed for " + neededMineral + " " + neededMineralAmount);
            for (let roomName in Game.rooms) {
                let anotherRoom = Game.rooms[roomName];
                if (anotherRoom.name != room.name && !terminalsIsBusy.get(anotherRoom.name)) {
                    let amountToAsk = neededMineralAmount >= 100 ? neededMineralAmount : 100;
                    if (anotherRoom.terminal != undefined) {
                        let anotherRoomFreeAmount = roomsFreeAmount.get(anotherRoom.name);
                        let anotherRoomTerminalAmount = terminalsAmount.get(anotherRoom.name);
                        if (anotherRoomFreeAmount != undefined && anotherRoomTerminalAmount != undefined) {
                            let freeAmount = get(anotherRoomFreeAmount, neededMineral, 0);
                            let freeAmountInTerminal = get(anotherRoomTerminalAmount, neededMineral, 0);
                            if (freeAmount >= 100 && freeAmountInTerminal >= 100) {
                                if (freeAmount >= amountToAsk && freeAmountInTerminal >= amountToAsk) {
                                    // console.log("Mineral " + neededMineral + " from " + anotherRoom.name + " to room " + room.name + " " + amountToAsk);
                                    terminalsSend.push([anotherRoom.name, neededMineral, amountToAsk, room.name]);
                                    terminalsIsBusy.set(anotherRoom, true);
                                    anotherRoomTerminalAmount.set(neededMineral, freeAmountInTerminal - amountToAsk);
                                    anotherRoomFreeAmount.set(neededMineral, freeAmount - amountToAsk);
                                    return true;
                                } else {
                                    terminalsSend.push([anotherRoom.name, neededMineral, freeAmountInTerminal, room.name]);
                                    terminalsIsBusy.set(anotherRoom, true);
                                    anotherRoomTerminalAmount.set(neededMineral, 0);
                                    anotherRoomFreeAmount.set(neededMineral, freeAmount - freeAmountInTerminal);
                                    neededMineralAmount = neededMineralAmount - freeAmountInTerminal;
                                }
                            }
                        }
                    }
                }
            }
            if (neededMineralAmount > 0) {
                return func(room, roomsFreeAmount, terminalsAmount, labsAmount, neededMineral, neededMineralAmount, terminalsIsBusy, terminalsSend);
            }
            return true;
        }
    } else {
        return true;
    }
};

let roomIsNeededMineral = function (mineral, target, first) {
    if (mineral == target) {
        return !first;
    } else {
        if (utils.isBaseMineral(target)) {
            return false;
        }
        let components = utils.getComponentsToProduceMineral(target);
        let left = roomIsNeededMineral(mineral, components[0], false);
        if (left) {
            return true;
        } else {
            let right = roomIsNeededMineral(mineral, components[1], false);
            if (right) {
                return true;
            }
        }
    }
    return false;
};

let calcRequiredMineralsMap = function (targetMineral, targetAmount, freeAmount, requiredAmount, isRoomTarget) {
    if (targetAmount <= 0) {
        return;
    }
    let currentRoomAmount = get(freeAmount, targetMineral, 0);
    let neededAmount = targetAmount - currentRoomAmount;
    if (neededAmount >= 0) {
        if (isRoomTarget) {
            let components = utils.getComponentsToProduceMineral(targetMineral);
            calcRequiredMineralsMap(components[0], neededAmount, freeAmount, requiredAmount, false);
            calcRequiredMineralsMap(components[1], neededAmount, freeAmount, requiredAmount, false);
        } else {
            // console.log(targetMineral + " " + neededAmount);
            requiredAmount.set(targetMineral, neededAmount + get(requiredAmount, targetMineral, 0));
            let offset = currentRoomAmount - targetAmount;
            if (offset < 0) {
                offset = 0;
            }
            freeAmount.set(targetMineral, offset);
            if (!utils.isBaseMineral(targetMineral)) {
                let components = utils.getComponentsToProduceMineral(targetMineral);
                calcRequiredMineralsMap(components[0], neededAmount, freeAmount, requiredAmount, false);
                calcRequiredMineralsMap(components[1], neededAmount, freeAmount, requiredAmount, false);
            }
        }
    }
};