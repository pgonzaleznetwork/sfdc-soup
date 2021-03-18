let sfdcSoup = require('../src/index');
let fs = require('fs');

/**
* @token A session id or oauth token with API access
* @url Your instance url i.e login.salesforce.com or mydomain.my.salesforce.com
* @apiVersion the version of the Salesforce API. If not specified or if it's lower than 49.0, we use 49.0 by default
*/
let connection = {
    token: '00D3h000005XLUw!AQkAQEiPWKF8KTp4BvG7Uv23y8CzvWH4NEOBz1b3iKtuIiS4sW9fHb8sImTaGqSBpV_To7gp.z9meio51s5c0YajAvZRhbCP',
    url:'https://brave-raccoon-mm7crl-dev-ed.my.salesforce.com',
    apiVersion:'49.0'
};

/**
* @name The API name of the metadata member
* @type The metadata type. It must match the Metadata API naming conventions
* @id The 18-digit id. The 15 digit one will NOT work
*/
let customField = {
    name:'Account.CustomerPriority__c',
    type:'CustomField',
    id:'00N3h00000DdZSIEA3',
    options:{
        'enhancedReportData':true,
        'fieldInMetadataTypes':true
    }
}

/**
 * For standard fields, the name and id must be the same, with the format
 * [ObjectName][FieldApiName]
 * The type must be StandardField, even though this is NOT a real metadata type
 * recognised by salesforce.
 */
let standardField = {
    name:'Opportunity.StageName',
    type:'StandardField',
    id:'Opportunity.StageName',
}

let emailTemplate = {
    name:'Marketing: Product Inquiry Response',
    type:'EmailTemplate',
    id:'00X3h000001J53gEAC',
}

let apexClass = {
    name:'TriggerDMLSupport',
    id:'01p3h00000C6msBAAR',
    type:'ApexClass',
    options:{'classInMetadataTypes':true}
}


async function test(){

    let soupApi = sfdcSoup(connection,customField);

    let usageResponse = await soupApi.getUsage();
    let dependencyResponse = await soupApi.getDependencies();

    fs.writeFileSync('examples/usage.json',JSON.stringify(usageResponse.usageTree));
    fs.writeFileSync('examples/dependencies.json',JSON.stringify(dependencyResponse.dependencyTree));

}

test();

