module.exports = {
    run() {
        for (var pos in Game.spawns.Base.memory.roadsToCreatePos) {
            var roadPos = Game.spawns.Base.memory.roadsToCreatePos[pos];
            Game.spawns.Base.room.createConstructionSite(roadPos.x, roadPos.y, STRUCTURE_ROAD);
        }
        
        Game.spawns.Base.memory.roadsToCreatePos = new Array();
        
        var roads = Game.spawns.Base.room.find(FIND_STRUCTURES, {
            filter: { structureType: STRUCTURE_ROAD }
        });
        
        for (var pos in roads) {
            var road = roads[pos];
            if (road.ticksToDecay <= 5) {
                Game.spawns.Base.memory.roadsToCreatePos.push(road.pos);
                road.destroy();
            }
        }
    }
};

var find = function(list, value) {
    for (var i = 0; i < list.length; i++) {
        listValue = list[i];
        if (listValue == value) {
            return true;
        }
    }
    return false;
}