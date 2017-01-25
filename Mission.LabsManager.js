let simpleLinkControllerUpgradeMission = require('Mission.Sub.SimpleLinkControllerUpgrade');
let constants = require('Constants');
let missionsUtils = require('MissionsUtils');
let createMineralMission = require('Mission.CreateMineral');

module.exports = {
    run(missionNumb) {
        let mission = Memory.missions[missionNumb];

        if (Game.rooms[mission.fromRoom].memory.lab1 == undefined || Game.rooms[mission.fromRoom].memory.lab2 == undefined) {
            return;
        }

        if (mission.currentMission == undefined) {
            mission.currentMission = getMission(mission);
        } else {
            let childMission = Memory.missions[mission.currentMission];

            if (childMission.isDone == true) {
                delete(Memory.missions[mission.currentMission]);
                mission.currentMission = undefined;
            } else {
                createMineralMission.run(mission.currentMission);
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

let getOrdersAmount = function(from, mineralType) {
    let amount = 0;
    let orders = Game.market.orders;
    for (let orderName in orders) {
        let order = orders[orderName];
        let mineral = order.resourceType;
        if (order.type == ORDER_BUY || mineral != mineralType || order.roomName != from) {
            continue;
        }
        amount += order.remainingAmount;
    }
    return amount;
};

let getMission = function(mission) {
    let terminal = Game.rooms[mission.fromRoom].terminal;

    if (get(terminal.store, RESOURCE_CATALYZED_GHODIUM_ACID, 0) - getOrdersAmount(mission.fromRoom, 'XGH2O') < 10000) {
        return missionsUtils.createCreateMineralMission(mission.fromRoom, RESOURCE_CATALYZED_GHODIUM_ACID, 10000);
    } else if (get(terminal.store, RESOURCE_CATALYZED_UTRIUM_ACID, 0) < 3000) {
        return missionsUtils.createCreateMineralMission(mission.fromRoom, RESOURCE_CATALYZED_UTRIUM_ACID, 3000);
    } else if (get(terminal.store, RESOURCE_CATALYZED_LEMERGIUM_ALKALIDE, 0) < 3000) {
        return missionsUtils.createCreateMineralMission(mission.fromRoom, RESOURCE_CATALYZED_LEMERGIUM_ALKALIDE, 3000);
    } else if (get(terminal.store, 'XGHO2', 0) < 3000) {
        return missionsUtils.createCreateMineralMission(mission.fromRoom, 'XGHO2', 3000);
    } else if (get(terminal.store, 'XZHO2', 0) < 3000) {
        return missionsUtils.createCreateMineralMission(mission.fromRoom, 'XZHO2', 3000);
    } else if (get(terminal.store, 'XKHO2', 0) < 3000) {
        return missionsUtils.createCreateMineralMission(mission.fromRoom, 'XKHO2', 3000);
    } else if (get(terminal.store, 'G', 0) < 5000) {
        return missionsUtils.createCreateMineralMission(mission.fromRoom, 'G', 5000);
    }
};