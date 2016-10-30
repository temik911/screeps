let utils = require('Utils');
let constants = require('Constants');

module.exports = {
    run() {
        if (Game.time % 10 != 0) {
            return;
        }

        let allAmount = new Map();
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
                room.memory.target_mineral_amount = 10000;
            }

            let terminal = room.terminal;
            if (terminal != undefined) {
                let terminalAmount = new Map();
                for (let resourceType in terminal.store) {
                    if (resourceType != RESOURCE_ENERGY) {
                        let currentAmount = allAmount.get(resourceType);
                        let store = terminal.store[resourceType];
                        if (isNaN(currentAmount)) {
                            allAmount.set(resourceType, store)
                        } else {
                            allAmount.set(resourceType, currentAmount + store)
                        }
                        terminalAmount.set(resourceType, store);
                    }
                }

                let labs = room.stats().labs;
                let labAmount = new Map();
                for (let index in labs) {
                    let lab = labs[index];
                    let mineralType = lab.mineralType;
                    if (mineralType != undefined) {
                        let mineralAmount = lab.mineralAmount;
                        if (mineralAmount != 0) {
                            let currentAmount = labAmount.get(mineralType);
                            if (isNaN(currentAmount)) {
                                labAmount.set(mineralType, mineralAmount);
                            } else {
                                labAmount.set(mineralType, currentAmount + mineralAmount);
                            }
                        }
                    }
                }

                let roomCreeps = room.stats().creeps;
                for (let index in roomCreeps) {
                    let creep = roomCreeps[index];
                    if (creep.memory.role == constants.LABS_SUPPORT) {
                        let creepRoomName = undefined;
                        if (creep.memory.roomName == undefined) {
                            creepRoomName = creep.name.split('-')[0];
                        } else {
                            creepRoomName = creep.memory.roomName;
                        }

                        if (creepRoomName = roomName) {
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

            let currentAmount = allAmount.get(mineral);
            if (isNaN(currentAmount)) {
                allAmount.set(mineral, remainingAmount);
            } else {
                allAmount.set(mineral, currentAmount - remainingAmount)
            }

            let roomAmount = terminalsAmount.get(roomName);
            let currentRoomAmount = roomAmount.get(mineral);
            if (isNaN(currentRoomAmount)) {
                roomAmount.set(mineral, remainingAmount);
            } else {
                roomAmount.set(mineral, currentRoomAmount - remainingAmount)
            }
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

                    func(room, allAmount, terminalsAmount, labAmount, targetMineral, neededAmount, terminalsIsBusy, terminalsSend);
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

        console.log("\n");
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

let func = function (room, allAmount, terminalsAmount, labAmount, targetMineral, targetMineralAmount, terminalsIsBusy, terminalsSend) {
    if (utils.isBaseMineral(targetMineral)) {
        return true;
    }

    console.log("Func from " + room.name + " " + targetMineral + " " + targetMineralAmount);

    let terminalAmount = terminalsAmount.get(room.name);
    if (targetMineralAmount > 0) {
        if (targetMineralAmount < 100) {
            targetMineralAmount = 100;
        }
        let targetMineralAmountInRoom = get(terminalAmount, targetMineral, 0) + get(labAmount, targetMineral, 0);
        let requiredMineral = getRequiredMineral(targetMineral, targetMineralAmount, terminalAmount, labAmount);
        if (requiredMineral == undefined) {
            let components = utils.getComponentsToProduceMineral(targetMineral);
            console.log("Room " + room.name + " now produce " + targetMineral + " from " + components[0] + " and " + components[1]);
            room.memory.lab1_resource = components[0];
            room.memory.lab2_resource = components[1];
            return true;
        } else {
            let neededMineral = requiredMineral[0];
            let neededMineralAmount = requiredMineral[1];
            if (neededMineralAmount < 100) {
                neededMineralAmount = 100;
            }
            console.log("Func from " + room.name + " " + targetMineral + " " + targetMineralAmount + " is needed for " + neededMineral + " " + neededMineralAmount);
            if (get(allAmount, neededMineral, 0) > neededMineralAmount) {
                console.log(neededMineral + " in all rooms amount is " + get(allAmount, neededMineral, 0));
                for (let roomName in Game.rooms) {
                    if (neededMineralAmount >= 100) {
                        let anotherRoom = Game.rooms[roomName];
                        if (anotherRoom.name != room.name) {
                            if (anotherRoom.terminal != undefined) {
                                let anotherRoomAmount = terminalsAmount.get(anotherRoom.name);
                                if (anotherRoomAmount != undefined) {
                                    let anotherRoomMineralAmount = get(anotherRoomAmount, neededMineral, 0);
                                    console.log(anotherRoom.name + " contain " + neededMineral + " in amount " + anotherRoomMineralAmount);
                                    if (anotherRoomMineralAmount > 0) {
                                        let anotherRoomTarget = anotherRoom.memory.target_mineral;
                                        let freeMineralAmount = 0;
                                        console.log(neededMineral + " " + anotherRoomTarget);
                                        if (anotherRoomTarget != undefined && roomIsNeededMineral(neededMineral, anotherRoomTarget, true)) {
                                            freeMineralAmount = anotherRoomMineralAmount - anotherRoom.memory.target_mineral_amount;
                                        } else {
                                            console.log("Free mineral amount " + anotherRoomMineralAmount);
                                            freeMineralAmount = anotherRoomMineralAmount;
                                        }
                                        if (freeMineralAmount >= 100) {
                                            if (terminalsIsBusy.get(anotherRoom.name) == false) {
                                                if (freeMineralAmount > neededMineralAmount) {
                                                    console.log("Mineral " + neededMineral + " from " + anotherRoom.name + " to room " + room.name + " " + neededMineralAmount);
                                                    terminalsSend.push([anotherRoom.name, neededMineral, neededMineralAmount, room.name]);
                                                    terminalsIsBusy.set(anotherRoom, true);
                                                    anotherRoomAmount.set(neededMineral, anotherRoomMineralAmount - neededMineralAmount);
                                                    neededMineralAmount = 0;
                                                    return true;
                                                } else {
                                                    console.log("Mineral " + neededMineral + " from " + anotherRoom.name + " to room " + room.name + " " + freeMineralAmount);
                                                    terminalsSend.push([anotherRoom.name, neededMineral, freeMineralAmount, room.name]);
                                                    terminalsIsBusy.set(anotherRoom, true);
                                                    anotherRoomAmount.set(neededMineral, 0);
                                                    neededMineralAmount = neededMineralAmount - freeMineralAmount;
                                                    if (neededMineralAmount == 0) {
                                                        return true;
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                if (neededMineralAmount > 0) {
                    return func(room, allAmount, terminalsAmount, labAmount, neededMineral, neededMineralAmount, terminalsIsBusy, terminalsSend);
                }
                return true;
            } else {
                return func(room, allAmount, terminalsAmount, labAmount, neededMineral, neededMineralAmount, terminalsIsBusy, terminalsSend);
            }
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
        console.log("Components for " + target);
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