const axios = require('axios')
const {ROOT_URL} = require('../utils/options')

async function getServerNetworkIo(req, res, next) {
    try {
        let tempApiResponse = []
        let apiResponse = []
        const url = `${ROOT_URL}/query`
        const nwReceive = await axios.get(url, {params: {query : 'rate(otel_system_network_io_bytes_total[1m])/1048576'}})
        nwReceive.data.data.result.map((data) => {
            tempApiResponse.push({data})
        })
        for(item in tempApiResponse) {
            const unixTime = new Date(tempApiResponse[item].data.value[0] * 1000)
            apiResponse.push({
                device: tempApiResponse[item].data.metric.device,
                direction: tempApiResponse[item].data.metric.direction,
                type: tempApiResponse[item].data.metric.direction,
                value: parseFloat(tempApiResponse[item].data.value[1]),
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

module.exports = getServerNetworkIo