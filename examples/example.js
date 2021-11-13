let sfdcSoup = require('../src/index');
let fs = require('fs');

/**
* @token A session id or oauth token with API access
* @url Your instance url i.e login.salesforce.com or mydomain.my.salesforce.com
* @apiVersion the version of the Salesforce API. If not specified or if it's lower than 49.0, we use 50.0 by default
*/
let connection = {
    token:'test!AQEAQJTdxi5GqzgPIvil4c0t1HfcSD6zgnnmQbCr7.d1pAJ484ohh9ChtRuGhoNstuIfNtwWCOQMv2_I0TLMmeZ_tD4kmLRd',
    url:'https://test--uat.my.salesforce.com',
    apiVersion:'49.0'
};

/**
* @name The API name of the metadata member
* @type The metadata type. It must match the Metadata API naming conventions
* @id The 18-digit id. The 15 digit one will NOT work
*/
let customField = {
    name:'CS_SLA_Report_Summary__c.X1_Blocker__c',
    type:'CustomField',
    id:'00N3n000003x1s0EAA',
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
    name:'Case.Reason',
    type:'StandardField',
    id:'Case.Reason',
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

    let soupApi = sfdcSoup(connection,standardField);

    let usageResponse = await soupApi.getUsage();
    //let dependencyResponse = await soupApi.getDependencies();

    //console.log(usageResponse.datatable)

    fs.writeFileSync('examples/usage.json',JSON.stringify(usageResponse.usageTree));
   //fs.writeFileSync('examples/usage.csv',usageResponse.csv);

    //fs.writeFileSync('examples/dependencies.json',JSON.stringify(dependencyResponse.dependencyTree));
    /*fs.writeFileSync('examples/dependencies.csv',dependencyResponse.excel);*/

}

test();

