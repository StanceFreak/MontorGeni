const axios = require('axios')
const {ROOT_URL} = require('../utils/options')

async function getServerDiskUsage(req, res, next) {
    try {
        const url = `${ROOT_URL}/query`
        const objValues = {}
        const diskAvailPercentage = await axios.get(url, {params: {query: 'round(100 - ((node_filesystem_avail_bytes{mountpoint="/",fstype!="rootfs"} * 100) / node_filesystem_size_bytes{mountpoint="/",fstype!="rootfs"}))'}})
        const diskAvailSpace = await axios.get(url, {params: {query: 'node_filesystem_avail_bytes{mountpoint="/",fstype!="rootfs"} * 100'}})
        const diskTotalSpace = await axios.get(url, {params: {query: 'node_filesystem_size_bytes{mountpoint="/",fstype!="rootfs"}'}})
        diskAvailPercentage.data.data.result.map((data) => {
            objValues.diskAvailablePercentage = data.value[1]
        })
        diskAvailSpace.data.data.result.map((data) => {
            objValues.diskAvailableSize = data.value[1]
        })
        diskTotalSpace.data.data.result.map((data) => {
            const unixTime = new Date(data.value[0] * 1000)
            objValues.diskTotal = data.value[1]
            objValues.date = unixTime.toLocaleTimeString('en-GB')
        })
        const diskValues = Object.values(objValues)
        return res.status(200).json(
            {
                status: 200,
                message: "success",
                data: {
                    usagePercentage: parseInt(diskValues[0]),
                    usageSizeByte: parseInt(diskValues[1] / 100),
                    diskSizeTotal: parseInt(diskValues[2]),
                    time: diskValues[3]
                }
            }
        )
    } catch (error) {
        res.status(400)
        next(Error(error.message))
    }
}

async function getServerDiskUtil(req, res, next) {
    try {
        let tempApiResponse = []
        let apiResponse = []
        const url = `${ROOT_URL}/query`
        const diskRw = await axios.get(url, {params: {query: 'rate(otel_system_disk_io_bytes_total{device=~".*da*"}[1m]) or rate(otel_system_disk_io_bytes_total{device=~".*db*"}[1m]) or rate(otel_system_disk_io_bytes_total{device=~".*sr.*"}[1m])'}})
        // get all sda and sr0 related drives
        // const diskRw = await axios.get(url, {params: {query: 'rate(otel_system_disk_io_bytes_total{device=~".*sda.*"}[1m])/1024 or rate(otel_system_disk_io_bytes_total{device="sr0"}[1m])/1024'}})
        diskRw.data.data.result.map((data) => {
            tempApiResponse.push({data})
        })
        let mergeObj = []
        for(item in tempApiResponse) {
            const unixTime = new Date(tempApiResponse[item].data.value[0]*1000)
            apiResponse.push({
                name: tempApiResponse[item].data.metric.device,
                utils: [{
                    direction: tempApiResponse[item].data.metric.direction,
                    value: parseFloat(tempApiResponse[item].data.value[1]),
                    packets: 0.0
                }],
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
        const diskRw = await axios.get(url, {params: {query: 'sum by (direction)(rate(otel_system_disk_io_bytes_total[1m]))'}})
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
    getServerDiskRw,
    getServerDiskUsage
}