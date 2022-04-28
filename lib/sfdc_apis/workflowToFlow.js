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

        console.log(workflowInfos)
        console.log(allActions)

        let actionsByType = allActions.reduce((result,action) => {

            if(result[action.type]){
                result[action.type].push(action.name);
            }
            else{
                result[action.type] = [action.name];
            }

            return result;

        },{})

        Object.keys(actionsByType).forEach(key => {

            let realObjName = mapName(key);
            let actionNames = actionsByType[key];

            let soql = {
                query: `SELECT Id FROM ${realObjName} WHERE `
            }

        })

        console.log(actionsByType)

    }

    function mapName(key){

        if(key == 'Alert'){
            return 'WorkflowAlert'
        }
        else if(key == 'FieldUpdate'){
            return 'WorkflowFieldUpdate'
        }
        else if(key == 'Task'){
            return 'WorkflowTask'
        }
        
        return 'WorkflowOutboundMessage';

    }

    function isCustom(value){
        return value.toUpperCase().endsWith('__C');
    }

    function getAllFieldUpdates(){

        let fieldUpdates = []

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

        metadataByType.forEach((members,type) => {

            members.forEach(fu => {
                fieldUpdates.push(fu)
            })
        })

        return fieldUpdates;
    }

    function getAllEmailAlerts(){

        let emailAlerts = []

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

        metadataByType.forEach((members,type) => {

            members.forEach(fu => {
                emailAlerts.push(fu)
            })
        })

        return emailAlerts;
    }

    function getAllFieldUpdates(){

        let fieldUpdates = []

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

        metadataByType.forEach((members,type) => {

            members.forEach(fu => {
                fieldUpdates.push(fu)
            })
        })

        return fieldUpdates;
    }

    return {getWorkflowInfo};

}

module.exports = workflowApi;