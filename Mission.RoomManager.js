let roomHarvestManagerMission = require('Mission.RoomHarvestManager');
let controllerUpgradeManagerMission = require('Mission.ControllerUpgradeManager');
let labsManagerMission = require('Mission.LabsManager');
let terminalManagerMission = require('Mission.TerminalManager');
let missionsUtils = require('MissionsUtils');
let constants = require('Constants');

module.exports = {
    run(missionNumb) {
        let mission = Memory.missions[missionNumb];

        checkHarvestManager(mission);
        checkControllerUpgradeManager(mission);
        checkLabsManagerMission(mission);
        checkTerminalManagerMission(mission);

        try {
            let harvestManager = Memory.missions[mission.harvestManager];
            if (harvestManager.name == constants.ROOM_HARVEST_MANAGER_MISSION) {
                roomHarvestManagerMission.run(mission.harvestManager);
            }
        } catch (e) {
            console.log(mission.fromRoom + " -> " + missionNumb + " " + e.stack);
        }

        try {
            let controllerUpgradeManager = Memory.missions[mission.controllerUpgradeManager];
            if (controllerUpgradeManager.name == constants.CONTROLLER_UPGRADE_MANAGER_MISSION) {
                controllerUpgradeManagerMission.run(mission.controllerUpgradeManager);
            }
        } catch (e) {
            console.log(mission.fromRoom + " -> " + missionNumb + " " + e.stack);
        }

        try {
            let labsManager = Memory.missions[mission.labsManagerMission];
            if (labsManager.name == constants.LABS_MANAGER_MISSION) {
                labsManagerMission.run(mission.labsManagerMission);
            }
        } catch (e) {
            console.log(mission.fromRoom + " -> " + missionNumb + " " + e.stack);
        }

        try {
            let terminalManager = Memory.missions[mission.terminalManagerMission];
            if (terminalManager.name == constants.TERMINAL_MANAGER_MISSION) {
                terminalManagerMission.run(mission.terminalManagerMission);
            }
        } catch (e) {
            console.log(mission.fromRoom + " -> " + missionNumb + " " + e.stack);
        }


    }
};

let checkHarvestManager = function (mission) {
    if (mission.harvestManager == undefined) {
        mission.harvestManager = missionsUtils.createRoomHarvestManagerMission(mission.fromRoom);
    }
};

let checkControllerUpgradeManager = function (mission) {
    if (mission.controllerUpgradeManager == undefined) {
        mission.controllerUpgradeManager = missionsUtils.createControllerUpgradeManagerMission(mission.fromRoom);
    }
};

let checkLabsManagerMission = function (mission) {
    if (mission.labsManagerMission == undefined) {
        mission.labsManagerMission = missionsUtils.createLabsManagerMission(mission.fromRoom);
    }
};

let checkTerminalManagerMission = function (mission) {
    if (mission.terminalManagerMission == undefined) {
        mission.terminalManagerMission = missionsUtils.createTerminalManagerMission(mission.fromRoom);
    }
};