/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('123');
 * mod.thing == 'a thing'; // true
 */

module.exports = {
    run() {

        for (let i in Memory.missions) {
            if (Memory.missions[i].isDone === true) {
                delete(Memory.missions[i])
            }
        }
        
        for (let i in Memory.rooms['E42S62'].missionCreepsRequests) {
            let request = Memory.rooms['E42S62'].missionCreepsRequests[i];
            if (_.size(request.body) == 22) {
                delete(Memory.rooms['E42S62'].missionCreepsRequests[i]);
            }
        }

        // Memory.rooms['E42S62'].missionCreepsRequests[69656].body = [MOVE, CARRY, CARRY, MOVE, CARRY, CARRY, MOVE, CARRY, CARRY]

        // Game.getObjectById('58811b53233e4fa461ba107e').createCreep([CARRY,CARRY,MOVE,MOVE], null, {role: 'baseEnergySupport', isSupport: false});

        // require('MissionsUtils').createDismantleRoomMission('E42S58', 'E41S61', true);

        // for (let flagName in Game.flags) {
        //     if (flagName.startsWith('flag')) {
        //         Game.flags[flagName].remove();
        //     }
        // }

        // Memory.missions[65684].childMissions.push(require('MissionsUtils').createPrepareRemoteHarvestMission('E42S62', 'E41S61'));

        // delete(Memory.rooms['E44S57'].remoteContainers['585a7427296c4f8e024b1c06']);
        // delete(Memory.rooms['E44S57'].remoteControllers['579fa9e00700be0674d3009b']);
        // delete(Memory.rooms['E44S57'].remoteRooms['E44S58']);
        //
        // Memory.missions[202].childMissions.push(require('MissionsUtils').createRemoteRoomHarvestMission(
        //     'E44S57',
        //     {
        //         '5866f0714ed626085969c779' : {
        //             containerId : '5866f0714ed626085969c779',
        //             containerPos : {
        //                 x : 15,
        //                 y : 10,
        //                 roomName : 'E43S58'
        //             }
        //         }
        //     },
        //     '579fa9dd0700be0674d30039',
        //     {
        //         x : 10,
        //         y : 21,
        //         roomName : 'E43S58'
        //     }
        // ));
        //
        // Memory.missions[202].containers.push({
        //     containerId : '5866f0714ed626085969c779',
        //     containerPos : {
        //         x : 15,
        //         y : 10,
        //         roomName : 'E43S58'
        //     }
        // });
        //
        // Memory.missions[65687].sources = undefined;
        // Memory.missions[202].containers = _.without(Memory.missions[202].containers, null);

        // require('MissionsUtils').createRoomManagerMission('E42S62');

        // delete(Memory.missions[18]);

        // Memory.missions[65688].isDone = true;
        // Memory.missions[65689].isDone = true;

        // Memory.missions[202].containers.push({
        //                 containerId : '585a7427296c4f8e024b1c06',
        //                 containerPos : {
        //                     x : 34,
        //                     y : 26,
        //                     roomName : 'E44S58'
        //                 }
        //             });

        // Memory.missions[786].containers = {};
        // Memory.missions[786].containers['586db86a2a843d204aaee099'] = {containerId:'586db86a2a843d204aaee099', containerPos:{
        //     x : 25,
        //     y : 10,
        //     roomName : 'E41S59'
        // }};
        // Memory.missions[786].containers['586de3ef19e6b82a364f41d2'] = {containerId:'586de3ef19e6b82a364f41d2', containerPos:{
        //     x : 16,
        //     y : 35,
        //     roomName : 'E41S59'
        // }};

        if (Memory.marketSystem.audit == undefined) {
            Memory.marketSystem.audit = new Map();
            Memory.marketSystem.audit.lastProcessedOrder = -1;
            Memory.marketSystem.audit.byMineral = new Map();
            Memory.marketSystem.audit.byRoom = new Map();
            
        }
        
        // for (let i in Memory.marketSystem.processedOrders) {
        //     if (parseInt(i) <= 690) {
        //         delete(Memory.marketSystem.processedOrders[i]); 
        //     }
        // }
        
        
        for (let i in Memory.marketSystem.processedOrders) {
            if (parseInt(i) > parseInt(Memory.marketSystem.audit.lastProcessedOrder)) {
                let order = Memory.marketSystem.processedOrders[i]; 
                
                let current = Memory.marketSystem.audit.byMineral[order.mineralType];
                if (current == undefined) {
                    current = new Map();
                    current['amount'] = 0;
                    current['transactionCost'] = 0;
                    current['cost'] = 0;
                    current['count'] = 0;
                    Memory.marketSystem.audit.byMineral[order.mineralType] = current;
                }
                
                let currentByRoom = Memory.marketSystem.audit.byRoom[order.roomName];
                if (currentByRoom == undefined) {
                    currentByRoom = new Map();
                    Memory.marketSystem.audit.byRoom[order.roomName] = currentByRoom;
                }
                
                let currentByRoomByMineral = currentByRoom[order.mineralType];
                if (currentByRoomByMineral == undefined) {
                    currentByRoomByMineral = new Map();
                    currentByRoomByMineral['amount'] = 0;
                    currentByRoomByMineral['transactionCost'] = 0;
                    currentByRoomByMineral['cost'] = 0;
                    currentByRoomByMineral['count'] = 0;
                    currentByRoom[order.mineralType] = currentByRoomByMineral;
                }
                
                
                if (order.filledPart != null && order.filledPart != undefined && order.transactionCost != null && order.transactionCost != undefined && order.cost != null && order.cost != undefined) {
                    current['amount'] += order.filledPart;
                    current['transactionCost'] += order.transactionCost;
                    current['cost'] += order.cost;
                    current['count'] += 1;
                    
                    currentByRoomByMineral['amount'] += order.filledPart;
                    currentByRoomByMineral['transactionCost'] += order.transactionCost;
                    currentByRoomByMineral['cost'] += order.cost;
                    currentByRoomByMineral['count'] += 1;
                }
                Memory.marketSystem.audit.lastProcessedOrder = i;
            }
        }
    }
};