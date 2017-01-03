let constants = require('Constants');
require('RoomInfo');

module.exports = {
    run(squad) {
        let attack = undefined;

        for (let index in squad) {
            let creep = squad[index];
            if (creep.memory.role == constants.SQUAD_ATTACK) {
                attack = creep;
            }
        }

        if (attack == undefined) {
            return;
        }

        if (!attack.memory.prepared) {
            let flag = Game.flags[attack.memory.roomName + "-prepareAttack"];
            if (flag != undefined) {
                if (!attack.pos.isNearTo(flag.pos)) {
                    attack.moveTo(flag.pos);
                } else {
                    attack.memory.prepared = true;
                }
            }
        } else {
            let flag = Game.flags[attack.memory.roomName + "-targetRampart"];
            if (flag != undefined) {
                if (!attack.pos.isNearTo(flag.pos)) {
                    attack.moveTo(flag.pos);
                } else {
                    let target = undefined;
                    let hostilesCreeps = attack.room.stats().hostilesCreeps;
                    for (let index in hostilesCreeps) {
                        let hostile = hostilesCreeps[index];
                        if (attack.pos.isNearTo(hostile.pos)) {
                            target = hostile;
                            break;
                        }
                    }

                    if (target == undefined) {
                        target = attack.room.lookForAt(LOOK_STRUCTURES, flag.pos.x, flag.pos.y)[0];
                        if (target == undefined) {
                            flag.remove();
                        }
                    }

                    attack.attack(target);
                }
            } else {
                let target = attack.pos.findClosestByPath(FIND_HOSTILE_STRUCTURES, {
                    filter: structure => structure.structureType == STRUCTURE_TOWER
                });

                if (target == null) {
                    target = attack.pos.findClosestByPath(FIND_HOSTILE_STRUCTURES, {
                        filter: structure => structure.structureType == STRUCTURE_SPAWN
                    });
                }

                if (target == null) {
                    target = attack.pos.findClosestByPath(FIND_HOSTILE_STRUCTURES, {
                        filter: structure => structure.structureType == STRUCTURE_EXTENSION
                    });
                }

                if (target == null) {
                    target = attack.pos.findClosestByPath(FIND_HOSTILE_STRUCTURES, {
                        filter: structure => structure.structureType != STRUCTURE_WALL &&
                        structure.structureType != STRUCTURE_RAMPART && structure.structureType != STRUCTURE_CONTROLLER
                    });
                }


                if (target == null) {
                    target = attack.pos.findClosestByPath(FIND_HOSTILE_CREEPS);
                }

                if (target == null) {
                    target = attack.pos.findClosestByPath(FIND_STRUCTURES, {
                        filter: structure => structure.structureType == STRUCTURE_CONTAINER
                    });
                }

                if (target == null) {
                    target = attack.pos.findClosestByPath(FIND_STRUCTURES, {
                        filter: structure => structure.structureType == STRUCTURE_ROAD
                    });
                }

                console.log(target);

                if (target != null) {
                    if (attack.attack(target) == ERR_NOT_IN_RANGE) {
                        attack.moveTo(target);
                    }
                }
            }
        }
    }
};