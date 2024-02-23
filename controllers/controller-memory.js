const axios = require('axios')
const {ROOT_URL} = require('../utils/options')

async function getServerAvgMemory(req, res, next) {
    try {
        // get root endpoint from options.js file and merge it with the additional /query for api calls
        const url = `${ROOT_URL}/query`
        // create new object for storing the object values from api response
        const objValues = {}
        // http request using axios library with query params for the api calls to prometheus api
        const avgMemTotal = await axios.get(url, {params: {query: 'avg_over_time(node_memory_MemTotal_bytes{instance="localhost:9100"}[10m])'}})
        const avgMemFree = await axios.get(url, {params: {query: 'avg_over_time(node_memory_MemFree_bytes{instance="localhost:9100"}[10m])'}})
        const avgMemCached = await axios.get(url, {params: {query: 'avg_over_time(node_memory_Cached_bytes{instance="localhost:9100"}[10m])'}})
        const avgMemBuffers = await axios.get(url, {params: {query: 'avg_over_time(node_memory_Buffers_bytes{instance="localhost:9100"}[10m])'}})
        // mapping the array of objects for getting the values and add that value to the objValues Object
        avgMemTotal.data.data.result.map((data) => {
            const calc = parseInt(data.value[1])
            objValues.memTotals = calc
        })
        avgMemFree.data.data.result.map((data) => {
            const calc = parseInt(data.value[1])
            objValues.memFree = calc
        })
        avgMemCached.data.data.result.map((data) => {
            const calc = parseInt(data.value[1])
            objValues.memCached = calc
        })
        avgMemBuffers.data.data.result.map((data) => {
            const calc = parseInt(data.value[1])  
            objValues.memBuffers = calc
        })
        // getting the values only from the objValues Object
        const memValues = Object.values(objValues)
        // calculate all of the values using below formula for the average memory usage in percent
        const avgServerMemory = 100 * (1- ((memValues[1] + memValues[2] + memValues[3]) / memValues[0]))
        return res.status(200).json(
            {
                status: "success",
                data: {
                    serverMemUsage: parseInt(avgServerMemory.toFixed(2)),
                    serverMemTotal: (memValues[0]/1024/1024),
                    serverMemFree: memValues[1]/1024/1024
                }
            }
        )
    } catch (error) {
        res.status(400)
        next(Error(error.message))
    }
}

module.exports = getServerAvgMemory