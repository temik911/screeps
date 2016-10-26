require('RoomInfo');

module.exports = {
    getMineralTypeByChar(char) {
        if (char == 'K') {
            return RESOURCE_KEANIUM;
        } else if (char == 'Z') {
            return RESOURCE_ZYNTHIUM;
        } else if (char == 'U') {
            return RESOURCE_UTRIUM;
        } else if (char == 'L') {
            return RESOURCE_LEMERGIUM;
        } else if (char == 'O') {
            return RESOURCE_OXYGEN;
        } else if (char == 'H') {
            return RESOURCE_HYDROGEN;
        } else if (char == 'X') {
            return RESOURCE_CATALYST;
        } else if (char == 'UL') {
            return RESOURCE_UTRIUM_LEMERGITE;
        } else if (char == 'ZK') {
            return RESOURCE_ZYNTHIUM_KEANITE;
        } else if (char == 'G') {
            return RESOURCE_GHODIUM;
        } else if (char == 'OH') {
            return RESOURCE_HYDROXIDE;
        } else if (char == 'GH') {
            return RESOURCE_GHODIUM_HYDRIDE;
        } else if (char == 'GH2O') {
            return RESOURCE_GHODIUM_ACID;
        } else if (char == 'XGH2O') {
            return RESOURCE_CATALYZED_GHODIUM_ACID;
        } else {
            return undefined;
        }
    }
};