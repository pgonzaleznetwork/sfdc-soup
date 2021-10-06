let sfdcSoup = require('../src/index');
let fs = require('fs');

/**
* @token A session id or oauth token with API access
* @url Your instance url i.e login.salesforce.com or mydomain.my.salesforce.com
* @apiVersion the version of the Salesforce API. If not specified or if it's lower than 49.0, we use 49.0 by default
*/
let connection = {
    token:'00D0O000000Z9Ab!AQMAQHpL0t3DLX4uF.mQzvuK9J0LYE_4b3KK5oFxaffWfylVSz4QVbLSBKSgmglSEInxrqIx2DTZTm_ubq34mA1EikGDiyjt',
    url:'https://resourceful-moose-448750-dev-ed.my.salesforce.com',
    apiVersion:'49.0'
};

/**
* @name The API name of the metadata member
* @type The metadata type. It must match the Metadata API naming conventions
* @id The 18-digit id. The 15 digit one will NOT work
*/
let customField = {
    name:'Case.SLAViolation__c',
    type:'CustomField',
    id:'00N3h00000DdZSREA3',
    options:{
        'enhancedReportData':false,
        'fieldInMetadataTypes':false
    }
}

/**
 * For standard fields, the name and id must be the same, with the format
 * [ObjectName][FieldApiName]
 * The type must be StandardField, even though this is NOT a real metadata type
 * recognised by salesforce.
 */
let standardField = {
    name:'Account.Industry',
    type:'StandardField',
    id:'Account.Industry',
}

let emailTemplate = {
    name:'Marketing: Product Inquiry Response',
    type:'EmailTemplate',
    id:'00X3h000001J53gEAC',
}

let workflowAlert = {
    name:'Account.account_alert',
    type:'WorkflowAlert',
    id:'01W3h000000lqaAEAQ'
}

let apexClass = {
    name:'OpportunityTriggerHelper',
    id:'01p3h00000FmgzOAAR',
    type:'ApexClass',
    options:{'classInMetadataTypes':false}
}

let apexClassBoundary = {
    name:'SRM_SelectMetadataExtensionTests',
    id:'01p3h00000E1kj4AAB',
    type:'ApexClass'
}

let flow = {
    name:'Flow_using_field',
    id:'3013Y000000VFB5QAO',
    type:'Flow'
}


async function test(){

    let soupApi = sfdcSoup(connection,flow);

    let usageResponse = await soupApi.getUsage();
    //let dependencyResponse = await soupApi.getDependencies();

    //console.log(usageResponse.datatable)

    fs.writeFileSync('examples/usage.json',JSON.stringify(usageResponse.usageTree));
   // fs.writeFileSync('examples/usage.csv',usageResponse.excel);

    //fs.writeFileSync('examples/dependencies.json',JSON.stringify(dependencyResponse.dependencyTree));
    /*fs.writeFileSync('examples/dependencies.csv',dependencyResponse.excel);*/

}

test();

