var harvestUtils = require('HarvestUtils');

module.exports = {
    run(creep) {
        harvestUtils.harvestFromPredefinedSourceWithLink(creep);
    }
};