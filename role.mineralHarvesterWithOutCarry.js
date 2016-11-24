let harvestUtils = require('HarvestUtils');

module.exports = {
    run(creep) {
        harvestUtils.harvestFromPredefineExtractorWithOutCarry(creep);
    }
};