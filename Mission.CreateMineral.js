let constants = require('Constants');
let utils = require('Utils');
let missionsUtils = require('MissionsUtils');
let produceMineralMission = require('Mission.Sub.ProduceMineral');
let waitMineralMission = require('Mission.Sub.WaitMineral');
let clearLabsMission = require('Mission.Sub.ClearLabs');

module.exports = {
    run(missionNumb) {
        let mission = Memory.missions[missionNumb];

        if (mission.fromMinerals == undefined) {
            mission.fromMinerals = utils.getComponentsToProduceMineral(mission.mineralType);
        }

        if (mission.currentMission == undefined) {
            mission.currentMission = getMission(mission);
        } else {
            let childMission = Memory.missions[mission.currentMission];

            if (childMission == undefined) {
                mission.currentMission = undefined;
            }

            if (childMission.isDone == true) {
                delete(Memory.missions[mission.currentMission]);
                if (childMission.name == constants.PRODUCE_MINERAL_MISSION) {
                    mission.currentMission = missionsUtils.createClearLabsMission(mission.fromRoom);
                } else if (childMission.name == constants.CLEAR_LABS_MISSION) {
                    mission.isDone = true;
                } else {
                    mission.currentMission = undefined;
                }
            } else {
                if (childMission.name == constants.PRODUCE_MINERAL_MISSION) {
                    produceMineralMission.run(mission.currentMission);
                } else if (childMission.name == constants.WAIT_MINERAL_MISSION) {
                    waitMineralMission.run(mission.currentMission);
                } else if (childMission.name == constants.CREATE_MINERAL_MISSION) {
                    this.run(mission.currentMission);
                } else if (childMission.name == constants.CLEAR_LABS_MISSION) {
                    clearLabsMission.run(mission.currentMission);
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

let getMission = function (mission) {
    let terminal = Game.rooms[mission.fromRoom].terminal;

    if (get(terminal.store, mission.fromMinerals[0], 0) >= mission.neededAmount) {
        if (get(terminal.store, mission.fromMinerals[1], 0) >= mission.neededAmount) {
            return missionsUtils.createProduceMineralMission(mission.fromRoom, mission.mineralType, mission.neededAmount);
        } else {
            let neededAmount = mission.neededAmount - get(terminal.store, mission.fromMinerals[1], 0);
            if (utils.isBaseMineral(mission.fromMinerals[1])) {
                return missionsUtils.createWaitMineralMission(mission.fromRoom, mission.fromMinerals[1], neededAmount);
            } else {
                return missionsUtils.createCreateMineralMission(mission.fromRoom, mission.fromMinerals[1], neededAmount);
            }
        }
    } else {
        let neededAmount = mission.neededAmount - get(terminal.store, mission.fromMinerals[0], 0);
        if (utils.isBaseMineral(mission.fromMinerals[0])) {
            return missionsUtils.createWaitMineralMission(mission.fromRoom, mission.fromMinerals[0], neededAmount);
        } else {
            return missionsUtils.createCreateMineralMission(mission.fromRoom, mission.fromMinerals[0], neededAmount);
        }
    }
};