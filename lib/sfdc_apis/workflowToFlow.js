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
        let allActions = [];

        metadataByType.forEach((members,type) => {

            members.forEach(workflow => {

                let {Metadata} = workflow;

                let workflowInfo = {
                    customFields :[],
                    standardFields : [],
                    standardObjects : [],
                    customObjects : [],
                    id: workflow.Id,
                    name: workflow.FullName,
                    active: Metadata.active,
                    type: Metadata.triggerType,
                    actions: [],
                    timeBasedActions : []
                }

                if(Metadata.formula){
                    
                        let parseReq = {
                            object : entryPoint.id,
                            formula: Metadata.formula
                        }

                        let result = parse(parseReq);
                       
                        if(result.customFields) workflowInfo.customFields = result.customFields;   
                        if(result.standardFields) workflowInfo.standardFields = result.standardFields;       
                        if(result.standardObjects)workflowInfo.standardObjects = result.standardObjects;
                        if(result.customObjects) workflowInfo.customObjects = result.customObjects;
                }
            
                else if(Metadata.criteriaItems){

                    let customFields = new Set();
                    let standardFields = new Set();
                    let customObjects = new Set();
                    let standardObjects = new Set();
    
                    if(Array.isArray(Metadata.criteriaItems)){

                        Metadata.criteriaItems.forEach(criteria => {

                            let [sobj,field] = criteria.field.split('.');

                            if(isCustom(sobj)) customObjects.add(sobj);
                            else standardObjects.add(sobj);
                            
                            if(isCustom(field)) customFields.add(criteria.field);
                            else standardFields.add(criteria.field);      
                        });
                    }

                    else{

                        let [sobj,field] = workflow.criteriaItems.field.split('.');

                            if(isCustom(sobj))customObjects.add(sobj);
                            else standardObjects.add(sobj);
                            

                            if(isCustom(field)) customFields.add(workflow.criteriaItems.field);
                            else standardFields.add(workflow.criteriaItems.field);    
                    }

                    
                    workflowInfo.customFields = Array.from(customFields);
                    workflowInfo.customObjects = Array.from(customObjects);
                    workflowInfo.standardFields = Array.from(standardFields);
                    workflowInfo.standardObjects = Array.from(standardObjects);
                   
                }

                Metadata.actions?.forEach(action => {
                    allActions.push(action);
                    workflowInfo.actions.push(action)
                })

                Metadata.workflowTimeTriggers?.forEach(tt => {

                    tt.actions?.forEach(action => {
                        allActions.push(action);
                        workflowInfo.timeBasedActions.push(action);
                    })

                })

                workflowInfos.push(workflowInfo)
            })
        })

        let allFieldUpdates = await getAllFieldUpdates();
        let allEmailAlerts = await getAllEmailAlerts();
        let allOBmessages = await getAllOutboundMessages();

        for (let index = 0; index < workflowInfos.length; index++) {

            const wfInfo = workflowInfos[index];

            wfInfo.actions?.forEach(action => {
                getMetadata(action); 
            })

            wfInfo.timeBasedActions?.forEach(action => {
                getMetadata(action);  
            })
        }

        function getMetadata(action){

            if(action.type == 'Task') return;

            let metadataMap;

            if(action.type == 'FieldUpdate'){
                metadataMap = allFieldUpdates;
            }
            else if(action.type == 'Alert'){
                metadataMap = allEmailAlerts;
            }

            else if(action.type == 'OutboundMessage'){
                metadataMap = allOBmessages;
            }

            let actionMetadata = metadataMap.get(action.name);
            
            if(actionMetadata){
                action.metadata = actionMetadata;
            }
        }

        workflowInfos.forEach(i => console.log(i))

        

    }

    function isCustom(value){
        return value.toUpperCase().endsWith('__C');
    }

    async function getAllFieldUpdates(){

        let soql = {
            query : `SELECT Id FROM WorkflowFieldUpdate WHERE SourceTableEnumOrId = '${entryPoint.id}'`,
            useToolingApi:true
        }

        let rawResults = await restApi.query(soql);

        let workflowFieldUpdates = rawResults.records.map(record => {

            return {
                id:record.Id,
                type:'WorkflowFieldUpdate'
            }
        });

        let metadataByType = await restApi.readMetadata(workflowFieldUpdates);

        let fieldUpdatesByName = new Map();

        metadataByType.forEach((members,type) => {

            members.forEach(fu => {

                let indexName = fu.FullName.split('.')[1];
                let simplified = {
                    ...fu.Metadata,
                    id:fu.Id,
                }

                fieldUpdatesByName.set(indexName,simplified);
            })
        })

        return fieldUpdatesByName;
    }

    async function getAllEmailAlerts(){

        let soql = {
            query : `SELECT Id FROM WorkflowAlert`,
            useToolingApi:true
        }

        let rawResults = await restApi.query(soql);

        let workflowAlerts = rawResults.records.map(record => {

            return {
                id:record.Id,
                type:'WorkflowAlert'
            }
        });

        let metadataByType = await restApi.readMetadata(workflowAlerts);

        let alertsByName = new Map();

        metadataByType.forEach((members,type) => {

            members.forEach(wa => {

                let indexName = wa.FullName.split('.')[1];
                let simplified = {
                    ...wa.Metadata,
                    id:wa.Id,
                }

                alertsByName.set(indexName,simplified);
            })
        })

        return alertsByName;
    }

    async function getAllOutboundMessages(){

        let soql = {
            query : `SELECT Id FROM WorkflowOutboundMessage`,
            useToolingApi:true
        }

        let rawResults = await restApi.query(soql);

        let obMessages = rawResults.records.map(record => {

            return {
                id:record.Id,
                type:'WorkflowOutboundMessage'
            }
        });

        let metadataByType = await restApi.readMetadata(obMessages);

        let obMessagesByName = new Map();

        metadataByType.forEach((members,type) => {

            members.forEach(obm => {

                let indexName = obm.FullName.split('.')[1];
                let simplified = {
                    ...obm.Metadata,
                    id:obm.Id,
                }

                obMessagesByName.set(indexName,simplified);
            })
        })

        return obMessagesByName;
    }

    

    return {getWorkflowInfo};

}

module.exports = workflowApi;