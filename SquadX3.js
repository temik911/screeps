let constants = require('Constants');
require('RoomInfo');

module.exports = {
    run(squad) {
        let healer = undefined;
        let healer2 = undefined;
        let attack = undefined;

        for (let index in squad) {
            let creep = squad[index];
            if (creep.memory.role == constants.SQUAD_HEALER) {
                healer = creep;
                console.log("lol")
            } else if (creep.memory.role == constants.SQUAD_ATTACK) {
                attack = creep;
                console.log("lol1")
            } else if (creep.memory.role == constants.SQUAD_HEALER_SECOND) {
                healer2 = creep;
                console.log("lol2")
            }
        }

        if (attack == undefined || healer == undefined || healer2 == undefined) {
            return;
        }

        if (!attack.memory.prepared) {
            let flag = Game.flags[attack.memory.roomName + "-prepareAttack"];
            if (flag != undefined) {
                if (!attack.pos.isNearTo(flag.pos)) {
                    attack.moveTo(flag.pos);
                    healer.moveTo(flag.pos);
                    healer2.moveTo(flag.pos);
                } else {
                    if (attack.pos.isNearTo(healer.pos) && attack.pos.isNearTo(healer2.pos)) {
                        attack.memory.prepared = true;
                    } else {
                        healer.moveTo(flag.pos);
                        healer2.moveTo(flag.pos);
                    }
                }
            }
        } else {
            if (attack.room != healer.room || attack.room != healer2.room) {
                let flag = Game.flags[attack.memory.roomName + "-targetRampart"];
                if (flag != undefined) {
                    if (!attack.pos.isNearTo(flag.pos)) {
                        attack.moveTo(flag.pos);
                        healer.moveTo(flag.pos);
                        healer2.moveTo(flag.pos);
                    }
                }
            } else {
                if (attack.pos.isNearTo(healer.pos) && attack.pos.isNearTo(healer2.pos)) {
                    let flag = undefined;
                    for (let flagName in Game.flags) {
                        if (flagName.startsWith(attack.memory.roomName + "-targetRampart")) {
                            flag = Game.flags[flagName];
                            break;
                        }
                    }
                    let attackLossHP = attack.hitsMax - attack.hits;
                    let healerLossHP = healer.hitsMax - healer.hits;
                    let healer2LossHP = healer2.hitsMax - healer2.hits;
                    let toHeal = undefined;
                    if (attackLossHP >= healerLossHP && attackLossHP >= healer2LossHP) {
                        toHeal = attack;
                    } else if (healerLossHP >= healer2LossHP) {
                        toHeal = healer;
                    } else {
                        toHeal = healer2;
                    }
                    if (flag != undefined) {
                        if (!attack.pos.isNearTo(flag.pos)) {
                            if (attack.fatigue == 0 && healer.fatigue == 0 && healer2.fatigue == 0) {
                                attack.moveTo(flag.pos);
                                healer.moveTo(flag.pos);
                                healer2.moveTo(flag.pos);
                            }
                            healer.heal(toHeal);
                            healer2.heal(toHeal);
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
                            healer.heal(toHeal);
                            healer2.heal(toHeal);
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

                        if (target == null) {
                            target = attack.pos.findClosestByPath(FIND_HOSTILE_STRUCTURES, {
                                filter: structure => structure.structureType == STRUCTURE_TOWER
                            });
                        }

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
                                if (attack.fatigue == 0 && healer.fatigue == 0 && healer2.fatigue == 0) {
                                    attack.moveTo(target);
                                    healer.moveTo(target);
                                    healer2.moveTo(target);
                                }
                                healer.heal(toHeal);
                                healer2.heal(toHeal);
                            }
                        }
                    }
                } else {
                    healer.moveTo(attack.pos, {reusePath: 0});
                    healer2.moveTo(attack.pos, {reusePath: 0});
                    if (healer.heal(attack) == ERR_NOT_IN_RANGE) {
                        healer.heal(healer);
                    }
                    if (healer2.heal(attack) == ERR_NOT_IN_RANGE) {
                        healer2.heal(healer2);
                    }
                }
            }
        }
    }
};