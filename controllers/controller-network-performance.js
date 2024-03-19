const axios = require('axios')
const {ROOT_URL} = require('../utils/options')

async function getNetworkPacketLoss(req, res, next) {
    try {
        const url = `${ROOT_URL}/query`
        const objValues = {}
        const serverPacketLoss = await axios.get(url, {params: {query: '((smokeping_requests_total - smokeping_response_duration_seconds_count) / smokeping_requests_total) * 100'}})
        serverPacketLoss.data.data.result.map((data) => {
            const pl = parseFloat(data.value[1]).toFixed(1)
            const unixTime = new Date(data.value[0] * 1000)
            objValues.value = pl
            objValues.time = unixTime.toLocaleTimeString()
        })
        const plValues = Object.values(objValues)
        return res.status(200).json({
            status: 200,
            message: "success",
            data: {
                packetLoss: plValues[0],
                time: plValues[1]
            }
        })
    } catch (error) {
        res.status(400)
        next(Error(error.message))
    }
}

async function getNetworkLatency(req, res, next) {
    try {
        const url = `${ROOT_URL}/query`
        const objValues = {}
        const serverLatency = await axios.get(url, {params: {query: 'sum(rate(smokeping_response_duration_seconds_bucket{instance="localhost:9374", le="0.512"}[1m]))'}})
        serverLatency.data.data.result.map((data) => {
            const latency = parseFloat(data.value[1]).toFixed(1)
            const unixTime = new Date(data.value[0] * 1000)
            objValues.value = latency
            objValues.date = unixTime.toLocaleTimeString()
        })
        const latencyValues = Object.values(objValues)
        return res.status(200).json({
            status: 200,
            message: "success",
            data: {
                latency: latencyValues[0],
                time: latencyValues[1]
            }
        })
    } catch (error) {
        
    }
}

module.exports = {
    getNetworkPacketLoss,
    getNetworkLatency
}