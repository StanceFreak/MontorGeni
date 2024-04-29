const axios = require('axios')
const {ROOT_URL} = require('../utils/options')

async function getServerNetworkIo(req, res, next) {
    try {
        let networkUtilResponse = []
        let apiResponse = []
        const url = `${ROOT_URL}/query`
        const nwReceive = await axios.get(url, {params: {query : 'rate(otel_system_network_io_bytes_total[1m])'}})
        const nwPacketsTotal = await axios.get(url, {params: {query : 'otel_system_network_packets_total'}})
        nwReceive.data.data.result.map((utilData) => {
            nwPacketsTotal.data.data.result.map((packetsData) => {
                if (utilData.metric.device == packetsData.metric.device &&
                    utilData.metric.direction == packetsData.metric.direction) {
                        networkUtilResponse.push({
                            util: utilData, 
                            packets: packetsData
                        })
                }
            })
        })
        let mergeObj = []
        for(item in networkUtilResponse) {
            const unixTime = new Date(networkUtilResponse[item].util.value[0] * 1000)
            apiResponse.push({
                name: networkUtilResponse[item].util.metric.device,
                utils: [{
                    direction: networkUtilResponse[item].util.metric.direction,
                    value: parseFloat(networkUtilResponse[item].util.value[1]).toFixed(1),
                    packets: parseFloat(networkUtilResponse[item].packets.value[1]).toFixed(1),
                },],
                time: unixTime.toLocaleTimeString('en-GB')
            })
        }
        mergeObj = apiResponse.reduce((obj, item) => {
            obj[item.name] ? obj[item.name].utils.push(...item.utils) : (obj[item.name] = { ...item })
            return obj
        }, {})
        const finalObj = Object.values(mergeObj)
        return res.status(200).json({
            status: 200,
            message: "success",
            data: finalObj
        })
    } catch (err) {
        res.status(400)
        next(Error(err.message))
    }
}

async function getServerNetworkRt(req, res, next) {
    try {
        let tempApiResponse = []
        let apiResponse = []
        const url = `${ROOT_URL}/query`
        const nwReceive = await axios.get(url, {params: {query : 'sum by(direction)(rate(otel_system_network_io_bytes_total[1m]))'}})
        nwReceive.data.data.result.map((data) => {
            tempApiResponse.push({data})
        })
        for(item in tempApiResponse) {
            const unixTime = new Date(tempApiResponse[item].data.value[0] * 1000)
            apiResponse.push({
                direction: tempApiResponse[item].data.metric.direction,
                value: parseFloat(tempApiResponse[item].data.value[1]).toFixed(1),
                time: unixTime.toLocaleTimeString('en-GB')
            })
        }
        return res.status(200).json({
            status: 200,
            message: "success",
            data: apiResponse
        })
    } catch (err) {
        res.status(400)
        next(Error(err.message))
    }
}

module.exports = {
    getServerNetworkIo,
    getServerNetworkRt
}