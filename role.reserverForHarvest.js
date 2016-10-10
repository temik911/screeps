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
            if(creep.room.controller) {
                if(creep.reserveController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                    var room = creep.room;
                    var controllerPos = creep.room.controller.pos;
                    var pos;
                    var wall = true;
                    for (var dx = -1; dx <= 1; dx++) {
                        for (var dy = -1; dy <= 1; dy++) {
                            pos = new RoomPosition(controllerPos.x + dx, controllerPos.y + dy, room.name);
                            wall = Game.map.getTerrainAt(pos) == "wall";
                            if (!wall) {
                                dy = 10;
                            }
                        }
                        if (!wall) {
                            dx = 10;
                        }
                    }
                    
                    creep.moveTo(pos.x, pos.y, {maxRooms: 1});
                }
            }
        } else {
            creep.moveTo(flag);
        }
    }
};