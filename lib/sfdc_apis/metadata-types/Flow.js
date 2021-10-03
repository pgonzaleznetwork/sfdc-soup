let {restAPI,metadataAPI} = require('sfdc-happy-api')();
const logError = require('../../services/logging');

async function findReferences(connection,entryPoint,cache,options){

    console.log(logError)


    let flowName = entryPoint.name;

    let references = [];
    let mdapi = metadataAPI(connection,logError);
    let restApi = restAPI(connection,logError);

    let query = `SELECT DeveloperName, Id FROM QuickActionDefinition WHERE Type = 'Flow'`;
    let soql = {query,filterById:false,useToolingApi:true};

    let rawResults = await restApi.query(soql);

    let idsByActionName = new Map();

    rawResults.records.forEach(record => {
        idsByActionName.set(record.DeveloperName,record.Id)
    })

    //TODO: need to replace this with the composite tooling API request
    let quickActionsMetadata = await mdapi.readMetadata('QuickAction',Array.from(idsByActionName.keys()));

    let quickActionsUsingFlow = []

    quickActionsMetadata.forEach(quickAction => {

        console.log(quickAction);

       /* if(quickAction.flowDefinition == flowName){
            quickActionsUsingFlow.push(quickAction.)
        }*/

    })

    return references;
}

module.exports = findReferences;