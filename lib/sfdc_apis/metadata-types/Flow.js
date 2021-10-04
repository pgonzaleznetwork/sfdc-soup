let {restAPI,metadataAPI} = require('sfdc-happy-api')();
const logError = require('../../services/logging');

async function findReferences(connection,entryPoint,cache,options){

    let flowName = entryPoint.name;

    let references = [];
    let mdapi = metadataAPI(connection,logError);
    let restApi = restAPI(connection,logError);

    let query = `SELECT DeveloperName, Id FROM QuickActionDefinition WHERE Type = 'Flow'`;
    let soql = {query,filterById:false,useToolingApi:true};

    let rawResults = await restApi.query(soql);

    let quickActions = rawResults.records.map(record => {
        return {
            id:record.Id,
            type:'QuickActionDefinition'
        }
    });

    let metadataByType = await restApi.readMetadata(quickActions);

    metadataByType.forEach((members,type) => {

        members.forEach(quickAction => {

            let {Metadata} = quickAction;

            if(Metadata.type == 'Flow' && Metadata.flowDefinition == flowName){

                let simplified = {
                    name:quickAction.FullName,
                    type:type,
                    id:quickAction.Id,
                    url:`${connection.url}/${quickAction.Id}`,
                    notes:null,
                    namespace: quickAction.NamespacePrefix,       
                }

                references.push(simplified);
            }
        })

    })


    return references;
}

module.exports = findReferences;