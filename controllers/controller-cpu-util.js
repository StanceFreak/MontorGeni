const axios = require('axios')
const {ROOT_URL} = require('../utils/options')
const db = require('../utils/config-db')
const mysql = require('mysql')
const pool = mysql.createPool(db)

pool.on("error", (err) => {
    console.error(err)
})

async function getServerCpuUtilRecord(req, res, next) {
    try {
        var query = ''
        console.log(req.query.interval)
        if (req.query.interval.includes(' day')) {
            query = `SELECT * FROM cpu_util WHERE created_at BETWEEN CURDATE() - INTERVAL ${req.query.interval} AND CURDATE() - INTERVAL 1 SECOND`
        } else if (req.query.interval.includes('today')) {
            query = `SELECT * FROM cpu_util WHERE created_at >= CURDATE()`
        }
        pool.getConnection(function (err, conn) {
            if (err) throw err
            conn.query(
                // get data from db with interval of hours, minutes, seconds
                query,
                // `SELECT * FROM cpu_util WHERE created_at >= DATE_SUB(NOW(), INTERVAL ${req.query.interval})`,
                // get data from db with interval of days
                // `SELECT * FROM cpu_util WHERE created_at BETWEEN CURDATE() - INTERVAL 2 DAY AND CURDATE() - INTERVAL 1 SECOND`,
                function (error, results) {
                    if (error) throw error
                    res.status(200).json(
                        {
                            status: 200,
                            message: "success",
                            data: results
                        }
                    )
                }
            )
            conn.release()
        })
    } catch (err) {
        res.status(400)
        next(Error(err.message))
    }
}

async function getServerCpuUtil(req, res, next) {
    try {
        const objValues = {}
        const url = `${ROOT_URL}/query`
        const cpuUtil = await axios.get(url, {params: {query: '(1-(avg by(instance)(rate(otel_system_cpu_time_seconds_total{state="idle"}[1m])))) * 100'}})
        cpuUtil.data.data.result.map((data) => {
            const unixTime = new Date(data.value[0] * 1000)
            objValues.value = data.value[1]
            objValues.time = unixTime.toLocaleTimeString('en-GB')
        })
        const cpuValues = Object.values(objValues)
        let cpuData = {
            value: parseInt(cpuValues[0]),
            time: cpuValues[1]
        }
        return res.status(200).json({
            status: 200,
            message: "success",
            data: cpuData
        })
    } catch (error) {
        res.status(400)
        next(Error(error.message))
    }
}

module.exports = {
    getServerCpuUtilRecord,
    getServerCpuUtil
}