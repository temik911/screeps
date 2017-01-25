let constants = require('Constants');

module.exports = {
    createDismantleRoomMission(from, dismantle, dismantleWalls) {
        let mission = new Map();
        mission.name = constants.DISMANTLE_ROOM_MISSION;
        mission.fromRoom = from;
        mission.dismantleRoom = dismantle;
        mission.dismantleWalls = dismantleWalls;

        return createMission(mission);
    },

    createPrepareRemoteHarvestMission(from, harvest) {
        let mission = new Map();
        mission.name = constants.PREPARE_REMOTE_HARVEST_MISSION;
        mission.fromRoom = from;
        mission.harvestRoom = harvest;

        return createMission(mission);
    },

    createCreateStructuresForRemoteHarvestSubMission(from, harvest) {
        let mission = new Map();
        mission.name = constants.CREATE_STRUCTURES_FOR_REMOTE_HARVEST_MISSION;
        mission.fromRoom = from;
        mission.harvestRoom = harvest;

        return createMission(mission);
    },

    createBuildStructuresForRemoteHarvestSubMission(from, harvest, roomsInPath) {
        let mission = new Map();
        mission.name = constants.BUILD_STRUCTURES_FOR_REMOTE_HARVEST_MISSION;
        mission.fromRoom = from;
        mission.harvestRoom = harvest;
        mission.roomsInPath = roomsInPath;

        return createMission(mission);
    },

    createHarvestMission(from, containerInfo) {
        let mission = new Map();
        mission.name = constants.HARVEST_MISSION;
        mission.fromRoom = from;
        mission.containerId = containerInfo.containerId;
        mission.containerPos = containerInfo.containerPos;
        if (containerInfo.sourceId != undefined) {
            mission.sourceId = containerInfo.sourceId;
        }

        return createMission(mission);
    },

    createLinkHarvestMission(from, containerInfo) {
        let mission = new Map();
        mission.name = constants.LINK_HARVEST_MISSION;
        mission.fromRoom = from;
        mission.linkId = containerInfo.linkId;
        mission.linkPos = containerInfo.linkPos;
        mission.sourceId = containerInfo.sourceId;

        return createMission(mission);
    },

    createReserveControllerMission(from, controllerId, controllerPos) {
        let mission = new Map();
        mission.name = constants.RESERVE_CONTROLLER_MISSION;
        mission.fromRoom = from;
        mission.controllerId = controllerId;
        mission.controllerPos = controllerPos;

        return createMission(mission);
    },

    createRemoteRoomHarvestMission(from, containers, controllerId, controllerPos) {
        let mission = new Map();
        mission.name = constants.REMOTE_ROOM_HARVEST_MISSION;
        mission.fromRoom = from;
        mission.containers = containers;
        mission.controllerId = controllerId;
        mission.controllerPos = controllerPos;
        mission.targetRoom = controllerPos.roomName;

        return createMission(mission);
    },

    createSelfRoomHarvestMission(from) {
        let mission = new Map();
        mission.name = constants.SELF_ROOM_HARVEST_MISSION;
        mission.fromRoom = from;

        return createMission(mission);
    },

    createCargoMission(from, containerInfo, minCargoTTL) {
        let mission = new Map();
        mission.name = constants.CARGO_MISSION;
        mission.fromRoom = from;
        mission.containerId = containerInfo.containerId;
        mission.containerPos = containerInfo.containerPos;
        mission.timeToGo = containerInfo.times == 0 ? 0 : containerInfo.timeToGo / containerInfo.times;
        mission.minCargoTTL = minCargoTTL;
        if (containerInfo.sourceId != undefined) {
            mission.sourceId = containerInfo.sourceId;
        }

        return createMission(mission);
    },

    createRoomHarvestManagerMission(from) {
        let mission = new Map();
        mission.name = constants.ROOM_HARVEST_MANAGER_MISSION;
        mission.fromRoom = from;

        return createMission(mission);
    },

    createRepairRoadsMission(from, pos) {
        let mission = new Map();
        mission.name = constants.REPAIR_ROADS_MISSION;
        mission.fromRoom = from;
        mission.pos = pos;

        return createMission(mission);
    },

    createDefendRemoteRoomMission(from, toDefend) {
        let mission = new Map();
        mission.name = constants.DEFEND_REMOTE_ROOM_MISSION;
        mission.fromRoom = from;
        mission.targetRoom = toDefend;

        return createMission(mission);
    },

    createRoomManagerMission(from) {
        let mission = new Map();
        mission.name = constants.ROOM_MANAGER_MISSION;
        mission.fromRoom = from;

        return createMission(mission);
    },

    createSimpleLinkControllerUpgradeMission(from, controllerId, linkId) {
        let mission = new Map();
        mission.name = constants.SIMPLE_LINK_CONTROLLER_UPGRADE_MISSION;
        mission.fromRoom = from;
        mission.controllerId = controllerId;
        mission.linkId = linkId;

        return createMission(mission);
    },

    createBoostedLinkControllerUpgradeMission(from, controllerId, linkId) {
        let mission = new Map();
        mission.name = constants.BOOSTED_LINK_CONTROLLER_UPGRADE_MISSION;
        mission.fromRoom = from;
        mission.controllerId = controllerId;
        mission.linkId = linkId;

        return createMission(mission);
    },

    createControllerUpgradeManagerMission(from) {
        let mission = new Map();
        mission.name = constants.CONTROLLER_UPGRADE_MANAGER_MISSION;
        mission.fromRoom = from;

        return createMission(mission);
    },

    createProduceMineralMission(from, mineralType, neededAmount) {
        let mission = new Map();
        mission.name = constants.PRODUCE_MINERAL_MISSION;
        mission.fromRoom = from;
        mission.mineralType = mineralType;
        mission.neededAmount = neededAmount;

        return createMission(mission);
    },

    createWaitMineralMission(from, mineralType, neededAmount) {
        let mission = new Map();
        mission.name = constants.WAIT_MINERAL_MISSION;
        mission.fromRoom = from;
        mission.mineralType = mineralType;
        mission.neededAmount = neededAmount;

        return createMission(mission);
    },

    createCreateMineralMission(from, mineralType, neededAmount) {
        let mission = new Map();
        mission.name = constants.CREATE_MINERAL_MISSION;
        mission.fromRoom = from;
        mission.mineralType = mineralType;
        mission.neededAmount = neededAmount;

        return createMission(mission);
    },

    createClearLabsMission(from) {
        let mission = new Map();
        mission.name = constants.CLEAR_LABS_MISSION;
        mission.fromRoom = from;

        return createMission(mission);
    },

    createLabsManagerMission(from) {
        let mission = new Map();
        mission.name = constants.LABS_MANAGER_MISSION;
        mission.fromRoom = from;

        return createMission(mission);
    },

    createTerminalManagerMission(from) {
        let mission = new Map();
        mission.name = constants.TERMINAL_MANAGER_MISSION;
        mission.fromRoom = from;

        return createMission(mission);
    },

    createTerminalCargoMission(from, amount, fromId, toId) {
        let mission = new Map();
        mission.name = constants.TERMINAL_CARGO_MISSION;
        mission.fromRoom = from;
        mission.amount = amount;
        mission.fromId = fromId;
        mission.toId = toId;

        return createMission(mission);
    }
};

let createMission = function(mission) {
    let currentId = Memory.missions.currentMissionId;
    Memory.missions[currentId] = mission;
    Memory.missions.currentMissionId += 1;
    return currentId;
};