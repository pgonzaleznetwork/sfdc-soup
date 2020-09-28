# sfdc-soup
## A simple API to understand your Salesforce dependencies

`sfdc-soup` is the NPM library that powers the [Salesforce Happy Soup](https://github.com/pgonzaleznetwork/sfdc-happy-soup#the-best-way-to-visualize-your-salesforce-dependencies). 

It is simple API that allows you to see usage (i.e "where is this used?") and dependency (aka [deployment boundaries](https://github.com/pgonzaleznetwork/sfdc-happy-soup#deployment-boundaries)) information of a metadata member in your Salesforce org.

This information is provided in 4 different formats:

* **Excel and CSV** Perfect for sharing with other members of the team and brainstorming (for example when deciding how to optimize a page layout that has too many fields).
* **JSON tree** Useful to build tree-like UIs like the one seen on [Salesforce Happy Soup](https://github.com/pgonzaleznetwork/sfdc-happy-soup#the-best-way-to-visualize-your-salesforce-dependencies)
* **package.xml** So that you can immediately retrieve your deployment boundary and create a scratch org or unlocked package.
* **Stats** A simple object counting how many members of a specific metadata type are referenced. Useful for building UI dashboards.

```javascript

let usageApi = sfdcSoup.usageApi(connection,entryPoint);
let usageResponse = await usageApi.getUsage();

fs.writeFileSync('usageResponse.json',JSON.stringify(usageResponse));

let dependencyApi = sfdcSoup.dependencyApi(connection,entryPoint);
let dependencyResponse = await dependencyApi.getDependencies();

fs.writeFileSync('dependencyResponse.json',JSON.stringify(dependencyResponse));

```

<p align="center">
  <img src="./github-images/sampleresponse.png" >
</p>

## Contents

* [Installation](#installation)
* [How to use](#how-to-use)
* [Exploring the response](#exploring-the-response)
* [Support and help](#support-and-help)


## Installation

In your NPM application folder, run the following command

`npm install sfdc-soup`

Once you have installed the module in your own NPM project, you can import it in this way

```javascript
const sfdcSoup = require('sfdc-soup');
```

## How to use

Before using the API, you must have an `entryPoint` and `connection` objects.

**Entry Point**

The `entryPoint` is an object with 3 properties, all of which represent the entry point of the dependency tree. For example

```javascript
/**
* @name The API name of the metadata member
* @type The metadata type. It must match the Metadata API naming conventions
* @id The 18-digit id. The 15 digit one will NOT work
*/
let entryPoint = {
    name:'TranslationsMerger_LEX_Controller',
    type:'ApexClass',
    id:'01p0O00000CBlzZQAT'
}
```

How your construct this object is not a concern of `sfdc-soup`. Your application must use the relevant Salesforce APIs to get this information.

**Connection**

The `connection` is also an object with 3 properties that represent a valid API session with any given salesforce org. For example

```javascript
/**
* @token A session id or oauth token with API access
* @url Your instance url i.e login.salesforce.com or mydomain.my.salesforce.com
* @apiVersion the version of the Salesforce API. If not specified or if it's lower than 49.0, we use 49.0 by default
*/
let connection = {
    token: '00D0O000000Z9Ab!AQMAQMRoLQKh_uBxWEvz3as7V...',
    url:'https://resourceful-moose-448750-dev-ed.my.salesforce.com',
    apiVersion:'49.0'
};
```

How your construct this object is not a concern of `sfdc-soup`. Your application must use the relevant Salesforce APIs to get this information.


**Getting usage information**

To see where a metadata member is used, use the usageApi provided by `sfdc-soup` as follows

```javascript 
//async function
let usageApi = sfdcSoup.usageApi(connection,entryPoint);
let usageResponse = await usageApi.getUsage();
```

```javascript 
//standard promise syntax
let usageApi = sfdcSoup.usageApi(connection,entryPoint);
usageApi.getUsage().then(response => console.log(response));
```

**Getting dependency information (deployment boundary)**

To see the [deployment boundary](https://github.com/pgonzaleznetwork/sfdc-happy-soup#deployment-boundaries) of a metadata member, use the dependencyApi provided by `sfdc-soup` as follows

```javascript 
//async function
let dependencyApi = sfdcSoup.dependencyApi(connection,entryPoint);
let dependencyResponse = await dependencyApi.getDependencies();
```

```javascript 
//standard promise syntax
let dependencyApi = sfdcSoup.dependencyApi(connection,entryPoint);
dependencyApi.getDependencies().then(response => console.log(response));
```

[Back to top](#sfdc-soup)

## Exploring the response

Both the `usageApi` and `dependencyApi` provide the exact same properties in their response. Here we'll show the response properties of the `dependencyApi` simply because that is the most interesting one.

### `packageXml`

The `packageXml` property provides a string representing the package.xml required to retrieve all the metadata members from your org. The metadata members are those in the deploment boundary as well as the entry point.

It can be accessed via `dependencyResponse.packageXml`


```javascript
 "packageXml": "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n        <Package xmlns=\"http://soap.sforce.com/2006/04/metadata\"><types><members>Translation_Context__c.Context_Type__c
 </members><members>Translation_Context__c.Record_Link__c</members><members>Translation_Key__c.Default_Label__c</members><members>Translation_Key__c.Key__c
 </members><members>Translation_Key__c.Translation_Context__c</members></types><version>49.0</version>\n        </Package>",
```

### `dependencyTree`

The `dependencyTree` property is a JSON tree reprensenting the entire deployment boundary, where the entryPoint is the top key of the tree.

Every time a metadata member references (or depends on) another set of metadata, the tree expands via a `references` property on the metadata member.

```javascript
"dependencyTree": {
        "TranslationsMerger_LEX_Controller": {
            "references": {
                "CustomField": [
                    {
                        "name": "Translation_Context__c.Context_Type__c",
                        "type": "CustomField",
                        "id": "00N0O00000GJnhoUAD",
                        "repeated": false,
                        "url": "https://resourceful-moose-448750-dev-ed.my.salesforce.com/00N0O00000GJnhoUAD",
                        "notes": null,
                        "namespace": null
                    },
                    {
                        "name": "Translation_Context__c.Record_Link__c",
                        "type": "CustomField",
                        "id": "00N0O00000GJnhjUAD",
                        "repeated": false,
                        "url": "https://resourceful-moose-448750-dev-ed.my.salesforce.com/00N0O00000GJnhjUAD",
                        "notes": null,
                        "namespace": null
                    }
                ],
                "CustomObject": [
                    {
                        "name": "Translation_Context__c",
                        "type": "CustomObject",
                        "id": "01I0O000000bVd8UAE",
                        "repeated": false,
                        "url": "https://resourceful-moose-448750-dev-ed.my.salesforce.com/01I0O000000bVd8UAE",
                        "notes": null,
                        "namespace": null,
                        "references": {
                            "FlexiPage": [
                                {
                                    "name": "Translation_Context_Record_Page",
                                    "type": "FlexiPage",
                                    "id": "0M00O000000YF9SSAW",
                                    "repeated": false,
                                    "url": "https://resourceful-moose-448750-dev-ed.my.salesforce.com/0M00O000000YF9SSAW",
                                    "notes": null,
                                    "namespace": null,
                                    "referencedBy": {
                                        "name": "Translation_Context__c",
                                        "id": "01I0O000000bVd8UAE",
                                        "type": "CustomObject"
                                    }
                                }
                            ]
                        }
                    }
                ],
                "ApexClass": [
                    {
                        "name": "TranslationFileBuilder",
                        "type": "ApexClass",
                        "id": "01p0O00000CBltlQAD",
                        "repeated": false,
                        "url": "https://resourceful-moose-448750-dev-ed.my.salesforce.com/01p0O00000CBltlQAD",
                        "notes": null,
                        "namespace": null,
                        "references": {
                            "CustomField": [
                                {
                                    "name": "Translation_Key__c.Type__c",
                                    "type": "CustomField",
                                    "id": "00N0O00000GJmhdUAD",
                                    "repeated": false,
                                    "url": "https://resourceful-moose-448750-dev-ed.my.salesforce.com/00N0O00000GJmhdUAD",
                                    "notes": null,
                                    "namespace": null,
                                    "referencedBy": {
                                        "name": "TranslationFileBuilder",
                                        "id": "01p0O00000CBltlQAD",
                                        "type": "ApexClass"
                                    }
                                }
```

**NOTE**: In the `usageApi` this property is called `usageTree`.

[Back to top](#sfdc-soup)

### `stats`

The  `stats` object is the output of a `reducer` function. You can use this to know how many metadata members are using or are being used by a specific metadata member.

```javascript
"stats": {
        "CustomField": 6,
        "CustomObject": 2,
        "ApexClass": 2,
        "FlexiPage": 1
    }
```

You could also use this information to build charts with javascript

### `csv` and `excel`

These two properties return a string representing all the metadata members in either `csv` or `excel` format. 

```csv
"Name,Metadata Type,Id,Url,Used by,
"Translation_Context__c.Record_Link__c""CustomField\","00N0O00000GJnhjUAD\",
"https://resourceful-moose-448750-dev-ed.my.salesforce.com/00N0O00000GJnhjUAD\",
\"TranslationsMerger_LEX_Controller via TranslationsMerger_LEX_Controller\",
\r\n\"Translation_Context__c.Context_Type__c\",\"CustomField\",\"00N0O00000GJnhoUAD\",\"https://
resourceful-moose-448750-dev-ed.my.salesforce.com/00N0O00000GJnhoUAD\",
\"TranslationsMerger_LEX_Controller via TranslationsMerger_LEX_Controller\",
\r\n\"Translation_Context__c\",\"CustomObject\",\"01I0O000000bVd8UAE\",\"https://
resourceful-moose-448750-dev-ed.my.salesforce.com/01I0O000000bVd8UAE\",\"TranslationsMerger_LEX_Controller via TranslationsMerger_LEX_Controller\"

```

[Back to top](#sfdc-soup)

## Support and help

Feel free to contact me at pgonzaleznetwork@gmail.com or log a github issue. 