let constants = require('Constants');
let bodyUtils = require('BodyUtils');
let missionsUtils = require('MissionsUtils');
let harvestMission = require('Mission.Sub.Harvest');
let linkHarvestMission = require('Mission.Sub.LinkHarvest');
let cargoMission = require('Mission.Sub.Cargo');

module.exports = {
    run(missionNumb) {
        let mission = Memory.missions[missionNumb];

        if (mission.childMissions == undefined) {
            mission.childMissions = [];
        }

        if (mission.minCargoTTL == undefined) {
            mission.minCargoTTL = 9999;
        }

        let linkCount = 0;

        if (mission.sources == undefined) {
            mission.sources = new Map();
            let sources = Game.rooms[mission.fromRoom].find(FIND_SOURCES);
            for (let i in sources) {
                let source = sources[i];
                let links = source.pos.findInRange(FIND_STRUCTURES, 2, {
                    filter: (structure) => structure.structureType == STRUCTURE_LINK
                });
                if (links.length != 0) {
                    let linkInfo = new Map();
                    linkInfo.sourceId = source.id;
                    linkInfo.linkId = links[0].id;
                    linkInfo.linkPos = links[0].pos;
                    mission.sources[source.id] = linkInfo;
                } else {
                    let containers = source.pos.findInRange(FIND_STRUCTURES, 1, {
                        filter: (structure) => structure.structureType == STRUCTURE_CONTAINER
                    });
                    if (containers.length != 0) {
                        let containerInfo = new Map();
                        containerInfo.sourceId = source.id;
                        containerInfo.containerId = containers[0].id;
                        containerInfo.containerPos = containers[0].pos;
                        mission.sources[source.id] = containerInfo;
                    }
                }
            }
        }

        for (let i in mission.sources) {
            mission.sources[i].currentCreepTTL = -1;
            mission.sources[i].currentCargoMissions = 0;
        }

        mission.childMissions = _.without(mission.childMissions, null);

        for (let i in mission.childMissions) {
            try {
                let missionId = mission.childMissions[i];

                if (missionId == null) {
                    continue;
                }

                let childMission = Memory.missions[missionId];

                if (childMission.isDone == true) {
                    delete(Memory.missions[missionNumb].childMissions[i]);
                    delete(Memory.missions[missionId]);
                } else {
                    if (childMission.name == constants.HARVEST_MISSION) {
                        harvestMission.run(missionId);
                        if (childMission.timeToGo != undefined) {
                            mission.sources[childMission.sourceId].timeToGo += childMission.timeToGo;
                            mission.sources[childMission.sourceId].times += 1;
                            childMission.timeToGo = undefined;
                        }
                        if (childMission.currentCreepTTL > mission.sources[childMission.sourceId].currentCreepTTL) {
                            mission.sources[childMission.sourceId].currentCreepTTL = childMission.currentCreepTTL;
                        }
                    } else if (childMission.name == constants.CARGO_MISSION) {
                        cargoMission.run(missionId);
                        if (childMission.isCargo == false) {
                            mission.sources[childMission.sourceId].currentCargoMissions += 1;
                        }
                    } else if (childMission.name == constants.LINK_HARVEST_MISSION) {
                        linkCount++;
                        linkHarvestMission.run(missionId);
                        if (childMission.timeToGo != undefined) {
                            mission.sources[childMission.sourceId].timeToGo += childMission.timeToGo;
                            mission.sources[childMission.sourceId].times += 1;
                            childMission.timeToGo = undefined;
                        }
                        if (childMission.currentCreepTTL > mission.sources[childMission.sourceId].currentCreepTTL) {
                            mission.sources[childMission.sourceId].currentCreepTTL = childMission.currentCreepTTL;
                        }
                    }
                }
            } catch (e) {
                console.log(e.stack);
            }
        }

        checkHarvesters(mission);
        checkCargo(mission);
    }
};

let checkCargo = function (mission) {
    let cargoAmountPerMission = 0;
    _.forEach(bodyUtils.createCargoBody(mission.fromRoom), function(body) {
        if (body == CARRY) {
            cargoAmountPerMission += 50;
        }
    });

    for (let i in mission.sources) {
        let sourceInfo = mission.sources[i];

        if (sourceInfo.containerId != undefined) {
            if (sourceInfo.currentAmount == undefined) {
                sourceInfo.currentAmount = 0;
            }

            let container = Game.getObjectById(sourceInfo.containerId);
            if (container != null) {
                sourceInfo.currentAmount = container.store[RESOURCE_ENERGY];
            }

            let timeToGo = sourceInfo.times == 0 ? 0 : sourceInfo.timeToGo / sourceInfo.times;

            if (sourceInfo.times != 0) {
                if (mission.minCargoTTL > timeToGo * 2) {
                    mission.minCargoTTL = timeToGo * 2;
                }
            }

            let availableAmount = sourceInfo.currentAmount - cargoAmountPerMission * sourceInfo.currentCargoMissions;
            if (availableAmount >= 0) {
                if (availableAmount + 12 * timeToGo >= cargoAmountPerMission) {
                    mission.childMissions.push(missionsUtils.createCargoMission(mission.fromRoom, sourceInfo, mission.minCargoTTL));
                }
            }
        }
    }
};

let checkHarvesters = function (mission) {
    for (let i in mission.sources) {
        let sourceInfo = mission.sources[i];

        if (sourceInfo.timeToGo == undefined) {
            sourceInfo.timeToGo = 0;
            sourceInfo.times = 0;
        }

        let timeToGo = sourceInfo.times == 0 ? 0 : sourceInfo.timeToGo / sourceInfo.times;
        if (sourceInfo.containerId != undefined) {
            let links = Game.getObjectById(sourceInfo.sourceId).pos.findInRange(FIND_STRUCTURES, 2, {
                filter: (structure) => structure.structureType == STRUCTURE_LINK
            });
            if (links.length != 0) {
                let linkInfo = new Map();
                linkInfo.sourceId = sourceInfo.sourceId;
                linkInfo.linkId = links[0].id;
                linkInfo.linkPos = links[0].pos;
                mission.sources[sourceInfo.sourceId] = linkInfo;
            } else {
                let timeToCreateCreep = 30;
                if (sourceInfo.currentCreepTTL <= (timeToCreateCreep + timeToGo)) {
                    mission.childMissions.push(missionsUtils.createHarvestMission(mission.fromRoom, sourceInfo));
                }
            }
        } else {
            let timeToCreateCreep = 42;
            if (sourceInfo.currentCreepTTL <= (timeToCreateCreep + timeToGo)) {
                mission.childMissions.push(missionsUtils.createLinkHarvestMission(mission.fromRoom, sourceInfo));
            }
        }
    }
};
