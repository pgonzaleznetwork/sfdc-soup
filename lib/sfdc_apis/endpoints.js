
function toolingApiEndpoint(apiVersion){
    return `/services/data/v${apiVersion}/tooling/query/?q=`;
}

function metadataApiEndpoint(apiVersion){
    return `/services/Soap/m/${apiVersion}`;
}

function soapApiEndpoint(apiVersion){
    return `/services/Soap/c/${apiVersion}`;
}

module.exports = {
    toolingApiEndpoint,metadataApiEndpoint,soapApiEndpoint
}