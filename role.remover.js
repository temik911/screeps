module.exports = {
    run(creep) {
        if (creep.memory.currentWall == undefined) {
            creep.memory.currentWall = 0;
        }
        
        let flag = Game.flags['RemoveWall-' + creep.memory.currentWall];
        
        if (flag == undefined) {
            return;
        }
        
        if (creep.room.name == flag.pos.roomName) {
            let found = flag.pos.lookFor(LOOK_STRUCTURES);
            if(found.length) {
                let toRemove = found[0];
                let result = creep.dismantle(toRemove);
                if (result == ERR_NOT_IN_RANGE) {
                    let moveResult = creep.moveTo(toRemove);
                    if (moveResult == ERR_NO_PATH) {
                        creep.memory.currentWall++;
                    }
                } 
            } else {
                flag.remove();
                creep.memory.currentWall++;
            }
        } else {
            creep.moveTo(flag);
        }
    }
};