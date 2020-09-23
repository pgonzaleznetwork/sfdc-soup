let metadataAPI = require('../sfdc_apis/metadata');

/**
 * The metadata component dependency API also returns references to objects that are only known at run time, for example
 * a test class that queries the Profile object to create a test user. The profile object is returned as a dependency
 * but we don't know what profile is actually being used, again, this is only known at run time.
 * 
 * At the time of this writing, you can tell that a reference is dynamic if the id is exactly the same as the name, for example
 * name: 'SlaProcess',
 * type: 'EntitlementProcess',
 * id: 'SlaProcess',
 */
function isDynamicReference(dep){

    let {name,id} = dep;

    if(name && id){
        name = name.toLowerCase();
        id = id.toLowerCase();
        if(id === name){
            return true;
        }
    }

    return false;
}

 /**
 * Uses the Metadata API to get a map of object Ids to object names
 */
async function getObjectNamesById(connection){
    
    let objectsData = await getCustomObjectData(connection);

    let objectsById = new Map();
    
    objectsData.forEach(obj => {
        if(obj.id != ''){
            objectsById.set(obj.id,obj.fullName);
        }
    })

    return objectsById;

}

 /**
     * The reverse of the above
     */
    async function getObjectIdsByName(connection){
        
        let objectsData = await getCustomObjectData(connection);
    
        let objectsByName = new Map();
        
        objectsData.forEach(obj => {
            if(obj.id != ''){
                objectsByName.set(obj.fullName,obj.id);
            }
        })
    
        return objectsByName;
    
    }

async function getCustomObjectData(connection){

    let mdapi = metadataAPI(connection);
    let objectsData = await mdapi.listMetadata('CustomObject');

    objectsData = objectsData.map(obj => {
        let simplified = {
            id:obj.id,
            fullName:obj.fullName
        };
        return simplified;
    })

    return objectsData;
}

/**
 * Takes a list of ids or a single id as a string and formats them in a way that can be used in 
 * SOQL query filters
 */
function filterableId(metadataId){

    let ids = '';

    //allows for the query to filter by either a single id or multiple ids
    if(Array.isArray(metadataId)){

        metadataId.forEach(id => {
            ids += "'"+id+"',"
        })
        //remove the first and last ' (and the last comma) as these are included in the query string 
        ids = ids.substring(1,ids.length-2);
    }else{
        ids = metadataId;
    }

    return ids;

}

function splitInBatchesOf(items,batchSize){

    let remainingItems = items.length;
    let indexSoFar = 0;
    let batches = [];

    while (remainingItems > batchSize) {
        
        let batch = [];

        for (let x = 0; x < batchSize; x++,indexSoFar++) {
            batch.push(items[indexSoFar]);       
        }

        batches.push(batch);
        remainingItems -= batchSize;
    }

    if(remainingItems > 0) batches.push(items.slice(indexSoFar));

    return batches;

}

function validateParams(connection,entryPoint){

    if(!entryPoint.id || !entryPoint.name || !entryPoint.type){
        throw new Error('id, name and type are required params on the entryPoint');
    }
    else{
        if(entryPoint.id.length < 18){
            throw new Error('You must use an 18-digit Salesforce id on the entryPoint');
        }
    }
    if(!connection.token || !connection.url){
        throw new Error('Access token and URL are required on the connection object');
    }
    if(connection.apiVersion){
        let parts = connection.apiVersion.split('.');
        if(parts.length < 2){
            throw new Error('The apiVersion must use the following format major.minor, for example 49.0');
        }
        else{
            if(isNaN(parts[0]) || isNaN(parts[1])){
                throw new Error('The apiVersion must use the following format major.minor, for example 49.0');
            }
        }
    }

}

function validateApiVersion(connection){

    let {apiVersion } = connection;

    if(!apiVersion){
        connection.apiVersion = '49.0';
    }
    else if(apiVersion && parseInt(apiVersion) < 49){
        connection.apiVersion = '49.0';
    }

    return connection;
}

module.exports = {isDynamicReference,filterableId,getObjectNamesById,getObjectIdsByName,splitInBatchesOf,validateApiVersion,validateParams}