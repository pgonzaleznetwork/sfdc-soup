

function endpoints({apiVersion}){
    return {
        metadataApi:`/services/Soap/m/${apiVersion}`,
        soapApi:`/services/Soap/c/${apiVersion}`,
        reportsApi:`/services/data/v${apiVersion}/analytics/`,
        restApi:`/services/data/v${apiVersion}/`
    }
}

module.exports = endpoints