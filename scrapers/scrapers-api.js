const axios = require('axios')
const {ROOT_URL} = require('../utils/options')
const db = require('../utils/config-db')
const mysql = require('mysql')
const pool = mysql.createPool(db)

pool.on("error", (err) => {
    console.error(err)
})

async function storeCpuUtils(req, res, next) {
    const objValues = {}
    const url = `${ROOT_URL}/query`
    const cpuUtil = await axios.get(url, {params: {query: '100 - (avg by (instance) (rate(node_cpu_seconds_total{job="node_exporter",mode="idle"}[5m])) * 100)'}})
    cpuUtil.data.data.result.map((data) => {
        const unixTime = new Date(data.value[0] * 1000)
        const d = new Date()
        objValues.CpuUtil = data == null ? 0:data.value[1]
        objValues.time = data == null ? d.toLocaleTimeString() : unixTime.toLocaleTimeString()
    })
    const cpuValues = Object.values(objValues)
    let data = {
        cpuUtil: cpuValues[0],
        time: cpuValues[1]
    }
    pool.getConnection(function (err, conn) {
        if (err) throw err
        conn.query(`INSERT INTO cpu_util SET ?;`, [data])
        conn.release()
    })
}

module.exports = storeCpuUtils