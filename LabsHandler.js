module.exports = {
    run(room) {
        let labs = room.stats().labs;
        if (labs.length < 6) {
            return;
        }
        if (room.memory.lab1 == undefined) {
            let lab = getLab(room, 1);
            if (lab != undefined) {
                room.memory.lab1 = lab.id;
            }
        }
        if (room.memory.lab2 == undefined) {
            let lab = getLab(room, 2);
            if (lab != undefined) {
                room.memory.lab2 = lab.id;
            }
        }

        let lab1 = Game.getObjectById(room.memory.lab1);
        let lab2 = Game.getObjectById(room.memory.lab2);

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