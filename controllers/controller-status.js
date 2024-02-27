const axios = require('axios')
const {ROOT_URL} = require('../utils/options')

async function getServerStatus(req, res, next) {
    try {
        const objResponse = {}
        const url = `${ROOT_URL}/query`
        const status = await axios.get(url, {params: {query : 'up{job="node_exporter"}'}})
        const serverUptime = await axios.get(url, {params: {query : 'node_time_seconds - node_boot_time_seconds'}})
        status.data.data.result.map((data) => {
            objResponse.serverStatus = data.value[1]
        })
        serverUptime.data.data.result.map((data) => {
            const uptimeSeconds = parseInt(data.value[1])
            const hours = Math.floor(uptimeSeconds/3600)
            const minutes = Math.floor((uptimeSeconds%3600)/60)
            const seconds = Math.floor(uptimeSeconds%60)
            const timeString = hours.toString().padStart(2, '0') + ' hours, ' + minutes.toString().padStart(2, '0') + ' minutes, ' + seconds.toString().padStart(2, '0') + ' seconds'
            objResponse.serverUptime = timeString
        })
        const responseValues = Object.values(objResponse)
        return res.status(200).json({
            status: 200,
            message: "success",
            data: {
                status: responseValues[0],
                uptime: responseValues[1]
            }
        })
    } catch (err) {
        res.status(400)
        next(Error(err.message))
    }
}

module.exports = getServerStatus