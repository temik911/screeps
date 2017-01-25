let dismantleRoomMission = require('Mission.DismantleRoom');
let roomManagerMission = require('Mission.RoomManager');
let constants = require('Constants');

module.exports = {
    run() {
        if (Memory.missions === undefined) {
            Memory.missions = new Map();
            Memory.missions.currentMissionId = 0;
        }

        for (let missionNumb in Memory.missions) {

            if (missionNumb == 'null' || missionNumb == 'undefined' || missionNumb == 'NaN') {
                delete(Memory.missions[missionNumb]);
            } else {
                let mission = Memory.missions[missionNumb];
                try {
                    if (mission.name === constants.DISMANTLE_ROOM_MISSION) {
                        dismantleRoomMission.run(missionNumb);
                    } else if (mission.name == constants.ROOM_MANAGER_MISSION) {
                        roomManagerMission.run(missionNumb);
                    }
                } catch (e) {
                    console.log(mission.name + "-" + missionNumb + ": " + e.stack);
                }
            }
        }

    }
};