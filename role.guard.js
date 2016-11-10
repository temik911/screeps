require('RoomInfo');

module.exports = {
    run(creep) {
        let numb = creep.memory.numb;
        let flagPrefix = creep.memory.flagPrefix;
        let flags = [];
        for (let flagName in Game.flags) {
            if (flagName.startsWith(flagPrefix)) {
                flags.push(Game.flags[flagName])
            }
        }
        let flag = flags[numb % flags.length];

        if (creep.room == flag.room) {
            let target = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
            if (target) {
                if (target.owner.username == 'Vervorris') {
                    // do nothing
                } else {
                    if (creep.attack(target) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(target);
                    }
                }
            } else {
                creep.moveTo(25, 25);
            }
        } else {
            creep.moveTo(flag);
        }
    }
};