module.exports = {
    renewCreep() {
        var spawn = Game.spawns.Base;

        var creeps = spawn.room.find(FIND_MY_CREEPS, {
            filter: (creep) => creep.ticksToLive < 1000
        });
        for (var name in creeps) {
            spawn.renewCreep(creeps[name]);
        }
    }
};
