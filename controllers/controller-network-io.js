const axios = require('axios')
const {ROOT_URL} = require('../utils/options')

async function getServerNetworkReceive(req, res, next) {
    try {
        let tempApiResponse = []
        let apiResponse = []
        const url = `${ROOT_URL}/query`
        const nwReceive = await axios.get(url, {params: {query : 'rate(node_network_receive_bytes_total[10s]) * 0.008'}})
        nwReceive.data.data.result.map((data) => {
            tempApiResponse.push({data})
        })
        for(item in tempApiResponse) {
            const unixTime = new Date(tempApiResponse[item].data.value[0] * 1000)
            apiResponse.push({
                device: tempApiResponse[item].data.metric.device,
                value: parseFloat(tempApiResponse[item].data.value[1]),
                date: unixTime.toLocaleString()
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

async function getServerNetworkTransmit(req, res, next) {
    try {
        let tempApiResponse = []
        let apiResponse = []
        const url = `${ROOT_URL}/query`
        const nwReceive = await axios.get(url, {params: {query : 'rate(node_network_transmit_bytes_total[10s]) * 0.008'}})
        nwReceive.data.data.result.map((data) => {
            tempApiResponse.push({data})
        })
        for(item in tempApiResponse) {
            const unixTime = new Date(tempApiResponse[item].data.value[0] * 1000)
            apiResponse.push({
                device: tempApiResponse[item].data.metric.device,
                value: parseFloat(tempApiResponse[item].data.value[1]),
                date: unixTime.toLocaleString()
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
    getServerNetworkReceive,
    getServerNetworkTransmit
}