require('RoomInfo');

module.exports = {
    createCargoBody(roomName) {
        let carryBodies = [];
        let moveBodies = [];
        let currentCost = 0;
        let currentBodiesPart = 0;
        let maxCost = Game.rooms[roomName].energyCapacityAvailable / 2;
        maxCost = maxCost < 1200 ? 1200 : maxCost;
        while ((currentCost + 150 <= maxCost) && (currentBodiesPart + 3 <= 48)) {
            carryBodies.push(CARRY);
            carryBodies.push(CARRY);
            moveBodies.push(MOVE);
            currentCost += 150;
            currentBodiesPart += 3;
        }
        if (currentBodiesPart == 48 && currentCost + 100 <= maxCost) {
            carryBodies.push(CARRY);
            moveBodies.push(MOVE);
        }
        return (_(carryBodies).concat(moveBodies)).value();
    },

    createSimpleLinkControllerUpgraderBody(roomName) {
        let room = Game.rooms[roomName];
        if (room.controller.level == 8) {
            return [WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK,
                MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,
                CARRY, CARRY, CARRY, CARRY];
        } else {
            let bodies = [CARRY, CARRY, CARRY, CARRY];
            let currentCost = 200;
            let currentBodiesPart = 4;
            let maxCost = room.energyCapacityAvailable;
            while ((currentCost + 250 < maxCost) && (currentBodiesPart + 3 < 35)) {
                bodies.push(WORK);
                bodies.push(WORK);
                bodies.push(MOVE);
                currentCost += 250;
                currentBodiesPart += 3;
            }
            return bodies;
        }
    },

    createTerminalCargoBody(roomName) {
        let room = Game.rooms[roomName];
        let bodies = [];
        let currentCost = 0;
        let currentBodiesPart = 0;
        let maxCost = room.energyCapacityAvailable / 2;
        while ((currentCost + 150 < maxCost) && (currentBodiesPart + 3 < 31)) {
            bodies.push(MOVE);
            bodies.push(CARRY);
            bodies.push(CARRY);
            currentCost += 150;
            currentBodiesPart += 3;
        }
        return bodies;
    },

    createLabHelperBody() {
        return [MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY];
    }
};