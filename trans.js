let missionsUtils = require('MissionsUtils');
let constants = require('Constants');

module.exports = {
    run() {
        for (let i in Memory.missions) {
            let mission = Memory.missions[i];
            if (mission.name == undefined) {
                delete(Memory.missions[i]);
            }
        }
    }
};