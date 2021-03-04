
let utils = require('../lib/services/utils');
let {initCache,cacheApi} = require('../lib/services/caching');

function sfdcSoup(connection,entryPoint,cache){

    //the cache is only used by the sfdc-happy-soup webapp
    let isWebApp = (cache != null || cache != undefined);

    if(!isWebApp){
        //so if the module is being used by another NPM package, we have
        //to create an in memory cache and validate the parameters
        //these operations would be taken care of by the web app but here
        //we need to perform them manually
        cache = initCache();
        cache = cacheApi(cache);
        utils.validateParams(connection,entryPoint);
        connection = utils.validateApiVersion(connection);
    }

    //if we get here without any errors, we can safely return the APIs
    //for the client to use

    let dependencyApi = require('../lib/sfdc_apis/dependencies');
    let usageApi = require('../lib/sfdc_apis/usage');

    dependencyApi = dependencyApi(connection,entryPoint,cache);
    usageApi = usageApi(connection,entryPoint,cache);

    return {dependencyApi,usageApi};


}

module.exports = sfdcSoup;