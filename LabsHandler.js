let utils = require('Utils');

module.exports = {
    run(room) {
        let labs = room.stats().labs;
        if (labs.length < 6) {
            return;
        }

        if (room.memory.clearLabs == undefined) {
            room.memory.clearLabs = false;
        }

        if (room.memory.lab1 == undefined) {
            let lab = getLab(room, 1);
            if (lab != undefined) {
                room.memory.lab1 = lab.id;
            } else {
                return;
            }
        }
        if (room.memory.lab2 == undefined) {
            let lab = getLab(room, 2);
            if (lab != undefined) {
                room.memory.lab2 = lab.id;
            } else {
                return;
            }
        }

        if (room.memory.lab1_resource == undefined || room.memory.lab2_resource == undefined) {
            return;
        }

        if (room.memory.clearLabs) {
            return;
        }

        let lab1 = Game.getObjectById(room.memory.lab1);
        let lab2 = Game.getObjectById(room.memory.lab2);

        let mineral1 = room.memory.lab1_resource;
        let mineral2 = room.memory.lab2_resource;

        if (mineral1 != lab1.mineralType || mineral2 != lab2.mineralType) {
            for (let labName in labs) {
                let lab = labs[labName];
                if ((lab1.id == lab.id && mineral1 == lab1.mineralType) ||
                    (lab2.id == lab.id && mineral2 == lab2.mineralType)) {
                    continue;
                }
                if (lab.mineralAmount != 0) {
                    room.memory.clearLabs = true;
                    return;
                }
            }
        }


        if (lab1.mineralAmount > 0 && lab2.mineralAmount > 0) {
            for (let labName in labs) {
                let lab = labs[labName];
                if (lab.id != lab1.id && lab.id != lab2.id) {
                    if (lab.cooldown == 0) {
                        lab.runReaction(lab1, lab2);
                    }
                }
            }
        }
    }
};

let getLab = function(room, numb) {
    let labFlagName = room.name + "-Lab-center-" + numb;
    for (let flagName in Game.flags) {
        if (flagName.startsWith(labFlagName)) {
            let labFlag = Game.flags[flagName];
            let labPosition = labFlag.pos;
            let lab = room.lookForAt(LOOK_STRUCTURES, labPosition);
            labFlag.remove();
            return lab[0];
        }
    }
    return undefined;
};