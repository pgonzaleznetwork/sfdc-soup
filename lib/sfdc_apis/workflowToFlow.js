let {restAPI} = require('sfdc-happy-api')();
let utils = require('../services/utils');
const logError = require('../services/logging');
const parse = require('forcemula');

function workflowApi(connection,entryPoint,cache){

    let restApi = restAPI(connection,logError);

    async function getWorkflowInfo(){

        let soql = {
            query : `SELECT Id,Name FROM WorkflowRule WHERE TableEnumOrId = '${entryPoint.id}'`,
            useToolingApi:true
        }

        let rawResults = await restApi.query(soql);

        let workflowRules = rawResults.records.map(record => {

            return {
                id:record.Id,
                type:'WorkflowRule'
            }
        });

        let metadataByType = await restApi.readMetadata(workflowRules);

        let workflowInfos = [];

        metadataByType.forEach((members,type) => {

            members.forEach(workflow => {

                let {Metadata} = workflow;

                if(Metadata.formula){
                    
                        let parseReq = {
                            object : entryPoint.id,
                            formula: Metadata.formula
                        }

                        let result = parse(parseReq);
                       // console.log('fields for ',workflow.FullName)
                        //console.log(result);

                        let workflowInfo = {
                            ...result,
                            id: workflow.Id,
                            name: workflow.FullName,
                            active: Metadata.active,
                            type: Metadata.triggerType
                        }

                        workflowInfos.push(workflowInfo);
                    
                }
            
                else if(Metadata.criteriaItems){

                    let customFields = new Set();
                    let standardFields = new Set();
                    let customObjects = new Set();
                    let standardObjects = new Set();
    
                    if(Array.isArray(Metadata.criteriaItems)){

                        Metadata.criteriaItems.forEach(criteria => {

                            let [sobj,field] = criteria.field.split('.');

                            if(isCustom(sobj)){
                                customObjects.add(sobj);
                            }
                            else{
                                standardObjects.add(sobj);
                            }

                            if(isCustom(field)){
                                customFields.add(criteria.field);
                            }
                            else{
                                standardFields.add(criteria.field);
                            }
                        });
                    }

                    else{

                        let [sobj,field] = workflow.criteriaItems.field.split('.');

                            if(isCustom(sobj)){
                                customObjects.add(sobj);
                            }
                            else{
                                standardObjects.add(sobj);
                            }

                            if(isCustom(field)){
                                customFields.add(workflow.criteriaItems.field);
                            }
                            else{
                                standardFields.add(workflow.criteriaItems.field);
                            }

                        
                    }
                    
                    let workflowInfo = {
                        customFields : Array.from(customFields),
                        standardFields : Array.from(standardFields),
                        standardObjects : Array.from(standardObjects),
                        customObjects : Array.from(customObjects),
                        id: workflow.Id,
                        name: workflow.FullName,
                        active: Metadata.active,
                        type: Metadata.triggerType
                    }

                    workflowInfos.push(workflowInfo);
                }
            })
        })

        console.log(workflowInfos)

    }

    function isCustom(value){
        return value.toUpperCase().endsWith('__C');
    }

    return {getWorkflowInfo};

}

module.exports = workflowApi;