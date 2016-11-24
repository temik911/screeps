let constants = require('Constants');
require('RoomInfo');

module.exports = {
    run(squad) {
        let healer = undefined;
        let attack = undefined;

        for (let index in squad) {
            let creep = squad[index];
            if (creep.memory.role == constants.SQUAD_HEALER) {
                healer = creep;
            } else if (creep.memory.role == constants.SQUAD_ATTACK) {
                attack = creep;
            }
        }

        if (healer == undefined || attack == undefined) {
            return;
        }

        attack.memory.roomName='E39S52';

        if (!attack.memory.prepared) {
            let flag = Game.flags[attack.memory.roomName + "-prepareAttack"];
            if (flag != undefined) {
                if (!attack.pos.isNearTo(flag.pos)) {
                    attack.moveTo(flag.pos);
                    healer.moveTo(flag.pos);
                } else {
                    attack.memory.prepared = true;
                }
            }
        } else {
            if (attack.room != healer.room) {
                let flag = Game.flags[attack.memory.roomName + "-targetRampart"];
                if (flag != undefined) {
                    if (!attack.pos.isNearTo(flag.pos)) {
                        attack.moveTo(flag.pos);
                        healer.moveTo(flag.pos);
                    }
                }
            } else {
                if (attack.pos.isNearTo(healer.pos)) {
                    let flag = Game.flags[attack.memory.roomName + "-targetRampart"];
                    if (flag != undefined) {
                        if (!attack.pos.isNearTo(flag.pos)) {
                            attack.moveTo(flag.pos);
                            healer.moveTo(flag.pos);
                            if ((attack.hitsMax - attack.hits) >= (healer.hitsMax - healer.hits)) {
                                console.log("heal attack");
                                healer.heal(attack);
                            } else {
                                console.log("heal healer");
                                healer.heal(healer);
                            }
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
                            if ((attack.hitsMax - attack.hits) >= (healer.hitsMax - healer.hits)) {
                                healer.heal(attack);
                            } else {
                                healer.heal(healer);
                            }
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
                                    structure.structureType != STRUCTURE_RAMPART
                            });
                        }

                        if (target == null) {
                            target = attack.pos.findClosestByPath(FIND_HOSTILE_CREEPS);
                        }

                        if (target != null) {
                            if (attack.attack(target) == ERR_NOT_IN_RANGE) {
                                attack.moveTo(target);
                                healer.moveTo(target);
                                if ((attack.hitsMax - attack.hits) >= (healer.hitsMax - healer.hits)) {
                                    healer.heal(attack);
                                } else {
                                    healer.heal(healer);
                                }
                            }
                        }
                    }
                } else {
                    healer.moveTo(attack.pos, {reusePath: 0});
                    if (healer.heal(attack) == ERR_NOT_IN_RANGE) {
                        healer.heal(healer);
                    }
                }
            }
        }
    }
};