const axios = require('axios')
const {ROOT_URL} = require('../utils/options')

async function getServerCpuUtil(req, res, next) {
    try {
        const url = `${ROOT_URL}/query`
        const cpuUtil = await axios.get(url, {params: {query: '100 - (avg by (instance) (rate(node_cpu_seconds_total{job="node_exporter",mode="idle"}[5m])) * 100)'}})
        return res.status(200).json(cpuUtil.data)
    } catch (err) {
        res.status(400)
        next(Error(err.message))
    }
}

module.exports = getServerCpuUtil