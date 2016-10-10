require('RoomInfo');

module.exports = {
    run(creep) {
        var numb = creep.memory.numb;
        var flagPrefix = creep.memory.flagPrefix;
        var flags = [];
        for (var flagName in Game.flags) {
            if (flagName.startsWith(flagPrefix)) {
                flags.push(Game.flags[flagName])
            }
        }
        var flag = flags[numb % flags.length];

        if (creep.room == flag.room) {
            var target = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
            if (target) {
                if (creep.attack(target) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target);
                }
            } else {
                creep.moveTo(25, 25);
            }
        } else {
            creep.moveTo(flag);
        }
    }
};