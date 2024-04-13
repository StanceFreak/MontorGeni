const axios = require('axios')
const {ROOT_URL} = require('../utils/options')

async function getServerDiskUtil(req, res, next) {
    try {
        let tempApiResponse = []
        let apiResponse = []
        const url = `${ROOT_URL}/query`
        const diskRw = await axios.get(url, {params: {query: 'rate(otel_system_disk_io_bytes_total{device=~".*sda.*"}[2m])/1048576 or rate(otel_system_disk_io_bytes_total{device="sr0"}[2m])/1048576'}})
        diskRw.data.data.result.map((data) => {
            tempApiResponse.push({data})
        })
        for(item in tempApiResponse) {
            const unixTime = new Date(tempApiResponse[item].data.value[0]*1000)
            apiResponse.push({
                device: tempApiResponse[item].data.metric.device,
                direction: tempApiResponse[item].data.metric.direction,
                value: parseFloat(tempApiResponse[item].data.value[1]),
                time: unixTime.toLocaleTimeString('en-GB')
            })
        }
        return res.status(200).json({
            status: 200,
            message: "success",
            data: apiResponse
        })
    } catch (error) {
        res.status(400)
        next(Error(error.message))
    }
}

async function getServerDiskRw(req, res, next) {
    try {
        let tempApiResponse = []
        let apiResponse = []
        const url = `${ROOT_URL}/query`
        const diskRw = await axios.get(url, {params: {query: 'sum by (direction)(rate(otel_system_disk_io_bytes_total[2m])/1048576)'}})
        diskRw.data.data.result.map((data) => {
            tempApiResponse.push({data})
        })
        for(item in tempApiResponse) {
            const unixTime = new Date(tempApiResponse[item].data.value[0]*1000)
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
    } catch (error) {
        res.status(400)
        next(Error(error.message))
    }
}

module.exports = {
    getServerDiskUtil,
    getServerDiskRw
}