const axios = require('axios')
const {ROOT_URL} = require('../utils/options')

async function getServerCpuUtil(req, res, next) {
    try {
        const url = `${ROOT_URL}/query`
        const cpuUtil = await axios.get(url, {params: {query: '100 - (avg by (instance) (rate(node_cpu_seconds_total{job="node_exporter",mode="idle"}[5m])) * 100)'}})
        const resutlCpuUtil = cpuUtil.data.data.result.map((data) => {
            return data.value[1]
        })
        return res.status(200).json(
            {
                status: "success",
                data: {
                    serverCpuUsage: resutlCpuUtil
                }
            }
        )
    } catch (err) {
        res.status(400)
        next(Error(err.message))
    }
}

module.exports = getServerCpuUtil