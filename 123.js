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
        if (Memory.marketSystem.audit == undefined) {
            Memory.marketSystem.audit = new Map();
            Memory.marketSystem.audit.lastProcessedOrder = -1;
            Memory.marketSystem.audit.byMineral = new Map();
            Memory.marketSystem.audit.byRoom = new Map();
            
        }
        
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