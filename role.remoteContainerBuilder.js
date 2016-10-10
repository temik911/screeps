var harvestUtils = require('HarvestUtils');
require('RoomInfo');

module.exports = {
    run(creep) {
        if (creep.memory.targetId == undefined) {
            creep.memory.targetId = false;
        }

        var numb = creep.memory.numb;
        var flagPrefix = creep.memory.flagPrefix;
        var flags = [];
        for (var flagName in Game.flags) {
            if (flagName.startsWith(flagPrefix)) {
                var flagInfo = flagName.split('-');
                var sourcesCount = 0;
                for (var q in flagInfo) {
                    var info = flagInfo[q];
                    if (info.startsWith('sources')) {
                        sourcesCount = info.split(':')[1]
                    }
                }
                for (var i = 0; i < sourcesCount; i++) {
                    flags.push(Game.flags[flagName])
                }
            }
        }
        var flag = flags[numb % flags.length];

        if (creep.room == flag.room) {
            if (creep.memory.needEnergy == true) {
                harvestUtils.harvestFromNearestSource(creep);

                if (creep.carry.energy == creep.carryCapacity) {
                    creep.memory.needEnergy = false;
                }
            } else {
                var target = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES);
                if (target) {
                    if (creep.build(target) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(target, {maxRooms: 1});
                    }
                } else {
                    creep.suicide();
                    flag.remove()
                }

                if (creep.carry.energy == 0) {
                    creep.memory.needEnergy = true;
                }
            }
        } else {
            creep.moveTo(flag);
        }
    }
};