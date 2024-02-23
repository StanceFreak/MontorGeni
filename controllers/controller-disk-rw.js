const axios = require('axios')
const {ROOT_URL} = require('../utils/options')

async function getServerDiskRead(req, res, next) {
    try {
        let tempApiResponse = []
        let apiResponse = []
        const url = `${ROOT_URL}/query`
        const diskRead = await axios.get(url, {params: {query: 'rate(node_disk_read_bytes_total[10s])*8/1024'}})
        diskRead.data.data.result.map((data) => {
            tempApiResponse.push({data})
        })
        for(item in tempApiResponse) {
            const unixTime = new Date(tempApiResponse[item].data.value[0]*1000)
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
    } catch (error) {
        res.status(400)
        next(Error(error.message))
    }
}

async function getServerDiskWrite(req, res, next) {
    try {
        let tempApiResponse = []
        let apiResponse = []
        const url = `${ROOT_URL}/query`
        const diskWrite = await axios.get(url, {params: {query: 'rate(node_disk_written_bytes_total[10s])*8/1024'}})
        diskWrite.data.data.result.map((data) => {
            tempApiResponse.push({data})
        })
        for(item in tempApiResponse) {
            const unixTime = new Date(tempApiResponse[item].data.value[0]*1000)
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
    } catch (error) {
        res.status(400)
        next(Error(error.message))
    }
}

module.exports = {
    getServerDiskRead,
    getServerDiskWrite
}